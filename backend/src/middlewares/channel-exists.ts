import { NextFunction } from "express";
import { Channel } from "@shared-interfaces";

import { FakeDatabase } from "../providers/fake-database";
import { AuthenticatedSocket } from "./socket-auth.middleware";

export const channelExists = (channels: FakeDatabase<Channel>) => (
  socket: AuthenticatedSocket,
  next: NextFunction
) => {
  // TODO
  next();
};
