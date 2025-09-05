import type { Request, Response, NextFunction } from "express";
import { storage } from "./storage";

// Simple in-memory session store for development
const sessions = new Map<string, { userId: string; email: string; expires: number }>();

// Session TTL: 7 days
const SESSION_TTL = 7 * 24 * 60 * 60 * 1000;

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

// Create session
export function createSession(userId: string, email: string): string {
  const sessionId = crypto.randomUUID();
  const expires = Date.now() + SESSION_TTL;
  
  sessions.set(sessionId, { userId, email, expires });
  
  // Clean up expired sessions
  cleanupExpiredSessions();
  
  return sessionId;
}

// Get session
export function getSession(sessionId: string): { id: string; email: string } | null {
  const session = sessions.get(sessionId);
  
  if (!session) {
    return null;
  }
  
  if (Date.now() > session.expires) {
    sessions.delete(sessionId);
    return null;
  }
  
  return {
    id: session.userId,
    email: session.email
  };
}

// Delete session
export function deleteSession(sessionId: string): void {
  sessions.delete(sessionId);
}

// Clean up expired sessions
function cleanupExpiredSessions(): void {
  const now = Date.now();
  const entries = Array.from(sessions.entries());
  for (const [sessionId, session] of entries) {
    if (now > session.expires) {
      sessions.delete(sessionId);
    }
  }
}

// Authentication middleware
export function isAuthenticated(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const sessionId = req.headers.authorization?.replace('Bearer ', '') || 
                   req.cookies?.sessionId;
  
  if (!sessionId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  const session = getSession(sessionId);
  if (!session) {
    return res.status(401).json({ message: "Invalid or expired session" });
  }
  
  req.user = session;
  next();
}

// Optional authentication middleware (for routes that work with or without auth)
export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const sessionId = req.headers.authorization?.replace('Bearer ', '') || 
                   req.cookies?.sessionId;
  
  if (sessionId) {
    const session = getSession(sessionId);
    if (session) {
      req.user = session;
    }
  }
  
  next();
}
