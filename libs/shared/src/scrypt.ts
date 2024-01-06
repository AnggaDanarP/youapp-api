import { randomBytes, scryptSync } from 'crypto';

export class Scrypt {
  static async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = scryptSync(password, salt, 64).toString('hex');
    return salt + ':' + derivedKey;
  }

  static async verifyPassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    const [salt, key] = hash.split(':');
    const derivedKey = scryptSync(password, salt, 64).toString('hex');
    return key === derivedKey;
  }
}
