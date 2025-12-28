import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../src/server.js';
import { ActivityLog } from '../src/models/ActivityLog.js';

let mongod: MongoMemoryServer;

describe('Activity API', () => {
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
    await ActivityLog.deleteMany({});
  });

  it('emits activity entries on incident lifecycle and can be listed', async () => {
    // create incident
    const { body: created } = await request(app as any)
      .post('/api/incidents')
      .send({
        type: 'fire',
        title: 'Smoke',
        description: 'Near warehouse',
        severity: 'high',
        location: { lat: 1, lng: 1, address: 'Somewhere' },
        reportedBy: 'citizen'
      })
      .expect(201);

    // status update
    await request(app as any)
      .patch(`/api/incidents/${created.id}/status`)
      .send({ status: 'verified' })
      .expect(200);

    // confirm
    await request(app as any).post(`/api/incidents/${created.id}/confirm`).expect(200);

    // list activity
    const list = await request(app as any).get('/api/activity').expect(200);
    expect(Array.isArray(list.body)).toBe(true);
    expect(list.body.length).toBeGreaterThanOrEqual(3);

    // filter by incidentId
    const filtered = await request(app as any)
      .get(`/api/activity?incidentId=${created.id}`)
      .expect(200);
    expect(filtered.body.every((a: any) => a.incidentId === created.id)).toBe(true);
  });
});
