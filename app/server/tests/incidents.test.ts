import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../src/server.js';
import { Incident } from '../src/models/Incident.js';

let mongod: MongoMemoryServer;

describe('Incidents API', () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri('rapidresponse');
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
  });

  beforeEach(async () => {
    await Incident.deleteMany({});
  });

  it('creates and lists incidents', async () => {
    const payload = {
      type: 'fire',
      title: 'Test Fire',
      description: 'Smoke sighted',
      severity: 'high',
      location: { lat: 40.7, lng: -74.0, address: 'NYC' },
      mediaUrls: [],
      reportedBy: 'citizen',
    };
    const createRes = await request(app as any).post('/api/incidents').send(payload).expect(201);
    expect(createRes.body).toMatchObject({ title: 'Test Fire', status: 'unverified' });

    const listRes = await request(app as any).get('/api/incidents').expect(200);
    expect(Array.isArray(listRes.body)).toBe(true);
    expect(listRes.body.length).toBe(1);
  });

  it('updates status and confirms incident', async () => {
    const payload = {
      type: 'flood',
      title: 'Test Flood',
      description: 'Water rising',
      severity: 'medium',
      location: { lat: 40.7, lng: -74.0, address: 'NYC' },
      reportedBy: 'citizen',
    };
    const { body: created } = await request(app as any).post('/api/incidents').send(payload).expect(201);

    const statusRes = await request(app as any)
      .patch(`/api/incidents/${created.id}/status`)
      .send({ status: 'in-progress' })
      .expect(200);
    expect(statusRes.body.status).toBe('in-progress');

    const confirmRes = await request(app as any).post(`/api/incidents/${created.id}/confirm`).expect(200);
    expect(confirmRes.body.upvotes).toBe(1);
  });

  it('general update fields', async () => {
    const { body: created } = await request(app as any)
      .post('/api/incidents')
      .send({
        type: 'medical',
        title: 'Injury',
        description: 'Minor injury',
        severity: 'low',
        location: { lat: 40.7, lng: -74.0, address: 'NYC' },
        reportedBy: 'citizen',
      })
      .expect(201);

    const upd = await request(app as any)
      .patch(`/api/incidents/${created.id}`)
      .send({ title: 'Injury - updated', severity: 'high' })
      .expect(200);

    expect(upd.body.title).toBe('Injury - updated');
    expect(upd.body.severity).toBe('high');
  });
});
