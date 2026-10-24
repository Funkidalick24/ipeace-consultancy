import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import supertest from 'supertest';
import { type Express } from 'express';
import { setupTestDB, teardownTestDB, clearDB, createTestApp } from './setup';

let app: Express;
let request: supertest.Agent;

beforeAll(async () => {
  await setupTestDB();
  app = createTestApp(async (app) => {
    const { registerRoutes } = await import('../server/routes');
    await registerRoutes(app);
  });
  const { registerRoutes } = await import('../server/routes');
  await registerRoutes(app);
  request = supertest.agent(app);
});

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await clearDB();
});

describe('Auth API smoke tests', () => {
  const testUser = {
    username: 'testuser',
    password: 'TestPass123!',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'client' as const,
  };

  it('POST /api/auth/register — creates a user and returns a token', async () => {
    const res = await request
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.username).toBe('testuser');
    expect(res.body.user.role).toBe('client');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('POST /api/auth/register — rejects duplicate username', async () => {
    await request.post('/api/auth/register').send(testUser);

    const res = await request
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(400);
    expect(res.body.error || res.body.success === false).toBeTruthy();
  });

  it('POST /api/auth/login — authenticates with correct credentials', async () => {
    await request.post('/api/auth/register').send(testUser);

    const res = await request
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'TestPass123!' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.username).toBe('testuser');
  });

  it('POST /api/auth/login — rejects wrong password', async () => {
    await request.post('/api/auth/register').send(testUser);

    const res = await request
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'WrongPassword' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  it('POST /api/auth/login — requires username and password', async () => {
    const res = await request
      .post('/api/auth/login')
      .send({ username: 'testuser' });

    expect(res.status).toBe(400);
  });

  it('GET /api/auth/verify — returns 401 without auth cookie', async () => {
    const freshAgent = supertest.agent(app);
    const res = await freshAgent.get('/api/auth/verify');

    expect(res.status).toBe(401);
  });

  it('GET /api/auth/verify — returns user with valid auth cookie', async () => {
    await request.post('/api/auth/register').send(testUser);

    const res = await request.get('/api/auth/verify');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.username).toBe('testuser');
  });

  it('POST /api/auth/logout — clears the auth cookie', async () => {
    await request.post('/api/auth/register').send(testUser);

    const res = await request.post('/api/auth/logout');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
