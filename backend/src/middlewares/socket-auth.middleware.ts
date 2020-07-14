import { FakeDatabase } from "../providers/fake-database";
import { Socket } from "socket.io";
import { NextFunction } from "express";

import { User, Channel, Event, HttpStatusCodes } from "@shared-interfaces";

export interface AuthenticatedSocket extends Socket {
  user: User;
  channel?: Channel;
}

export const authenticatedSocket = (users: FakeDatabase<User>) => (
  socket: AuthenticatedSocket,
  next: NextFunction
) => {
  const auth = socket.request?.cookies?.user;

  if (auth) {
    let user: User;

    try {
      user = JSON.parse(auth);
    } catch (e) {
      console.log("Malformed cookies.");
      socket.request.cookies.user = null;
      socket.user = null;
      socket.emit(Event.AUTH, { code: HttpStatusCodes.UNAUTHORIZED });
      return next();
    }

    const exists = users.get(user.id);

    if (!exists) {
      /* USING COOKIES AS A SOURCE OF TRUTH IN CASE OF SERVER FAILURE AND DATA LOSS
       */
      users.create(user.id, user);
      socket.emit(Event.AUTH, { user });
    }

    socket.request.cookies.user = exists || user;
    socket.user = user;
  }

  next();
};
