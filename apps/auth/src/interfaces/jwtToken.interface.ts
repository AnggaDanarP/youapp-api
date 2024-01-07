export interface Jwt {
  /**
   * In the context of JWT, an access token is typically used to grant access to resources in an application.
   * It's a string that usually represents an encoded, signed, and sometimes encrypted piece of data.
   */
  accessToken: string;
  /**
   * Refresh tokens are used in authentication systems to allow an application to
   * obtain a new access token without requiring the user to be re-authenticated.
   */
  refreshToken: string;
}
/**
 * @description
 * This interface is used to define the payload of JWT token.
 * WARNING: Don't put too much data on JwtPayload. Max 1024 bytes.
 */
export interface JwtPayload {
  /**
   *  In JWT terms, sub is a standard claim (also known as a subject claim)
   * that typically represents the subject of the token (e.g., the user to whom the token refers).
   */
  sub: string;
}
