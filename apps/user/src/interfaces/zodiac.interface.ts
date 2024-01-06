import { Document } from 'mongoose';

export interface ZodiacEnd {
  data: string[];
}

export interface ZodiacEndDocument extends Document, ZodiacEnd {}
