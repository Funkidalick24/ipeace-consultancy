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

describe('Consultations API smoke tests', () => {
  const validBooking = {
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@example.com',
    phone: '+263771234567',
    company: 'Test Corp',
    serviceType: 'regulatory' as const,
    preferredDate: '2027-01-15',
    preferredTime: 'morning-10' as const,
    consultationType: 'video-call' as const,
    description: 'Need help with company registration compliance.',
    newsletter: false,
  };

  it('POST /api/consultations — creates a booking with valid data', async () => {
    const res = await request
      .post('/api/consultations')
      .send(validBooking);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.bookingId).toBeDefined();
    expect(res.body.bookingId.length).toBeGreaterThan(0);
  });

  it('POST /api/consultations — rejects invalid email', async () => {
    const res = await request
      .post('/api/consultations')
      .send({ ...validBooking, email: 'not-an-email' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/consultations — rejects missing required fields', async () => {
    const res = await request
      .post('/api/consultations')
      .send({ firstName: 'Jane' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/consultations — rejects invalid service type', async () => {
    const res = await request
      .post('/api/consultations')
      .send({ ...validBooking, serviceType: 'nonexistent' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/consultations — returns bookings after creation', async () => {
    await request.post('/api/consultations').send(validBooking);

    const res = await request.get('/api/consultations');

    expect(res.status).toBe(200);
    const body = typeof res.text === 'string' ? JSON.parse(res.text) : res.body;
    expect(body.bookings).toBeDefined();
    expect(body.bookings.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/consultations/:id — returns a single booking', async () => {
    const createRes = await request
      .post('/api/consultations')
      .send(validBooking);

    const bookingId = createRes.body.bookingId;
    const res = await request.get(`/api/consultations/${bookingId}`);

    expect(res.status).toBe(200);
    expect(res.body.booking).toBeDefined();
    expect(res.body.booking.id).toBe(bookingId);
  });

  it('GET /api/consultations/:id — returns 404 for nonexistent booking', async () => {
    const fakeId = '507f1f77bcf86cd799439011';
    const res = await request.get(`/api/consultations/${fakeId}`);

    expect(res.status).toBe(404);
  });

  it('PATCH /api/consultations/:id/status — updates booking status', async () => {
    const createRes = await request
      .post('/api/consultations')
      .send(validBooking);

    const bookingId = createRes.body.bookingId;
    const res = await request
      .patch(`/api/consultations/${bookingId}/status`)
      .send({ status: 'confirmed' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.booking.status).toBe('confirmed');
  });

  it('PATCH /api/consultations/:id/status — rejects invalid status', async () => {
    const createRes = await request
      .post('/api/consultations')
      .send(validBooking);

    const bookingId = createRes.body.bookingId;
    const res = await request
      .patch(`/api/consultations/${bookingId}/status`)
      .send({ status: 'invalid-status' });

    expect(res.status).toBe(400);
  });
});
