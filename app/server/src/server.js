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

dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
  })
);

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: process.env.CORS_ORIGIN?.split(',') || '*' },
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
