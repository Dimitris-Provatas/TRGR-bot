import { WithId, Document } from "mongodb";

export interface DatabaseObject extends WithId<Document> {
  username: string,
  user_id: string,
  points: number,
  totalMessages: number,
  lastMessaged: number,
  lastVoiceJoined: number,
  lastOnline: number,
}

