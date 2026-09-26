import axios from 'axios';
import {
  Incident, AIAnalysisResult, DuplicateMatch, Worker, Department,
  NotificationItem, OverviewMetrics, InsightItem, CitizenReportItem,
  IssueAnalysisRequest, IssueAnalysisResponse,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('urbanfix_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiService = {
  // ── Auth ────────────────────────────────────────────────────────────────
  login: (email_or_mobile: string, password: string) =>
    api.post('/auth/login', { email_or_mobile, password }),

  register: (data: { name: string; email: string; mobile: string; password: string; city?: string; ward?: string }) =>
    api.post('/auth/register', data),

  getMe: () => api.get('/auth/me'),

  sendMobileOtp: (mobile: string) =>
    api.post('/auth/mobile/send-otp', { mobile }),

  verifyMobileOtp: (mobile: string, otp: string) =>
    api.post('/auth/mobile/verify-otp', { mobile, otp }),

  sendIdentityOtp: (id_number: string) =>
    api.post('/auth/identity/send-otp', { id_number }),

  verifyIdentityOtp: (id_number: string, otp: string, consent_given: boolean) =>
    api.post('/auth/identity/verify', { id_number, otp, consent_given }),

  // ── Reports ─────────────────────────────────────────────────────────────
  analyzeReport: (text: string, landmark: string = '', input_type: string = 'photo') =>
    api.post<AIAnalysisResult>('/reports/analyze', null, { params: { text, landmark, input_type } }),

  checkDuplicate: (category: string, latitude: number, longitude: number, text: string = '') =>
    api.post<DuplicateMatch>('/reports/check-duplicate', { category, latitude, longitude, text }),

  submitReport: (data: {
    input_type: string;
    original_text?: string;
    image_url?: string;
    video_url?: string;
    audio_url?: string;
    latitude: number;
    longitude: number;
    landmark?: string;
    ward?: string;
    anonymous?: boolean;
    join_incident_id?: string;
  }) => api.post('/reports', data),

  getMyReports: () => api.get<CitizenReportItem[]>('/reports/me'),

  // ── Incidents ───────────────────────────────────────────────────────────
  getIncidents: (params?: { category?: string; status?: string; severity?: string; department_id?: string; sort_by?: string }) =>
    api.get<Incident[]>('/incidents', { params }),

  getIncidentDetail: (id: string) => api.get<Incident>(`/incidents/${id}`),

  assignWorker: (incident_id: string, worker_id: string) =>
    api.post(`/incidents/${incident_id}/assign`, { worker_id }),

  acceptTask: (incident_id: string) =>
    api.post(`/incidents/${incident_id}/accept`),

  startWork: (incident_id: string) =>
    api.post(`/incidents/${incident_id}/start`),

  completeWork: (incident_id: string, after_url: string, worker_note?: string) =>
    api.post(`/incidents/${incident_id}/complete`, { after_url, worker_note }),

  submitFeedback: (incident_id: string, resolved: boolean, comment?: string) =>
    api.post(`/incidents/${incident_id}/feedback`, { resolved, comment }),

  reopenIncident: (incident_id: string, reason: string) =>
    api.post(`/incidents/${incident_id}/reopen`, { reason }),

  // ── Workers ─────────────────────────────────────────────────────────────
  getWorkers: (department_id?: string) =>
    api.get<Worker[]>('/workers', { params: { department_id } }),

  getMyWorkerTasks: () => api.get<Incident[]>('/workers/me/tasks'),

  // ── Departments ─────────────────────────────────────────────────────────
  getDepartments: () => api.get<Department[]>('/departments'),

  getDepartmentIncidents: (department_id: string) =>
    api.get<Incident[]>(`/departments/${department_id}/incidents`),

  // ── Analytics ───────────────────────────────────────────────────────────
  getOverview: () => api.get<OverviewMetrics>('/analytics/overview'),
  getCategories: () => api.get<{ category: string; count: number }[]>('/analytics/categories'),
  getAreas: () => api.get<{ area: string; count: number }[]>('/analytics/areas'),
  getDepartmentStats: () => api.get<any[]>('/analytics/departments'),
  getTrends: () => api.get<{ day: string; reported: number; resolved: number }[]>('/analytics/trends'),
  getInsights: () => api.get<InsightItem[]>('/analytics/insights'),

  // ── Notifications ────────────────────────────────────────────────────────
  getNotifications: () => api.get<NotificationItem[]>('/notifications'),
  markNotificationRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllNotificationsRead: () => api.post('/notifications/read-all'),

  // ── Media Upload ─────────────────────────────────────────────────────────
  uploadMedia: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ url: string; filename: string; size: number }>('/upload/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // ── AI Triage (v1) ───────────────────────────────────────────────────────
  analyzeIssueWithAI: (data: IssueAnalysisRequest) =>
    api.post<IssueAnalysisResponse>('/api/v1/ai/analyze', data),
};

// Named export for direct fetch-based usage (no axios)
export async function analyzeIssueWithAI(data: IssueAnalysisRequest): Promise<IssueAnalysisResponse> {
  const token = localStorage.getItem('urbanfix_token');
  const response = await fetch(`${API_BASE}/api/v1/ai/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`AI Analysis failed: ${response.statusText}`);
  }
  return response.json();
}
