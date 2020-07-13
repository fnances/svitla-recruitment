export interface Message {
  username: string;
  createdAt: Date;
  body: string;
}

export enum MessageType {
  CHANNEL = "channel",
  DIRECT = "direct",
}
