import { Server } from "http";

import { Websockets } from "../providers/websockets";
import { FakeDatabase, FakeDatabaseProvider } from "../providers/fake-database";
import { AuthenticatedSocket } from "../middlewares/socket-auth.middleware";

import { Event, HttpStatusCodes, Channel, Message } from "@shared-interfaces";

export class ChannelModule {
  channels: FakeDatabase<Channel>;

  constructor(
    private server: Server,
    private ws: Websockets,
    private database: FakeDatabaseProvider
  ) {
    this.channels = database.table("channels");
  }

  async onModuleInit(): Promise<void> {
    this.ws.path(Event.CONNECTED, this.connected);
    this.ws.path(Event.SEND_MESSAGE, this.sendMessage);
    this.ws.path(Event.ADD_CHANNEL, this.createChannel);
    this.ws.path(Event.JOIN_CHANNEL, this.joinChannel);
  }

  connected = (socket: AuthenticatedSocket, id: string) => {
    const channels = this.channels.getAll();

    if (socket.user) {
      channels.forEach((channel: Channel) => {
        socket.join(channel.id);
      });
    }

    this.ws.broadcast(Event.CHANNELS, channels);
  };

  sendMessage = (socket: AuthenticatedSocket, { channel, message, user }) => {
    if (!socket.user) {
      socket.user = user;
    }

    const exists = this.channels.get(channel);

    const msg: Message = {
      createdAt: new Date(),
      username: user.username,
      body: message,
    };

    this.channels.update(exists.id, {
      ...exists,
      messages: [...exists.messages, msg],
    });

    const allChannels = this.channels.getAll();
    this.ws.broadcast(Event.CHANNELS, allChannels);
  };

  createChannel = (socket: AuthenticatedSocket, { channelName, user }) => {
    if (this.channels.exists(channelName)) {
      return socket.emit(Event.ADD_CHANNEL, { code: HttpStatusCodes.CONFLICT });
    }

    if (!socket.user) {
      socket.user = user;
    }

    const createdAt = new Date();

    const firstMessage: Message = {
      system: true,
      createdAt,
      username: user.username,
      body: `Channel ${channelName} created`,
    };

    const channel = {
      id: channelName,
      name: channelName,
      createdAt: new Date(),
      createdBy: user.username,
      messages: [firstMessage],
      users: [user],
    };

    try {
      this.channels.create(channelName, channel);
      socket.join(channel.id);
      this.ws.broadcast(Event.CHANNELS, this.channels.getAll());
    } catch (e) {
      return socket.emit(Event.CHANNELS, {
        code: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  };

  joinChannel = (socket: AuthenticatedSocket, { channelName }) => {
    const channel = this.channels.get(channelName);

    if (!channel) {
      return socket.emit(Event.CHANNELS, { code: HttpStatusCodes.NOT_FOUND });
    }

    const users = [...channel.users, socket.user];

    try {
      const updated = this.channels.update(channelName, { ...channel, users });
      socket.join(channel.id);
      this.ws.broadcast(Event.CHANNELS, updated);
    } catch (e) {
      return socket.emit(Event.CHANNELS, { code: HttpStatusCodes.CONFLICT });
    }
  };
}
