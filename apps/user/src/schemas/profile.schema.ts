import { Schema } from 'mongoose';

export const ProfileSchema = new Schema({
  userId: String,
  name: String,
  birthday: String,
  gender: Boolean,
  heightInCm: Number,
  weightInKg: Number,
  horoscope: String,
  zodiac: String,
  interests: [String],
});
