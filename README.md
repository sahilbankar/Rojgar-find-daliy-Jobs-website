# ROJGAR - Real-World Job & Work-Finding Platform

ROJGAR is a full-stack, production-ready web application connecting skilled workers, tradespeople, contractors, employers, and professionals with job opportunities. Built with a modern **React + TypeScript + Vite** frontend and a robust **Node.js + Express + MongoDB** backend, ROJGAR provides a real-time, database-driven experience with role-based access control, strict authentication, dynamic vacancy tracking, and comprehensive admin management.

---

## 🚀 Key Architectural Principles

- **Zero Mock / Demo Data Policy**: Every user, job listing, category, application, statistic, and vacancy calculation is driven strictly by real database operations in MongoDB through Express API endpoints.
- **Dynamic Vacancy Engine**: Vacancies are auto-calculated on the backend based on real application state transitions (e.g., when candidates are marked `Selected`). When remaining vacancies reach zero, job listings automatically transition to `Closed` status.
- **Role-Based Access Control (RBAC)**: Enforced via secure JWT token verification and custom middleware across three distinct roles: **Job Seeker / Worker**, **Employer / Contractor**, and **Admin**.
- **Centralized API & State Management**: Centralized Axios client with automatic interceptors for JWT header attachment, token lifecycle, and HTTP error code handling (400, 401, 403, 404, 409, 500).

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM (v6+)
- **HTTP Client**: Axios with centralized response/error handling
- **State Management**: React Context API / Redux Toolkit
- **Notifications & UI**: Toast / Alert notifications, Modals, Skeleton loaders, Empty states

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ORM
- **Authentication**: JWT (JSON Web Tokens) & `bcryptjs` for password hashing
- **Security & Middleware**: `helmet`, `cors`, `express-rate-limit`, `express-mongo-sanitize`, `cookie-parser`
- **File Uploads**: `multer` (Local / Cloud Storage integration)
- **Validation**: Centralized request payload validation middleware

---

## 👥 User Roles & Responsibilities

| Role | Responsibilities & Capabilities |
| :--- | :--- |
| **Job Seeker / Worker** | Browse & search jobs, apply to active listings, track application statuses (`Applied`, `Under Review`, `Shortlisted`, `Interview`, `Selected`, `Rejected`), upload resume, manage profile skills & experience. |
| **Employer / Contractor** | Post new job listings, set required skills & vacancies, manage active listings, review candidate applications, update applicant status, track company hiring statistics. |
| **Admin** | System-wide dashboard statistics (aggregated from MongoDB), monitor users/employers/seekers/jobs/applications, approve or reject job postings, block or unblock users. |

---

## 🧰 Supported Job Categories

ROJGAR caters to both blue-collar trade roles and white-collar professional jobs:

- **Trades & Technical**: Carpenter, Mason, Plumber, Electrician, Painter, Welder, Mechanic, AC Technician, CCTV Technician
- **Logistics & Hospitality**: Driver, Delivery, Hotel Jobs, Housekeeping, Cook, Security Guard
- **Office & Professional**: Sales, Accountant, Receptionist, Office Assistant, Teacher, Nurse, Healthcare, Software Engineer, Web Developer, Software Tester, Data Analyst
- **General**: Other Jobs

*Note: All categories are loaded dynamically from the backend database.*

---

## 📁 Repository & Project Structure

```text
workswebr/
├── README.md
├── backend/
│   ├── config/          # Database & environment configurations
│   ├── controllers/     # Controller logic (Auth, Jobs, Applications, Employer, Admin, Users)
│   ├── middleware/      # Auth, RBAC, Error handling, Rate limiting, Sanitization
│   ├── models/          # Mongoose Schemas (User, Employer, Job, Application, Category)
│   ├── routes/          # Express route definitions
│   ├── services/        # Business logic & vacancy calculation service
│   ├── utils/           # Helper functions & upload handles
│   ├── validators/      # Payload validation rules
│   ├── uploads/         # Local file upload directory for resumes & avatars
│   ├── app.js           # Express app setup & middleware bindings
│   ├── server.js        # Server listener start script
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/         # Axios instance & API service modules
    │   ├── assets/      # Static assets & icons
    │   ├── components/  # Reusable UI components (Navbar, Sidebar, Modals, Cards, Loaders)
    │   ├── context/     # Global Auth & State Context providers
    │   ├── hooks/       # Custom React hooks (useAuth, useFetch)
    │   ├── layouts/     # Main Layout, Dashboard Layout
    │   ├── pages/       # Public (Home, Jobs, JobDetail, Login, Register, About, Contact)
    │   ├── pages/dashboards/ # JobSeeker, Employer, and Admin Dashboard pages
    │   ├── routes/      # ProtectedRoute & RoleRoute components
    │   ├── types/       # TypeScript interfaces (User, Job, Application, etc.)
    │   ├── App.tsx
    │   └── main.tsx
    ├── package.json
    ├── tailwind.config.js
    ├── tsconfig.json
    ├── vite.config.ts
    └── .env.example
```

---

## 🌐 API Endpoint Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new user (Job Seeker, Employer, or Admin)
- `POST /api/auth/login` - Authenticate user & return JWT token
- `POST /api/auth/logout` - Invalidate session / clear auth cookie
- `GET  /api/auth/me` - Retrieve current authenticated user profile

### Job Management (`/api/jobs`)
- `GET  /api/jobs` - Search & filter jobs (Query parameters: `keyword`, `category`, `location`, `minSalary`, `maxSalary`, `experience`, `jobType`, `page`, `limit`, `sort`)
- `GET  /api/jobs/:id` - Fetch single job details with real-time remaining vacancy calculation
- `POST /api/jobs` - Create new job listing (Employer / Admin)
- `PUT  /api/jobs/:id` - Update job listing (Job owner Employer / Admin)
- `DELETE /api/jobs/:id` - Delete job listing (Job owner Employer / Admin)
- `POST /api/jobs/:id/close` - Manually close job listing

### Applications (`/api/applications`)
- `POST /api/applications/:jobId` - Submit application (Job Seeker only; verifies job active, deadline, remaining vacancies, duplicate check)
- `GET  /api/applications/my` - Fetch applications submitted by logged-in Job Seeker
- `GET  /api/applications/:id` - Fetch specific application detail
- `GET  /api/jobs/:jobId/applications` - Fetch all applications for a specific job (Employer owner / Admin)
- `PUT  /api/applications/:id/status` - Update application status (`Applied`, `Under Review`, `Shortlisted`, `Interview`, `Selected`, `Rejected`). Trigger dynamic vacancy updates upon candidate selection.

### Employer Operations (`/api/employer`)
- `GET  /api/employer/profile` - Fetch employer company details
- `PUT  /api/employer/profile` - Update employer profile & logo
- `GET  /api/employer/jobs` - Get listings created by current employer

### User Profile (`/api/users`)
- `GET  /api/users/profile` - Get Job Seeker profile, experience, education
- `PUT  /api/users/profile` - Update profile details & availability status
- `POST /api/users/resume` - Upload resume document (PDF/DOCX)

### Admin Panel (`/api/admin`)
- `GET  /api/admin/dashboard` - Get aggregated counts (Total Users, Job Seekers, Employers, Jobs, Active Listings, Applications, Selections)
- `GET  /api/admin/users` - Paginated user management list
- `GET  /api/admin/jobs` - Paginated job audit list
- `PUT  /api/admin/jobs/:id/approve` - Approve pending job post
- `PUT  /api/admin/jobs/:id/reject` - Reject job post
- `PUT  /api/admin/users/:id/block` - Block user account
- `PUT  /api/admin/users/:id/unblock` - Unblock user account

---

## ⚙️ Environment Configuration

### Backend `.env`
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/rojgar
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api
```

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- **Node.js**: `v18.x` or higher
- **MongoDB**: Local MongoDB instance running on port `27017` or MongoDB Atlas URI

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Ensure MONGO_URI and JWT_SECRET are correctly configured in .env
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Ensure VITE_API_URL points to backend API
npm run dev
```

Open `http://localhost:5173` in your browser to start using ROJGAR.

---

## 🛡️ Security & Quality Guarantees

- **No Hardcoded Data**: Guaranteed real database persistence via MongoDB.
- **Sanitized Inputs**: MongoDB injection prevention using `express-mongo-sanitize`.
- **HTTP Security**: Express headers secured using `helmet`.
- **Rate Limiting**: IP-based rate limiting to prevent brute-force attacks on auth and public endpoints.
- **Strict Error Handling**: Centralized error middleware returning clean HTTP status codes without leaking stack traces in production.
