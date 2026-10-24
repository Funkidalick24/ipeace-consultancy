process.env.JWT_SECRET = 'test-secret-key-that-is-at-least-32-characters-long-for-testing';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.SMTP_HOST = 'smtp.test.com';
process.env.SMTP_PORT = '587';
process.env.SMTP_USER = 'test@test.com';
process.env.SMTP_PASS = 'testpass';
process.env.FROM_EMAIL = 'noreply@test.com';
process.env.COMPANY_EMAIL = 'company@test.com';
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.NODE_ENV = 'test';

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import express, { type Express } from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';

let mongod: MongoMemoryServer;

export async function setupTestDB() {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
  return mongoose.connection;
}

export async function teardownTestDB() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
}

export async function clearDB() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}

export function createTestApp(registerRoutes: (app: Express) => Promise<any>): Express {
  const app = express();

  app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
  app.use(cors({ origin: true, credentials: true }));
  app.use(compression());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  return app;
}
