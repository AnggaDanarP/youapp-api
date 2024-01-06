import { Media } from './media.interface';

export interface Message {
  text?: string;
  roomId?: string;
  user: {
    id: string;
    profileImage: string;
    firstName: string;
    customProperties: { [id: string]: any };
  };
  createdAt: string;
  medias?: Media[];
}
