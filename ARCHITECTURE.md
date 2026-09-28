# JUDGELAYER Architecture & Security Specification

## 1. System Overview

JUDGELAYER is engineered as a zero-cloud, self-hostable command center that operates entirely offline. It couples a high-performance Express REST backend with a reactive Vite + React + Tailwind TypeScript frontend.

```
                           ┌───────────────────────────┐
                           │      Client Browser       │
                           │   React 19 + TypeScript   │
                           └─────────────┬─────────────┘
                                         │
                   HTTP REST / Cookies / Bearer / X-Session-Token
                                         │
                                         ▼
                           ┌───────────────────────────┐
                           │    Express Server Engine  │
                           │         (server.ts)       │
                           ├───────────────────────────┤
                           │  - Cookie & Token Parser  │
                           │  - RBAC & Scope Enforcer  │
                           │  - Peer Isolation Guard   │
                           │  - Deadline Supervisor    │
                           │  - Normalization Engine   │
                           │  - Append-Only Audit Log  │
                           └─────────────┬─────────────┘
                                         │
                                         ▼
                           ┌───────────────────────────┐
                           │     State Store Engine    │
                           │  (fixtures.json + Memory) │
                           └───────────────────────────┘
```

---

## 2. Authentication & Session Resolution

Sessions are stateless and deterministic for high testability and local portability.
The authentication middleware resolves credentials in the following precedence order:
1. `Cookie`: `session=<token>`
2. `Authorization`: `Bearer <token>`
3. `X-Session-Token`: `<token>`
4. Query param `?token=<token>` (useful for preview links)

When a token is matched against the seeded user registry:
- An authenticated `UserSession` is attached to `req.user`.
- If the token is invalid or absent, `req.user` is null (public visitor).

---

## 3. Role-Based Access Control (RBAC)

The system defines 4 distinct privilege tiers:

| Tier | Role | Allowed Endpoints | Prohibited Endpoints |
| :--- | :--- | :--- | :--- |
| **Visitor** | Anonymous | `GET /api/projects`, `GET /api/tracks`, `GET /api/health` | Judge scores, Submissions, Exports |
| **Participant** | Team Member | Public + `POST /api/projects`, `PATCH /api/projects/:id` (pre-deadline only) | Judge scores, Peer submissions, Exports |
| **Judge** | Evaluator | Public + `GET /api/judge/projects`, `GET /api/judge/scores`, `POST /api/judge/scores` | Peer judge scores, Organizer exports, Submissions |
| **Organizer** | Director | Full read/write over assignments, published results, CSV exports, and audit logs | Cannot falsify judge identity on ballots |

---

## 4. The Peer Isolation Security Boundary

One of the foundational integrity requirements of DOGFOOD 2026 is that **a judge must never be capable of retrieving or inspecting another judge's ballot or scoring history**.

### Enforcement Algorithm:
```typescript
app.get('/api/judge/scores', requireJudge, (req, res) => {
  const currentJudgeId = req.user.judge_id;
  const requestedJudgeId = req.query.judge as string | undefined;

  // If a specific judge is requested and does NOT match the authenticated judge:
  if (requestedJudgeId && requestedJudgeId !== currentJudgeId) {
    // Record boundary probe into audit trail
    recordAuditLog({
      actor_id: req.user.id,
      actor_name: `${req.user.name} (${req.user.role})`,
      action: 'PEER_ISOLATION_BOUNDARY_PROBED',
      resource_type: 'judge_scores',
      resource_id: requestedJudgeId,
      status: 'BLOCKED_403',
      details: `Forbidden attempt to access ballot for judge '${requestedJudgeId}'.`
    });

    return res.status(403).json({
      error: 'FORBIDDEN',
      code: 'PEER_SCORE_ACCESS_DENIED',
      message: 'Access denied: You are not authorized to inspect peer judge ballots.'
    });
  }

  // Returns ONLY current judge's scores
  const judgeScores = db.scores.filter(s => s.judge_id === currentJudgeId);
  return res.json(judgeScores);
});
```

Hiding the score on the client side is treated as invalid; the API hard-rejects the request with `HTTP 403`.

---

## 5. Submission Deadline Supervisor

When a project is created (`POST /api/projects`) or updated (`PATCH /api/projects/:id`), the backend queries the active event configuration:
1. `now = new Date()`
2. `deadline = new Date(event.submissions_close)`
3. If `now > deadline`, the API immediately rejects the transaction with:
   - Status: `403 Forbidden` (or `400 Bad Request`)
   - Error Code: `DEADLINE_EXPIRED`
   - Audit event logged: `DEADLINE_VIOLATION_REJECTED`

The UI visually reflects this status with a locked timeline badge, but the backend is the authoritative gatekeeper.

---

## 6. Audit Trail Architecture

All critical state transitions generate immutable audit records:
- `timestamp`: ISO-8601 UTC string
- `actor_id`: User identifier
- `actor_name`: Human-readable name and role
- `action`: Normalized enum (e.g. `SCORE_SUBMITTED`, `DEADLINE_LOCKED`, `CSV_EXPORTED`)
- `resource_type`: Target entity
- `resource_id`: Entity primary key
- `status`: Outcome (`SUCCESS`, `BLOCKED_403`, `ENFORCED`)
- `details`: Human-readable cryptographic context

The audit log is viewable in real-time by organizers and exportable to CSV.
