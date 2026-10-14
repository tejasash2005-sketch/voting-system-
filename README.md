# 🗳️ VoteSecure Pro

A full-stack **online voting platform** with four role-based portals, real-time election monitoring and cryptographic vote integrity. Built with React, Node.js, Express and MongoDB.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)

## ✨ Overview

VoteSecure Pro supports the full election lifecycle: creating elections, registering voters and candidates, casting secure ballots, monitoring turnout live, auditing events and publishing results.

### Role-based portals

| Role            | What they can do                                                                                   |
|-----------------|----------------------------------------------------------------------------------------------------|
| 👑 **Super Admin** | System dashboard, user and role management, elections, audit logs, security alerts, system health, broadcasts, settings |
| ⚙️ **Admin**       | Election and candidate management, voter registration, ballot configuration, live monitor, reports, observer assignment, results publishing |
| 🗳️ **Voter**       | Browse elections, cast votes in the voting booth, vote history, receipt verification, published results, candidate profiles |
| 👁️ **Observer**    | Real-time statistics, turnout analysis, candidate monitoring, audit trail review, integrity checks, submit reports |

## 🔒 Security Features

- JWT authentication with configurable expiry
- bcrypt password hashing (12 rounds)
- SHA-256 hash for every vote, with a receipt code voters can verify
- Account lockout after 5 failed logins (30 minutes)
- Rate limiting, Helmet security headers and restricted CORS
- Compound unique index to prevent double voting per position
- Audit log of actions with IP and timestamp
- Role-based access control on routes and controllers

## 🧰 Tech Stack

| Layer      | Technology                                                |
|------------|-----------------------------------------------------------|
| Frontend   | React 18, React Router v6, Recharts, Axios, react-hot-toast |
| Backend    | Node.js, Express, Mongoose                                |
| Database   | MongoDB (local, Docker or Atlas)                          |
| Auth       | JWT, bcryptjs                                             |
| DevOps     | Docker, Docker Compose, Nginx                             |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 6+ (local) or a free MongoDB Atlas cluster

### 1. Clone and install

```bash
git clone https://github.com/<your-username>/votesecure-pro-online-voting.git
cd votesecure-pro-online-voting

cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment variables

Copy the example files and edit the values:

```bash
# Linux / macOS
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Windows (cmd)
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

At minimum, set `MONGODB_URI` and a strong `JWT_SECRET` in `backend/.env`.

### 3. Seed the database

```bash
cd backend
npm run seed
```

### 4. Run the app

```bash
# Terminal 1: API (http://localhost:5000)
cd backend
npm run dev

# Terminal 2: UI (http://localhost:3000)
cd frontend
npm start
```

On Windows you can also double-click `run_project.bat`.

### 🐳 Docker

```bash
docker-compose up --build
```

## 👤 Demo Accounts

Created by `npm run seed`:

| Role        | Email                        | Password       |
|-------------|------------------------------|----------------|
| Super Admin | superadmin@votesecure.com    | `Password123!` |
| Admin       | admin@votesecure.com         | `Password123!` |
| Voter       | voter1@votesecure.com        | `Password123!` |
| Voter       | voter2@votesecure.com        | `Password123!` |
| Observer    | observer@votesecure.com      | `Password123!` |

> ⚠️ Demo credentials only. Remove or change them before any real deployment.

## 📁 Project Structure

```
├── backend/
│   └── src/
│       ├── config/          # database connection
│       ├── controllers/     # auth, superadmin, admin, voter, observer, election, candidate, vote
│       ├── middleware/      # JWT protection and role guards
│       ├── models/          # User, Election, Candidate, Vote, AuditLog, Notification
│       ├── routes/          # REST routes per role and resource
│       ├── utils/seeder.js  # demo data
│       └── server.js
├── frontend/
│   ├── nginx.conf
│   └── src/
│       ├── components/layout/   # dashboard layout
│       ├── context/             # auth state
│       ├── pages/               # home, auth, superadmin, admin, voter, observer
│       ├── services/api.js      # API client
│       └── utils/navConfig.js   # role navigation
├── docker-compose.yml
└── run_project.bat
```

## 📡 API Overview

| Area      | Base path           | Examples                                                        |
|-----------|---------------------|-----------------------------------------------------------------|
| Auth      | `/api/auth`         | `POST /register`, `POST /login`, `GET /me`, `PUT /change-password` |
| Elections | `/api/elections`    | `GET /public`, `POST /`, `PUT /:id/status`                      |
| Votes     | `/api/votes`        | `POST /cast`, `GET /my-history`, `GET /verify/:receiptCode`     |
| Candidates| `/api/candidates`   | candidate CRUD and approval                                     |
| Results   | `/api/results`      | published results                                               |
| Reports   | `/api/reports`      | election and observer reports                                   |
| Super Admin / Admin / Voter / Observer | `/api/superadmin`, `/api/admin`, `/api/voter`, `/api/observer` | role-specific modules |
| Health    | `/api/health`       | service status check                                            |

## 🔒 Before Deploying to Production

- Set a long random `JWT_SECRET` and keep every `.env` file out of git
- Set `NODE_ENV=production` and restrict `FRONTEND_URL`
- Remove the seeded demo accounts
- Put the API behind HTTPS (for example Nginx with Let's Encrypt)
- Enable authentication on MongoDB and restrict network access

## 🛣️ Roadmap

- [ ] Email and OTP verification for voters
- [ ] Two-factor authentication for admins
- [ ] Automated test suite
- [ ] CI pipeline with GitHub Actions

## 📄 License

Released under the [MIT License](LICENSE).
