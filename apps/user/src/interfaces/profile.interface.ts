import { Document } from 'mongoose';

export interface Profile {
  pId: string;
  userId?: string;
  readonly name?: string;
  readonly horoscope?: string;
  readonly zodiac?: string;
  readonly birthday?: string;
  readonly gender?: boolean;
  readonly heightInCm?: number;
  readonly weightInKg?: number;
  readonly interests?: string[];
  readonly username?: string;
}

export interface ProfileDocument extends Document, Profile {}
