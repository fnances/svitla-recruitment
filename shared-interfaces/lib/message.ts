export interface Message {
  system?: boolean;
  username: string;
  createdAt: Date;
  body: string;
}

export enum MessageType {
  CHANNEL = "channel",
  DIRECT = "direct",
}
