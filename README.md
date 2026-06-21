# ThreatDesk - SOC Management Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

Web-based Security Operations Center (SOC) alert management platform for collecting, normalizing, triaging, escalating, and reporting security alerts from multiple sources.

## Table of Contents
- [About the Project](#about-the-project)
  - [Features (MVP)](#features-mvp)
  - [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running Locally](#running-locally)
  - [Testing Login](#testing-login)
- [Project Architecture](#project-architecture)
  - [Project Structure](#project-structure)
  - [Database Schema](#database-schema)
  - [API Documentation](#api-documentation)
- [Development Guide](#development-guide)
  - [Development Commands](#development-commands)
  - [Project Phases](#project-phases)
  - [Next Steps](#next-steps)
- [Advanced Topics](#advanced-topics)
  - [Troubleshooting](#troubleshooting)
  - [Performance Optimization](#performance-optimization)
  - [Security Considerations](#security-considerations)
- [Community & Support](#community--support)
  - [Support](#support)
  - [License](#license)

---

## About the Project

### Features (MVP)
- **Alert Dashboard**: Real-time view of security alerts with filterable cards
- **Alert Triage**: Detailed alert investigation with comments and timeline
- **Role-Based Access**: Support for L1/L2 analysts, engineers, managers, and admins
- **Escalation Workflow**: Streamlined process for escalating alerts to L2
- **Ticket Management**: Auto-create tickets from critical alerts
- **SLA Tracking**: Monitor response and resolution times
- **Integrations**: Support for Wazuh, Deep Security, Firewalls, and more

### Tech Stack

**Backend**
- **Runtime**: Node.js 18+
- **Framework**: NestJS 10
- **Database**: PostgreSQL 14+
- **ORM**: Prisma
- **Auth**: JWT with Passport
- **Queue**: BullMQ + Redis
- **Cache**: Redis

**Frontend**
- **Framework**: Next.js 14
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State**: Zustand

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- npm or yarn

### Installation

**1. Clone repository and install dependencies**
```bash
git clone https://github.com/boniyeamincse/ThreatDesk.git
cd ThreatDesk

# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
npx prisma generate

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

**2. Setup PostgreSQL Database**
```bash
# Create database (Linux/Mac)
createdb threatdesk

# Or use PostgreSQL client to create database manually
# Then configure the DATABASE_URL in backend/.env
```

**3. Configure Environment Variables**
```bash
# Copy env template
cp .env.example .env

# Update backend/.env with your actual database credentials
# DATABASE_URL=postgresql://user:password@localhost:5432/threatdesk
```

**4. Run Database Migrations & Seed**
```bash
cd backend

# Create initial schema
npm run prisma:migrate

# Populate test data
npm run prisma:seed
```

### Running Locally

**Option 1: Development Mode (All in One)**
```bash
# From root directory, runs both backend and frontend concurrently
npm run dev
```
- Backend API: http://localhost:3000
- Frontend: http://localhost:3001

**Option 2: Run Separately**
Terminal 1 - Backend:
```bash
cd backend
npm run dev
```
Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

### Testing Login
After running the seed script, you can use the following credentials to test the system:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | admin123 |
| L1 Analyst | l1@example.com | l1password |
| L2 Analyst | l2@example.com | l2password |

**Test Flow**:
1. Visit http://localhost:3001/login
2. Login with demo credentials
3. View dashboard at http://localhost:3001/dashboard
4. Browse alerts at http://localhost:3001/alerts
5. Click on an alert to open triage page
6. Test triage actions (assign, escalate, comment, close)

---

## Project Architecture

### Project Structure
```
ThreatDesk/
├── backend/          # NestJS API server
│   ├── prisma/      # Database schema and migrations
│   └── src/         # Backend source code
├── frontend/         # Next.js React application
│   └── src/         # Frontend source code
└── docs/            # Documentation
```

### Database Schema
Key tables:
- `users` - System users
- `roles` - User roles (Admin, L1, L2, Engineer, Manager)
- `alerts` - Core alert data
- `alert_comments` - Investigation notes
- `alert_assignments` - User assignments
- `tickets` - Incident tickets
- `assets` - Network assets/hosts
- `integrations` - Data source configurations
- `sla_policies` - SLA definitions
- `audit_logs` - Activity audit trail

### API Documentation
**Authentication**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Alerts API**
```bash
GET /api/alerts?skip=0&take=20&severity=high&status=new
GET /api/alerts/:id
PATCH /api/alerts/:id/status
POST /api/alerts/:id/comments
```

**Dashboard API**
```bash
GET /api/dashboard/summary
GET /api/dashboard/severity-count
GET /api/dashboard/status-count
```
*(Remember to pass the JWT in the `Authorization: Bearer <token>` header)*

---

## Development Guide

### Development Commands

**Backend**
```bash
cd backend
npm run dev           # Watch mode for development
npm run test          # Run tests
npm run test:watch    # Run tests in watch mode
npm run typecheck     # Type checking
npm run build         # Build for production
npm start             # Start production build
npm run lint          # Linting
```

**Frontend**
```bash
cd frontend
npm run dev           # Development server with hot reload
npm run build         # Build for production
npm start             # Start production build
npm run type-check    # Type checking
npm run lint          # Linting
```

### Project Phases
- **Phase 1: ✅ Project Initialization & Database** (Monorepo, Prisma schema, scaffolding)
- **Phase 2: Authentication & Authorization** (JWT, RBAC, Protected routes)
- **Phase 3: Alert Management API** (CRUD, Priority scoring, Comments)
- **Phase 4: Dashboard & Tickets** (Metrics cards, Incident management, SLA)
- **Phase 5: Frontend UI** (Dashboard charts, Triage workflow)
- **Phase 6: Integrations** (Wazuh, Deep Security, Firewalls)
- **Phase 7: Advanced Features** (Correlation engine, IOC enrichment)

### Next Steps
1. Implement password hashing with bcrypt
2. Add integration tests with real PostgreSQL
3. Setup CI/CD pipeline (GitHub Actions)
4. Implement WebSocket for real-time alert updates
5. Add alert correlation engine
6. Setup Wazuh connector for real data ingestion
7. Implement advanced filtering and search
8. Add admin panel for user management
9. Create comprehensive monitoring dashboards
10. Setup production deployment

---

## Advanced Topics

### Troubleshooting

**Database Connection Failed**
```bash
# Verify PostgreSQL is running
psql -U postgres -h localhost
# Check DATABASE_URL in backend/.env
cat backend/.env | grep DATABASE_URL
# Recreate migration if needed
cd backend
npm run prisma:migrate
```

**Port Already in Use**
```bash
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

**Prisma Client Error**
```bash
cd backend
npx prisma generate
npm install @prisma/client
```

**Frontend can't reach backend API**
Ensure backend is running on port 3000 (`curl http://localhost:3000/api/dashboard/summary`). Check `NEXT_PUBLIC_API_URL` in `frontend/.env` is set to `http://localhost:3000`.

### Performance Optimization
- Database indexes on frequently filtered fields (severity, status, alertTime)
- Redis caching for dashboard summaries
- BullMQ for background jobs (alert deduplication, integration syncs)
- Pagination on alert list API
- Lazy loading for alert details

### Security Considerations
- Passwords hashed with bcrypt (implement in next phase)
- SQL injection prevention via Prisma ORM
- CORS configured for frontend origin
- JWT expiration and refresh tokens
- Role-based authorization on all endpoints
- Audit logging of critical actions
- Sensitive fields excluded from API responses

---

## Community & Support

### Support
For issues or questions, contact the development team or open an issue using the [provided templates](.github/ISSUE_TEMPLATE).

### License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
