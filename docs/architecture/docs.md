# ThreatDesk Project Architecture

## 1. Project Overview

**ThreatDesk** is a centralized SOC alert triage, ticketing, incident, and log source management platform. The system collects alerts and security events from tools such as Wazuh, Trend Micro Deep Security, firewalls, Windows/Linux logs, and other API-based sources.

The platform helps SOC teams manage the full alert lifecycle from detection to triage, escalation, ticket creation, incident handling, reporting, and closure.

## 2. Main Objectives

The main objectives of ThreatDesk are:

* Centralize alerts from multiple security tools.
* Provide a single dashboard for SOC monitoring.
* Help L1 analysts triage alerts quickly.
* Help L2 analysts perform deeper investigation and remediation.
* Allow SOC engineers to monitor log source health and improve alert quality.
* Allow SOC managers to track SOC performance, SLA, true positives, false positives, and analyst workload.
* Maintain audit logs for accountability.
* Support future automation and integrations.

## 3. User Roles

ThreatDesk will support role-based access control.

### Admin

Admin users can manage the full platform.

Permissions:

* Manage users
* Manage roles
* Manage settings
* Manage API keys
* Manage log sources
* View audit logs
* Access all dashboards and reports

### SOC Manager

SOC managers monitor performance and quality.

Permissions:

* View dashboard
* View reports
* Track SLA
* Track analyst workload
* View alerts, tickets, and incidents
* Review true positive and false positive trends

### SOC L1 Analyst

L1 analysts perform first-level alert triage.

Permissions:

* View new alerts
* Assign alerts
* Start investigation
* Add comments
* Change alert status
* Set verdict
* Escalate alerts to L2
* Create tickets from alerts

### SOC L2 Analyst

L2 analysts handle escalated alerts and confirmed threats.

Permissions:

* View escalated alerts
* Perform deeper investigation
* Create incidents
* Update tickets
* Add remediation notes
* Close confirmed cases

### SOC Engineer

SOC engineers maintain integrations and alert quality.

Permissions:

* Manage log sources
* Test integrations
* Review parsing errors
* Review noisy alerts
* Improve detection quality
* Monitor data collection health

## 4. High-Level Architecture

```text
Security Tools / Log Sources
        |
        | API / Syslog / Webhook / Agent
        |
        v
Integration & Collector Layer
        |
        v
Parser and Normalization Layer
        |
        v
Alert Processing Engine
        |
        v
Database and Search Storage
        |
        v
Backend API Layer
        |
        v
Frontend Web Dashboard
```

## 5. Main System Components

## 5.1 Frontend Web Application

The frontend is the user interface for SOC analysts, managers, engineers, and administrators.

Recommended technology:

```text
React.js or Next.js
TypeScript
Tailwind CSS
shadcn/ui
TanStack Table
Recharts or ApexCharts
Socket.IO Client
```

Main frontend pages:

```text
/login
/dashboard
/alerts
/alerts/:id
/alert-board
/tickets
/tickets/:id
/incidents
/incidents/:id
/log-sources
/reports
/settings
/settings/profile
/settings/users
/settings/api-keys
```

Main menu:

```text
Dashboard
Alert Triage
Alert Board
Tickets
Incidents
Log Sources
Reports
Users & Roles
Settings
```

## 5.2 Backend API Application

The backend provides REST APIs for the frontend and integration services.

Recommended technology:

```text
Node.js
NestJS or Express.js
TypeScript
Prisma ORM
JWT Authentication
Role-Based Access Control
Socket.IO
BullMQ
```

Backend responsibilities:

* Authentication
* Authorization
* User management
* Alert management
* Ticket management
* Incident management
* Log source management
* Dashboard data
* Reports
* Notifications
* Audit logs
* API key management

## 5.3 Integration & Collector Layer

This layer collects alerts and security events from different tools.

Supported sources:

```text
Wazuh
Trend Micro Deep Security
Firewall
Windows Event Logs
Linux Syslog
Email Security
Proxy/DNS
Custom API Sources
```

Collection methods:

```text
REST API Pull
Webhook Push
Syslog Receiver
Scheduled Sync Job
Manual Import
```

Examples:

* Wazuh alerts collected through Wazuh API.
* Deep Security events collected through Trend Micro API.
* Firewall events received through syslog or API.
* Custom tools can push alerts using ThreatDesk API.

## 5.4 Parser and Normalization Layer

Different tools send alerts in different formats. ThreatDesk will normalize all alerts into one standard format.

Common alert schema:

```json
{
  "id": "uuid",
  "alertCode": "ALT-2025-000001",
  "source": "wazuh",
  "name": "Suspicious PowerShell Command",
  "description": "Encoded PowerShell command detected",
  "severity": "high",
  "status": "new",
  "verdict": "unclassified",
  "alertTime": "2025-03-27T19:56:00Z",
  "eventTime": "2025-03-27T19:54:00Z",
  "asset": {
    "hostname": "PC-IT-01",
    "ipAddress": "10.10.10.25"
  },
  "user": {
    "username": "jsmith",
    "department": "Finance"
  },
  "network": {
    "sourceIp": "10.10.10.25",
    "destinationIp": "8.8.8.8",
    "destinationPort": 53,
    "protocol": "DNS"
  },
  "mitre": {
    "tactic": "Discovery",
    "technique": "T1087"
  },
  "rawEvent": {}
}
```

## 5.5 Alert Processing Engine

The alert processing engine handles alert workflow and prioritization.

Responsibilities:

* Create alerts
* Deduplicate alerts
* Calculate priority score
* Apply SLA policy
* Assign alert status
* Trigger notification
* Create audit timeline
* Support escalation to L2
* Support ticket and incident creation

Priority logic:

```text
1. New and unassigned alerts first
2. Critical alerts before high, medium, and low
3. Oldest alerts first
4. Critical assets get higher priority
5. Known malicious IOC gets higher priority
6. Related alerts increase priority
7. SLA breach increases priority
```

Example priority score:

```text
Critical severity = 100
High severity = 75
Medium severity = 50
Low severity = 25

Critical asset = +30
Known malicious IOC = +40
Multiple related alerts = +20
SLA near breach = +25
```

## 5.6 Database Layer

Recommended database:

```text
PostgreSQL
```

PostgreSQL will store structured application data.

Main tables:

```text
users
roles
permissions
alerts
alert_comments
alert_timeline
tickets
incidents
incident_alerts
log_sources
notification_preferences
api_keys
audit_logs
settings
sla_policies
```

Optional future storage:

```text
OpenSearch or Elasticsearch
```

Use OpenSearch/Elasticsearch for:

* Large raw log search
* Historical event search
* IOC search
* Long-term investigation data

Use Redis for:

```text
Queue jobs
Caching
Session/token blacklist
Real-time counters
Background sync status
```

## 5.7 Queue and Background Job Layer

Recommended technology:

```text
Redis
BullMQ
```

Background jobs:

* Wazuh alert sync
* Deep Security event sync
* Firewall event processing
* Notification sending
* Daily summary report
* SLA breach checking
* Alert deduplication
* Log source health checking
* API key cleanup
* Audit log retention

## 5.8 Notification Layer

ThreatDesk will notify users when important events happen.

Notification channels:

```text
In-app notification
Email
Slack webhook
Microsoft Teams webhook
Telegram bot
```

Notification events:

```text
New critical alert
Alert assigned
Alert escalated
Ticket created
Incident created
SLA breached
Log source disconnected
Daily SOC summary
```

## 5.9 Real-Time Layer

Real-time updates will help SOC analysts see new alerts immediately.

Recommended technology:

```text
Socket.IO
```

WebSocket events:

```text
alert.created
alert.updated
alert.assigned
alert.escalated
alert.closed
ticket.created
ticket.updated
incident.created
sla.breached
logsource.disconnected
notification.created
```

## 6. Core Modules

## 6.1 Authentication Module

Features:

* Login
* Logout
* JWT access token
* Refresh token
* Password change
* MFA enable/disable
* Current user profile

Main APIs:

```text
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
POST /api/auth/refresh-token
PUT  /api/settings/security/password
POST /api/settings/security/mfa/enable
POST /api/settings/security/mfa/disable
```

## 6.2 Dashboard Module

Features:

* SOC overview
* Alert counts
* Severity chart
* Status chart
* Verdict chart
* SLA breach count
* Analyst workload
* Top noisy rules
* Top risky assets

Main APIs:

```text
GET /api/dashboard/summary
GET /api/dashboard/alerts-by-severity
GET /api/dashboard/alerts-by-status
GET /api/dashboard/analyst-workload
GET /api/dashboard/top-risk-assets
GET /api/dashboard/top-noisy-rules
```

## 6.3 Alert Triage Module

Features:

* View alerts
* Filter alerts
* Assign alert
* Start investigation
* Add comments
* Change status
* Change severity
* Set verdict
* Escalate to L2
* Close alert
* Archive alert
* View alert timeline
* View raw event

Main APIs:

```text
GET    /api/alerts
GET    /api/alerts/:alertId
POST   /api/alerts
POST   /api/alerts/:alertId/assign
POST   /api/alerts/:alertId/start
PATCH  /api/alerts/:alertId/status
PATCH  /api/alerts/:alertId/verdict
PATCH  /api/alerts/:alertId/severity
POST   /api/alerts/:alertId/escalate
POST   /api/alerts/:alertId/close
POST   /api/alerts/:alertId/archive
GET    /api/alerts/:alertId/comments
POST   /api/alerts/:alertId/comments
GET    /api/alerts/:alertId/timeline
```

## 6.4 Alert Board Module

Features:

* Kanban board
* Drag and drop alerts
* View alerts by status
* Move alert between columns

Main APIs:

```text
GET   /api/alert-board
PATCH /api/alert-board/alerts/:alertId/move
```

Board columns:

```text
New
Assigned
In Progress
Escalated
True Positive
False Positive
Closed
Archived
```

## 6.5 Tickets Module

Features:

* Create ticket
* Create ticket from alert
* Assign ticket
* Update ticket status
* Add ticket comments
* Resolve ticket
* Close ticket

Main APIs:

```text
GET    /api/tickets
GET    /api/tickets/:ticketId
POST   /api/tickets
POST   /api/alerts/:alertId/create-ticket
PATCH  /api/tickets/:ticketId/status
POST   /api/tickets/:ticketId/comments
```

## 6.6 Incidents Module

Features:

* Create incident
* Create incident from alert
* Link alerts to incident
* Manage incident lifecycle
* Track containment
* Track remediation
* Track recovery
* Close incident

Main APIs:

```text
GET    /api/incidents
GET    /api/incidents/:incidentId
POST   /api/incidents
POST   /api/alerts/:alertId/create-incident
PATCH  /api/incidents/:incidentId/status
POST   /api/incidents/:incidentId/alerts
```

Incident lifecycle:

```text
Open
Investigation
Containment
Remediation
Recovery
Closed
Reopened
```

## 6.7 Log Sources Module

Features:

* Add log source
* Edit log source
* Test connection
* Sync alerts
* Monitor health
* View parsing errors
* View last log received time

Main APIs:

```text
GET    /api/log-sources
GET    /api/log-sources/:sourceId
POST   /api/log-sources
PATCH  /api/log-sources/:sourceId
DELETE /api/log-sources/:sourceId
GET    /api/log-sources/:sourceId/health
POST   /api/log-sources/:sourceId/test-connection
POST   /api/log-sources/:sourceId/sync
POST   /api/integrations/wazuh/sync-alerts
POST   /api/integrations/deep-security/sync-events
POST   /api/integrations/firewall/events
```

## 6.8 Reports Module

Features:

* Daily SOC report
* Weekly SOC report
* Monthly SOC report
* Alert summary
* Incident summary
* SLA report
* Analyst performance
* True positive report
* False positive report
* Export PDF/Excel/CSV

Main APIs:

```text
GET /api/reports/daily
GET /api/reports/weekly
GET /api/reports/monthly
GET /api/reports/alerts-summary
GET /api/reports/incidents-summary
GET /api/reports/analyst-performance
GET /api/reports/sla
GET /api/reports/export
```

## 6.9 Users and Roles Module

Features:

* Create user
* Update user
* Delete user
* Deactivate user
* Assign role
* Manage permissions

Main APIs:

```text
GET    /api/settings/users
POST   /api/settings/users
DELETE /api/settings/users/:userId

GET    /api/roles
POST   /api/roles
PATCH  /api/roles/:roleId
DELETE /api/roles/:roleId
GET    /api/permissions
PUT    /api/roles/:roleId/permissions
```

## 6.10 Settings Module

Features:

* Profile settings
* Notification preferences
* Password change
* MFA
* API keys
* System settings
* SLA policy
* Alert statuses
* Verdict settings

Main APIs:

```text
GET  /api/settings/profile
PUT  /api/settings/profile
GET  /api/settings/preferences
PUT  /api/settings/preferences
PUT  /api/settings/security/password
POST /api/settings/security/mfa/enable
POST /api/settings/security/mfa/disable
GET  /api/settings/api-keys
POST /api/settings/api-keys
DELETE /api/settings/api-keys/:keyId
```

## 7. Data Flow

## 7.1 Alert Collection Flow

```text
Wazuh / Deep Security / Firewall
        |
        v
Collector Service
        |
        v
Parser and Normalizer
        |
        v
Alert Processing Engine
        |
        v
PostgreSQL Database
        |
        v
Dashboard and Alert Triage UI
```

## 7.2 Alert Triage Flow

```text
New Alert
   |
   v
Assigned to L1
   |
   v
In Progress
   |
   v
L1 Analysis
   |
   +--> False Positive --> Closed
   |
   +--> Suspicious Alert --> Escalated to L2
                              |
                              v
                         L2 Investigation
                              |
                              +--> True Positive --> Incident/Ticket
                              |
                              +--> False Positive --> Closed
```

## 7.3 Ticket Flow

```text
Alert or Incident
        |
        v
Ticket Created
        |
        v
Assigned
        |
        v
In Progress
        |
        v
Resolved
        |
        v
Closed
```

## 8. Suggested Backend Folder Structure

```text
backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── config/
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   └── app.config.ts
│   ├── common/
│   │   ├── guards/
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── interceptors/
│   │   └── utils/
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── roles/
│   │   ├── dashboard/
│   │   ├── alerts/
│   │   ├── alert-board/
│   │   ├── tickets/
│   │   ├── incidents/
│   │   ├── log-sources/
│   │   ├── integrations/
│   │   │   ├── wazuh/
│   │   │   ├── deep-security/
│   │   │   └── firewall/
│   │   ├── reports/
│   │   ├── notifications/
│   │   ├── audit-logs/
│   │   └── settings/
│   ├── jobs/
│   │   ├── wazuh-sync.job.ts
│   │   ├── deep-security-sync.job.ts
│   │   ├── sla-check.job.ts
│   │   └── daily-report.job.ts
│   └── websocket/
│       └── events.gateway.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── test/
├── package.json
└── Dockerfile
```

## 9. Suggested Frontend Folder Structure

```text
frontend/
├── src/
│   ├── app/
│   │   ├── login/
│   │   ├── dashboard/
│   │   ├── alerts/
│   │   ├── alert-board/
│   │   ├── tickets/
│   │   ├── incidents/
│   │   ├── log-sources/
│   │   ├── reports/
│   │   └── settings/
│   ├── components/
│   │   ├── layout/
│   │   ├── ui/
│   │   ├── tables/
│   │   ├── forms/
│   │   └── charts/
│   ├── features/
│   │   ├── auth/
│   │   ├── alerts/
│   │   ├── tickets/
│   │   ├── incidents/
│   │   ├── log-sources/
│   │   └── settings/
│   ├── hooks/
│   ├── lib/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── socket.ts
│   ├── types/
│   └── styles/
├── public/
├── package.json
└── Dockerfile
```

## 10. Suggested Full Project Folder Structure

```text
threatdesk/
├── backend/
├── frontend/
├── docker/
│   ├── docker-compose.yml
│   ├── postgres/
│   ├── redis/
│   └── opensearch/
├── docs/
│   ├── architecture.md
│   ├── api-endpoints.md
│   ├── database-design.md
│   ├── deployment.md
│   └── soc-workflow.md
├── scripts/
│   ├── setup.sh
│   ├── backup.sh
│   └── restore.sh
├── logs/
├── .env.example
└── README.md
```

## 11. Deployment Architecture

Recommended deployment for MVP:

```text
Nginx Reverse Proxy
        |
        +--> Frontend Container
        |
        +--> Backend API Container
        |
        +--> PostgreSQL Container
        |
        +--> Redis Container
```

Recommended deployment for production:

```text
Load Balancer / Reverse Proxy
        |
        +--> Frontend Application
        |
        +--> Backend API Application
        |
        +--> Worker Service
        |
        +--> PostgreSQL Database
        |
        +--> Redis Queue
        |
        +--> OpenSearch
        |
        +--> Backup Storage
```

## 12. Docker Services

Recommended Docker services:

```text
frontend
backend
worker
postgres
redis
opensearch
nginx
```

Example service responsibility:

```text
frontend   = Web UI
backend    = REST API and WebSocket
worker     = Background jobs and integrations
postgres   = Main database
redis      = Queue and cache
opensearch = Raw log search
nginx      = Reverse proxy
```

## 13. Security Architecture

Security controls:

* JWT authentication
* Refresh token rotation
* Role-based access control
* Password hashing using bcrypt or Argon2
* MFA support
* API key hashing
* Audit logging
* Input validation
* Rate limiting
* CORS protection
* Secure headers
* HTTPS in production
* Secrets stored in environment variables
* Database backup encryption
* Least privilege database user

## 14. Audit Logging

Every important action should be stored in audit logs.

Examples:

```text
User login
User logout
Alert assigned
Alert escalated
Alert closed
Verdict changed
Ticket created
Incident created
API key created
API key deleted
Log source added
Log source deleted
Settings changed
```

Audit log schema:

```json
{
  "id": "uuid",
  "userId": "uuid",
  "action": "alert.assigned",
  "entityType": "alert",
  "entityId": "uuid",
  "ipAddress": "10.10.10.10",
  "userAgent": "Mozilla/5.0",
  "createdAt": "2025-03-27T20:00:00Z"
}
```

## 15. MVP Development Roadmap

## Phase 1: Core Platform

Build:

```text
Login
JWT authentication
User profile
Users and roles
Dashboard summary
Alert list
Alert details
Assign alert
Update alert status
Add alert comments
Set alert verdict
```

## Phase 2: SOC Workflow

Build:

```text
Alert Board
Escalation to L2
Ticket creation
Incident creation
Alert timeline
Audit logs
Notifications
```

## Phase 3: Integrations

Build:

```text
Log Sources module
Wazuh API integration
Deep Security API integration
Firewall event API
Manual alert import
Source health checking
```

## Phase 4: Reports

Build:

```text
Daily report
Weekly report
Monthly report
SLA report
Analyst performance report
True positive report
False positive report
Export PDF/Excel/CSV
```

## Phase 5: Advanced Features

Build:

```text
Correlation engine
IOC enrichment
MITRE ATT&CK mapping
Automated playbooks
Suppression rules
Noisy rule analysis
OpenSearch integration
Threat intelligence lookup
```

## 16. Recommended MVP Build Order

Recommended first build order:

```text
1. Backend project setup
2. Database schema with Prisma
3. Authentication and JWT
4. User profile and user management
5. Alert model and alert APIs
6. Alert triage frontend page
7. Dashboard summary
8. Alert board Kanban
9. Ticket module
10. Log source module
11. Reports module
12. Settings module
```

## 17. Final Recommended Technology Stack

```text
Frontend:
Next.js
React
TypeScript
Tailwind CSS
shadcn/ui
TanStack Table
Recharts
Socket.IO Client

Backend:
Node.js
NestJS
TypeScript
Prisma ORM
JWT
Socket.IO
BullMQ

Database:
PostgreSQL

Queue and Cache:
Redis

Search:
OpenSearch or Elasticsearch

Deployment:
Docker
Docker Compose
Nginx
Linux Server
```

## 18. Final Architecture Summary

ThreatDesk will use a modular architecture where the frontend, backend API, background worker, database, queue, and log search engine are separated. Alerts will be collected from security tools through API, webhook, or syslog. After collection, alerts will be normalized and stored in the database. SOC analysts will triage alerts through the web dashboard, escalate real threats, create tickets, and manage incidents. SOC managers will use reports and dashboards to track team performance and alert quality.

This architecture is suitable for an MVP and can later scale into a full enterprise SOC management platform.
