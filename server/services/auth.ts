import { createHmac } from 'crypto';
import bcrypt from 'bcryptjs';
import { storage } from '../storage';
import type { InsertUser } from '@shared/schema';
import type { IUser } from '../models';

// Simple JWT implementation using built-in crypto
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h';

export interface JWTPayload {
  userId: string;
  username: string;
  role: string;
  iat: number;
  exp: number;
}

export class AuthService {
  // Simple base64url encoding
  private base64urlEncode(str: string): string {
    return Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  // Simple base64url decoding
  private base64urlDecode(str: string): string {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) {
      str += '=';
    }
    return Buffer.from(str, 'base64').toString();
  }

  // Create JWT token
  createToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const now = Math.floor(Date.now() / 1000);
    const fullPayload: JWTPayload = {
      ...payload,
      iat: now,
      exp: now + (24 * 60 * 60) // 24 hours
    };

    const encodedHeader = this.base64urlEncode(JSON.stringify(header));
    const encodedPayload = this.base64urlEncode(JSON.stringify(fullPayload));

    const data = `${encodedHeader}.${encodedPayload}`;
    const signature = createHmac('sha256', JWT_SECRET)
      .update(data)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    return `${data}.${signature}`;
  }

  // Verify JWT token
  verifyToken(token: string): JWTPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const [encodedHeader, encodedPayload, signature] = parts;
      const data = `${encodedHeader}.${encodedPayload}`;

      // Verify signature
      const expectedSignature = createHmac('sha256', JWT_SECRET)
        .update(data)
        .digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

      if (signature !== expectedSignature) return null;

      // Decode payload
      const payload = JSON.parse(this.base64urlDecode(encodedPayload));

      // Check expiration
      if (payload.exp < Math.floor(Date.now() / 1000)) return null;

      return payload;
    } catch (error) {
      return null;
    }
  }

  // Hash password with bcryptjs (secure implementation)
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12; // Industry standard
    return await bcrypt.hash(password, saltRounds);
  }

  // Verify password with bcryptjs
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  // Register user
  async register(userData: InsertUser): Promise<{ user: IUser; token: string } | null> {
    try {
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) return null;

      // Hash password
      const hashedPassword = await this.hashPassword(userData.password);

      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Create token
      const token = this.createToken({
        userId: user._id.toString(),
        username: user.username,
        role: user.role,
      });

      return { user, token };
    } catch (error) {
      console.error('Registration error:', error);
      return null;
    }
  }

  // Login user
  async login(identifier: string, password: string): Promise<{ user: IUser; token: string } | null> {
    try {
      // Check if identifier is an email or username
      const isEmail = identifier.includes('@');
      const user = isEmail
        ? await storage.getUserByEmail(identifier)
        : await storage.getUserByUsername(identifier);

      if (!user) return null;

      if (!(await this.verifyPassword(password, user.password))) return null;

      const token = this.createToken({
        userId: user._id.toString(),
        username: user.username,
        role: user.role,
      });

      return { user, token };
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  }

  // Get user from token
  async getUserFromToken(token: string): Promise<IUser | null> {
    try {
      console.log(`[AUTH DEBUG] Verifying token...`);
      const payload = this.verifyToken(token);
      console.log(`[AUTH DEBUG] Token verification result: ${payload ? 'valid' : 'invalid/expired'}`);

      if (!payload) {
        console.log(`[AUTH DEBUG] Token verification failed`);
        return null;
      }

      console.log(`[AUTH DEBUG] Looking up user with ID: ${payload.userId}`);
      const user = await storage.getUser(payload.userId);
      console.log(`[AUTH DEBUG] User lookup result: ${user ? `found (${user.username}, ${user.role})` : 'not found'}`);

      return user || null;
    } catch (error) {
      console.error('[AUTH DEBUG] Get user from token error:', error);
      return null;
    }
  }
}

export const authService = new AuthService();