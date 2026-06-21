# ThreatDesk - Quick Test (2 minutes)

Minimal checklist to verify system works. Do this AFTER following LOCAL_SETUP.md.

## Prerequisites
- [ ] Docker containers running: `docker ps | grep threatdesk`
- [ ] Backend running: `npm run dev` in backend/ (Terminal 1)
- [ ] Frontend running: `npm run dev` in frontend/ (Terminal 2)
- [ ] Database seeded: `npm run prisma:seed` (already done)

## Test Steps

### 1. Test Frontend (30 seconds)
```
Action: Open http://localhost:3001/login
Expect: Login page loads with form
Check: [ ] Email field visible [ ] Password field visible [ ] Demo credentials shown
```

### 2. Test Login (30 seconds)
```
Action: Enter admin@example.com / admin123, click Sign In
Expect: Redirected to dashboard
Check: [ ] Dashboard URL is http://localhost:3001/dashboard
```

### 3. Test Dashboard (30 seconds)
```
Action: Wait for dashboard to load
Expect: 8 metric cards show numbers
Check: [ ] New Alerts shows number [ ] Critical Alerts shows number
       [ ] Charts display (Severity & Status)
```

### 4. Test Navigation (30 seconds)
```
Action: Click "View Alerts" card or navigate to /alerts
Expect: Table with alerts appears
Check: [ ] Alert Code column visible [ ] Table has rows
```

### 5. Test Alert Details (30 seconds)
```
Action: Click "View" button on first alert
Expect: Alert detail page loads
Check: [ ] Alert name shows [ ] Triage actions visible
       [ ] Comment section visible
```

### 6. Test Backend API (30 seconds)
```bash
# Get token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' | jq -r '.access_token')

# Test endpoint
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/dashboard/summary

Action: Run commands above
Expect: JSON response with alert counts
Check: [ ] No error messages [ ] Numbers visible (newAlerts, inProgress, etc.)
```

## Success Result

If all 6 tests pass:

✅ **System is working correctly!**

- Frontend renders pages
- Authentication works  
- Backend API responds
- Database has test data
- Full workflow functional

## If Something Fails

Check these in order:

1. **Page won't load**
   - [ ] Frontend running? (Terminal 2: npm run dev)
   - [ ] URL correct? (http://localhost:3001)
   - [ ] No errors in browser console? (F12)

2. **Login fails**
   - [ ] Backend running? (Terminal 1: npm run dev)
   - [ ] Database seeded? (npm run prisma:seed)
   - [ ] .env has correct DATABASE_URL?

3. **API errors**
   - [ ] Docker containers running? (docker ps)
   - [ ] PostgreSQL accessible? (psql -h localhost -U threatdesk -d threatdesk)
   - [ ] Token valid? (Check curl output)

4. **No data in dashboard**
   - [ ] Database seeded? (npm run prisma:seed)
   - [ ] Check alert count: psql -h localhost -U threatdesk -d threatdesk -c "SELECT COUNT(*) FROM alerts;"
   - [ ] Restart backend: Ctrl+C then npm run dev

## Quick Fixes

```bash
# Database won't connect
docker-compose restart

# Backend crashed
cd backend && npm run dev

# Frontend stuck
pkill node  # kills all node processes
# Restart: cd frontend && npm run dev

# Want to reset everything
docker-compose down -v
docker-compose up -d
npm run prisma:seed
```

## Expected Performance

- Login: <1 second
- Dashboard load: <1 second
- API response: <500ms
- Charts render: instant

If slower, check:
- Network latency
- System resources (CPU, RAM)
- Database query speed

---

**All tests passed = Ready to develop!** 🚀

Next steps:
1. Make changes to code
2. Test in browser/API
3. Add features
4. Deploy to production

See LOCAL_SETUP.md for detailed setup instructions.
See README.md for architecture overview.
See IMPLEMENTATION_SUMMARY.md for what's implemented.
