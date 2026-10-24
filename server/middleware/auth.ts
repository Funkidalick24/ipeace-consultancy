import type { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth';

const AUTH_COOKIE = 'auth_token';
const AUTH_COOKIE_MAX_AGE = 24 * 60 * 60;

export const getTokenFromRequest = (req: any): string | null => {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${AUTH_COOKIE}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
};

export const setAuthCookie = (res: any, token: string) => {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${AUTH_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${AUTH_COOKIE_MAX_AGE}${secure}`);
};

export const clearAuthCookie = (res: any) => {
  res.setHeader('Set-Cookie', `${AUTH_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
};

export const authenticateToken = async (req: any, res: any, next: any) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const user = await authService.getUserFromToken(token);

    if (!user) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(`Token authentication error for ${req.method} ${req.path}`);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const authenticateClient = async (req: any, res: any, next: any) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const user = await authService.getUserFromToken(token);
  if (!user || user.role !== 'client') {
    return res.status(403).json({ error: 'Client access required' });
  }

  req.user = user;
  next();
};

export const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
