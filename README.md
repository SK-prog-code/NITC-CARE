# � NITC Hostel Management & Grievance System

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://reactjs.org/)
[![Node.js Version](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![Vite + React](https://img.shields.io/badge/Frontend-Vite%20%2B%20React%2018-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-orange.svg)](LICENSE)

> **An NIT Calicut-specific hostel grievance platform for students, caretakers, and the Chief Warden office to report, assign, and resolve hostel maintenance and campus issues quickly.**

---

## 📑 Table of Contents

1. [Project Overview](#-project-overview)
2. [Key Features & User Roles](#-key-features--user-roles)
3. [Technology Stack](#-technology-stack)
4. [Complaint Lifecycle State Machine](#-complaint-lifecycle-state-machine)
5. [Prerequisites](#-prerequisites)
6. [Step-by-Step Local Setup Guide](#-step-by-step-local-setup-guide)
7. [Default Seeded Test Credentials](#-default-seeded-test-credentials)
8. [Project Directory Structure](#-project-directory-structure)
9. [REST API Reference](#-rest-api-reference)
10. [Cloud Deployment Guide (Vercel + Render + Atlas)](#-cloud-deployment-guide)
11. [Troubleshooting & FAQ](#-troubleshooting--faq)

---

## 🌟 Project Overview

The **NITC Hostel Management & Grievance System** replaces informal room-to-room reporting and manual hostel complaint tracking with an auditable digital workflow across all NIT Calicut hostels, messes, and maintenance cells.

- **For Students:** Submit hostel complaints with photos/PDFs, include hostel block and room number, and track progress in a real-time timeline.
- **For Administrators:** Executive dashboard, hostel-block filtering, workload analytics, issue routing, and performance monitoring across caretaker and department teams.
- **For Staff/Caretakers:** Dedicated queue of assigned tickets with status progression tools, assignment notes, and mandatory resolution logging.

---

## 👥 Key Features & User Roles

| Role | Access & Capabilities |
|---|---|
| **🎓 Student** | • Register with Roll Number & college email<br>• Submit complaints with up to 5 attachments (images/PDFs, max 5MB)<br>• Filter "My Complaints" by status, category, date<br>• View full chronological activity timeline<br>• Post timeline comments & dispute/reopen resolved issues |
| **👑 Admin** | • Executive KPI dashboard & interactive Recharts graphs<br>• Advanced complaint table with search, filter, and sorting<br>• Route complaints to departments & assign staff handlers<br>• Update priority (`Low`, `Medium`, `High`, `Critical`)<br>• Advance lifecycle states & verify resolution to close tickets<br>• Manage Departments & Categories with auto-routing defaults |
| **🛠️ Staff** | • View tickets assigned to their department/staff queue<br>• Advance status (`Assigned` ➔ `In Progress` ➔ `Resolved`)<br>• Record mandatory resolution notes |

---

## ⚙️ Technology Stack

```
┌──────────────────────────────┐        HTTPS / REST API         ┌──────────────────────────────┐
│       React.js (Vite)        │ ──────────────────────────────► │      Node.js + Express       │
│  TailwindCSS + Lucide Icons  │ ◄────────────────────────────── │   JWT Auth + Bcrypt Hash     │
│   (Port 5173 / Vercel SPA)   │              JSON               │   (Port 5000 / Render API)   │
└──────────────────────────────┘                                 └──────────────────────────────┘
                                                                                 │
                                                                                 ▼
                                                                 ┌──────────────────────────────┐
                                                                 │     MongoDB Database         │
                                                                 │  (Atlas Cloud / Local / Mem) │
                                                                 └──────────────────────────────┘
```

- **Frontend**: React 18 (Vite SPA), Tailwind CSS, Lucide React, Recharts, React Router v6, Canvas-Confetti.
- **Backend**: Node.js, Express.js, Mongoose ODM, JWT (`jsonwebtoken`), Bcrypt.js, Multer, Cloudinary SDK, Morgan, Express-Rate-Limit.
- **Database**: MongoDB (Atlas M0 Free Tier, local MongoDB `mongodb://127.0.0.1:27017/ccms`, or automatic zero-config In-Memory MongoDB).
- **File Storage**: Cloudinary (Cloud) or automatic local disk storage fallback.

---

## 🔄 Complaint Lifecycle State Machine

```
Submitted ──► Under Review ──► Assigned ──► In Progress ──► Resolved ──► Closed
                                                                │
                                                                ▼
                                                           (Reopened) ──► Assigned
```

1. **`Submitted`**: Student creates complaint.
2. **`Under Review`**: Admin views ticket and initiates triage.
3. **`Assigned`**: Routed to specific Department and/or Staff Handler.
4. **`In Progress`**: Department actively working on fixing the issue.
5. **`Resolved`**: Issue fixed; mandatory resolution summary notes recorded.
6. **`Closed`**: Admin verifies resolution and archives complaint.
7. **`Reopened`**: Student disputes resolution; ticket returns to active work.

---

## 📋 Prerequisites

Before running the project locally, ensure you have:
- **Node.js** (v18.0.0 or higher) — [Download Node.js](https://nodejs.org/)
- **npm** (comes packaged with Node.js)
- *(Optional)* **MongoDB** installed locally OR a free **MongoDB Atlas** cluster URI. (Note: An in-memory database will automatically launch if no MongoDB instance is detected).

---

## 🚀 Step-by-Step Local Setup Guide

### Step 1: Open the Project Directory
Open your terminal (PowerShell, Command Prompt, or Bash) in the project root:
```bash
cd complaint_mangement
```

---

### Step 2: Install Dependencies
Run the master installation script to install dependencies for root, server, and client:
```bash
npm run install:all
```
*(Or install manually: `npm install && npm install --prefix server && npm install --prefix client`)*

---

### Step 3: Configure Environment Variables

#### Backend Configuration (`server/.env`)
Create/verify the `server/.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/ccms
JWT_SECRET=ccms_super_secret_jwt_key_2026_college_complaints_system
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development

# Optional Cloudinary keys (if left blank, local uploads/ directory is used automatically):
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

#### Frontend Configuration (`client/.env`)
Create/verify the `client/.env` file:
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

---

### Step 4: Seed the Database with Demo Data
Run the database seed script to populate realistic sample departments, categories, staff, students, and active complaints across all lifecycle stages:
```bash
npm run seed
```

---

### Step 5: Start the Application
Run both the backend API and frontend React application concurrently:
```bash
npm run dev
```

- **Frontend Client**: Open [http://localhost:5173](http://localhost:5173) in your browser.
- **Backend API**: Running on [http://localhost:5000/api/v1](http://localhost:5000/api/v1).
- **Health Check**: [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health).

---

## 🔑 Default Seeded Test Credentials

For quick evaluation and grading, the UI includes a **1-Click Demo Sandbox Switcher Bar** at the top of every screen. You can also sign in manually using these credentials:

| Role | Email Address | Password | Description |
|---|---|---|---|
| 👑 **Chief Warden** | `chiefwarden@nitc.ac.in` | `Admin@123` | Full administrative control over hostel administration, route assignment, and oversight |
| 🛠️ **Caretaker (Mega Hostel)** | `caretaker.mh@nitc.ac.in` | `Staff@123` | Maintenance coordination for Mega Hostel blocks |
| 🛠️ **Caretaker (Ladies Hostel)** | `caretaker.lh@nitc.ac.in` | `Staff@123` | Ladies hostel maintenance and housekeeping coordination |
| 🎓 **Student 1** | `keerthan_b241139ch@nitc.ac.in` | `Student@123` | Mega Hostel Block 1 resident with active hostel complaints |
| 🎓 **Student 2** | `anjali_b220123ee@nitc.ac.in` | `Student@123` | Mega Ladies Hostel resident with hostel maintenance issues |
| 🎓 **Student 3** | `karthik_m230011me@nitc.ac.in` | `Student@123` | PG hostel resident with room and mess complaints |

---

## 📂 Project Directory Structure

```
complaint_mangement/
├── package.json                 # Master script runner (concurrently)
├── README.md                    # System documentation & setup guide
├── College_Complaint_Management_System_Spec.md  # System specification sheet
│
├── server/                      # Express.js REST API Backend
│   ├── .env                     # Server environment variables
│   ├── .env.example
│   ├── package.json
│   ├── uploads/                 # Local uploaded attachments directory
│   └── src/
│       ├── server.js            # Express server entrypoint
│       ├── seed.js              # Database seeder script
│       ├── config/
│       │   └── db.js            # MongoDB & In-Memory connection logic
│       ├── models/              # Mongoose ODM schemas
│       │   ├── User.js          # Students, Admins, Staff
│       │   ├── Department.js    # Campus departments
│       │   ├── Category.js      # Issue categories & department mappings
│       │   └── Complaint.js     # Embedded attachments & activity logs
│       ├── middleware/
│       │   ├── auth.js          # JWT & RBAC middleware
│       │   ├── upload.js        # Multer + Cloudinary/local fallback
│       │   └── errorHandler.js  # Centralized error envelope
│       ├── routes/              # Express API routers
│       │   ├── authRoutes.js
│       │   ├── complaintRoutes.js
│       │   ├── categoryRoutes.js
│       │   ├── departmentRoutes.js
│       │   └── statsRoutes.js
│       └── controllers/         # Business logic handlers
│           ├── authController.js
│           ├── complaintController.js
│           ├── categoryController.js
│           ├── departmentController.js
│           └── statsController.js
│
└── client/                      # React 18 + Vite SPA Frontend
    ├── .env                     # Frontend environment variables
    ├── index.html               # Main HTML entry with Google Fonts
    ├── package.json
    ├── vite.config.js           # Vite configuration & dev server proxy
    ├── tailwind.config.js       # Custom design system tokens
    └── src/
        ├── main.jsx             # React entrypoint
        ├── App.jsx              # Application router & protected routes
        ├── index.css            # Tailwind styles, glassmorphism, scrollbars
        ├── context/
        │   ├── AuthContext.jsx  # Authentication state & 1-click switcher
        │   └── ThemeContext.jsx # Dark / Light mode toggle
        ├── services/
        │   └── api.js           # Axios API client with JWT interceptor
        ├── components/common/   # Reusable UI components
        │   ├── Navbar.jsx
        │   ├── Footer.jsx
        │   ├── DemoBanner.jsx   # Top 1-click test credential switcher
        │   ├── StatusBadge.jsx
        │   ├── PriorityBadge.jsx
        │   ├── ActivityTimeline.jsx
        │   ├── StatCard.jsx
        │   ├── Pagination.jsx
        │   ├── Modal.jsx
        │   └── ProtectedRoute.jsx
        └── pages/               # Screen Views
            ├── Home.jsx         # Landing page & feature showcase
            ├── Login.jsx        # Login screen with quick credentials
            ├── Register.jsx     # Student registration form
            ├── NotFound.jsx     # 404 page
            ├── student/
            │   ├── StudentDashboard.jsx
            │   ├── SubmitComplaint.jsx
            │   ├── MyComplaints.jsx
            │   └── ComplaintDetails.jsx
            └── admin/
                ├── AdminDashboard.jsx
                ├── AllComplaints.jsx
                ├── AdminComplaintDetails.jsx
                ├── DepartmentManagement.jsx
                ├── CategoryManagement.jsx
                └── AnalyticsPage.jsx
```

---

## 📡 REST API Reference

Base API Endpoint: `/api/v1`

### Authentication (`/api/v1/auth`)
- `POST /auth/register` — Register a new student account.
- `POST /auth/login` — Sign in and receive JWT token.
- `GET /auth/me` — Get current logged-in user profile *(Protected)*.
- `GET /auth/staff` — List staff members for assignment dropdown *(Protected: Admin/Staff)*.

### Complaints (`/api/v1/complaints`)
- `POST /complaints` — Submit a complaint with up to 5 attachments *(Protected: Student)*.
- `GET /complaints` — List complaints with search, status, category, priority, department filters & pagination.
- `GET /complaints/:id` — Get full complaint details, attachments & activity log timeline.
- `PATCH /complaints/:id/status` — Transition complaint status through state machine *(Protected: Admin/Staff)*.
- `PATCH /complaints/:id/assign` — Assign department and staff handler *(Protected: Admin)*.
- `PATCH /complaints/:id/priority` — Update priority level *(Protected: Admin)*.
- `POST /complaints/:id/comments` — Add comment/note to activity log.
- `POST /complaints/:id/reopen` — Reopen resolved or closed complaint *(Protected: Student owner)*.

### Reference Data & Categories (`/api/v1/categories`, `/api/v1/departments`)
- `GET /categories` — List active complaint categories.
- `POST /categories` — Create category with default department mapping *(Protected: Admin)*.
- `PUT /categories/:id` — Update category *(Protected: Admin)*.
- `GET /departments` — List active departments *(Protected)*.
- `POST /departments` — Create campus department *(Protected: Admin)*.
- `PUT /departments/:id` — Update department *(Protected: Admin)*.

### Executive Analytics (`/api/v1/stats`) *(Protected: Admin/Staff)*
- `GET /stats/summary` — Total, pending, in-progress, resolved counts, and resolution rate.
- `GET /stats/by-category` — Volume aggregated by category.
- `GET /stats/by-department` — Complaints assigned and resolved per department.
- `GET /stats/by-priority` — Breakdown by priority level.
- `GET /stats/resolution-time` — Average turnaround time in hours/days.

---

## ☁️ Cloud Deployment Guide

### 1. Database (MongoDB Atlas)
1. Sign up at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas) and create a free **M0 cluster**.
2. Under **Network Access**, add IP `0.0.0.0/0` (Allow access from anywhere).
3. Under **Database Access**, create a user with read/write privileges.
4. Copy the connection string: `mongodb+srv://<user>:<password>@cluster.mongodb.net/ccms?retryWrites=true&w=majority`.

### 2. Backend (Render)
1. Connect your GitHub repository to [Render.com](https://render.com/).
2. Create a new **Web Service** with:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
3. Add Environment Variables in Render Dashboard:
   - `MONGODB_URI`: `<Your MongoDB Atlas URI>`
   - `JWT_SECRET`: `<A random 64-character string>`
   - `JWT_EXPIRES_IN`: `7d`
   - `CLIENT_URL`: `<Your Vercel URL, e.g., https://your-app.vercel.app>`
   - `NODE_ENV`: `production`
   - *(Optional)* `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
4. Deploy and note your live Render backend URL: `https://your-service.onrender.com`.

### 3. Frontend (Vercel)
1. Import your GitHub repository on [Vercel](https://vercel.com/).
2. Set **Root Directory** to `client`.
3. Set Environment Variable:
   - `VITE_API_BASE_URL`: `https://your-service.onrender.com/api/v1`
4. Click **Deploy**.

---

## ❓ Troubleshooting & FAQ

- **Port 5000 or 5173 already in use?**
  Change `PORT=5001` in `server/.env` and update `VITE_API_BASE_URL=http://localhost:5001/api/v1` in `client/.env`.
- **Render Free Tier Cold Start?**
  Render spins down free tier instances when idle. The first request after inactivity may take ~30 seconds to wake up.
- **Can I run without Cloudinary?**
  Yes! The backend automatically falls back to storing attachments in `server/uploads/` when Cloudinary keys are omitted.

---

*Developed for College Campus Grievance Redressal & Resolution.*
