export type UserRole = 'citizen' | 'authority' | 'department_head' | 'worker';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  role: UserRole;
  mobile_verified: boolean;
  identity_verified: boolean;
  city?: string;
  ward?: string;
  anonymous_reporting_enabled?: boolean;
  created_at?: string;
}

export interface PriorityFactor {
  factor: string;
  score: number;
  description: string;
}

export interface RiskFactor {
  factor: string;
  impact: string;
}

export interface AIAnalysisResult {
  category: string;
  detected_category: string;
  confidence: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  severity_score: number;
  priority_score: number;
  recommended_department: string;
  standardized_description: string;
  standardized_title: string;
  routing_confidence: number;
  risk_factors: RiskFactor[];
  priority_breakdown: PriorityFactor[];
}

export interface DuplicateMatch {
  is_duplicate: boolean;
  match_confidence: number;
  master_incident_id?: string;
  existing_incident?: {
    id: string;
    incident_code: string;
  };
  category?: string;
  distance_meters?: number;
  reported_time_ago?: string;
  existing_reporters_count?: number;
  landmark?: string;
  status?: string;
}

export interface IncidentTimelineItem {
  id: string;
  event: string;
  actor: string;
  timestamp: string;
  metadata_json?: string;
}

export interface ResolutionEvidence {
  before_url?: string;
  after_url: string;
  worker_note?: string;
  submitted_at: string;
}

export interface ResolutionVerification {
  confidence: number;
  status: 'VERIFIED' | 'NEEDS_HUMAN_REVIEW' | 'VERIFICATION_FAILED';
  reason?: string;
  issue_remaining: boolean;
  created_at: string;
}

export interface CitizenReportItem {
  id: string;
  report_code: string;
  incident_id?: string;
  citizen_name?: string;
  input_type: 'photo' | 'video' | 'text' | 'voice';
  original_text?: string;
  image_url?: string;
  video_url?: string;
  landmark?: string;
  created_at: string;
  anonymous: boolean;
}

export type IncidentStatus =
  | 'SUBMITTED'
  | 'AI_ANALYZING'
  | 'AI_VERIFIED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'PENDING_VERIFICATION'
  | 'RESOLVED'
  | 'CITIZEN_CONFIRMED'
  | 'CLOSED'
  | 'REOPENED'
  | 'VERIFICATION_FAILED';

export interface Incident {
  id: string;
  incident_code: string;
  title: string;
  category: string;
  description: string;
  latitude: number;
  longitude: number;
  landmark?: string;
  ward?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  severity_score: number;
  priority_score: number;
  status: IncidentStatus;
  department_id?: string;
  department_name?: string;
  worker_id?: string;
  worker_name?: string;
  sla_hours: number;
  sla_deadline?: string;
  sla_due_at?: string;
  sla_remaining_seconds?: number;
  sla_breached?: boolean;
  reporter_count: number;
  image_url?: string;
  before_image_url?: string;
  after_image_url?: string;
  created_at: string;
  updated_at: string;
  analysis?: {
    classification_confidence: number;
    standardized_description: string;
    routing_confidence: number;
    risk_summary: RiskFactor[];
    priority_breakdown: PriorityFactor[];
  };
  timeline?: IncidentTimelineItem[];
  evidence?: ResolutionEvidence;
  verification?: ResolutionVerification;
  citizen_reports?: CitizenReportItem[];
}

export interface Worker {
  id: string;
  user_id: string;
  department_id: string;
  department_name?: string;
  name: string;
  phone?: string;
  availability: boolean;
  active_task_count: number;
  latitude: number;
  longitude: number;
  skills: string;
  status?: 'idle' | 'assigned' | 'on_task';
  distance_km?: number;
}

export interface Department {
  id: string;
  name: string;
  code?: string;
  description?: string;
  incident_count: number;
  active_worker_count: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  incident_id?: string;
  type: string;
  read: boolean;
  created_at: string;
}

export interface OverviewMetrics {
  total_incidents: number;
  critical_count: number;
  critical_pending: number;
  high_priority_count: number;
  pending_count: number;
  in_progress_count: number;
  active_dispatches: number;
  resolved_count: number;
  ai_verified_count: number;
  duplicates_merged: number;
  sla_compliance_rate: number;
  avg_resolution_hours: number;
}

export interface InsightItem {
  title: string;
  detail: string;
  type: 'warning' | 'critical' | 'alert' | 'success' | 'info';
}

// AI Triage endpoint types (backend/app/api/v1/ai)
export interface IssueAnalysisRequest {
  title: string;
  description: string;
  image_base64?: string;
  latitude: number;
  longitude: number;
}

export interface IssueAnalysisResponse {
  category: string;
  department: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence_score: number;
  hazard_risk_summary: string;
  recommended_action: string;
  is_emergency: boolean;
  parent_cluster_id?: string | null;
}
