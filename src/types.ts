export type UserRole = 'organizer' | 'judge' | 'participant' | 'visitor';

export interface User {
  id: string;
  judge_id?: string;
  name: string;
  email: string;
  role: UserRole;
  token?: string;
  avatar?: string;
  title?: string;
  team_id?: string;
}

export interface Track {
  id: string;
  name: string;
  description: string;
}

export interface TeamMember {
  name: string;
  role: string;
  email: string;
}

export interface Team {
  id: string;
  name: string;
  members: TeamMember[];
}

export interface Project {
  id: string;
  title: string;
  track_id: string;
  team_id: string;
  summary: string;
  description: string;
  repo_url: string;
  demo_url: string;
  submitted_at: string;
  status: 'draft' | 'submitted' | 'withdrawn';
  is_duplicate?: boolean;
  track_name?: string;
  team_name?: string;
  team_members?: TeamMember[];
  reviews_count?: number;
  myScore?: Score | null;
  reviewStatus?: 'none' | 'pending' | 'draft' | 'submitted';
}

export interface Score {
  id: string;
  judge_id: string;
  project_id: string;
  functionality: number;
  quality: number;
  innovation: number;
  impact: number;
  comment: string;
  status: 'draft' | 'submitted';
  created_at: string;
  updated_at: string;
  _composite?: number;
  _normalized?: number;
}

export interface JudgeAssignment {
  judge_id: string;
  project_id: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor_id: string;
  actor_name: string;
  action: string;
  resource_type: string;
  resource_id: string;
  status: 'SUCCESS' | 'BLOCKED_403' | 'ENFORCED';
  details: string;
}

export interface EventConfig {
  id: string;
  name: string;
  tagline: string;
  submissions_close: string;
  status: 'open' | 'closed' | 'judging' | 'concluded';
  results_published: boolean;
  review_target_per_project: number;
  is_deadline_passed?: boolean;
  current_time?: string;
}

export interface JudgeCalibrationStat {
  count: number;
  mean: number;
  std: number;
  rawScores: number[];
}

export interface ProjectSummary {
  id: string;
  title: string;
  track_id: string;
  team_id: string;
  repo_url: string;
  demo_url: string;
  reviewsCount: number;
  targetReviews: number;
  coveragePercent: number;
  rawScore: number;
  normalizedScore: number;
  isDuplicate: boolean;
  feedbackCount: number;
}
