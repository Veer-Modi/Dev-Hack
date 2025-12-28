const BASE_URL = import.meta.env.VITE_API_URL as string;

export type CreateIncidentPayload = {
  type: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  location: { lat: number; lng: number; address: string };
  mediaUrls?: string[];
  reportedBy?: string;
};

export async function getIncidents(params?: { status?: string; severity?: string; limit?: number; page?: number }) {
  const url = new URL('/api/incidents', BASE_URL);
  if (params) Object.entries(params).forEach(([k, v]) => v != null && url.searchParams.set(k, String(v)));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to fetch incidents');
  return res.json();
}

// Users
export type CreateUserPayload = { name: string; email: string; role: 'citizen' | 'responder' | 'admin' };

export async function getUsers(params?: { role?: string; active?: boolean }) {
  const url = new URL('/api/users', BASE_URL);
  if (params?.role) url.searchParams.set('role', params.role);
  if (params?.active != null) url.searchParams.set('active', String(params.active));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function createUser(payload: CreateUserPayload) {
  const res = await fetch(`${BASE_URL}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create user');
  return res.json();
}

export async function updateUser(id: string, updates: Partial<{ name: string; email: string; role: string; isActive: boolean }>) {
  const res = await fetch(`${BASE_URL}/api/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update user');
  return res.json();
}

export async function deleteUser(id: string) {
  const res = await fetch(`${BASE_URL}/api/users/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete user');
  return res.json();
}

// Activity
export async function getActivity(params?: { userId?: string; incidentId?: string; limit?: number; page?: number }) {
  const url = new URL('/api/activity', BASE_URL);
  if (params) Object.entries(params).forEach(([k, v]) => v != null && url.searchParams.set(k, String(v)));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to fetch activity');
  return res.json();
}

export async function updateIncident(
  id: string,
  updates: Partial<{
    title: string;
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    location: { lat: number; lng: number; address: string };
    assignedTo: string;
  }>
) {
  const res = await fetch(`${BASE_URL}/api/incidents/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update incident');
  return res.json();
}

export async function createIncident(payload: CreateIncidentPayload) {
  const res = await fetch(`${BASE_URL}/api/incidents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create incident');
  return res.json();
}

export async function updateIncidentStatus(id: string, status: string) {
  const res = await fetch(`${BASE_URL}/api/incidents/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update status');
  return res.json();
}

export async function confirmIncident(id: string) {
  const res = await fetch(`${BASE_URL}/api/incidents/${id}/confirm`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to confirm incident');
  return res.json();
}
