import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../services/jwtService';
import { storage } from '../storage';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const jwtAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = JwtService.getTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const payload = JwtService.verifyAccessToken(token);
    if (!payload) {
      return res.status(401).json({ message: 'Invalid or expired access token' });
    }

    // Verify user still exists
    const user = await storage.getUser(payload.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email!,
    };

    next();
  } catch (error) {
    console.error('JWT authentication error:', error);
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

export const optionalJwtAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = JwtService.getTokenFromHeader(authHeader);

    if (token) {
      const payload = JwtService.verifyAccessToken(token);
      if (payload) {
        const user = await storage.getUser(payload.userId);
        if (user) {
          req.user = {
            id: user.id,
            email: user.email!,
          };
        }
      }
    }

    next();
  } catch (error) {
    // For optional auth, we don't fail on errors
    next();
  }
};
