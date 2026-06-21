# ThreatDesk - Quick Start Guide

## 🚀 Starting the Application

### Terminal 1: Backend
```bash
cd /home/boni/Desktop/ThreatDesk/backend
npm run build
npm start
# Backend running on http://localhost:3000
```

### Terminal 2: Frontend
```bash
cd /home/boni/Desktop/ThreatDesk/frontend
npm run build
npm start
# Frontend running on http://localhost:3001
```

## 📱 Accessing the Application

- **Frontend:** http://localhost:3001
- **API Docs:** See `/docs/api/endpoint.md`
- **Architecture:** See `/docs/architecture/docs.md`

## 🔐 Default Test Credentials

Login page at http://localhost:3001/login

(Create user via API first)

## 📡 Testing APIs

### Quick Test
```bash
# List dashboard summary
curl http://localhost:3000/api/dashboard/summary

# List alerts (requires auth)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/alerts

# List users (requires auth)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/users
```

## 🗄️ Database Setup

PostgreSQL must be running on localhost:5434

```bash
# Check connection
psql -h localhost -p 5434 -U postgres -d threatdesk

# Run migrations
cd backend && npx prisma db push
```

## 📊 Main Pages

- `/dashboard` - Real-time metrics & charts
- `/alerts` - Alert triage table
- `/tickets` - IT ticket management
- `/incidents` - Security incident tracking
- `/log-sources` - Integration configuration
- `/reports` - Analytics & exports

## 🔌 WebSocket Testing

Connect to WebSocket on backend port 3000:
```javascript
const socket = io('http://localhost:3000', {
  query: { userId: 'test-user' }
});

// Listen for events
socket.on('alert.created', (data) => console.log(data));
socket.on('sla.breached', (data) => console.log(data));
```

## 📚 API Examples

### Get Dashboard Summary
```bash
curl http://localhost:3000/api/dashboard/summary
```

Response:
```json
{
  "newAlerts": 42,
  "inProgress": 15,
  "escalated": 3,
  "criticalAlerts": 2,
  "slaBreached": 1,
  "truePositive": 28,
  "falsePositive": 5,
  "closedToday": 12
}
```

### List Alerts
```bash
curl "http://localhost:3000/api/alerts?skip=0&take=20&severity=critical"
```

### Create Alert
```bash
curl -X POST http://localhost:3000/api/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Suspicious Activity",
    "severity": "high",
    "source": "wazuh",
    "assetId": "asset-123"
  }'
```

## 🛠️ Configuration

### Backend Environment (.env)
```env
DATABASE_URL=postgresql://user:pass@localhost:5434/threatdesk
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3001
```

### Frontend Environment (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 🐛 Troubleshooting

### Backend won't start
- Check PostgreSQL is running
- Run: `npx prisma db push`
- Check ports: 3000 (backend), 5434 (DB)

### Frontend showing errors
- Clear `.next` folder: `rm -rf .next`
- Rebuild: `npm run build`
- Restart: `npm start`

### API returns 401
- Check JWT token is valid
- Verify Authorization header format: `Bearer TOKEN`

### WebSocket not connecting
- Check backend is running
- Verify Socket.IO port 3000 is accessible
- Check browser console for errors

## 📝 Key Features

✅ Real-time alert updates via WebSocket
✅ Alert triage with status workflow
✅ Incident management with linking
✅ IT ticket tracking
✅ Daily/weekly/monthly reports
✅ SLA monitoring & breach alerts
✅ User/role management
✅ Audit logging
✅ Multi-channel notifications
✅ Log source health monitoring

## 🔗 Documentation

- [API Documentation](./docs/api/endpoint.md) - All endpoints
- [Architecture](./docs/architecture/docs.md) - System design
- [Testing Report](./TESTING_REPORT.md) - Integration tests
- [Project Summary](./PROJECT_COMPLETION_SUMMARY.md) - Full overview

## 📊 Status

✅ Backend: Production Ready
✅ Frontend: Ready for Integration
✅ Database: Synced
✅ Real-Time: Working
✅ Security: Implemented
✅ Documentation: Complete

## 🚀 Ready to Deploy

All components tested and verified.
See [PROJECT_COMPLETION_SUMMARY.md](./PROJECT_COMPLETION_SUMMARY.md) for deployment checklist.
