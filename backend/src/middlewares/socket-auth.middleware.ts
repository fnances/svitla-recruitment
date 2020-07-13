import { FakeDatabase } from "../providers/fake-database";
import { Socket } from "socket.io";
import { NextFunction } from "express";

import { User, Channel } from "@shared-interfaces";

export interface AuthenticatedSocket extends Socket {
  user: User;
  channel?: Channel;
}

export const authenticatedSocket = (users: FakeDatabase<User>) => (
  socket: Socket,
  next: NextFunction
) => {
  const auth = socket.request?.cookies?.user;

  if (auth) {
    const parsed = JSON.parse(auth);
    const user = users.get(parsed.id);

    if (!user) {
      // PSEUDO AUTH REVOKING
      socket.request.cookies = null;
      (socket as AuthenticatedSocket).user = null;
      socket.emit("AUTH", { code: 404 });
      return next();
    }

    (socket as AuthenticatedSocket).user = user;
  }

  next();
};
