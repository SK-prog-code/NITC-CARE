# College Complaint Management System
## Software Requirements & Technical Specification Document

**Version:** 1.0
**Project Difficulty:** Easy–Intermediate
**Document Type:** Full System Specification (SRS)

---

## 1. Project Overview

### 1.1 Purpose
The College Complaint Management System (CCMS) is a web-based platform that digitizes the process of reporting, tracking, and resolving campus-related complaints. It replaces manual, paper-based, or informal complaint reporting (emails, verbal reports) with a centralized, auditable, and transparent digital workflow.

### 1.2 Problem Statement
Students currently have no structured way to report issues (classrooms, labs, hostels, Wi-Fi, infrastructure, transport, cleanliness, etc.) and no visibility into whether their complaint is being addressed. Administrators lack a centralized way to triage, assign, and track resolution across departments.

### 1.3 Objectives
- Provide students a simple interface to submit and track complaints.
- Provide admins/staff a dashboard to manage, assign, and resolve complaints.
- Maintain a full audit trail of every complaint's lifecycle.
- Generate visibility through statistics/reports on complaint volume and resolution performance.

### 1.4 Scope
**In Scope (MVP):** Student registration/login, complaint submission with attachments, status tracking, admin assignment and resolution workflow, search/filter, basic statistics, deployed working app.

**Out of Scope (MVP, but listed as Phase 2 in Section 12):** Email/real-time notifications, AI-based categorization, feedback ratings, escalation automation, PWA/mobile app.

---

## 2. User Roles & Permissions

| Role | Description | Key Permissions |
|---|---|---|
| **Student** | End user reporting issues | Register/login, submit complaint, view own complaints, view status/history, comment on own complaint |
| **Admin** | College-level super user | View all complaints, assign to department/staff, update status/priority, add comments, view statistics, manage users/departments |
| **Staff / Department Handler** *(optional role, recommended)* | Person responsible for resolving assigned complaints | View assigned complaints, update status, add resolution notes |

> **Note:** For the Easy version, Staff role can be merged into Admin (Admin does the assignment *and* resolution). For a more realistic system, keep Staff as a separate role — this is documented as an optional extension in Section 4.9.

---

## 3. Functional Requirements

Each feature below is written as a testable functional requirement (FR).

### 3.1 Authentication & User Management
- **FR-1:** System shall allow students to register using name, college email (institutional domain validation optional), enrollment/roll number, and password.
- **FR-2:** System shall allow login via email + password using hashed passwords (bcrypt/argon2).
- **FR-3:** System shall issue a session token (JWT) upon successful login.
- **FR-4:** System shall support role-based access control (Student vs Admin) enforced on both frontend routes and backend endpoints.
- **FR-5:** System shall provide password reset via email token (bonus) or admin-reset fallback (MVP).
- **FR-6:** Admin accounts shall be pre-seeded or created via a protected admin-invite flow (not public self-registration).

### 3.2 Student Dashboard
- **FR-7:** Upon login, student sees: summary counts (Total, Pending, In Progress, Resolved), recent complaints list, and a "Submit New Complaint" call-to-action.

### 3.3 Complaint Submission
- **FR-8:** Student shall submit a complaint with the following fields:
  - Title (required, max 120 chars)
  - Category (required, dropdown — see 3.4)
  - Description (required, min 20 / max 2000 chars)
  - Location (required, free text or building/room dropdown)
  - Priority suggestion (optional — student can *suggest* priority; Admin sets the final value)
  - Attachments (optional — up to 5 images/PDFs, max 5MB each)
- **FR-9:** System shall auto-generate a unique Complaint ID (e.g., `CMP-2026-000123`) and timestamp on submission.
- **FR-10:** System shall set initial status to `Submitted`.

### 3.4 Complaint Categories
- **FR-11:** System shall support predefined categories: Classroom, Laboratory, Hostel, Wi-Fi/Network, Infrastructure, Transportation, Cleanliness, Cafeteria/Mess, Library, Other.
- **FR-12:** Categories shall be stored in a separate table so Admin can add/edit/deactivate categories without code changes.
- **FR-13:** Each category may optionally map to a default department for auto-suggestion during assignment.

### 3.5 Complaint Status Tracking
- **FR-14:** Status shall follow the defined lifecycle (Section 6) and only allow valid forward/backward transitions (see state machine rules).
- **FR-15:** Every status change shall be logged with timestamp, actor (who changed it), and optional note — forming a **Complaint Timeline/Activity Log**.
- **FR-16:** Students shall view the full timeline of their complaint (read-only).

### 3.6 Complaint History & Details
- **FR-17:** Student "My Complaints" page shall list all complaints with status badges, filterable by status/category/date.
- **FR-18:** Complaint Details page shall show: all submitted fields, attachments, current status, assigned department/staff, priority, full activity timeline, and admin resolution notes (once resolved).

### 3.7 Admin Dashboard & Complaint Management
- **FR-19:** Admin shall view all complaints in a table with sortable columns (Date, Priority, Status, Category, Department).
- **FR-20:** Admin shall search complaints by ID, student name, keyword in title/description.
- **FR-21:** Admin shall filter by status, category, priority, department, and date range.
- **FR-22:** Admin shall assign a complaint to a Department and/or Staff member; this transitions status to `Assigned`.
- **FR-23:** Admin (or assigned Staff) shall update status manually through the lifecycle, add internal comments, and mark `Resolved` with mandatory resolution notes.
- **FR-24:** Admin shall set/change Priority: Low, Medium, High, Critical — at any stage before closure.
- **FR-25:** Admin shall mark a complaint `Closed` after resolution is confirmed (separate from `Resolved` to allow a verification step).

### 3.8 Statistics
- **FR-26:** Admin dashboard shall show basic statistics: total complaints, complaints by status (pie/bar), complaints by category, complaints by priority, average resolution time (basic calculation: resolved_at − created_at).

### 3.9 Data & API
- **FR-27:** All complaint, user, category, and department data shall be persisted in a relational database.
- **FR-28:** System shall expose a documented REST (or GraphQL) API for all CRUD operations, consumed by the frontend (see Section 8).
- **FR-29:** System shall be deployed and publicly accessible (frontend + backend + database) with HTTPS.

---

## 4. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Usability** | Mobile-responsive layout; complaint submission completable in under 2 minutes |
| **Performance** | List/search endpoints respond in <1s for up to 10,000 complaint records with pagination |
| **Security** | Passwords hashed; JWT with expiry; input validation/sanitization; file-upload type & size restriction; RBAC enforced server-side |
| **Reliability** | No data loss on status transitions; DB transactions for multi-step updates (e.g., assign + log) |
| **Scalability** | Stateless backend (JWT, no server-side session) to allow horizontal scaling |
| **Availability** | Target 99% uptime on chosen hosting platform |
| **Maintainability** | Modular codebase, environment-based config (.env), migrations for schema changes |
| **Auditability** | Every status/assignment change is logged and immutable |

---

## 5. System Architecture

### 5.1 High-Level Architecture (3-tier) — LOCKED STACK

```
┌──────────────────┐      HTTPS/REST        ┌──────────────────┐     Mongoose/ODM    ┌───────────────────┐
│   Frontend         │  ────────────────────► │   Backend API      │ ───────────────────► │   Database          │
│ React (Vite)        │ ◄──────────────────── │  Node.js/Express     │ ◄─────────────────── │  MongoDB Atlas       │
│ Hosted on Vercel     │      JSON              │  Hosted on Render     │                       │  (Cloud, Free Tier)  │
└──────────────────┘                        └──────────────────┘                       └───────────────────┘
                                                       │
                                                       ▼
                                             ┌──────────────────┐
                                             │  File Storage      │
                                             │ (Cloudinary — free   │
                                             │  tier, images/PDFs)  │
                                             └──────────────────┘

Source Control: GitHub (monorepo or /frontend + /backend repos)
CI/CD: Vercel auto-deploys on push to `main` (frontend) · Render auto-deploys on push to `main` (backend)
```

### 5.2 Locked Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | React.js (Vite) + TailwindCSS + React Router | SPA, deployed as static build |
| State Mgmt | React Query (server state) + Context/Redux Toolkit (auth state) | |
| Backend | Node.js + Express.js | REST API, deployed as a Render Web Service |
| Auth | JWT (jsonwebtoken) + bcrypt for password hashing | Stateless auth — no server-side sessions |
| Database | **MongoDB Atlas** (Free M0 cluster) via **Mongoose ODM** | Document-based schema, see Section 7 |
| File Storage | Cloudinary (free tier) for complaint attachments | Store only the returned `secure_url` + `public_id` in MongoDB |
| Hosting — Frontend | **Vercel** | Auto-deploy from GitHub `main`/`prod` branch |
| Hosting — Backend | **Render** | Web Service, auto-deploy from GitHub, set env vars in Render dashboard |
| Hosting — Database | **MongoDB Atlas** | Whitelist Render's outbound IPs (or `0.0.0.0/0` for dev, restrict for prod) |
| Source Control | **GitHub** | Recommended: single repo with `/client` and `/server` folders |

**Environment variables (backend, set in Render):**
```
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/ccms
JWT_SECRET=<random-64-char-string>
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLIENT_URL=https://your-app.vercel.app
```

**Environment variables (frontend, set in Vercel):**
```
VITE_API_BASE_URL=https://your-backend.onrender.com/api/v1
```

> **CORS note:** Since frontend (Vercel) and backend (Render) are on different domains, the Express backend must enable CORS explicitly for the Vercel domain (`app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))`).

> **Cold-start note:** Render's free tier spins down idle services — the first request after inactivity can take 30–50 seconds. Mention this in your demo/viva, or upgrade to a paid instance before presenting.

---

## 6. Complaint Status Lifecycle (State Machine)

```
Submitted → Under Review → Assigned → In Progress → Resolved → Closed
                                                          │
                                                          ▼
                                                     (Reopened) ──► Assigned
```

| Status | Meaning | Who triggers |
|---|---|---|
| **Submitted** | Complaint created by student | Student |
| **Under Review** | Admin has seen and is evaluating it | Admin |
| **Assigned** | Routed to a department/staff | Admin |
| **In Progress** | Staff/department actively working on it | Admin/Staff |
| **Resolved** | Issue fixed, resolution notes added | Admin/Staff |
| **Closed** | Verified and archived (final state) | Admin |
| **Reopened** *(optional)* | Student disputes resolution, reopens | Student |

**Transition Rules:**
- Forward-only by default; `Resolved → Closed` requires resolution notes to be non-empty.
- `Reopened` is only allowed from `Resolved` or `Closed`, and only within a configurable window (e.g., 7 days) — bonus feature.
- Every transition writes a row to the `complaint_activity_log` table.

---

## 7. Database Schema (MongoDB — Mongoose Collections)

### 7.1 Collection Relationship Summary
`users` (1) ──< `complaints` (M) — via `studentId` reference
`departments` (1) ──< `complaints` (M) — via `assignedDepartmentId` reference
`categories` (1) ──< `complaints` (M) — via `categoryId` reference
`complaints` embeds `attachments[]` and `activityLog[]` as **sub-documents** (denormalized — see design rationale below)

> **Design rationale:** Attachments and activity-log entries are always fetched *together with* their parent complaint and never queried independently across complaints, so they are embedded as arrays inside the `complaints` document rather than kept as separate collections. This avoids extra round-trips and matches MongoDB's document-oriented strengths. `users`, `departments`, and `categories` remain separate collections and are referenced by `ObjectId`, since they're reused across many complaints and queried independently (e.g., "list all departments").

### 7.2 Collection Definitions

**`users`**
```js
{
  _id: ObjectId,
  name: String,                // required
  email: { type: String, unique: true, required: true, lowercase: true },
  passwordHash: String,        // required, bcrypt hash
  role: { type: String, enum: ['student', 'admin', 'staff'], default: 'student' },
  rollNumber: { type: String, default: null },       // students only
  departmentId: { type: ObjectId, ref: 'Department', default: null }, // staff only
  createdAt: Date,
  updatedAt: Date
}
```

**`departments`**
```js
{
  _id: ObjectId,
  name: String,                 // e.g. "Hostel Admin", "IT/Network", "Facilities"
  description: { type: String, default: '' }
}
```

**`categories`**
```js
{
  _id: ObjectId,
  name: String,                 // Classroom, Lab, Hostel, Wi-Fi, etc.
  defaultDepartmentId: { type: ObjectId, ref: 'Department', default: null },
  isActive: { type: Boolean, default: true }
}
```

**`complaints`** (core collection, with embedded sub-documents)
```js
{
  _id: ObjectId,
  complaintCode: { type: String, unique: true }, // e.g. "CMP-2026-000123"
  studentId: { type: ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, maxlength: 120, required: true },
  description: { type: String, required: true },
  categoryId: { type: ObjectId, ref: 'Category', required: true, index: true },
  location: String,
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  status: {
    type: String,
    enum: ['submitted', 'under_review', 'assigned', 'in_progress', 'resolved', 'closed', 'reopened'],
    default: 'submitted',
    index: true
  },
  assignedDepartmentId: { type: ObjectId, ref: 'Department', default: null },
  assignedStaffId: { type: ObjectId, ref: 'User', default: null },
  resolutionNotes: { type: String, default: null },

  attachments: [{
    fileUrl: String,            // Cloudinary secure_url
    publicId: String,           // Cloudinary public_id (for deletion)
    fileType: String,           // 'image' | 'pdf'
    uploadedAt: { type: Date, default: Date.now }
  }],

  activityLog: [{
    actorId: { type: ObjectId, ref: 'User' },
    action: String,             // 'status_changed' | 'assigned' | 'comment_added' | 'priority_changed'
    oldValue: { type: String, default: null },
    newValue: { type: String, default: null },
    note: { type: String, default: null },
    createdAt: { type: Date, default: Date.now }
  }],

  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
  resolvedAt: { type: Date, default: null },
  closedAt: { type: Date, default: null }
}
```

### 7.3 Indexing Strategy
```js
// Speeds up admin table search/filter and student "my complaints" queries
complaintSchema.index({ studentId: 1, status: 1 });
complaintSchema.index({ status: 1, priority: 1 });
complaintSchema.index({ categoryId: 1 });
complaintSchema.index({ complaintCode: 1 }, { unique: true });
complaintSchema.index({ title: 'text', description: 'text' }); // for keyword search (FR-20)
```

### 7.4 Why Embedding Instead of Referencing (for `attachments` and `activityLog`)
| Consideration | Embedded (chosen) | Separate collection |
|---|---|---|
| Read pattern | Always read with parent complaint → 1 query | Would need a `$lookup`/join every time |
| Write pattern | Small, bounded arrays (few attachments, log grows slowly) | Unneeded overhead for this scale |
| Document size limit | Well under MongoDB's 16MB/doc limit for this use case | N/A |

If the activity log is expected to grow very large (e.g., thousands of entries per complaint, unlikely for this domain), it can be split into its own `activity_logs` collection referencing `complaintId` — noted here as a scaling option, not needed for MVP.

---

## 8. API Specification (REST)

**Base URL:** `/api/v1`

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Student registration |
| POST | `/auth/login` | Public | Login, returns JWT |
| POST | `/auth/logout` | Authenticated | Invalidate session (client-side token discard) |
| GET | `/auth/me` | Authenticated | Get current user profile |

### Complaints
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/complaints` | Student | Create complaint (+file upload) |
| GET | `/complaints` | Student (own) / Admin (all) | List with filters: `status`, `category`, `priority`, `search`, `page`, `limit` |
| GET | `/complaints/:id` | Owner or Admin | Complaint details + timeline |
| PATCH | `/complaints/:id/status` | Admin/Staff | Update status |
| PATCH | `/complaints/:id/assign` | Admin | Assign department/staff |
| PATCH | `/complaints/:id/priority` | Admin | Update priority |
| POST | `/complaints/:id/comments` | Admin/Staff/Student(own) | Add comment/note |
| POST | `/complaints/:id/reopen` | Student(own) | Reopen (bonus) |

### Reference Data
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/categories` | Public/Authenticated | List categories |
| POST | `/categories` | Admin | Create category |
| GET | `/departments` | Authenticated | List departments |
| POST | `/departments` | Admin | Create department |

### Statistics
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/stats/summary` | Admin | Total/status counts |
| GET | `/stats/by-category` | Admin | Category breakdown |
| GET | `/stats/by-department` | Admin | Department load |
| GET | `/stats/resolution-time` | Admin | Avg resolution time |

**Standard Response Envelope:**
```json
{
  "success": true,
  "data": { },
  "message": "Optional human-readable message",
  "error": null
}
```

**Pagination Convention:**
```json
{
  "data": [ ],
  "pagination": { "page": 1, "limit": 20, "total": 134, "totalPages": 7 }
}
```

---

## 9. UI / Screen Inventory

### Student-Facing
1. Register / Login
2. Student Dashboard (summary cards + recent complaints)
3. Submit Complaint (form with category, description, location, attachments)
4. My Complaints (list, filter by status/category)
5. Complaint Details (timeline view, attachments, resolution notes)

### Admin-Facing
6. Admin Login
7. Admin Dashboard (stats cards + charts)
8. All Complaints Table (search, filter, sort, pagination)
9. Complaint Management Detail (assign, change status/priority, add notes)
10. Department & Category Management (CRUD)
11. Reports/Analytics Page

### Shared
12. 404 / Error / Access-Denied pages
13. Notification toast/snackbar system

---

## 10. Complaint Priority Definitions

| Priority | SLA Guidance (suggested) | Example |
|---|---|---|
| **Low** | 7+ days | Minor cosmetic issue, suggestion |
| **Medium** | 3–5 days | Faulty classroom equipment |
| **High** | 1–2 days | No Wi-Fi in hostel block, broken lab equipment |
| **Critical** | Same day | Safety hazard, electrical fault, water leakage near electronics |

---

## 11. Security Considerations
- Hash all passwords (bcrypt, min 10 rounds).
- Validate and sanitize all inputs server-side (never trust frontend validation alone).
- Restrict file uploads to `.jpg, .jpeg, .png, .pdf`, max size 5MB, scan/validate MIME type not just extension.
- Enforce RBAC middleware on every protected route — students must never access another student's complaint or admin-only endpoints, even by guessing IDs. MongoDB's default `ObjectId` is already non-sequential and hard to guess, but access control must still be checked server-side on every request (never rely on ID obscurity alone).
- Whitelist only the Render backend's IP (or use MongoDB Atlas's "Allow access from anywhere" only during development, then restrict for production).
- Never expose the `MONGODB_URI` (contains DB credentials) in frontend code, GitHub commits, or client-side env vars — it belongs only in Render's server-side environment variables.
- Rate-limit login and complaint-submission endpoints to prevent abuse/spam.
- Use HTTPS everywhere; set secure, httpOnly cookies if using cookie-based JWT storage.
- Store secrets (DB credentials, JWT secret, cloud storage keys) in environment variables, never in source control.

---

## 12. Bonus / Phase 2 Features (Post-MVP Roadmap)

| Feature | Notes |
|---|---|
| Email notifications | On status change, use SendGrid/Nodemailer |
| Real-time notifications | WebSockets/Socket.io or Firebase for live status updates |
| Admin analytics dashboard | Charts via Recharts/Chart.js — trend lines, heatmaps by building |
| Department-wise statistics | Load balancing view for admins |
| Resolution time tracking | Already partially in MVP stats; extend to SLA breach alerts |
| Student feedback/rating | 1–5 star rating + comment after `Closed` |
| Duplicate complaint detection | Text similarity (e.g., cosine similarity on description) to flag likely duplicates in same location/category |
| AI-based complaint categorization | Use an LLM/classifier to auto-suggest category from description text |
| AI-generated complaint summaries | Summarize long descriptions for admin quick-view |
| Image-based issue classification | CV model to auto-tag issue type from uploaded photo |
| Automatic escalation | Cron job to escalate priority/notify higher authority if unresolved past SLA |
| PWA / mobile-responsive enhancements | Installable app shell, offline complaint drafting |

---

## 12.5 Deployment Checklist (Locked Stack)

| Step | Action |
|---|---|
| 1 | Push code to **GitHub** — recommended structure: `/client` (React) and `/server` (Express) in one repo, or two separate repos |
| 2 | Create a **MongoDB Atlas** free (M0) cluster → create DB user → whitelist IPs → copy connection string |
| 3 | Deploy `/server` to **Render** as a Web Service → connect GitHub repo → set env vars (`MONGODB_URI`, `JWT_SECRET`, Cloudinary keys, `CLIENT_URL`) → note the generated `.onrender.com` URL |
| 4 | Deploy `/client` to **Vercel** → connect GitHub repo → set `VITE_API_BASE_URL` to the Render backend URL → deploy |
| 5 | Update the backend's CORS `origin` to the final Vercel URL and redeploy |
| 6 | Seed at least one Admin user directly in MongoDB Atlas (via Atlas UI or a one-time seed script) since public registration is student-only |
| 7 | Smoke-test full flow end-to-end: register → login → submit complaint with attachment → admin assigns → status updates → student sees timeline |

## 13. Suggested Development Milestones

| Phase | Deliverable |
|---|---|
| 1 | DB schema + auth (register/login, JWT, RBAC) |
| 2 | Student: submit complaint + attachment upload + my complaints list |
| 3 | Admin: view all complaints, assign, update status/priority |
| 4 | Complaint details + activity timeline (both roles) |
| 5 | Search, filter, pagination |
| 6 | Basic statistics dashboard |
| 7 | Polish UI, mobile responsiveness, deploy (frontend + backend + DB) |
| 8 (optional) | Bonus features from Section 12 |

---

## 14. Acceptance Criteria (Definition of Done for MVP)
- [ ] Student can register, log in, and submit a complaint with category, description, location, and at least one attachment.
- [ ] Complaint receives a unique ID and status `Submitted` automatically.
- [ ] Admin can log in, view all complaints, filter/search, assign a department, set priority, and change status through the full lifecycle to `Closed`.
- [ ] Every status change is visible to the student in a timeline on the Complaint Details page.
- [ ] Admin dashboard shows at least: total complaints, count by status, count by category.
- [ ] Application is deployed and publicly reachable over HTTPS with a working database.
- [ ] Role-based access is enforced — a student cannot view or modify another student's complaint or reach admin routes.

---

*End of Specification Document.*
