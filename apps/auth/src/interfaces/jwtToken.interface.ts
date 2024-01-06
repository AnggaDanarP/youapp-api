export interface Jwt {
  accessToken: string;
  refreshToken: string;
}
/**
 * @description
 * This interface is used to define the payload of JWT token.
 * WARNING: Don't put too much data on JwtPayload. Max 1024 bytes.
 */
export interface JwtPayload {
  sub: string;
}
