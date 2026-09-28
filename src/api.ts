import { User, EventConfig, Track, Project, Score, AuditLogEntry } from './types';

const TOKEN_KEY = 'judgelayer_auth_token';

let currentAuthToken: string | null = null;
if (typeof window !== 'undefined') {
  const isJudgePath = window.location.pathname.startsWith('/judge');
  currentAuthToken = localStorage.getItem(TOKEN_KEY) || (isJudgePath ? 'session_judge_a_ada_102' : 'session_organizer_sec_991');
}

export function setClientToken(token: string | null) {
  currentAuthToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }
}

export function getClientToken(): string | null {
  return currentAuthToken;
}

// Helper for fetch with credentials, Bearer tokens, and fallback error parsing
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  // Inject Bearer token and X-Session-Token to survive iframe third-party cookie partitioning
  if (currentAuthToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${currentAuthToken}`);
    headers.set('X-Session-Token', currentAuthToken);
  }

  // Include credentials for session cookies
  const res = await fetch(endpoint, {
    ...options,
    headers,
    credentials: 'same-origin',
  });

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const data = await res.json();
    if (!res.ok) {
      const error: any = new Error(data.message || `Request failed with status ${res.status}`);
      error.status = res.status;
      error.data = data;
      throw error;
    }
    return data;
  }

  if (!res.ok) {
    const text = await res.text();
    const error: any = new Error(text || `Request failed with status ${res.status}`);
    error.status = res.status;
    throw error;
  }

  return res.text();
}

export const api = {
  getClientToken,
  setClientToken,

  async getSession(): Promise<{ authenticated: boolean; user: User; token: string | null }> {
    return apiFetch('/api/session');
  },

  async switchRole(roleOrUserId: string): Promise<{ success: boolean; user: User; token?: string }> {
    const res = await apiFetch('/api/auth/switch', {
      method: 'POST',
      body: JSON.stringify({ roleOrUserId }),
    });
    if (res.token) {
      setClientToken(res.token);
    } else if (roleOrUserId === 'visitor') {
      setClientToken(null);
    }
    return res;
  },

  async getEvent(): Promise<EventConfig> {
    return apiFetch('/api/event');
  },

  async updateEvent(patch: Partial<EventConfig>): Promise<{ success: boolean; event: EventConfig }> {
    return apiFetch('/api/event', {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
  },

  async getTracks(): Promise<Track[]> {
    return apiFetch('/api/tracks');
  },

  async getProjects(params: { q?: string; track?: string; status?: string } = {}): Promise<Project[]> {
    const query = new URLSearchParams();
    if (params.q) query.set('q', params.q);
    if (params.track) query.set('track', params.track);
    if (params.status) query.set('status', params.status);
    const qs = query.toString();
    return apiFetch(`/api/projects${qs ? `?${qs}` : ''}`);
  },

  async getProject(id: string): Promise<Project> {
    return apiFetch(`/api/projects/${id}`);
  },

  async createProject(data: Partial<Project>): Promise<Project> {
    return apiFetch('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    return apiFetch(`/api/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async getJudgeProjects(): Promise<{
    judge_id: string;
    total_assigned: number;
    reviewed_count: number;
    projects: Project[];
  }> {
    return apiFetch('/api/judge/projects');
  },

  async getJudgeScores(requestedJudge?: string): Promise<Score[]> {
    const url = requestedJudge ? `/api/judge/scores?judge=${requestedJudge}` : '/api/judge/scores';
    return apiFetch(url);
  },

  async submitScore(ballot: Partial<Score>): Promise<{ success: boolean; score: Score }> {
    return apiFetch('/api/judge/scores', {
      method: 'POST',
      body: JSON.stringify(ballot),
    });
  },

  async getOrganizerDashboard(): Promise<any> {
    return apiFetch('/api/organizer/dashboard');
  },

  async getAssignmentsMatrix(): Promise<any> {
    return apiFetch('/api/organizer/assignments');
  },

  async toggleAssignment(judge_id: string, project_id: string, assigned: boolean): Promise<{ success: boolean }> {
    return apiFetch('/api/organizer/assignments', {
      method: 'POST',
      body: JSON.stringify({ judge_id, project_id, assigned }),
    });
  },

  async togglePublishResults(published: boolean): Promise<{ success: boolean; results_published: boolean }> {
    return apiFetch('/api/organizer/publish', {
      method: 'POST',
      body: JSON.stringify({ published }),
    });
  },

  async getResults(): Promise<{
    published: boolean;
    isOrganizerPreview?: boolean;
    message?: string;
    standings: any[];
    globalStats?: { mean: number; std: number };
  }> {
    return apiFetch('/api/results');
  },

  async getAuditLogs(): Promise<AuditLogEntry[]> {
    return apiFetch('/api/audit');
  },

  async triggerSecurityProbe(probeType: 'peer_isolation' | 'participant_barrier' | 'deadline_bypass'): Promise<any> {
    return apiFetch('/api/audit/probe', {
      method: 'POST',
      body: JSON.stringify({ probeType }),
    });
  },

  async resetFixtures(): Promise<any> {
    return apiFetch('/api/reset', { method: 'POST' });
  },

  getExportCsvUrl(type: string = 'scores'): string {
    return `/api/export.csv?type=${type}`;
  },
};
