import { Message } from "@/models/User.model";

export interface ApiResponce {
  success: boolean;
  message: string;
  isAcceptingMessages?: boolean;
  messages?: Array<Message>;
}
