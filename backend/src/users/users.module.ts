import { Server } from "http";
import { Socket } from "socket.io";

import { Websockets } from "../providers/websockets";
import { FakeDatabaseProvider, FakeDatabase } from "../providers/fake-database";

import { AuthenticatedSocket } from "../middlewares/socket-auth.middleware";

import { User, Event, HttpStatusCodes } from "@shared-interfaces";

export class UsersModule {
  users: FakeDatabase<User>;
  blocked: FakeDatabase<User>;

  constructor(
    private server: Server,
    private ws: Websockets,
    private database: FakeDatabaseProvider
  ) {
    this.users = database.table("users");
    this.blocked = database.table("blocked");
  }

  async onModuleInit(): Promise<void> {
    this.ws.path(Event.CONNECTED, this.connected);
    this.ws.path(Event.DISCONNECTED, this.disconnected);
    this.ws.path(Event.ADD_USER, this.addUser);
    this.ws.path(Event.EDIT_USER, this.editUser);
  }

  emitAllUsers = () => {
    const allUsers = this.users.getAll();
    this.ws.io.sockets.emit(Event.USERS, allUsers);
  };

  disconnected = (socket: AuthenticatedSocket) => {
    const user = socket.user;

    if (user) {
      this.users.update(user.id, {
        ...user,
        isOnline: false,
      });

      socket.user = null;
    }

    this.emitAllUsers();
  };

  connected = (socket: AuthenticatedSocket) => {
    const user = socket.user;

    if (user) {
      this.users.update(user.id, {
        ...user,
        isOnline: true,
      });
    }

    this.emitAllUsers();
  };

  addUser = (socket: Socket, username: string) => {
    if (this.users.exists(username)) {
      return socket.emit(Event.ADD_USER, {
        error: true,
        code: HttpStatusCodes.CONFLICT,
      });
    }

    const user = {
      id: username,
      username,
      createdAt: new Date(),
      isOnline: true,
    };

    try {
      this.users.create(user.id, user);

      socket.emit(Event.ADD_USER, { success: true, user });
      this.emitAllUsers();
    } catch (e) {
      socket.emit(Event.ADD_USER, {
        error: true,
        code: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  };

  editUser = (socket: AuthenticatedSocket, { username, user }) => {
    const updated = {
      ...user,
      isOnline: true,
      username,
    };

    this.users.update(user.id, updated);
    socket.emit(Event.EDIT_USER, updated);
    this.emitAllUsers();
  };
}
