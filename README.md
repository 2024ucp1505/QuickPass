# ⚡ QuickPass — Secure Attendance Management Platform

A cryptographically secure, real-time QR-based attendance and classroom management platform built for the modern classroom.

## Architecture

```
quickpass/                  ← Monorepo root
├── server/                 ← Node.js + Express + Socket.io + MongoDB
└── client/                 ← React 18 + Vite + Tailwind CSS
```

## Quick Start

### 1. Install dependencies
```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure environment
```bash
cp server/.env.example server/.env
# Edit server/.env — MONGO_URI, JWT_SECRET, AES_ENCRYPTION_KEY are required
```

### 3. Seed demo data
```bash
cd server && npm run seed
```

### 4. Start servers (two terminals)
```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

App will be live at **http://localhost:5173**

---

## Demo Credentials

| Role    | Email                   | Password    |
|---------|-------------------------|-------------|
| Teacher | teacher@quickpass.dev   | password123 |
| Student | alex@student.dev        | password123 |
| Student | priya@student.dev       | password123 |
| Student | carlos@student.dev      | password123 |
| Student | emma@student.dev        | password123 |
| Student | david@student.dev       | password123 |

---

## Key Features

### Security
- **AES-256-CBC** encrypted QR payloads — each code is unique and expires in **10 seconds**
- **Anti-proxy enforcement** — device fingerprinting blocks shared-device attendance fraud
- **JWT authentication** — role-based access (teacher / student)

### Teacher Portal
- Classroom CRUD with weekly schedule builder
- Student enrollment by email
- Live session with real-time QR display (Socket.io refreshed every 10s)
- Live attendance feed with proxy flag alerts
- Analytics dashboard with per-student attendance percentage
- One-click Nodemailer email to students below 75% attendance

### Student Portal
- Built-in QR scanner (`html5-qrcode`) with proper camera lifecycle management
- 5-minute undo window for mistaken scans
- Personal attendance analytics per course
- Markdown notes editor tied to classrooms
- Weekly / list schedule view

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express, Socket.io |
| Database | MongoDB with Mongoose ORM |
| Auth | JWT (jsonwebtoken) |
| Encryption | AES-256-CBC (Node.js `crypto`) |
| Email | Nodemailer |
| Frontend | React 18, Vite |
| Styling | Tailwind CSS v3 (custom design tokens) |
| Real-time | Socket.io |
| QR Scan | html5-qrcode |
| QR Render | qrcode |

---

## Environment Variables

See [`server/.env.example`](./server/.env.example) for the full reference.

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | JWT signing secret |
| `AES_ENCRYPTION_KEY` | ✅ | Exactly 32 chars for AES-256 |
| `PORT` | ✅ | Server port (default 5000) |
| `EMAIL_*` | Optional | SMTP config for Nodemailer |
| `CLIENT_URL` | ✅ | CORS origin for frontend |
