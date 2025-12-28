import { io, Socket } from 'socket.io-client';
import type { Incident } from '@/types/incident';

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL as string, {
      transports: ['websocket'],
      autoConnect: true,
      auth: (cb) => {
        // Attach token here if you add auth later
        cb({});
      },
    });
  }
  return socket;
}

export type IncidentStatus = 'unverified' | 'partially-verified' | 'verified' | 'in-progress' | 'resolved';

export type ServerToClientEvents = {
  'incident:new': (incident: Incident | { _id: string } & Partial<Incident>) => void;
  'incident:status': (payload: { id: string; status: IncidentStatus; updatedAt: string }) => void;
  'incident:confirm': (payload: { id: string; upvotes: number; updatedAt: string }) => void;
};

export type ClientToServerEvents = {
  'incident:confirm': (payload: { id: string }) => void;
  'incident:status': (payload: { id: string; status: IncidentStatus }) => void;
};
