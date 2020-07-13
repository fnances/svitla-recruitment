import { Socket } from "socket.io";
import cookieParser from "cookie-parser";

export const cookieParserSocket = function() {
  const parser = cookieParser.apply(null, arguments);
  return (socket: Socket, next) => {
    return parser(socket.request, null, next);
  };
};
