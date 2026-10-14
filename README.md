# 🗳️ VoteSecure Pro — Full-Stack Online Voting System

A production-ready, full-stack online voting platform with four role-based dashboards, 40 functional modules, real-time monitoring, cryptographic vote integrity, and a stunning homepage.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, React Router v6, Recharts, Axios, react-hot-toast |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose |
| **Auth** | JWT (JSON Web Tokens), bcryptjs |
| **Security** | Helmet, CORS, Rate Limiting, SHA-256 vote hashing |
| **Container** | Docker, Docker Compose, Nginx |

---

## 📁 Project Structure

```
voting-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── authController.js    # Login, register, profile
│   │   │   ├── superAdminController.js  # 10 SA modules
│   │   │   ├── adminController.js   # 10 Admin modules
│   │   │   ├── voterController.js   # 10 Voter modules
│   │   │   ├── observerController.js # 10 Observer modules
│   │   │   ├── electionController.js
│   │   │   ├── candidateController.js
│   │   │   └── voteController.js
│   │   ├── middleware/
│   │   │   └── auth.js              # JWT protect + role guard
│   │   ├── models/
│   │   │   ├── User.js              # All roles, voterId auto-gen
│   │   │   ├── Election.js          # Full election lifecycle
│   │   │   ├── Candidate.js         # Candidate profiles
│   │   │   ├── Vote.js              # SHA-256 hashed votes
│   │   │   ├── AuditLog.js          # Immutable audit trail
│   │   │   └── Notification.js      # In-app notifications
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── superadmin.js
│   │   │   ├── admin.js
│   │   │   ├── voter.js
│   │   │   ├── observer.js
│   │   │   ├── elections.js
│   │   │   ├── candidates.js
│   │   │   ├── votes.js
│   │   │   ├── results.js
│   │   │   └── reports.js
│   │   ├── utils/
│   │   │   └── seeder.js            # Test data seeder
│   │   └── server.js                # Express app entry
│   ├── .env
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   └── layout/
│   │   │       └── DashboardLayout.js  # Collapsible sidebar
│   │   ├── context/
│   │   │   └── AuthContext.js       # Global auth state
│   │   ├── pages/
│   │   │   ├── HomePage.js          # Advanced landing page
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.js     # Quick demo login
│   │   │   │   └── RegisterPage.js  # 3-step registration
│   │   │   ├── superadmin/          # 10 modules
│   │   │   ├── admin/               # 10 modules
│   │   │   ├── voter/               # 10 modules
│   │   │   └── observer/            # 10 modules
│   │   ├── services/
│   │   │   └── api.js               # All API calls (axios)
│   │   ├── styles/
│   │   │   └── globals.css          # Design system
│   │   ├── utils/
│   │   │   └── navConfig.js         # Sidebar nav configs
│   │   ├── App.js                   # Routes + auth guards
│   │   └── index.js
│   ├── .env
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6+ (local or Atlas)
- npm or yarn

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Environment Setup

Backend `.env` (already created):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/voting_system
JWT_SECRET=your_super_secret_jwt_key_change_in_production_2024
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

Frontend `.env` (already created):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Seed Database

```bash
cd backend
npm run seed
```

This creates 5 test accounts + 2 elections + 5 candidates.

### 4. Start Development Servers

```bash
# Terminal 1 – Backend
cd backend
npm run dev

# Terminal 2 – Frontend
cd frontend
npm start
```

Visit: **http://localhost:3000**

---

## 🐳 Docker Deployment

```bash
docker-compose up --build
```

---

## 👤 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| **Super Admin** | superadmin@votesecure.com | Password123! |
| **Admin** | admin@votesecure.com | Password123! |
| **Voter 1** | voter1@votesecure.com | Password123! |
| **Voter 2** | voter2@votesecure.com | Password123! |
| **Observer** | observer@votesecure.com | Password123! |

> 💡 Use the **Quick Demo Login** buttons on the login page!

---

## 🗂️ 40 Functional Modules

### 👑 Super Admin (10 modules)
1. **System Dashboard** — Live stats, voting trends, charts
2. **User Management** — CRUD, role toggle, search/filter
3. **Election Management** — Create, publish, activate, pause elections
4. **Roles & Permissions** — Role definitions and access matrix
5. **Audit Logs** — Filterable immutable activity trail
6. **Security Management** — Failed logins, locked accounts
7. **System Health** — Uptime, memory, DB status
8. **Broadcast Notifications** — Send to all or specific roles
9. **System Reports** — Voter participation analytics
10. **System Settings** — Platform configuration

### ⚙️ Admin (10 modules)
1. **Admin Dashboard** — Election overview with charts
2. **Election Management** — Manage assigned elections
3. **Voter Registration** — Register, verify, search voters
4. **Candidate Management** — Add, approve/reject, edit candidates
5. **Ballot Configuration** — View ballot layouts per election
6. **Live Monitor** — Real-time vote counts and turnout
7. **Reports** — Per-election candidate vote breakdown
8. **Notifications** — Send voter notifications
9. **Observer Assignment** — Assign observers to elections
10. **Results Publishing** — Publish results to public

### 🗳️ Voter (10 modules)
1. **Voter Dashboard** — Status, active elections, quick links
2. **Elections Browser** — Filter by status with voting progress
3. **Voting Booth** — Secure multi-position ballot with confirmation
4. **Vote History** — All past votes with receipts
5. **Receipt Verification** — Cryptographic vote proof
6. **Published Results** — Charts and leaderboard
7. **Candidate Profiles** — Full manifesto and bio
8. **Voter Profile** — Account info and voting stats
9. **Notifications** — Election alerts and reminders
10. **Election Search** — Search by keyword, type, status

### 👁️ Observer (10 modules)
1. **Observer Dashboard** — Assigned elections overview
2. **Election Monitoring** — All assigned elections with actions
3. **Real-time Statistics** — Live hourly charts, turnout
4. **Candidate Monitoring** — Live vote distribution with pie charts
5. **Turnout Analysis** — Peak hour analysis, hourly bars
6. **Audit Trail Review** — Full event log for each election
7. **Submit Reports** — Structured observer reporting
8. **Integrity Check** — Cryptographic vote verification
9. **Comparative Analysis** — Cross-election turnout comparison
10. **Observer Profile** — Credentials and assignment history

---

## 🔒 Security Features

- **JWT Authentication** with 7-day expiry
- **bcrypt password hashing** (12 rounds)
- **SHA-256 vote hashing** — every vote has a unique cryptographic hash
- **Vote receipts** — voters get a unique receipt code to verify their vote
- **Account lockout** — 5 failed attempts → 30-minute lockout
- **Rate limiting** — 200 requests/15 min per IP
- **Helmet.js** — security headers
- **CORS** — restricted to frontend origin
- **Compound unique index** — prevents double-voting per position
- **Immutable audit trail** — every action logged with IP and timestamp
- **Role-based access control** — 4 roles, route-level and controller-level guards

---

## 📡 API Endpoints

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
PUT    /api/auth/profile
PUT    /api/auth/change-password
POST   /api/auth/logout
```

### Elections
```
GET    /api/elections/public
GET    /api/elections
POST   /api/elections
GET    /api/elections/:id
PUT    /api/elections/:id
PUT    /api/elections/:id/status
DELETE /api/elections/:id
```

### Votes
```
POST   /api/votes/cast
GET    /api/votes/my-history
GET    /api/votes/verify/:receiptCode
GET    /api/votes/has-voted/:electionId
GET    /api/votes/election/:electionId
```

### Super Admin
```
GET    /api/superadmin/dashboard
GET    /api/superadmin/users
POST   /api/superadmin/users
PUT    /api/superadmin/users/:id
DELETE /api/superadmin/users/:id
GET    /api/superadmin/audit-logs
GET    /api/superadmin/security/alerts
GET    /api/superadmin/health
POST   /api/superadmin/notifications/broadcast
```

*(+ 30 more endpoints for admin, voter, observer, candidates, results)*

---

## 🎨 Design System

- **Font**: Playfair Display (headings) + Inter (body)
- **Primary**: `#1a3a6b` (deep navy)
- **Accent**: `#f59e0b` (amber gold)
- **Success**: `#10b981` | **Danger**: `#ef4444`
- **Sidebar**: collapsible dark theme
- **Cards**: white with subtle shadows and borders
- **Responsive**: mobile-friendly with breakpoints at 768px and 1024px

---

## 📄 License

MIT License — Free for educational and commercial use.

---

**Built with ❤️ for democracy** 🗳️
