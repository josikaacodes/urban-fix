export type Department = 'highways' | 'electric' | 'hydro' | 'sanitation';
export type TicketStatus = 'critical' | 'assigned' | 'pending' | 'resolved';
export type AppView = 'landing' | 'login' | 'dashboard' | 'citizen';
export type Language = 'en' | 'ta';

export interface UserSession {
  role: 'citizen' | 'official' | null;
  identifier: string;
  name: string;
  ward: string;
}

export interface AuthUser {
  id: string;
  name: string;
  role: 'nodal_officer' | 'field_lead' | 'chief_auditor' | 'citizen';
  roleTitle: string;
  badgeId: string;
  ward: string;
  email: string;
  avatarInitials: string;
}

export interface CitizenAuditFeedback {
  verified: boolean;
  rating: number; // 1 to 5
  physicalState: 'Fully Fixed' | 'Partially Fixed' | 'Not Fixed';
  remarks: string;
  verifiedAt: string;
}

export interface Ticket {
  id: string; // e.g. "W42-9842"
  docketNumber: string; // "#W42-9842" or "#W42-2026-9842"
  title: string;
  description: string;
  quote?: string;
  department: Department;
  deptLabel: string;
  location: string;
  coordinates: string;
  status: TicketStatus;
  statusLabel: string;
  badgeClass: string;
  loggedTimeAgo: string;
  slaRemainingSeconds: number;
  initialSlaSeconds: number;
  aiConfidence: string;
  defectType: string;
  assignedLead?: string;
  assignedCrew?: string;
  etaMinutes?: number;
  evidencePhoto: string;
  completionPhoto?: string;
  inspectionStatus?: string;
  mapCoords: { x: number; y: number }; // SVG map coordinates
  mergedDuplicatesCount?: number;
  audioUrl?: string;
  audioDuration?: string;
  lifecycleStage: 'logged' | 'inspected' | 'repaired' | 'verified';
  citizenFeedback?: CitizenAuditFeedback | null;
  citizenSignOff?: {
    verified: boolean;
    rating?: number;
    feedback?: string;
    verifiedAt?: string;
  };
}

export interface FieldUnit {
  id: string;
  name: string;
  type: 'lineman' | 'patch' | 'hydro' | 'sanitation';
  typeLabel: string;
  lead: string;
  status: 'Deployed' | 'En Route' | 'On-Site' | 'Idle';
  activeDocket?: string;
  location: string;
  coords: { x: number; y: number };
  battery: number;
  eta?: string;
  contactNumber: string;
}

export interface AuditRecord {
  id: string;
  docketId: string;
  timestamp: string;
  action: string;
  officer: string;
  details: string;
  slaMet: boolean;
}
