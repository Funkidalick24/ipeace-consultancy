import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import bcrypt from 'bcryptjs';
import { storage } from '../storage';
import type { InsertUser } from '@shared/schema';
import type { IUser } from '../models';

const encoder = new TextEncoder();
const JWT_SECRET = encoder.encode(process.env.JWT_SECRET!);
const JWT_ISSUER = 'ipeace-consultancy';
const JWT_AUDIENCE = 'ipeace-clients';

export interface TokenPayload extends JWTPayload {
  userId: string;
  username: string;
  role: string;
}

export class AuthService {
  async createToken(payload: Omit<TokenPayload, 'iat' | 'exp' | 'iss' | 'aud'>): Promise<string> {
    return new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer(JWT_ISSUER)
      .setAudience(JWT_AUDIENCE)
      .setExpirationTime('24h')
      .sign(JWT_SECRET);
  }

  async verifyToken(token: string): Promise<TokenPayload | null> {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET, {
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
        clockTolerance: 30,
      });
      return payload as unknown as TokenPayload;
    } catch {
      return null;
    }
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  async hashResetToken(token: string): Promise<string> {
    return this.hashPassword(token);
  }

  async verifyResetToken(token: string, hash: string): Promise<boolean> {
    return this.verifyPassword(token, hash);
  }

  async register(userData: InsertUser): Promise<{ user: IUser; token: string } | null> {
    try {
      const [byUsername, byEmail] = await Promise.all([
        storage.getUserByUsername(userData.username),
        userData.email ? storage.getUserByEmail(userData.email) : Promise.resolve(null),
      ]);

      if (byUsername || byEmail) {
        console.warn(`Registration attempt for existing user: ${userData.username}`);
        return null;
      }

      const hashedPassword = await this.hashPassword(userData.password);

      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      const token = await this.createToken({
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

  async login(identifier: string, password: string): Promise<{ user: IUser; token: string } | null> {
    try {
      const isEmail = identifier.includes('@');
      const user = isEmail
        ? await storage.getUserByEmail(identifier)
        : await storage.getUserByUsername(identifier);

      if (!user) {
        await new Promise(resolve => setTimeout(resolve, 100));
        return null;
      }

      if (!(await this.verifyPassword(password, user.password))) {
        return null;
      }

      const token = await this.createToken({
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

  async getUserFromToken(token: string): Promise<IUser | null> {
    try {
      const payload = await this.verifyToken(token);
      if (!payload) return null;
      const user = await storage.getUser(payload.userId);
      return user || null;
    } catch {
      return null;
    }
  }
}

export const authService = new AuthService();