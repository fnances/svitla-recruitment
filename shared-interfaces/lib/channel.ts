import { Message } from "./message";
import { User } from "./user";

export interface Channel {
  id: string;
  name: string;
  createdAt: Date;
  messages: Message[];
  users: User[];
}
