import { Server } from "https";
import socketIo, { Socket } from "socket.io";
import { AuthenticatedSocket } from "../middlewares/socket-auth.middleware";
import { Event } from "@shared-interfaces";

export type WsListener = (socket: Socket, payload?: unknown) => void;

export interface WsListeners {
  [index: string]: Array<WsListener>;
}

export class Websockets {
  io: socketIo.Server;
  socket: socketIo.Socket;
  connected = false;
  subscribers = {};

  users = 0;
  events = [];
  middlewares = [];
  socketMiddlewares = [];
  listeners: WsListeners = {};

  constructor(private server: Server) {
    this.io = socketIo(server);
  }

  registerEvents = () => {
    this.io.on("connect", (socket: AuthenticatedSocket) => {
      this.users += 1;
      console.log("Client connected", socket.user);

      this.listeners[Event.CONNECTED].forEach((listener) => {
        listener(socket);
      });

      this.events.forEach((event) => {
        socket.on(event, (payload: unknown) => {
          this.listeners[event].forEach((listener) => {
            listener(socket, payload);
          });
        });
      });

      socket.on("disconnect", () => {
        this.users -= 1;
        console.log("Client disconnected");

        this.listeners[Event.DISCONNECTED].forEach((listener) => {
          listener(socket);
        });
      });

      socket.on("error", (e) => {
        console.log(`Websocket Error: ${JSON.stringify(e)}`);
      });
    });
  };

  path(event: string, listener: WsListener) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }

    this.listeners[event].push(listener);
    this.events = Object.keys(this.listeners);

    return () => {
      this.listeners[event] = this.listeners[event].filter(
        (l) => l !== listener
      );
    };
  }

  broadcast(event: string, payload: any) {
    this.io.sockets.emit(event, payload);
  }

  registerMiddlewares(middlewares) {
    this.middlewares = middlewares;
    this.middlewares.forEach((middleware) => {
      this.io.use(middleware);
    });
  }
}

let ws: Websockets;

export const createWebsocketsFactory = (server: Server) => {
  if (!ws) {
    ws = new Websockets(server);
  }
  return ws;
};
