import { ProfileDocument } from 'apps/user/src/interfaces/profile.interface';
import { User } from './user.interface';

export interface ProfileAndUser {
  profile: ProfileDocument;
  user: User;
}
