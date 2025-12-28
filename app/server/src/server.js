import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Server as SocketIOServer } from 'socket.io';
import { incidentsRouter } from './routes/incidents.js';
import { usersRouter } from './routes/users.js';
import { activityRouter } from './routes/activity.js';
import { adminRouter } from './routes/admin.js';
import { authRouter } from './routes/auth.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: ['http://localhost:8080', 'http://localhost:8081', 'http://172.29.41.39:8080', 'http://172.29.41.39:8081'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080', 'http://localhost:3001'] },
});

io.on('connection', (socket) => {
  // In real app, verify JWT here from socket.handshake.auth?.token
  socket.on('disconnect', () => {});
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/incidents', incidentsRouter(io));
app.use('/api/users', usersRouter);
app.use('/api/activity', activityRouter);
app.use('/api/admin', adminRouter);
app.use('/api/auth', authRouter);

const PORT = process.env.PORT || 3001;

export async function start() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set');
    process.exit(1);
  }
  await mongoose.connect(uri, { dbName: uri.split('/').pop() || 'rapidresponse' });
  server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

if (process.env.NODE_ENV !== 'test') {
  start().catch((err) => {
    console.error('Failed to start server', err);
    process.exit(1);
  });
}

export { app, server };
