# JUDGELAYER

> **Run the event. Protect the judging. Trust the results.**
> The open-source operating system for hackathon submissions, judging, normalization, and defensible results.

Built for the **DOGFOOD 2026** Hackathon challenge. JUDGELAYER is a zero-external-dependency, self-hostable command center that unifies submissions, judge assignment matrices, strict role-based access control, cryptographic-grade audit logging, score normalization, and organizer exports.

---

## 🔗 Links

| | |
|:---|:---|
| 🌐 **Live Demo** | [judgelayer-self-hosted-hackathon.onrender.com](https://judgelayer-self-hosted-hackathon.onrender.com/) |
| 🎬 **Demo Video** | [Watch on Google Drive](https://drive.google.com/file/d/1ThHje2t4vV-GU83m-5o8wF9sB3_hbNaF/view?usp=drive_link) |

---

## ⚡ Key Highlights

1. **Submission-First Ergonomics**: Instant project gallery with track filtering and search, participant submission timeline, team rosters, and strict deadline enforcement.
2. **Judge-First Command Console**: Split-pane review studio (Project Specs ↔ Multi-criteria Rubric ↔ Sticky Decision Panel) with instant autosave drafts and ballot submission.
3. **Trust-First Backend Security**: Strict role boundaries enforced in API middleware:
   - Judges cannot access peer ballots (returns `403 Forbidden` and records an audit event).
   - Participants cannot read judge scoring endpoints (returns `403 Forbidden`).
   - Submissions reject updates after `submissions_close` deadline (returns `403 / 400`).
   - CSV exports are restricted exclusively to organizers.
4. **Signature Trust Layer UX**: Live visual & programmatic inspector showing active session roles, permission bounds, token authenticity, and one-click penetration tests.
5. **Edge-Case & Normalization Intelligence**: Real-time detection of duplicate submissions, incomplete review batches (<3 reviews), and score compression/outlier judges with deterministic Z-score standardization.

---

## 🚀 Quickstart & One-Command Run

JUDGELAYER runs completely offline with zero cloud accounts or API keys required:

```bash
# 1. Install dependencies
npm install

# 2. Start full-stack portal (Express backend + Vite client)
npm run dev

# The portal will be live at:
# http://localhost:3000
```

### Build & Production Mode
```bash
npm run build
npm start
```

## 🌐 Cloud Deployment

### Render (Recommended - Free Tier)
1. Connect your GitHub repository to [Render.com](https://render.com)
2. Create a new "Web Service"
3. Select "Node.js" runtime
4. Render will automatically detect the configuration from `render.yaml`
5. Deploy! The app will be live at `https://your-app.onrender.com`

### Vercel (Frontend + Separate Backend)
For Vercel deployment, you'll need to:
1. Deploy frontend to Vercel
2. Deploy backend separately (Render/Railway)
3. Configure CORS between frontend and backend

### Manual Cloud Deployment
```bash
# On any VPS or cloud server
git clone https://github.com/Tanya-garg10/JUDGELAYER-Self-Hosted-Hackathon-Submission-Judging-Platform.git
cd JUDGELAYER-Self-Hosted-Hackathon-Submission-Judging-Platform
npm install
npm run build
npm start
```

---

## 🔑 Pre-Seeded Auth Credentials

JUDGELAYER auto-seeds itself from `fixtures.json` on startup. The application accepts both session cookies and Bearer/X-Session-Token headers:

| Persona | Role | Email | Session Token / Cookie |
| :--- | :--- | :--- | :--- |
| **Elena Rostova** | Organizer | `elena@judgelayer.org` | `session=session_organizer_sec_991` |
| **Ada Okonkwo** | Judge A | `ada@mit.edu` | `session=session_judge_a_ada_102` |
| **Marcus Chen** | Judge B | `marcus@infra.dev` | `session=session_judge_b_marcus_554` |
| **Dr. Aris Thorne** | Judge C | `aris@research.lab` | `session=session_judge_c_aris_771` |
| **Tanya Garg** | Participant | `tanyagarg5315@gmail.com` | `session=session_participant_tanya_883` |
| **Public Visitor** | Visitor | Unauthenticated | None |

> *Tip: In the web interface, use the fast role switcher in the top navigation bar to seamlessly hot-swap between personas and inspect boundary enforcement!*

---

## 🧪 Acceptance-Test Mapping (`.dogfood.toml`)

| Check | Specification | Backend Enforcement |
| :--- | :--- | :--- |
| **Public Gallery** | `GET /projects` & `GET /api/projects` | `200 OK` without authentication |
| **Fixture Visibility** | Project `Quiet Hours` | Seeded from `fixtures.json` |
| **Submission Deadline** | `POST /api/projects` after deadline | Rejected with `403 Forbidden` (`DEADLINE_EXPIRED`) |
| **Judge Own Scores** | `GET /api/judge/scores` | Scoped strictly to authenticated judge |
| **Judge Peer Isolation** | `GET /api/judge/scores?judge=judge_a` (as Judge B) | Rejected with `403 Forbidden` + Audit logged |
| **Participant Blocked** | `GET /api/judge/scores` (as Participant) | Rejected with `403 Forbidden` |
| **Organizer CSV** | `GET /api/export.csv` | `200 OK` with valid RFC-4180 CSV body |

---

## 📂 Project Architecture

```
├── .dogfood.toml         # Acceptance test runner config
├── fixtures.json         # Deterministic fixture dataset
├── README.md             # Product overview and run instructions
├── ARCHITECTURE.md       # Technical design and security architecture
├── DATA-MODEL.md         # Schema and relational model specifications
├── JUDGING.md            # Scoring methodology, normalization & rubrics
├── acceptance-report.txt # Full report of acceptance assertions
├── LICENSE               # MIT License
├── server.ts             # Express backend API with Vite middleware
├── src/                  # React + TypeScript frontend
│   ├── components/       # Specialized UI components
│   │   ├── Navigation.tsx
│   │   ├── TrustLayerModal.tsx
│   │   ├── RubricReviewPanel.tsx
│   │   ├── AssignmentMatrix.tsx
│   │   └── EdgeAlerts.tsx
│   ├── views/            # Dashboard views
│   │   ├── GalleryView.tsx
│   │   ├── JudgeConsoleView.tsx
│   │   ├── ParticipantDashboardView.tsx
│   │   ├── OrganizerView.tsx
│   │   ├── ResultsView.tsx
│   │   ├── AuditTrailView.tsx
│   │   └── ExportCenterView.tsx
│   ├── store/            # Client state, auth context & mock breach runner
│   └── types.ts          # Core TypeScript contracts
```
