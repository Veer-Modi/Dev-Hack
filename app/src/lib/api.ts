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

export async function escalateIncident(id: string) {
  const res = await fetch(`${BASE_URL}/api/incidents/${id}/escalate`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to escalate incident');
  return res.json();
}

// Analytics API
export interface IncidentAnalytics {
  total: number;
  resolved: number;
  active: number;
  byType: { _id: string; count: number }[];
  bySeverity: { _id: string; count: number }[];
}

export interface Hotspot {
  location: { lat: number; lng: number };
  incidents: number;
  score: number;
  type: string;
  severity: string;
}

export interface Prediction {
  type: string;
  severity: string;
  probability: number;
  expectedTimeframe: string;
}

export async function getIncidentAnalytics(days: number = 30) {
  const res = await fetch(`${BASE_URL}/api/analytics/incidents?days=${days}`);
  if (!res.ok) throw new Error('Failed to fetch incident analytics');
  return res.json() as Promise<IncidentAnalytics>;
}

export async function getHotspots() {
  const res = await fetch(`${BASE_URL}/api/analytics/hotspots`);
  if (!res.ok) throw new Error('Failed to fetch hotspots');
  return res.json() as Promise<Hotspot[]>;
}

export async function predictIncidents(location: { lat: number; lng: number }, timeRange: number = 24) {
  const res = await fetch(`${BASE_URL}/api/analytics/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ location, timeRange })
  });
  if (!res.ok) throw new Error('Failed to predict incidents');
  return res.json() as Promise<Prediction[]>;
}

// Leaderboard API
export interface UserStats {
  totalReports: number;
  verifiedReports: number;
  resolvedReports: number;
  totalUpvotes: number;
  streak: number;
  lastReportDate?: string;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  role: string;
  points: number;
  level: number;
  badges: string[];
  stats: UserStats;
}

export interface UserActivityStats {
  stats: UserStats;
  recentActivity: {
    title: string;
    type: string;
    severity: string;
    status: string;
    reportedAt: string;
  }[];
  totalPoints: number;
  level: number;
  badges: string[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
}

export async function getTopReporters(limit: number = 10, days: number = 30) {
  const res = await fetch(`${BASE_URL}/api/leaderboards/top-reporters?limit=${limit}&days=${days}`);
  if (!res.ok) throw new Error('Failed to fetch leaderboard');
  return res.json() as Promise<LeaderboardUser[]>;
}

export async function getUserProfile(userId: string) {
  const res = await fetch(`${BASE_URL}/api/leaderboards/profile/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch user profile');
  return res.json() as Promise<any>;
}

export async function getUserStats(userId: string) {
  const res = await fetch(`${BASE_URL}/api/leaderboards/stats/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch user stats');
  return res.json() as Promise<UserActivityStats>;
}

export async function getAvailableBadges() {
  const res = await fetch(`${BASE_URL}/api/leaderboards/badges`);
  if (!res.ok) throw new Error('Failed to fetch badges');
  return res.json() as Promise<Badge[]>;
}

// Notification API
export interface NotificationSubscription {
  userId: string;
  token: string;
  filters: {
    severity?: string[];
    types?: string[];
    radius?: number;
    location?: { lat: number; lng: number };
  };
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  incidentUpdates: boolean;
  systemAlerts: boolean;
  subscriptionAreas: any[];
  subscriptionTypes: string[];
}

export async function subscribeToNotifications(userId: string, token: string, filters: any) {
  const res = await fetch(`${BASE_URL}/api/notifications/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, token, filters }),
  });
  if (!res.ok) throw new Error('Failed to subscribe to notifications');
  return res.json();
}

export async function unsubscribeFromNotifications(userId: string, token: string) {
  const res = await fetch(`${BASE_URL}/api/notifications/unsubscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, token }),
  });
  if (!res.ok) throw new Error('Failed to unsubscribe from notifications');
  return res.json();
}

export async function getUserNotificationSubscriptions(userId: string) {
  const res = await fetch(`${BASE_URL}/api/notifications/subscriptions/${userId}`);
  if (!res.ok) throw new Error('Failed to get notification subscriptions');
  return res.json() as Promise<NotificationSubscription[]>;
}

export async function getUserNotificationPreferences(userId: string) {
  const res = await fetch(`${BASE_URL}/api/notifications/preferences/${userId}`);
  if (!res.ok) throw new Error('Failed to get notification preferences');
  return res.json() as Promise<{ preferences: NotificationPreferences }>;
}

export async function updateUserNotificationPreferences(userId: string, preferences: Partial<NotificationPreferences>) {
  const res = await fetch(`${BASE_URL}/api/notifications/preferences/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preferences),
  });
  if (!res.ok) throw new Error('Failed to update notification preferences');
  return res.json();
}

// Media API
export interface MediaUploadResponse {
  url: string;
  publicId: string;
  format: string;
  size: number;
  resourceType: string;
}

export interface MediaDetails {
  publicId: string;
  url: string;
  format: string;
  size: number;
  resourceType: string;
  createdAt: string;
  tags: string[];
}

export async function uploadMedia(file: File): Promise<MediaUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${BASE_URL}/api/media/upload`, {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to upload media');
  }

  return res.json();
}

export async function uploadMultipleMedia(files: File[]): Promise<MediaUploadResponse[]> {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));

  const res = await fetch(`${BASE_URL}/api/media/upload-multiple`, {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to upload media');
  }

  return res.json();
}

export async function getMediaDetails(publicId: string): Promise<MediaDetails> {
  const res = await fetch(`${BASE_URL}/api/media/details/${publicId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!res.ok) throw new Error('Failed to get media details');

  return res.json();
}

export async function deleteMedia(publicId: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/media/delete/${publicId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!res.ok) throw new Error('Failed to delete media');

  return res.json();
}

// Survey API
export interface SurveyResponse {
  overallSatisfaction?: number;
  responseTime?: number;
  resolutionQuality?: number;
  staffCourtesy?: number;
  wouldRecommend?: boolean;
  additionalComments?: string;
  rating?: number;
}

export interface SurveySubmission {
  id: string;
  incidentId: string;
  respondentId: string;
  respondentType: 'reporter' | 'responder' | 'citizen';
  responses: SurveyResponse;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface SurveyStats {
  count: number;
  averageRating: number | null;
  averageSatisfaction: number | null;
  averageResponseTime: number | null;
  averageResolutionQuality: number | null;
  averageStaffCourtesy: number | null;
  wouldRecommendPercentage: number | null;
  stats: any;
}

export async function submitSurvey(incidentId: string, respondentType: 'reporter' | 'responder' | 'citizen', responses: SurveyResponse): Promise<SurveySubmission> {
  const res = await fetch(`${BASE_URL}/api/surveys`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ incidentId, respondentType, responses }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to submit survey');
  }

  return res.json();
}

export async function getSurveyForIncident(incidentId: string): Promise<SurveySubmission> {
  const res = await fetch(`${BASE_URL}/api/surveys/incident/${incidentId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to get survey');
  }

  return res.json();
}

export async function getSurveyStatsForIncident(incidentId: string): Promise<SurveyStats> {
  const res = await fetch(`${BASE_URL}/api/surveys/incident/${incidentId}/stats`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to get survey stats');
  }

  return res.json();
}

export async function getUserSurveys(userId: string): Promise<SurveySubmission[]> {
  const res = await fetch(`${BASE_URL}/api/surveys/user/${userId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to get user surveys');
  }

  return res.json();
}
