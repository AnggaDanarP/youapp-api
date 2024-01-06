import { JwtPayload } from 'apps/auth/src/interfaces/jwtToken.interface';
import { Request } from 'express';

export type AuthRequest = Request & { payload: JwtPayload };
