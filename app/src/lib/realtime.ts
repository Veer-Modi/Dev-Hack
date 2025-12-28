import { io, Socket } from 'socket.io-client';
import type { Incident } from '@/types/incident';

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    socket = io(apiUrl, {
      transports: ['websocket'],
      autoConnect: false, // Don't auto-connect, handle connection errors gracefully
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
      timeout: 20000, // 20 second timeout
      auth: (cb) => {
        // Attach token here if you add auth later
        cb({});
      },
    });
    
    // Attempt to connect, but handle errors gracefully
    socket.on('connect_error', (error) => {
      console.warn('WebSocket connection failed:', error.message);
      console.warn('The app will continue to work with mock data.');
    });
    
    socket.on('connect_timeout', (timeout) => {
      console.warn('WebSocket connection timed out after', timeout, 'ms');
      console.warn('The app will continue to work with mock data.');
    });
    
    socket.connect();
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
