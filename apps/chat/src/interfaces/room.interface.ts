import { ObjectId } from 'mongoose';
import { Message } from './message.interface';

export interface Room {
  _id: ObjectId;
  users: string[];
  message: Message[];
  lastMessage: string;
}

export interface RoomDocument extends Document, Room {}
