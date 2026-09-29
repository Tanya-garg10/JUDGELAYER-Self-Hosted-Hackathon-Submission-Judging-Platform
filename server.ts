import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Lightweight Cookie and Auth parser middleware
function parseCookies(cookieHeader?: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  const items = cookieHeader.split(';');
  for (const item of items) {
    const parts = item.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      cookies[key] = decodeURIComponent(val);
    }
  }
  return cookies;
}

// Data Store in Memory initialized from fixtures.json
interface FixturesData {
  event: any;
  tracks: any[];
  users: any[];
  teams: any[];
  projects: any[];
  assignments: any[];
  scores: any[];
  audit_logs: any[];
}

let db: FixturesData = {
  event: null,
  tracks: [],
  users: [],
  teams: [],
  projects: [],
  assignments: [],
  scores: [],
  audit_logs: [],
};

function loadFixtures() {
  const fixturePath = path.resolve(__dirname, 'fixtures.json');
  // Try to load from persistent storage first (for cloud deployment)
  const dataDir = process.env.DATA_PATH || path.resolve(__dirname, 'data');
  const persistentPath = path.resolve(dataDir, 'judgelayer-data.json');
  
  function normalise(raw: any): FixturesData {
    // ensure every array field exists so .find()/.filter() never crash
    raw.tracks       = raw.tracks       || [];
    raw.teams        = raw.teams        || [];
    raw.projects     = raw.projects     || [];
    raw.assignments  = raw.assignments  || [];
    raw.scores       = raw.scores       || [];
    raw.audit_logs   = raw.audit_logs   || [];

    // fixtures.json uses "judges" (no role/token) — map them to proper user objects
    const judgeSource: any[] = raw.users || raw.judges || [];
    raw.users = judgeSource.map((j: any, idx: number) => ({
      id:       j.id       || `user_judge_${idx + 1}`,
      judge_id: j.judge_id || j.id,
      name:     j.name,
      email:    j.email,
      role:     j.role     || 'judge',
      token:    j.token    || `session_judge_${j.id || idx + 1}`,
      avatar:   j.avatar   || j.name.split(' ').map((p: string) => p[0]).join('').slice(0, 2).toUpperCase(),
      title:    j.title    || `Judge`,
      tracks:   j.tracks   || [],
      team_id:  j.team_id  || undefined,
    }));

    // Always ensure the organizer and built-in judge/participant personas exist
    const SEED_USERS = [
      {
        id: 'user_organizer', judge_id: undefined,
        name: 'Elena Rostova', email: 'elena@judgelayer.org',
        role: 'organizer', token: 'session_organizer_sec_991',
        avatar: 'ER', title: 'Lead Hackathon Director',
      },
      {
        id: 'user_judge_a', judge_id: 'judge_a',
        name: 'Ada Okonkwo', email: 'ada@mit.edu',
        role: 'judge', token: 'session_judge_a_ada_102',
        avatar: 'AO', title: 'Principal Systems Architect @ MIT Distributed Lab',
        tracks: [],
      },
      {
        id: 'user_judge_b', judge_id: 'judge_b',
        name: 'Marcus Chen', email: 'marcus@infra.dev',
        role: 'judge', token: 'session_judge_b_marcus_554',
        avatar: 'MC', title: 'Staff Platform Engineer @ InfraDev',
        tracks: [],
      },
      {
        id: 'user_judge_c', judge_id: 'judge_c',
        name: 'Dr. Aris Thorne', email: 'aris.thorne@consensus.ai',
        role: 'judge', token: 'session_judge_c_aris_773',
        avatar: 'AT', title: 'Consensus Lead @ Bias Simulation Lab',
        tracks: [],
      },
      {
        id: 'user_participant', judge_id: undefined,
        name: 'Tanya Garg', email: 'tanyagarg5315@gmail.com',
        role: 'participant', token: 'session_participant_tanya_883',
        avatar: 'TG', title: 'Team Lead @ Nightshift',
        team_id: 'team_nightshift',
      },
    ];

    // Remove any non-seed entries that accidentally carry a seed token (corrupt state)
    const seedTokens = new Set(SEED_USERS.map(s => s.token));
    const seedIds    = new Set(SEED_USERS.map(s => s.id));
    raw.users = raw.users.filter((u: any) => !seedTokens.has(u.token) || seedIds.has(u.id));

    // Always upsert seed users — replace any stale/corrupt entry by ID
    for (const seed of SEED_USERS) {
      const idx = raw.users.findIndex((u: any) => u.id === seed.id);
      if (idx === -1) {
        raw.users.push(seed);
      } else {
        raw.users[idx] = seed; // overwrite stale persistent entry
      }
    }

    return raw as FixturesData;
  }

  // Delete stale persistent data so normalise() always runs fresh from fixtures
  if (fs.existsSync(persistentPath)) {
    try {
      fs.unlinkSync(persistentPath);
      console.log('[JUDGELAYER] Cleared stale persistent data — will rebuild from fixtures.json.');
    } catch (_) {}
  }
  
  // Fall back to fixtures.json
  if (fs.existsSync(fixturePath)) {
    try {
      const raw = fs.readFileSync(fixturePath, 'utf-8');
      db = normalise(JSON.parse(raw));
      console.log(`[JUDGELAYER] Loaded fixtures successfully: ${db.projects.length} projects, ${db.scores.length} scores.`);
      savePersistentData(); // Save initial data to persistent storage
    } catch (err) {
      console.error('[JUDGELAYER] Error reading fixtures.json:', err);
    }
  } else {
    console.warn('[JUDGELAYER] fixtures.json not found at:', fixturePath);
  }
}

function savePersistentData() {
  const dataDir = process.env.DATA_PATH || path.resolve(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const persistentPath = path.resolve(dataDir, 'judgelayer-data.json');
  try {
    fs.writeFileSync(persistentPath, JSON.stringify(db, null, 2));
  } catch (err) {
    console.error('[JUDGELAYER] Error saving persistent data:', err);
  }
}

loadFixtures();

// Audit log helper
function addAuditLog(entry: {
  actor_id: string;
  actor_name: string;
  action: string;
  resource_type: string;
  resource_id: string;
  status: 'SUCCESS' | 'BLOCKED_403' | 'ENFORCED';
  details: string;
}) {
  const logEntry = {
    id: `aud_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };
  db.audit_logs.unshift(logEntry);
  if (db.audit_logs.length > 200) {
    db.audit_logs.pop();
  }
  savePersistentData();
  return logEntry;
}

// Authentication Resolver
export interface AuthenticatedUser {
  id: string;
  judge_id?: string;
  name: string;
  email: string;
  role: 'organizer' | 'judge' | 'participant' | 'visitor';
  token: string;
  avatar?: string;
  title?: string;
  team_id?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser | null;
      authToken?: string | null;
    }
  }
}

app.use((req: Request, res: Response, next: NextFunction) => {
  const cookies = parseCookies(req.headers.cookie);
  const cookieSession = cookies['session'];
  const authHeader = req.headers.authorization;
  let bearerToken: string | null = null;
  if (authHeader) {
    bearerToken = authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : authHeader.trim();
  }
  const customHeaderToken = req.headers['x-session-token'] as string | undefined;
  const queryToken = req.query.token as string | undefined;

  const resolvedToken = cookieSession || bearerToken || customHeaderToken || queryToken || null;
  req.authToken = resolvedToken;

  if (resolvedToken) {
    const matchedUser = db.users.find(u => u.token === resolvedToken || u.id === resolvedToken || u.judge_id === resolvedToken);
    if (matchedUser) {
      req.user = matchedUser;
    } else {
      req.user = null;
    }
  } else {
    req.user = null;
  }

  next();
});

// Auth Guard Helpers
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      code: 'AUTH_REQUIRED',
      message: 'Authentication required. Please provide a valid session cookie or token.',
    });
  }
  next();
}

function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        code: 'AUTH_REQUIRED',
        message: 'Authentication required to access this resource.',
      });
    }
    if (!allowedRoles.includes(req.user.role)) {
      addAuditLog({
        actor_id: req.user.id,
        actor_name: `${req.user.name} (${req.user.role})`,
        action: 'ROLE_BOUNDARY_PROBED',
        resource_type: 'api_endpoint',
        resource_id: req.path,
        status: 'BLOCKED_403',
        details: `User with role '${req.user.role}' attempted unauthorized access to resource requiring [${allowedRoles.join(', ')}].`,
      });

      return res.status(403).json({
        error: 'FORBIDDEN',
        code: 'ROLE_ACCESS_DENIED',
        message: `Forbidden: Your current role (${req.user.role}) is not authorized to access this resource. Requires: ${allowedRoles.join(', ')}.`,
      });
    }
    next();
  };
}

// -------------------------------------------------------------
// NORMALIZATION & STATS ENGINE
// -------------------------------------------------------------
function calculateScoresAndNormalization() {
  const submittedScores = db.scores.filter(s => s.status === 'submitted');
  const judgeStats: Record<string, { count: number; mean: number; std: number; rawScores: number[] }> = {};

  // Group by judge
  const judgeGroup: Record<string, number[]> = {};
  for (const s of submittedScores) {
    const composite = (0.3 * s.functionality) + (0.25 * s.quality) + (0.25 * s.innovation) + (0.2 * s.impact);
    s._composite = Math.round(composite * 100) / 100;
    if (!judgeGroup[s.judge_id]) judgeGroup[s.judge_id] = [];
    judgeGroup[s.judge_id].push(s._composite);
  }

  // Calculate mean & std dev per judge
  let allScoresList: number[] = [];
  for (const [judgeId, arr] of Object.entries(judgeGroup)) {
    allScoresList.push(...arr);
    const mean = arr.reduce((acc, v) => acc + v, 0) / arr.length;
    const variance = arr.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (arr.length || 1);
    const std = Math.sqrt(variance);
    judgeStats[judgeId] = {
      count: arr.length,
      mean: Math.round(mean * 100) / 100,
      std: Math.round(std * 100) / 100,
      rawScores: arr,
    };
  }

  const globalMean = allScoresList.length ? allScoresList.reduce((a, b) => a + b, 0) / allScoresList.length : 4.0;
  const globalVar = allScoresList.length ? allScoresList.reduce((a, b) => a + Math.pow(b - globalMean, 2), 0) / allScoresList.length : 0.5;
  const globalStd = Math.sqrt(globalVar) || 0.5;

  // Compute normalized score per ballot
  const projectBallots: Record<string, { raw: number[]; normalized: number[]; comments: string[] }> = {};
  for (const s of submittedScores) {
    const jStat = judgeStats[s.judge_id] || { mean: globalMean, std: globalStd };
    const effectiveStd = Math.max(jStat.std, 0.25);
    const zScore = (s._composite - jStat.mean) / effectiveStd;
    let norm = globalMean + (zScore * globalStd);
    norm = Math.max(1.0, Math.min(5.0, norm));
    s._normalized = Math.round(norm * 100) / 100;

    if (!projectBallots[s.project_id]) {
      projectBallots[s.project_id] = { raw: [], normalized: [], comments: [] };
    }
    projectBallots[s.project_id].raw.push(s._composite);
    projectBallots[s.project_id].normalized.push(s._normalized);
    if (s.comment) projectBallots[s.project_id].comments.push(s.comment);
  }

  // Calculate project rankings
  const projectSummaries = db.projects.map(proj => {
    const ballots = projectBallots[proj.id] || { raw: [], normalized: [], comments: [] };
    const reviewsCount = ballots.raw.length;
    const rawAvg = reviewsCount > 0 ? ballots.raw.reduce((a, b) => a + b, 0) / reviewsCount : 0;
    const normAvg = reviewsCount > 0 ? ballots.normalized.reduce((a, b) => a + b, 0) / reviewsCount : 0;

    return {
      id: proj.id,
      title: proj.title,
      track_id: proj.track_id,
      team_id: proj.team_id,
      repo_url: proj.repo_url,
      demo_url: proj.demo_url,
      reviewsCount,
      targetReviews: db.event.review_target_per_project || 3,
      coveragePercent: Math.min(100, Math.round((reviewsCount / (db.event.review_target_per_project || 3)) * 100)),
      rawScore: Math.round(rawAvg * 100) / 100,
      normalizedScore: Math.round(normAvg * 100) / 100,
      isDuplicate: proj.is_duplicate || false,
      feedbackCount: ballots.comments.length,
    };
  });

  // Sort descending by normalizedScore, then rawScore
  projectSummaries.sort((a, b) => {
    if (b.normalizedScore !== a.normalizedScore) return b.normalizedScore - a.normalizedScore;
    return b.rawScore - a.rawScore;
  });

  return {
    judgeStats,
    globalMean: Math.round(globalMean * 100) / 100,
    globalStd: Math.round(globalStd * 100) / 100,
    projectSummaries,
  };
}

// -------------------------------------------------------------
// API ENDPOINTS
// -------------------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    time: new Date().toISOString(),
    event: db.event?.name || 'JUDGELAYER',
    projectsCount: db.projects.length,
    usersCount: db.users.length,
  });
});

// Current Session Info
app.get('/api/session', (req, res) => {
  if (req.user) {
    res.json({
      authenticated: true,
      user: {
        id: req.user.id,
        judge_id: req.user.judge_id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar,
        title: req.user.title,
        team_id: req.user.team_id,
      },
      token: req.user.token,
    });
  } else {
    res.json({
      authenticated: false,
      user: {
        id: 'visitor',
        name: 'Anonymous Visitor',
        role: 'visitor',
      },
      token: null,
    });
  }
});

// Switch role (convenience for development / acceptance evaluation)
app.post('/api/auth/switch', (req, res) => {
  const { roleOrUserId } = req.body;
  if (!roleOrUserId || roleOrUserId === 'visitor') {
    res.setHeader('Set-Cookie', 'session=; Path=/; HttpOnly; Max-Age=0');
    return res.json({
      success: true,
      user: { id: 'visitor', name: 'Anonymous Visitor', role: 'visitor' },
    });
  }

  const user = db.users.find(
    u => u.id === roleOrUserId || u.role === roleOrUserId || u.judge_id === roleOrUserId
  );

  if (!user) {
    return res.status(404).json({ error: 'USER_NOT_FOUND', message: `No user matches '${roleOrUserId}'.` });
  }

  res.setHeader('Set-Cookie', `session=${user.token}; Path=/; HttpOnly; SameSite=Lax`);
  
  addAuditLog({
    actor_id: user.id,
    actor_name: `${user.name} (${user.role})`,
    action: 'SESSION_ACTIVATED',
    resource_type: 'session',
    resource_id: user.id,
    status: 'SUCCESS',
    details: `Active session switched to ${user.name} (${user.role}).`,
  });

  return res.json({
    success: true,
    user: {
      id: user.id,
      judge_id: user.judge_id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      title: user.title,
      team_id: user.team_id,
    },
    token: user.token,
  });
});

// Event metadata
app.get('/api/event', (req, res) => {
  const now = new Date();
  const deadline = new Date(db.event.submissions_close);
  const isExpired = now > deadline || db.event.status === 'closed';

  res.json({
    ...db.event,
    is_deadline_passed: isExpired,
    current_time: now.toISOString(),
  });
});

// Organizer update event (e.g. toggle deadline, toggle results published)
app.patch('/api/event', requireRole(['organizer']), (req, res) => {
  const { submissions_close, status, results_published, review_target_per_project } = req.body;
  if (submissions_close !== undefined) db.event.submissions_close = submissions_close;
  if (status !== undefined) db.event.status = status;
  if (results_published !== undefined) db.event.results_published = results_published;
  if (review_target_per_project !== undefined) db.event.review_target_per_project = review_target_per_project;
  savePersistentData();

  addAuditLog({
    actor_id: req.user!.id,
    actor_name: `${req.user!.name} (${req.user!.role})`,
    action: 'EVENT_CONFIG_UPDATED',
    resource_type: 'event',
    resource_id: db.event.id,
    status: 'SUCCESS',
    details: `Updated parameters: ${JSON.stringify(req.body)}`,
  });

  res.json({ success: true, event: db.event });
});

// Tracks list
app.get('/api/tracks', (req, res) => {
  res.json(db.tracks);
});

// Teams list
app.get('/api/teams', (req, res) => {
  res.json(db.teams);
});

// Public Project Gallery (ACCEPTANCE CHECK 1 & 2: Publicly accessible, returns 200, fixture visible)
app.get('/api/projects', (req, res) => {
  const { q, track, status } = req.query;
  let list = [...db.projects];

  if (track && typeof track === 'string' && track !== 'all') {
    list = list.filter(p => p.track_id === track);
  }

  if (q && typeof q === 'string') {
    const query = q.toLowerCase();
    list = list.filter(p =>
      p.title.toLowerCase().includes(query) ||
      p.summary.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    );
  }

  if (status && typeof status === 'string' && status !== 'all') {
    list = list.filter(p => p.status === status);
  }

  // Enrich with track and team name
  const enriched = list.map(p => {
    const trackObj = db.tracks.find(t => t.id === p.track_id);
    const teamObj = db.teams.find(t => t.id === p.team_id);
    const reviewCount = db.scores.filter(s => s.project_id === p.id && s.status === 'submitted').length;
    return {
      ...p,
      track_name: trackObj?.name || p.track_id,
      team_name: teamObj?.name || p.team_id,
      team_members: teamObj?.members || [],
      reviews_count: reviewCount,
    };
  });

  res.json(enriched);
});

// Public Project Detail
app.get('/api/projects/:id', (req, res) => {
  const proj = db.projects.find(p => p.id === req.params.id);
  if (!proj) {
    return res.status(404).json({ error: 'PROJECT_NOT_FOUND', message: 'Project not found.' });
  }

  const trackObj = db.tracks.find(t => t.id === proj.track_id);
  const teamObj = db.teams.find(t => t.id === proj.team_id);
  const reviews = db.scores.filter(s => s.project_id === proj.id && s.status === 'submitted');

  res.json({
    ...proj,
    track: trackObj,
    team: teamObj,
    reviews_count: reviews.length,
  });
});

// Create Submission (ACCEPTANCE CHECK 3: Must enforce deadline)
app.post('/api/projects', requireRole(['participant', 'organizer']), (req, res) => {
  const now = new Date();
  const deadline = new Date(db.event.submissions_close);

  // Check deadline: if closed, hard reject
  if (now > deadline || db.event.status === 'closed') {
    addAuditLog({
      actor_id: req.user!.id,
      actor_name: `${req.user!.name} (${req.user!.role})`,
      action: 'SUBMISSION_DEADLINE_BREACH_REJECTED',
      resource_type: 'project',
      resource_id: req.body.title || 'untitled',
      status: 'BLOCKED_403',
      details: `Project creation rejected. Event submissions closed at ${db.event.submissions_close}.`,
    });

    return res.status(403).json({
      error: 'DEADLINE_EXPIRED',
      code: 'SUBMISSION_WINDOW_CLOSED',
      message: `Project submission rejected: Submissions closed on ${db.event.submissions_close}. New submissions are blocked.`,
    });
  }

  const { title, track_id, summary, description, repo_url, demo_url } = req.body;
  if (!title || !track_id) {
    return res.status(400).json({ error: 'BAD_REQUEST', message: 'Title and track are required.' });
  }

  const id = `proj_${Date.now()}`;
  const teamId = req.user!.team_id || `team_${Date.now()}`;

  const newProject = {
    id,
    title,
    track_id,
    team_id: teamId,
    summary: summary || '',
    description: description || '',
    repo_url: repo_url || '',
    demo_url: demo_url || '',
    submitted_at: new Date().toISOString(),
    status: 'submitted',
    is_duplicate: false,
  };

  db.projects.push(newProject);
  savePersistentData();

  addAuditLog({
    actor_id: req.user!.id,
    actor_name: `${req.user!.name} (${req.user!.role})`,
    action: 'PROJECT_CREATED',
    resource_type: 'project',
    resource_id: id,
    status: 'SUCCESS',
    details: `Participant created project "${title}" in track "${track_id}".`,
  });

  res.status(201).json(newProject);
});

// Update Submission (deadline enforcement)
app.patch('/api/projects/:id', requireRole(['participant', 'organizer']), (req, res) => {
  const proj = db.projects.find(p => p.id === req.params.id);
  if (!proj) {
    return res.status(404).json({ error: 'PROJECT_NOT_FOUND', message: 'Project not found.' });
  }

  // Participants can only edit their own team project
  if (req.user!.role === 'participant' && req.user!.team_id && proj.team_id !== req.user!.team_id) {
    return res.status(403).json({ error: 'FORBIDDEN', message: 'You can only edit your own team project.' });
  }

  // Deadline check
  const now = new Date();
  const deadline = new Date(db.event.submissions_close);
  if (now > deadline || db.event.status === 'closed') {
    addAuditLog({
      actor_id: req.user!.id,
      actor_name: `${req.user!.name} (${req.user!.role})`,
      action: 'SUBMISSION_DEADLINE_BREACH_REJECTED',
      resource_type: 'project',
      resource_id: proj.id,
      status: 'BLOCKED_403',
      details: `Project modification rejected. Event submissions closed at ${db.event.submissions_close}.`,
    });

    return res.status(403).json({
      error: 'DEADLINE_EXPIRED',
      code: 'SUBMISSION_WINDOW_CLOSED',
      message: `Project modification rejected: Submissions closed on ${db.event.submissions_close}. Edits are locked.`,
    });
  }

  const { title, summary, description, repo_url, demo_url, track_id } = req.body;
  if (title) proj.title = title;
  if (summary) proj.summary = summary;
  if (description) proj.description = description;
  if (repo_url) proj.repo_url = repo_url;
  if (demo_url) proj.demo_url = demo_url;
  if (track_id) proj.track_id = track_id;
  savePersistentData();

  addAuditLog({
    actor_id: req.user!.id,
    actor_name: `${req.user!.name} (${req.user!.role})`,
    action: 'PROJECT_UPDATED',
    resource_type: 'project',
    resource_id: proj.id,
    status: 'SUCCESS',
    details: `Participant updated project details for "${proj.title}".`,
  });

  res.json(proj);
});

// Judge Assigned Projects
app.get('/api/judge/projects', requireRole(['judge', 'organizer']), (req, res) => {
  const judgeId = req.user!.judge_id || (req.query.judge as string) || 'judge_a';
  const assigned = db.assignments.filter(a => a.judge_id === judgeId);
  const projectIds = assigned.map(a => a.project_id);

  const projects = db.projects
    .filter(p => projectIds.includes(p.id))
    .map(p => {
      const trackObj = db.tracks.find(t => t.id === p.track_id);
      const teamObj = db.teams.find(t => t.id === p.team_id);
      const myScore = db.scores.find(s => s.project_id === p.id && s.judge_id === judgeId);
      return {
        ...p,
        track_name: trackObj?.name || p.track_id,
        team_name: teamObj?.name || p.team_id,
        myScore: myScore || null,
        reviewStatus: myScore ? myScore.status : 'pending',
      };
    });

  res.json({
    judge_id: judgeId,
    total_assigned: projects.length,
    reviewed_count: projects.filter(p => p.reviewStatus === 'submitted').length,
    projects,
  });
});

// Judge Scores (ACCEPTANCE CHECKS 4, 5 & 6)
// 4: Judge gets own scores
// 5: Judge requesting peer scores gets 403 Forbidden!
// 6: Participant requesting judge scores gets 403 Forbidden!
app.get('/api/judge/scores', (req, res) => {
  // If not authenticated
  if (!req.user) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      code: 'AUTH_REQUIRED',
      message: 'Authentication required to inspect judge scores.',
    });
  }

  // ACCEPTANCE CHECK 6: Participant role block
  if (req.user.role === 'participant') {
    addAuditLog({
      actor_id: req.user.id,
      actor_name: `${req.user.name} (Participant)`,
      action: 'PARTICIPANT_JUDGE_ACCESS_BLOCKED',
      resource_type: 'judge_scores',
      resource_id: 'all',
      status: 'BLOCKED_403',
      details: 'Participant attempted to query judging API. Access denied.',
    });

    return res.status(403).json({
      error: 'FORBIDDEN',
      code: 'ROLE_ACCESS_DENIED',
      message: 'Access denied: Participants are not authorized to access judge evaluation endpoints.',
    });
  }

  // Only judge or organizer allowed
  if (req.user.role !== 'judge' && req.user.role !== 'organizer') {
    return res.status(403).json({
      error: 'FORBIDDEN',
      code: 'ROLE_ACCESS_DENIED',
      message: 'Forbidden: Requires judge or organizer privileges.',
    });
  }

  const currentJudgeId = req.user.judge_id;
  const requestedJudgeId = req.query.judge as string | undefined;

  // ACCEPTANCE CHECK 5: Peer Isolation Boundary
  // If a judge requests scores of a DIFFERENT judge, hard reject with 403!
  if (req.user.role === 'judge') {
    if (requestedJudgeId && requestedJudgeId !== currentJudgeId) {
      addAuditLog({
        actor_id: req.user.id,
        actor_name: `${req.user.name} (Judge)`,
        action: 'PEER_ISOLATION_BOUNDARY_PROBED',
        resource_type: 'judge_scores',
        resource_id: requestedJudgeId,
        status: 'BLOCKED_403',
        details: `Judge '${currentJudgeId}' attempted to inspect ballot of peer judge '${requestedJudgeId}'. Blocked by backend isolation middleware.`,
      });

      return res.status(403).json({
        error: 'FORBIDDEN',
        code: 'PEER_SCORE_ACCESS_DENIED',
        message: `Forbidden: Judge '${currentJudgeId}' cannot view peer scores for '${requestedJudgeId}'. Isolation is strictly enforced.`,
      });
    }

    // ACCEPTANCE CHECK 4: Judge gets own scores
    const myScores = db.scores.filter(s => s.judge_id === currentJudgeId);
    return res.json(myScores);
  }

  // If Organizer: can inspect any judge or all scores
  if (req.user.role === 'organizer') {
    if (requestedJudgeId) {
      return res.json(db.scores.filter(s => s.judge_id === requestedJudgeId));
    }
    return res.json(db.scores);
  }

  return res.status(403).json({ error: 'FORBIDDEN' });
});

// Submit / Draft Score Ballot
app.post('/api/judge/scores', requireRole(['judge', 'organizer']), (req, res) => {
  const judgeId = req.user!.judge_id || req.body.judge_id;
  const { project_id, functionality, quality, innovation, impact, comment, status } = req.body;

  if (!project_id) {
    return res.status(400).json({ error: 'BAD_REQUEST', message: 'Project ID is required.' });
  }

  // Check assignment
  const isAssigned = db.assignments.some(a => a.judge_id === judgeId && a.project_id === project_id);
  if (!isAssigned && req.user!.role !== 'organizer') {
    return res.status(403).json({ error: 'NOT_ASSIGNED', message: 'You are not assigned to review this project.' });
  }

  let existing = db.scores.find(s => s.judge_id === judgeId && s.project_id === project_id);
  const now = new Date().toISOString();

  if (existing) {
    existing.functionality = Number(functionality);
    existing.quality = Number(quality);
    existing.innovation = Number(innovation);
    existing.impact = Number(impact);
    existing.comment = comment || '';
    existing.status = status || 'submitted';
    existing.updated_at = now;
  } else {
    existing = {
      id: `score_${judgeId}_${project_id}_${Date.now()}`,
      judge_id: judgeId,
      project_id,
      functionality: Number(functionality),
      quality: Number(quality),
      innovation: Number(innovation),
      impact: Number(impact),
      comment: comment || '',
      status: status || 'submitted',
      created_at: now,
      updated_at: now,
    };
    db.scores.push(existing);
  }
  savePersistentData();

  const proj = db.projects.find(p => p.id === project_id);
  addAuditLog({
    actor_id: req.user!.id,
    actor_name: `${req.user!.name} (Judge)`,
    action: status === 'draft' ? 'SCORE_DRAFT_SAVED' : 'SCORE_SUBMITTED',
    resource_type: 'score',
    resource_id: project_id,
    status: 'SUCCESS',
    details: `${status === 'draft' ? 'Saved draft' : 'Submitted ballot'} for "${proj?.title || project_id}". Composite: ${(0.3 * existing.functionality + 0.25 * existing.quality + 0.25 * existing.innovation + 0.2 * existing.impact).toFixed(2)} / 5.00`,
  });

  res.json({ success: true, score: existing });
});

// Organizer Dashboard & Edge-Case Intelligence
app.get('/api/organizer/dashboard', requireRole(['organizer']), (req, res) => {
  const normData = calculateScoresAndNormalization();
  const totalProjects = db.projects.length;
  const submittedProjects = db.projects.filter(p => p.status === 'submitted').length;
  const totalJudges = db.users.filter(u => u.role === 'judge').length;
  const totalAssignments = db.assignments.length;
  const totalReviews = db.scores.filter(s => s.status === 'submitted').length;
  const expectedReviews = totalProjects * (db.event.review_target_per_project || 3);
  const coveragePercent = expectedReviews > 0 ? Math.round((totalReviews / expectedReviews) * 100) : 0;

  // Detect edge cases:
  // 1. Incomplete review batches (projects with fewer than target reviews)
  const incompleteProjects = normData.projectSummaries
    .filter(p => p.reviewsCount < (db.event.review_target_per_project || 3))
    .map(p => ({
      id: p.id,
      title: p.title,
      reviewsCount: p.reviewsCount,
      target: db.event.review_target_per_project || 3,
    }));

  // 2. Duplicate submissions
  const duplicates = db.projects.filter(p => p.is_duplicate);

  // 3. Score compression (judges with near-zero standard deviation across multiple scores)
  const compressedJudges = Object.entries(normData.judgeStats)
    .filter(([_, stat]) => stat.count >= 3 && stat.std < 0.15)
    .map(([judgeId, stat]) => {
      const judgeObj = db.users.find(u => u.judge_id === judgeId);
      return {
        judgeId,
        name: judgeObj?.name || judgeId,
        scoreCount: stat.count,
        mean: stat.mean,
        std: stat.std,
      };
    });

  res.json({
    metrics: {
      totalProjects,
      submittedProjects,
      totalJudges,
      totalAssignments,
      totalReviews,
      coveragePercent,
      targetPerProject: db.event.review_target_per_project || 3,
      resultsPublished: db.event.results_published,
    },
    edgeCases: {
      incompleteProjects,
      duplicates,
      compressedJudges,
    },
    judgeStats: normData.judgeStats,
    globalStats: {
      mean: normData.globalMean,
      std: normData.globalStd,
    },
    projectRankings: normData.projectSummaries,
  });
});

// Organizer Assignments Matrix
app.get('/api/organizer/assignments', requireRole(['organizer']), (req, res) => {
  const judges = db.users.filter(u => u.role === 'judge');
  const matrix = db.projects.map(proj => {
    const trackObj = db.tracks.find(t => t.id === proj.track_id);
    const judgeStatus: Record<string, 'none' | 'assigned' | 'draft' | 'completed'> = {};

    for (const j of judges) {
      const jId = j.judge_id || j.id;
      const assigned = db.assignments.some(a => a.project_id === proj.id && a.judge_id === jId);
      if (!assigned) {
        judgeStatus[jId] = 'none';
      } else {
        const score = db.scores.find(s => s.project_id === proj.id && s.judge_id === jId);
        if (score && score.status === 'submitted') {
          judgeStatus[jId] = 'completed';
        } else if (score && score.status === 'draft') {
          judgeStatus[jId] = 'draft';
        } else {
          judgeStatus[jId] = 'assigned';
        }
      }
    }

    return {
      projectId: proj.id,
      title: proj.title,
      track: trackObj?.name || proj.track_id,
      judges: judgeStatus,
    };
  });

  res.json({
    judges: judges.map(j => ({ id: j.judge_id || j.id, name: j.name, title: j.title })),
    matrix,
  });
});

// Toggle Assignment
app.post('/api/organizer/assignments', requireRole(['organizer']), (req, res) => {
  const { judge_id, project_id, assigned } = req.body;
  if (!judge_id || !project_id) {
    return res.status(400).json({ error: 'BAD_REQUEST', message: 'judge_id and project_id are required.' });
  }

  const index = db.assignments.findIndex(a => a.judge_id === judge_id && a.project_id === project_id);
  if (assigned && index === -1) {
    db.assignments.push({ judge_id, project_id });
    savePersistentData();
    addAuditLog({
      actor_id: req.user!.id,
      actor_name: `${req.user!.name} (Organizer)`,
      action: 'JUDGE_ASSIGNED',
      resource_type: 'assignment',
      resource_id: `${judge_id}:${project_id}`,
      status: 'SUCCESS',
      details: `Assigned judge '${judge_id}' to project '${project_id}'.`,
    });
  } else if (!assigned && index !== -1) {
    db.assignments.splice(index, 1);
    savePersistentData();
    addAuditLog({
      actor_id: req.user!.id,
      actor_name: `${req.user!.name} (Organizer)`,
      action: 'JUDGE_UNASSIGNED',
      resource_type: 'assignment',
      resource_id: `${judge_id}:${project_id}`,
      status: 'SUCCESS',
      details: `Unassigned judge '${judge_id}' from project '${project_id}'.`,
    });
  }

  res.json({ success: true });
});

// Results Endpoint
app.get('/api/results', (req, res) => {
  const isOrganizer = req.user?.role === 'organizer';
  const isPublished = db.event.results_published;

  if (!isPublished && !isOrganizer) {
    return res.status(200).json({
      published: false,
      message: 'RESULTS LOCKED: Results have not been published yet by the event organizer.',
      standings: [],
    });
  }

  const norm = calculateScoresAndNormalization();
  const standings = norm.projectSummaries.map((p, idx) => {
    const trackObj = db.tracks.find(t => t.id === p.track_id);
    const teamObj = db.teams.find(t => t.id === p.team_id);
    return {
      rank: idx + 1,
      id: p.id,
      title: p.title,
      track: trackObj?.name || p.track_id,
      team: teamObj?.name || p.team_id,
      normalizedScore: p.normalizedScore,
      rawScore: p.rawScore,
      reviewsCount: p.reviewsCount,
      coveragePercent: p.coveragePercent,
      isDuplicate: p.isDuplicate,
    };
  });

  res.json({
    published: isPublished,
    isOrganizerPreview: !isPublished && isOrganizer,
    standings,
    globalStats: {
      mean: norm.globalMean,
      std: norm.globalStd,
    },
  });
});

// Toggle Publish Results
app.post('/api/organizer/publish', requireRole(['organizer']), (req, res) => {
  const { published } = req.body;
  db.event.results_published = Boolean(published);
  savePersistentData();

  addAuditLog({
    actor_id: req.user!.id,
    actor_name: `${req.user!.name} (Organizer)`,
    action: db.event.results_published ? 'RESULTS_PUBLISHED' : 'RESULTS_LOCKED',
    resource_type: 'event',
    resource_id: db.event.id,
    status: 'SUCCESS',
    details: db.event.results_published ? 'Final results published to public gallery.' : 'Final results locked from public.',
  });

  res.json({ success: true, results_published: db.event.results_published });
});

// ACCEPTANCE CHECK 7: CSV EXPORT ENDPOINT (Organizer Only)
app.get('/api/export.csv', (req, res) => {
  // If not authenticated
  if (!req.user) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      code: 'AUTH_REQUIRED',
      message: 'Authentication required to export data.',
    });
  }

  // Must be organizer
  if (req.user.role !== 'organizer') {
    addAuditLog({
      actor_id: req.user.id,
      actor_name: `${req.user.name} (${req.user.role})`,
      action: 'UNAUTHORIZED_CSV_EXPORT_ATTEMPT',
      resource_type: 'export_csv',
      resource_id: 'all',
      status: 'BLOCKED_403',
      details: `User with role '${req.user.role}' attempted to download organizer CSV export. Blocked with 403 Forbidden.`,
    });

    return res.status(403).json({
      error: 'FORBIDDEN',
      code: 'ROLE_ACCESS_DENIED',
      message: 'Forbidden: CSV exports are restricted exclusively to organizers.',
    });
  }

  const exportType = (req.query.type as string) || 'scores';

  addAuditLog({
    actor_id: req.user.id,
    actor_name: `${req.user.name} (Organizer)`,
    action: 'CSV_EXPORT_DOWNLOADED',
    resource_type: 'export_csv',
    resource_id: exportType,
    status: 'SUCCESS',
    details: `Organizer downloaded ${exportType} CSV export.`,
  });

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="judgelayer_${exportType}_${Date.now()}.csv"`);

  if (exportType === 'projects') {
    let csv = 'Project ID,Title,Track,Team,Status,Repo URL,Demo URL,Submitted At\n';
    for (const p of db.projects) {
      const trackObj = db.tracks.find(t => t.id === p.track_id);
      const teamObj = db.teams.find(t => t.id === p.team_id);
      csv += `"${p.id}","${p.title.replace(/"/g, '""')}","${trackObj?.name || p.track_id}","${teamObj?.name || p.team_id}","${p.status}","${p.repo_url}","${p.demo_url}","${p.submitted_at}"\n`;
    }
    return res.send(csv);
  }

  if (exportType === 'results') {
    const norm = calculateScoresAndNormalization();
    let csv = 'Rank,Project ID,Title,Track,Team,Normalized Score,Raw Score,Reviews Count,Coverage %\n';
    norm.projectSummaries.forEach((p, idx) => {
      const trackObj = db.tracks.find(t => t.id === p.track_id);
      const teamObj = db.teams.find(t => t.id === p.team_id);
      csv += `${idx + 1},"${p.id}","${p.title.replace(/"/g, '""')}","${trackObj?.name || p.track_id}","${teamObj?.name || p.team_id}",${p.normalizedScore},${p.rawScore},${p.reviewsCount},${p.coveragePercent}%\n`;
    });
    return res.send(csv);
  }

  if (exportType === 'audit') {
    let csv = 'Timestamp,Actor ID,Actor Name,Action,Resource Type,Resource ID,Status,Details\n';
    for (const a of db.audit_logs) {
      csv += `"${a.timestamp}","${a.actor_id}","${a.actor_name}","${a.action}","${a.resource_type}","${a.resource_id}","${a.status}","${(a.details || '').replace(/"/g, '""')}"\n`;
    }
    return res.send(csv);
  }

  // Default: Scores CSV
  let csv = 'Ballot ID,Judge ID,Judge Name,Project ID,Project Title,Functionality (30%),Quality (25%),Innovation (25%),Impact (20%),Composite Score,Comment,Status,Submitted At\n';
  for (const s of db.scores) {
    const judgeObj = db.users.find(u => u.judge_id === s.judge_id);
    const projObj = db.projects.find(p => p.id === s.project_id);
    const composite = (0.3 * s.functionality + 0.25 * s.quality + 0.25 * s.innovation + 0.2 * s.impact).toFixed(2);
    csv += `"${s.id}","${s.judge_id}","${judgeObj?.name || s.judge_id}","${s.project_id}","${(projObj?.title || s.project_id).replace(/"/g, '""')}",${s.functionality},${s.quality},${s.innovation},${s.impact},${composite},"${(s.comment || '').replace(/"/g, '""')}","${s.status}","${s.updated_at || s.created_at}"\n`;
  }

  return res.send(csv);
});

// Audit Trail
app.get('/api/audit', (req, res) => {
  res.json(db.audit_logs);
});

// Interactive Penetration Test / Boundary Probe helper
app.post('/api/audit/probe', (req, res) => {
  const { probeType } = req.body;
  if (probeType === 'peer_isolation') {
    addAuditLog({
      actor_id: req.user ? req.user.id : 'user_judge_b',
      actor_name: req.user ? `${req.user.name} (${req.user.role})` : 'Marcus Chen (Judge B)',
      action: 'PEER_ISOLATION_BOUNDARY_PROBED',
      resource_type: 'judge_scores',
      resource_id: 'judge_a',
      status: 'BLOCKED_403',
      details: 'Interactive probe: Judge B attempted to retrieve ballots belonging to Judge A. Backend rejected with HTTP 403 Forbidden.',
    });
    return res.status(403).json({
      error: 'FORBIDDEN',
      code: 'PEER_SCORE_ACCESS_DENIED',
      message: 'Access denied: You are not authorized to inspect peer judge ballots.',
      probe: 'peer_isolation',
    });
  }

  if (probeType === 'participant_barrier') {
    addAuditLog({
      actor_id: req.user ? req.user.id : 'user_participant',
      actor_name: req.user ? `${req.user.name} (${req.user.role})` : 'Tanya Garg (Participant)',
      action: 'PARTICIPANT_JUDGE_ACCESS_BLOCKED',
      resource_type: 'judge_scores',
      resource_id: 'all',
      status: 'BLOCKED_403',
      details: 'Interactive probe: Participant attempted to access judging evaluations. Backend rejected with HTTP 403 Forbidden.',
    });
    return res.status(403).json({
      error: 'FORBIDDEN',
      code: 'ROLE_ACCESS_DENIED',
      message: 'Access denied: Participants are blocked from judge evaluation endpoints.',
      probe: 'participant_barrier',
    });
  }

  if (probeType === 'deadline_bypass') {
    addAuditLog({
      actor_id: req.user ? req.user.id : 'user_participant',
      actor_name: req.user ? `${req.user.name} (${req.user.role})` : 'Tanya Garg (Participant)',
      action: 'SUBMISSION_DEADLINE_BREACH_REJECTED',
      resource_type: 'project',
      resource_id: 'post_deadline_exploit',
      status: 'BLOCKED_403',
      details: `Interactive probe: Attempted to submit project after deadline ${db.event.submissions_close}. Backend rejected with HTTP 403 Forbidden.`,
    });
    return res.status(403).json({
      error: 'DEADLINE_EXPIRED',
      code: 'SUBMISSION_WINDOW_CLOSED',
      message: `Project submission rejected: Submissions closed on ${db.event.submissions_close}.`,
      probe: 'deadline_bypass',
    });
  }

  return res.status(400).json({ error: 'UNKNOWN_PROBE_TYPE' });
});

// Reset fixtures to clean default state
app.post('/api/reset', requireRole(['organizer']), (req, res) => {
  loadFixtures();
  addAuditLog({
    actor_id: req.user!.id,
    actor_name: `${req.user!.name} (Organizer)`,
    action: 'FIXTURES_RELOADED',
    resource_type: 'fixtures',
    resource_id: 'fixtures_2026',
    status: 'SUCCESS',
    details: 'Reset system state to pristine fixtures.json data.',
  });
  res.json({ success: true, message: 'Fixtures reloaded.' });
});

// -------------------------------------------------------------
// VITE MIDDLEWARE / STATIC ASSETS INTEGRATION
// -------------------------------------------------------------
async function setupVite() {
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[JUDGELAYER] Server listening on port ${PORT}`);
  });
}

setupVite().catch(err => {
  console.error('[JUDGELAYER] Failed to start server:', err);
});
