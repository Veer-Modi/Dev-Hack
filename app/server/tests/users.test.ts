import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../src/server.js';
import { User } from '../src/models/User.js';

let mongod: MongoMemoryServer;

describe('Users API', () => {
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
    await User.deleteMany({});
  });

  it('creates and lists users', async () => {
    const create = await request(app as any)
      .post('/api/users')
      .send({ name: 'Alice', email: 'alice@example.com', role: 'responder' })
      .expect(201);
    expect(create.body).toMatchObject({ name: 'Alice', role: 'responder' });

    const list = await request(app as any).get('/api/users').expect(200);
    expect(Array.isArray(list.body)).toBe(true);
    expect(list.body.length).toBe(1);
  });

  it('updates user fields and deactivates', async () => {
    const { body: user } = await request(app as any)
      .post('/api/users')
      .send({ name: 'Bob', email: 'bob@example.com', role: 'citizen' })
      .expect(201);

    const upd = await request(app as any)
      .patch(`/api/users/${user.id}`)
      .send({ role: 'admin', isActive: false })
      .expect(200);

    expect(upd.body.role).toBe('admin');
    expect(upd.body.isActive).toBe(false);
  });
});
