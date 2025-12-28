const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001') as string;

// Store token in localStorage
const getToken = () => localStorage.getItem('auth_token');
const setToken = (token: string) => localStorage.setItem('auth_token', token);
const removeToken = () => localStorage.removeItem('auth_token');

// API request helper with auth
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  const url = `${BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export async function checkHealth() {
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    return res.ok;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}

// Auth API calls
export const authAPI = {
  login: async (email: string, password: string, role: 'responder' | 'admin') => {
    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });
    
    if (data.token) {
      setToken(data.token);
    }
    
    return data;
  },

  logout: async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } finally {
      removeToken();
    }
  },

  getProfile: async () => {
    return apiRequest('/api/auth/me');
  },

  verifyToken: async () => {
    return apiRequest('/api/auth/verify');
  },
};

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
  try {
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Failed to fetch incidents: ${res.status} ${res.statusText}`);
    return res.json();
  } catch (error) {
    console.error('Failed to fetch incidents from API:', error);
    throw error;
  }
}

// Users
export type CreateUserPayload = { name: string; email: string; role: 'citizen' | 'responder' | 'admin'; password?: string };

export async function getUsers(params?: { role?: string; active?: boolean }) {
  const token = getToken();
  const url = new URL('/api/users', BASE_URL);
  if (params?.role) url.searchParams.set('role', params.role);
  if (params?.active != null) url.searchParams.set('active', String(params.active));
  
  try {
    const res = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    if (!res.ok) throw new Error(`Failed to fetch users: ${res.status} ${res.statusText}`);
    return res.json();
  } catch (error) {
    console.error('Failed to fetch users from API:', error);
    throw error;
  }
}

export async function createUser(payload: CreateUserPayload) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/api/users`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(payload),
  });
  try {
    if (!res.ok) throw new Error(`Failed to create user: ${res.status} ${res.statusText}`);
    return res.json();
  } catch (error) {
    console.error('Failed to create user from API:', error);
    throw error;
  }
}

export async function updateUser(id: string, updates: Partial<{ name: string; email: string; role: string; isActive: boolean }>) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/api/users/${id}`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(updates),
  });
  try {
    if (!res.ok) throw new Error(`Failed to update user: ${res.status} ${res.statusText}`);
    return res.json();
  } catch (error) {
    console.error('Failed to update user from API:', error);
    throw error;
  }
}

export async function deleteUser(id: string) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/api/users/${id}`, { 
    method: 'DELETE',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  try {
    if (!res.ok) throw new Error(`Failed to delete user: ${res.status} ${res.statusText}`);
    return res.json();
  } catch (error) {
    console.error('Failed to delete user from API:', error);
    throw error;
  }
}

export async function resetUserPassword(id: string) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/api/users/${id}/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  try {
    if (!res.ok) throw new Error(`Failed to reset password: ${res.status} ${res.statusText}`);
    return res.json();
  } catch (error) {
    console.error('Failed to reset password from API:', error);
    throw error;
  }
}

// Activity
export async function getActivity(params?: { userId?: string; incidentId?: string; limit?: number; page?: number }) {
  const url = new URL('/api/activity', BASE_URL);
  if (params) Object.entries(params).forEach(([k, v]) => v != null && url.searchParams.set(k, String(v)));
  try {
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Failed to fetch activity: ${res.status} ${res.statusText}`);
    return res.json();
  } catch (error) {
    console.error('Failed to fetch activity from API:', error);
    throw error;
  }
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
  try {
    if (!res.ok) throw new Error(`Failed to update incident: ${res.status} ${res.statusText}`);
    return res.json();
  } catch (error) {
    console.error('Failed to update incident from API:', error);
    throw error;
  }
}

export async function createIncident(payload: CreateIncidentPayload) {
  const res = await fetch(`${BASE_URL}/api/incidents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  try {
    if (!res.ok) throw new Error(`Failed to create incident: ${res.status} ${res.statusText}`);
    return res.json();
  } catch (error) {
    console.error('Failed to create incident from API:', error);
    throw error;
  }
}

export async function updateIncidentStatus(id: string, status: string) {
  const res = await fetch(`${BASE_URL}/api/incidents/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  try {
    if (!res.ok) throw new Error(`Failed to update status: ${res.status} ${res.statusText}`);
    return res.json();
  } catch (error) {
    console.error('Failed to update status from API:', error);
    throw error;
  }
}

export async function confirmIncident(id: string) {
  const res = await fetch(`${BASE_URL}/api/incidents/${id}/confirm`, { method: 'POST' });
  try {
    if (!res.ok) throw new Error(`Failed to confirm incident: ${res.status} ${res.statusText}`);
    return res.json();
  } catch (error) {
    console.error('Failed to confirm incident from API:', error);
    throw error;
  }
}
