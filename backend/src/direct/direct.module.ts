import { Server } from "http";
import { Socket } from "socket.io";

import { Websockets } from "../providers/websockets";
import { FakeDatabase, FakeDatabaseProvider } from "../providers/fake-database";

import { Event, Direct } from "@shared-interfaces";

export class DirectModule {
  directs: FakeDatabase<Direct>;

  constructor(
    private server: Server,
    private ws: Websockets,
    private database: FakeDatabaseProvider
  ) {
    this.directs = database.table("directs");
  }

  async onModuleInit(): Promise<void> {
    this.ws.path(Event.CONNECTED, this.connected);
    this.ws.path(Event.SEND_DIRECT, this.sendMessage);
  }

  connected = (socket: Socket, id: string) => {
    const directs = this.directs.get(id);
    socket.emit("DIRECTS", directs);
  };

  sendMessage() {}
}
