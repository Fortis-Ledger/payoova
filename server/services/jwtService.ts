import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';

interface JwtPayload {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
}

export class JwtService {
  private static readonly ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || 'default-access-secret';
  private static readonly REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret';
  private static readonly ACCESS_TOKEN_EXPIRES_IN = '15m';
  private static readonly REFRESH_TOKEN_EXPIRES_IN = '7d';

  static generateTokenPair(userId: string, email: string): { accessToken: string; refreshToken: string } {
    const accessToken = jwt.sign(
      { userId, email, type: 'access' } as JwtPayload,
      this.ACCESS_TOKEN_SECRET,
      { expiresIn: this.ACCESS_TOKEN_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { userId, email, type: 'refresh' } as JwtPayload,
      this.REFRESH_TOKEN_SECRET,
      { expiresIn: this.REFRESH_TOKEN_EXPIRES_IN }
    );

    return { accessToken, refreshToken };
  }

  static verifyAccessToken(token: string): JwtPayload | null {
    try {
      const payload = jwt.verify(token, this.ACCESS_TOKEN_SECRET) as JwtPayload;
      return payload.type === 'access' ? payload : null;
    } catch {
      return null;
    }
  }

  static verifyRefreshToken(token: string): JwtPayload | null {
    try {
      const payload = jwt.verify(token, this.REFRESH_TOKEN_SECRET) as JwtPayload;
      return payload.type === 'refresh' ? payload : null;
    } catch {
      return null;
    }
  }

  static generateEmailVerificationToken(): string {
    return nanoid(32);
  }

  static generatePasswordResetToken(): string {
    return nanoid(32);
  }
}