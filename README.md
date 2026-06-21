# ThreatDesk - SOC Management Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

Web-based Security Operations Center (SOC) alert management platform for collecting, normalizing, triaging, escalating, and reporting security alerts from multiple sources.

## Project Structure

```
ThreatDesk/
├── backend/          # NestJS API server
│   ├── prisma/      # Database schema and migrations
│   └── src/         # Backend source code
├── frontend/         # Next.js React application
│   └── src/         # Frontend source code
└── docs/            # Documentation
```

## Features (MVP)

- **Alert Dashboard**: Real-time view of security alerts with filterable cards
- **Alert Triage**: Detailed alert investigation with comments and timeline
- **Role-Based Access**: Support for L1/L2 analysts, engineers, managers, and admins
- **Escalation Workflow**: Streamlined process for escalating alerts to L2
- **Ticket Management**: Auto-create tickets from critical alerts
- **SLA Tracking**: Monitor response and resolution times
- **Integrations**: Support for Wazuh, Deep Security, Firewalls, and more

## Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: NestJS 10
- **Database**: PostgreSQL 14+
- **ORM**: Prisma
- **Auth**: JWT with Passport
- **Queue**: BullMQ + Redis
- **Cache**: Redis

### Frontend
- **Framework**: Next.js 14
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State**: Zustand

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- npm or yarn

## Installation

### 1. Clone repository and install dependencies

```bash
cd /home/boni/Desktop/ThreatDesk

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

### 2. Setup PostgreSQL Database

```bash
# Create database (Linux/Mac)
createdb threatdesk

# Or use PostgreSQL client to create database manually
# Then configure the DATABASE_URL in backend/.env
```

### 3. Configure Environment Variables

```bash
# Copy env template
cp .env.example .env

# Update backend/.env with your actual database credentials
# DATABASE_URL=postgresql://user:password@localhost:5432/threatdesk
```

### 4. Run Database Migrations & Seed

```bash
cd backend

# Create initial schema
npm run prisma:migrate

# Populate test data
npm run prisma:seed
```

## Running Locally

### Option 1: Development Mode (All in One)

```bash
# From root directory, runs both backend and frontend concurrently
npm run dev
```

- Backend API: http://localhost:3000
- Frontend: http://localhost:3001

### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Testing Login

### Demo Credentials (after running seed script)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | admin123 |
| L1 Analyst | l1@example.com | l1password |
| L2 Analyst | l2@example.com | l2password |

### Test Flow

1. Visit http://localhost:3001/login
2. Login with demo credentials
3. View dashboard at http://localhost:3001/dashboard
4. Browse alerts at http://localhost:3001/alerts
5. Click on an alert to open triage page
6. Test triage actions (assign, escalate, comment, close)

## API Documentation

### Authentication

```bash
# Login
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}

# Response
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "Admin"
  }
}
```

### Alerts API

```bash
# Get all alerts
GET /api/alerts?skip=0&take=20&severity=high&status=new
Authorization: Bearer <token>

# Get single alert
GET /api/alerts/:id
Authorization: Bearer <token>

# Update alert status
PATCH /api/alerts/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "in_progress"
}

# Add comment
POST /api/alerts/:id/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "This is a comment"
}
```

### Dashboard API

```bash
# Get summary metrics
GET /api/dashboard/summary
Authorization: Bearer <token>

# Get severity breakdown
GET /api/dashboard/severity-count
Authorization: Bearer <token>

# Get status breakdown
GET /api/dashboard/status-count
Authorization: Bearer <token>
```

## Database Schema

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

## Development

### Backend Development

```bash
cd backend

# Watch mode for development
npm run dev

# Run tests
npm run test
npm run test:watch

# Type checking
npm run typecheck

# Build for production
npm run build

# Start production build
npm start

# Linting
npm run lint
```

### Frontend Development

```bash
cd frontend

# Development server with hot reload
npm run dev

# Build for production
npm run build

# Start production build
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

## Project Phases

### Phase 1: ✅ Project Initialization & Database
- Monorepo setup with workspaces
- Prisma schema with all tables
- Backend and frontend scaffolding

### Phase 2: Authentication & Authorization
- JWT login/logout
- Role-based access control
- Protected routes and API endpoints

### Phase 3: Alert Management API
- Alert CRUD operations
- Priority scoring algorithm
- Alert comments and timeline

### Phase 4: Dashboard & Tickets
- Dashboard summary cards and charts
- Ticket creation and management
- SLA breach tracking

### Phase 5: Frontend UI
- Dashboard page with charts
- Alerts list and detail pages
- Triage workflow UI
- Ticket management UI

### Phase 6: Integrations
- Wazuh API connector
- Deep Security connector
- Firewall syslog receiver
- Alert normalization engine

### Phase 7: Advanced Features
- Correlation engine
- IOC enrichment
- VirusTotal/AbuseIPDB integration
- Metrics and reporting

## Troubleshooting

### Database Connection Failed
```bash
# Verify PostgreSQL is running
psql -U postgres -h localhost

# Check DATABASE_URL in backend/.env
cat backend/.env | grep DATABASE_URL

# Recreate migration if needed
cd backend
npm run prisma:migrate
```

### Port Already in Use
```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Kill process using port 3001
lsof -ti:3001 | xargs kill -9
```

### Prisma Client Error
```bash
cd backend
npx prisma generate
npm install @prisma/client
```

### Frontend can't reach backend API
```bash
# Verify backend is running on port 3000
curl http://localhost:3000/api/dashboard/summary

# Check NEXT_PUBLIC_API_URL in frontend/.env
cat frontend/.env

# Should be: NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Performance Optimization

- Database indexes on frequently filtered fields (severity, status, alertTime)
- Redis caching for dashboard summaries
- BullMQ for background jobs (alert deduplication, integration syncs)
- Pagination on alert list API
- Lazy loading for alert details

## Security Considerations

- Passwords hashed with bcrypt (implement in next phase)
- SQL injection prevention via Prisma ORM
- CORS configured for frontend origin
- JWT expiration and refresh tokens
- Role-based authorization on all endpoints
- Audit logging of critical actions
- Sensitive fields excluded from API responses

## Next Steps

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

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues or questions, contact the development team.
