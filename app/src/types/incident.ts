export type Severity = "critical" | "high" | "medium" | "low";
export type IncidentStatus =
  | "unverified"
  | "partially-verified"
  | "verified"
  | "in-progress"
  | "resolved";
export type UserRole = "citizen" | "responder" | "admin";

export interface Incident {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: Severity;
  status: IncidentStatus;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  reportedBy: string;
  reportedAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  mediaUrls?: string[];
  upvotes: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
  isActive: boolean;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  incidentId?: string;
  timestamp: Date;
  details?: string;
}
