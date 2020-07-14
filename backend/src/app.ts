import socketIo from "socket.io";

import { resolve } from "path";
import { readFileSync } from "fs";

import { createServer, Server } from "https";

import { UsersModule } from "./users/users.module";
import { ChannelModule } from "./channel/channel.module";
import { DirectModule } from "./direct/direct.module";

import { Websockets, createWebsocketsFactory } from "./providers/websockets";

import {
  FakeDatabaseProvider,
  createFakeDatabaseProviderFactory,
} from "./providers/fake-database";

import { cookieParserSocket } from "./middlewares/socket-cookie-parser";
import { authenticatedSocket } from "./middlewares/socket-auth.middleware";

import { User } from "@shared-interfaces";

export type Module =
  | typeof ChannelModule
  | typeof DirectModule
  | typeof UsersModule;

export class SvitlaServer {
  app: Express.Application;
  socket: socketIo.Socket;
  io: socketIo.Server;

  ws: Websockets;
  db: FakeDatabaseProvider;

  server: Server;
  modules = [];

  opts = {
    key: readFileSync(resolve(__dirname, "../ssl/file.pem")),
    cert: readFileSync(resolve(__dirname, "../ssl/file.crt")),
  };

  constructor() {
    this.createApp();
  }

  createApp() {
    this.server = createServer(this.opts);
    this.ws = createWebsocketsFactory(this.server);
    this.db = createFakeDatabaseProviderFactory();
  }

  register(Module: Module) {
    this.modules.push(Module);
  }

  registerMiddlewares() {
    const users = this.db.table<User>("users");
    const middlewares = [cookieParserSocket(), authenticatedSocket(users)];
    this.ws.registerMiddlewares(middlewares);
  }

  async lifecycleOnModuleInit() {
    return Promise.all(
      this.modules.map((Module) => {
        const module = new Module(this.server, this.ws, this.db);
        return module.onModuleInit();
      })
    );
  }
  async lifecycleOnModuleShutdown() {
    return Promise.all(
      this.modules.map((Module) => {
        const module = new Module(this.server, this.ws, this.db);
        return module.onModuleShutdown();
      })
    );
  }

  startListening(port: number) {
    return new Promise((resolve, reject) => {
      this.server.listen(port, async () => {
        await this.lifecycleOnModuleInit();
        this.registerMiddlewares();
        this.ws.registerEvents();
        console.log(`Successfully started server port: ${port}`);
        resolve();
      });

      this.server.on("close", async () => {
        this.ws.io.close();
        await this.lifecycleOnModuleShutdown();
      });

      this.server.on("error", () => {
        this.ws.io.close();
        reject();
      });
    });
  }
}

export const createAppFactory = () => {
  const app = new SvitlaServer();
  app.register(UsersModule);
  app.register(ChannelModule);
  app.register(DirectModule);

  return app;
};
