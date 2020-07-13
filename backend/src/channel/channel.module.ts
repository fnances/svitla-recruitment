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
    if (socket.user) {
      const channels = this.channels.getAll();

      channels.forEach((channel: Channel) => {
        socket.join(channel.id);
      });
    }
  };

  sendMessage = (socket: AuthenticatedSocket, { channel, message }) => {
    const exists = this.channels.get(channel);

    const msg: Message = {
      createdAt: new Date(),
      username: socket.user.username,
      body: message,
    };

    this.channels.update(exists.id, {
      ...exists,
      messages: [...exists.messages, msg],
    });

    const allChannels = this.channels.getAll();
    this.ws.broadcast(Event.CHANNELS, allChannels);
  };

  createChannel = (socket: AuthenticatedSocket, { channelName }) => {
    if (this.channels.exists(channelName)) {
      return socket.emit(Event.ADD_CHANNEL, { code: HttpStatusCodes.CONFLICT });
    }

    const channel = {
      id: channelName,
      name: channelName,
      createdAt: new Date(),
      createdBy: socket.user,
      messages: ["channel created"],
      users: [socket.user],
    };

    try {
      this.channels.create(channelName, channel);
      socket.join(channelName);
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
      socket.join(channelName);
      this.ws.broadcast(Event.CHANNELS, updated);
    } catch (e) {
      return socket.emit(Event.CHANNELS, { code: HttpStatusCodes.CONFLICT });
    }
  };
}
