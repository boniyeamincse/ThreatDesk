# ThreatDesk - Local Development Setup

Complete step-by-step guide to run ThreatDesk locally with full functionality.

## Prerequisites

Verify you have:
- Node.js 18+ (check: `node --version`)
- npm 11+ (check: `npm --version`)
- Docker & Docker Compose (check: `docker --version`)
- PostgreSQL client (optional, already installed)

## Quick Start (5 minutes with Docker)

### 1. Start Database & Redis

```bash
cd /home/boni/Desktop/ThreatDesk

# Start PostgreSQL and Redis containers
docker-compose up -d

# Verify containers running
docker ps | grep threatdesk
```

Expected output:
```
threatdesk-postgres  postgres:16-alpine
threatdesk-redis     redis:7-alpine
```

### 2. Initialize Database

```bash
cd backend

# Generate Prisma client
npm run prisma:generate

# Run migrations (creates all tables)
npm run prisma:migrate

# Seed test data (creates test users and sample alerts)
npm run prisma:seed
```

Expected output after seed:
```
Database seeded successfully

Test Credentials:
Admin - admin@example.com / admin123
L1 Analyst - l1@example.com / l1password
L2 Analyst - l2@example.com / l2password

Test Alerts Created: 3
```

### 3. Start Backend (Terminal 1)

```bash
cd /home/boni/Desktop/ThreatDesk/backend

npm run dev
```

Expected output:
```
[Nest] 12345 - 06/21/2026, 9:30:00 AM     LOG [NestFactory] Starting Nest application...
[Nest] 12345 - 06/21/2026, 9:30:01 AM     LOG [InstanceLoader] AppModule dependencies initialized
...
ThreatDesk API running on port 3000
```

### 4. Start Frontend (Terminal 2)

```bash
cd /home/boni/Desktop/ThreatDesk/frontend

npm run dev
```

Expected output:
```
  ▲ Next.js 14.0.4
  - Ready in 1.2s

Open http://localhost:3001
```

### 5. Access Application

Open browser and visit:
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **API Health**: http://localhost:3000/api/auth/me (returns error - expected without token)

## Testing Login

1. Go to http://localhost:3001/login
2. See "Demo Credentials" section with:
   - Email: `admin@example.com`
   - Password: `admin123`
3. Click "Sign In"
4. Redirected to Dashboard at http://localhost:3001/dashboard

## Verify Full Workflow

### Dashboard
- [x] 8 metric cards show actual data
- [x] 2 charts display (Severity, Status)
- [x] 3 navigation cards

### Alerts
- [x] Table with 3 test alerts
- [x] Click "View" on any alert
- [x] Opens triage page with details

### Triage Page
- [x] Shows full alert information
- [x] Network details (IPs, ports)
- [x] MITRE ATT&CK mapping
- [x] Triage action buttons work
- [x] Comments section ready

### More Pages
- [x] Tickets page shows table
- [x] Integrations page shows 6 integration cards
- [x] Logout button works

## Verify API Endpoints

Test endpoints with curl (use token from login):

```bash
# 1. Login and get token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }' | jq -r '.access_token')

echo "Token: $TOKEN"

# 2. Get current user
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/auth/me

# 3. Get all alerts
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/alerts

# 4. Get dashboard summary
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/dashboard/summary

# 5. Get severity chart data
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/dashboard/severity-count

# 6. Get status chart data
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/dashboard/status-count
```

## Verify Database

Connect to PostgreSQL and check tables:

```bash
# Connect to database
psql -h localhost -U threatdesk -d threatdesk

# List all tables
\dt

# Count alerts
SELECT COUNT(*) FROM alerts;

# See test users
SELECT email, firstName, role_name FROM users JOIN roles ON users.roleId = roles.id;

# Exit
\q
```

## Performance Metrics

After full setup, expect:
- **Backend startup**: 2-3 seconds
- **Frontend build**: 1-2 seconds
- **Dashboard load**: ~500ms
- **Alerts list**: ~600ms
- **API response**: <100ms

## Troubleshooting

### Port Already in Use

```bash
# Backend port 3000 in use
lsof -ti:3000 | xargs kill -9

# Frontend port 3001 in use
lsof -ti:3001 | xargs kill -9

# Redis port 6380 in use
lsof -ti:6380 | xargs kill -9

# PostgreSQL port 5432 in use
lsof -ti:5432 | xargs kill -9
```

### Database Connection Failed

```bash
# Check containers running
docker ps

# Check PostgreSQL logs
docker logs threatdesk-postgres

# Restart containers
docker-compose restart

# Verify connection
psql -h localhost -U threatdesk -d threatdesk -c "SELECT 1"
```

### Frontend Can't Reach Backend

```bash
# Check backend is running
curl http://localhost:3000/

# Check environment variable
echo $NEXT_PUBLIC_API_URL

# Should be: http://localhost:3000
# Restart frontend if changed
```

### Prisma Errors

```bash
# Regenerate Prisma client
cd backend
npx prisma generate

# View database state
npx prisma db execute --stdin < query.sql

# Reset database (WARNING: deletes all data)
npm run prisma:reset
```

### Test Data Missing

```bash
cd backend

# Run seed again
npm run prisma:seed

# Verify
psql -h localhost -U threatdesk -d threatdesk \
  -c "SELECT COUNT(*) FROM alerts;"
```

## Development Workflow

### Making Backend Changes

```bash
# 1. Edit src/modules/*/...
# 2. Backend auto-rebuilds (watch mode)
# 3. Restart if compilation fails
npm run dev
```

### Making Frontend Changes

```bash
# 1. Edit src/app/*/...
# 2. Frontend hot-reloads automatically
# 3. No restart needed
```

### Testing API Changes

```bash
# 1. Update controller in backend
# 2. Test with curl or Postman
# 3. Update frontend component if needed

# Example: Testing new endpoint
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/alerts/ALERT_ID/escalate \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"reason": "Needs investigation"}'
```

## Database Inspection

```bash
# Connect to PostgreSQL
psql -h localhost -U threatdesk -d threatdesk

# Show all tables
\dt

# Show schema of specific table
\d alerts

# Run queries
SELECT id, name, severity, status FROM alerts LIMIT 5;
SELECT email, firstName, role_id FROM users;
SELECT COUNT(*) FROM alert_comments;

# Exit
\q
```

## Reset Everything

Start fresh if something breaks:

```bash
# Stop containers
docker-compose down

# Remove all containers and volumes
docker-compose down -v

# Clear npm cache
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Restart from Quick Start step 1
docker-compose up -d
```

## Next Steps

After verifying everything works:

1. **Explore Code**
   - Backend: `backend/src/modules/`
   - Frontend: `frontend/src/app/`
   - Database: `backend/prisma/schema.prisma`

2. **Make Changes**
   - Add new API endpoint
   - Create new frontend page
   - Modify database schema
   - Add new feature

3. **Test Changes**
   - Backend: curl or Postman
   - Frontend: browser at localhost:3001
   - Database: psql command line

4. **Deploy**
   - Build for production: `npm run build`
   - Use Docker images
   - Deploy to cloud platform

## Success Criteria Checklist

- [ ] Docker containers running
- [ ] Database seeded with test data
- [ ] Backend starts without errors
- [ ] Frontend loads at localhost:3001
- [ ] Can login with admin credentials
- [ ] Dashboard shows metrics and charts
- [ ] Can navigate to all pages
- [ ] API endpoints respond with data
- [ ] Database contains test data
- [ ] No errors in browser console

All items checked = **Local setup complete!** ✅

## Additional Resources

- Backend API docs: See `backend/src/modules/*/` for endpoint definitions
- Frontend components: See `frontend/src/app/` for page structure
- Database schema: See `backend/prisma/schema.prisma`
- Environment config: See `.env.example` files
- Docker setup: See `docker-compose.yml`

## Support

For detailed setup issues:
1. Check TESTING.md for comprehensive testing guide
2. Check README.md for architecture overview
3. Check IMPLEMENTATION_SUMMARY.md for what's implemented
4. Review error messages carefully - usually indicate the problem

---

**Local development setup is now complete!**

Next: Start making features or deploying to production.
