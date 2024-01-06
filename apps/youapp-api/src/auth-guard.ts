import { AuthRequest } from '@app/shared/types/auth-request.type';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtPayload } from 'apps/auth/src/interfaces/jwtToken.interface';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const token = this.extractBearerTokenFromHeader(request);
    if (!token) return false;
    try {
      const payload: JwtPayload = await firstValueFrom(
        this.authService.send('validate', token),
      );
      if (!payload) return false;
      request.payload = payload;
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  private extractBearerTokenFromHeader(request: Request): string | undefined {
    const token = request.headers['x-access-token'] as string | undefined;
    if (!token || token === undefined) return undefined;
    const tokenParts = token.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      return undefined;
    }
    return tokenParts[1];
  }
}
