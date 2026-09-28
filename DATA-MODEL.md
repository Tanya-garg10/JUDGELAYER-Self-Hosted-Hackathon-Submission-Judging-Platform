# JUDGELAYER Data Model

## 1. Entity-Relationship Overview

```
 [Event] 1 ──── * [Track]
    │
    ├───── 1 ──── * [Team] 1 ──── * [TeamMember]
    │                 │
    │                 1 ──── 1 [Project]
    │                             │
    │                             ├──── * [JudgeAssignment] * ──── 1 [Judge]
    │                             │                                    │
    │                             └──── * [Score] * ───────────────────┘
    │
    └───── 1 ──── * [AuditLog]
```

---

## 2. Table & Record Definitions

### `Event`
The root hackathon container defining global milestones and policy limits.
- `id` (string, PK): Unique slug (e.g. `sample-hack-2026`)
- `name` (string): Event title
- `tagline` (string): Description
- `submissions_close` (ISO8601 string): Exact UTC deadline for participant write operations
- `status` (string): `open` | `closed` | `judging` | `concluded`
- `results_published` (boolean): Flag controlling public visibility of leaderboards
- `review_target_per_project` (integer): Desired review count per project (default: 3)

### `User`
- `id` (string, PK): `user_organizer`, `user_judge_a`, etc.
- `judge_id` (string, optional): Foreign identifier for judges (e.g. `judge_a`)
- `name` (string): Full name
- `email` (string, unique)
- `role` (enum): `organizer` | `judge` | `participant` | `visitor`
- `token` (string): Secret session token used in Bearer / Cookie auth
- `team_id` (string, optional): Associated team if role is participant

### `Project`
- `id` (string, PK): `proj_quiet_hours`
- `title` (string): Submission title
- `track_id` (string, FK -> Track.id)
- `team_id` (string, FK -> Team.id)
- `summary` (string): Concise pitch
- `description` (string): Detailed system design and implementation notes
- `repo_url` (string): Git repository URL
- `demo_url` (string): Live demo link
- `submitted_at` (ISO8601 string): UTC timestamp of submission
- `status` (enum): `draft` | `submitted` | `withdrawn`
- `is_duplicate` (boolean): Flag identifying accidental duplicate submissions

### `JudgeAssignment`
Defines the review matrix linking judges to assigned projects.
- `judge_id` (string, FK -> Judge.id)
- `project_id` (string, FK -> Project.id)

### `Score`
The evaluation ballot submitted by a single judge for a specific project.
- `id` (string, PK): Unique ballot identifier
- `judge_id` (string, FK -> Judge.id)
- `project_id` (string, FK -> Project.id)
- `functionality` (number 1..5): Weight 30%
- `quality` (number 1..5): Weight 25%
- `innovation` (number 1..5): Weight 25%
- `impact` (number 1..5): Weight 20%
- `comment` (string): Qualitative rationale and peer feedback
- `status` (enum): `draft` | `submitted`
- `created_at` (ISO8601 string)
- `updated_at` (ISO8601 string)

### `AuditLog`
Append-only tamper-evident event log.
- `id` (string, PK)
- `timestamp` (ISO8601 string)
- `actor_id` (string)
- `actor_name` (string)
- `action` (string): `SCORE_SUBMITTED`, `PEER_ISOLATION_BOUNDARY_PROBED`, etc.
- `resource_type` (string): `score`, `project`, `export`, etc.
- `resource_id` (string)
- `status` (string): `SUCCESS` | `BLOCKED_403` | `ENFORCED`
- `details` (string)

---

## 3. Fixture Ingestion & Transformation

On application boot, `server.ts` checks for `fixtures.json`. If present, it loads all events, tracks, users, projects, assignments, and scores into the reactive storage engine. The ingestion is completely idempotent: re-starting the process preserves existing state without creating duplicate entries.
