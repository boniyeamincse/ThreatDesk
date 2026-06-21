# ThreatDesk API Endpoints

Base URL: `http://localhost:3000/api`

## Authentication
All endpoints require Bearer token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## Settings API

### User Profile

#### GET /settings/profile
Get current user's profile information.

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1-555-0123",
  "role": {
    "name": "Admin"
  }
}
```

#### PUT /settings/profile
Update current user's profile.

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "phone": "string (optional)"
}
```

**Response:** Updated profile object

---

### Notification Preferences

#### GET /settings/preferences
Get user's notification preferences.

**Response:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "emailAlerts": true,
  "emailSeverity": ["critical", "high"],
  "slackAlerts": false,
  "slackWebhook": "https://hooks.slack.com/...",
  "dailySummary": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### PUT /settings/preferences
Update notification preferences.

**Request Body:**
```json
{
  "emailAlerts": boolean,
  "emailSeverity": ["critical", "high"],
  "slackAlerts": boolean,
  "slackWebhook": "string (optional)",
  "dailySummary": boolean
}
```

**Response:** Updated preferences object

---

### Security Settings

#### PUT /settings/security/password
Update user password.

**Request Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

**Response:**
```json
{
  "message": "Password updated"
}
```

**Errors:**
- 400: Current password incorrect
- 400: Current password is required
- 400: New password is required

#### POST /settings/security/mfa/enable
Enable multi-factor authentication.

**Response:**
```json
{
  "secret": "hex-encoded-secret",
  "message": "MFA enabled. Save this secret safely."
}
```

#### POST /settings/security/mfa/disable
Disable multi-factor authentication.

**Response:**
```json
{
  "message": "MFA disabled"
}
```

---

### API Keys

#### GET /settings/api-keys
List all API keys for current user.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Grafana Dashboard Sync",
    "createdAt": "2024-01-01T00:00:00Z",
    "lastUsedAt": "2024-01-15T12:30:00Z"
  }
]
```

#### POST /settings/api-keys
Generate new API key.

**Request Body:**
```json
{
  "name": "string (key name/description)"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Grafana Dashboard Sync",
  "key": "hex-encoded-api-key",
  "createdAt": "2024-01-01T00:00:00Z",
  "message": "API key created. Save it now — you cannot view it again."
}
```

**Note:** API key is only returned once. Save immediately.

#### DELETE /settings/api-keys/:keyId
Revoke API key.

**Response:**
```json
{
  "message": "API key revoked"
}
```

**Errors:**
- 403: Cannot revoke this API key

---

### User Management (Admin Only)

#### GET /settings/users
List all users. **Admin required.**

**Response:**
```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1-555-0123",
    "role": {
      "name": "Admin"
    },
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

#### POST /settings/users
Create new user. **Admin required.**

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+1-555-0456",
  "department": "SOC",
  "role": "L1 Analyst",
  "password": "string (optional, auto-generated if omitted)"
}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "newuser@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+1-555-0456",
  "role": {
    "name": "L1 Analyst"
  }
}
```

**Errors:**
- 403: Only admins can create users
- 400: Role not found

#### DELETE /settings/users/:userId
Delete user. **Admin required.**

**Response:**
```json
{
  "message": "User deleted"
}
```

**Errors:**
- 403: Only admins can delete users
- 400: Cannot delete yourself

---

## Alerts API

### Alert CRUD

#### GET /alerts
List alerts with filtering and pagination.

**Query Parameters:**
- `skip` (optional): Offset for pagination (default: 0)
- `take` (optional): Limit results (default: 20)
- `severity` (optional): Filter by severity (critical, high, medium, low)
- `status` (optional): Filter by status (new, in_progress, escalated, closed, archived)
- `source` (optional): Filter by source (wazuh, deep-security, firewall, etc.)

**Response:**
```json
{
  "alerts": [
    {
      "id": "uuid",
      "alertCode": "ALERT-001",
      "name": "Suspicious Login",
      "severity": "high",
      "status": "new",
      "verdict": "unclassified",
      "source": "wazuh",
      "alertTime": "2024-01-15T10:30:00Z",
      "asset": { "id": "uuid", "hostname": "prod-web-01" },
      "assignedTo": []
    }
  ],
  "total": 150,
  "page": 0,
  "limit": 20
}
```

#### POST /alerts
Create new alert.

**Request Body:**
```json
{
  "source": "wazuh",
  "name": "Suspicious Activity",
  "description": "High number of login failures",
  "severity": "high",
  "alertTime": "2024-01-15T10:30:00Z",
  "eventTime": "2024-01-15T10:25:00Z",
  "assetId": "uuid",
  "sourceIp": "192.168.1.100",
  "destinationIp": "10.0.0.1",
  "destinationPort": 22,
  "protocol": "ssh",
  "ruleId": "rule-123"
}
```

#### GET /alerts/:id
Get alert details with comments, timeline, and related data.

**Response:**
```json
{
  "id": "uuid",
  "alertCode": "ALERT-001",
  "name": "Suspicious Login",
  "severity": "high",
  "status": "in_progress",
  "verdict": "true_positive",
  "asset": { "id": "uuid", "hostname": "prod-web-01" },
  "assignedTo": [{ "id": "uuid", "user": {...} }],
  "comments": [...],
  "timeline": [...],
  "tickets": [...]
}
```

#### DELETE /alerts/:id
Delete alert and associated data (comments, assignments, timeline).

---

### Alert Workflow

#### POST /alerts/:id/assign
Assign alert to analyst.

**Request Body:**
```json
{
  "userId": "uuid"
}
```

#### POST /alerts/:id/unassign
Remove analyst assignment.

**Request Body:**
```json
{
  "userId": "uuid"
}
```

#### POST /alerts/:id/start
Begin investigation (sets status to in_progress).

#### POST /alerts/:id/close
Close alert.

**Request Body:**
```json
{
  "reason": "False positive - legitimate admin activity"
}
```

#### POST /alerts/:id/archive
Archive alert (removes from active view).

#### POST /alerts/:id/reopen
Reopen closed alert.

#### POST /alerts/:id/escalate
Escalate to L2 responder.

**Request Body:**
```json
{
  "reason": "Potential APT activity - needs deep investigation"
}
```

---

### Alert Classification

#### PATCH /alerts/:id/status
Update alert status.

**Request Body:**
```json
{
  "status": "in_progress"
}
```

**Valid statuses:** new, in_progress, escalated, closed, archived

#### PATCH /alerts/:id/severity
Update severity level.

**Request Body:**
```json
{
  "severity": "critical"
}
```

**Valid severities:** low, medium, high, critical

#### PATCH /alerts/:id/verdict
Set verdict classification.

**Request Body:**
```json
{
  "verdict": "true_positive"
}
```

**Valid verdicts:** unclassified, true_positive, false_positive, suspicious, benign

#### PATCH /alerts/:id/priority-score
Set custom priority score.

**Request Body:**
```json
{
  "priorityScore": 85
}
```

---

### Alert Comments

#### GET /alerts/:id/comments
Get all comments for alert.

**Response:**
```json
[
  {
    "id": "uuid",
    "content": "Initial assessment complete",
    "user": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "createdAt": "2024-01-15T11:00:00Z",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
]
```

#### POST /alerts/:id/comments
Add comment to alert.

**Request Body:**
```json
{
  "content": "Confirmed malicious IP. Blocking in firewall."
}
```

#### PUT /alerts/:id/comments/:commentId
Edit your own comment.

**Request Body:**
```json
{
  "content": "Updated analysis..."
}
```

#### DELETE /alerts/:id/comments/:commentId
Delete your own comment.

---

### Alert Context

#### GET /alerts/:id/timeline
Get alert activity timeline.

**Response:**
```json
[
  {
    "id": "uuid",
    "action": "escalated",
    "details": "Escalated to L2. Reason: Potential APT",
    "createdAt": "2024-01-15T11:30:00Z"
  },
  {
    "id": "uuid",
    "action": "assigned",
    "details": "Assigned to user xyz",
    "createdAt": "2024-01-15T11:15:00Z"
  }
]
```

#### GET /alerts/:id/raw-event
Get raw event data from source system.

**Response:**
```json
{
  "id": "uuid",
  "alertCode": "ALERT-001",
  "rawEvent": { ...original event payload... }
}
```

#### GET /alerts/:id/related-alerts
Get similar alerts on same asset.

**Query Parameters:**
- `limit` (optional): Number of results (default: 5)

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Failed SSH Login",
    "severity": "medium",
    "status": "closed",
    "alertTime": "2024-01-15T09:00:00Z",
    "asset": { "id": "uuid", "hostname": "prod-web-01" }
  }
]
```

---

## Alert Board API (Kanban)

### GET /alert-board
Get full alert board organized by Kanban columns.

**Query Parameters:**
- `severity` (optional): Filter by severity (critical, high, medium, low)
- `source` (optional): Filter by source (wazuh, deep-security, etc)
- `assignedTo` (optional): Filter by assigned user ID

**Response:**
```json
{
  "columns": [
    {
      "id": "new",
      "title": "New",
      "status": "new",
      "alerts": [
        {
          "id": "uuid",
          "alertCode": "ALERT-001",
          "name": "Suspicious Login",
          "severity": "high",
          "alertTime": "2024-01-15T10:30:00Z",
          "asset": { "id": "uuid", "hostname": "prod-web-01" },
          "assignedTo": []
        }
      ]
    },
    {
      "id": "in_progress",
      "title": "In Progress",
      "status": "in_progress",
      "alerts": [...]
    },
    {
      "id": "escalated",
      "title": "Escalated",
      "status": "escalated",
      "alerts": [...]
    },
    {
      "id": "closed",
      "title": "Closed",
      "status": "closed",
      "alerts": [...]
    },
    {
      "id": "archived",
      "title": "Archived",
      "status": "archived",
      "alerts": [...]
    }
  ],
  "total": 150
}
```

### GET /alert-board/columns
Get board column definitions.

**Response:**
```json
[
  { "id": "new", "title": "New", "status": "new" },
  { "id": "in_progress", "title": "In Progress", "status": "in_progress" },
  { "id": "escalated", "title": "Escalated", "status": "escalated" },
  { "id": "closed", "title": "Closed", "status": "closed" },
  { "id": "archived", "title": "Archived", "status": "archived" }
]
```

### PATCH /alert-board/alerts/:id/move
Move alert to different column (status).

**Request Body:**
```json
{
  "status": "in_progress"
}
```

**Valid statuses:** new, in_progress, escalated, closed, archived

**Response:** Updated alert object with new status

**Errors:**
- 400: Invalid status
- 404: Alert not found

### GET /alert-board/my-alerts
Get all alerts assigned to current user.

**Response:**
```json
[
  {
    "id": "uuid",
    "alertCode": "ALERT-001",
    "name": "Suspicious Login",
    "severity": "high",
    "status": "in_progress",
    "verdict": "unclassified",
    "alertTime": "2024-01-15T10:30:00Z",
    "asset": { "id": "uuid", "hostname": "prod-web-01" },
    "assignedTo": [
      {
        "id": "uuid",
        "user": {
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com"
        }
      }
    ]
  }
]
```

### GET /alert-board/team-alerts
Get all alerts with assignments (team workload view).

**Response:**
```json
[
  {
    "id": "uuid",
    "alertCode": "ALERT-001",
    "name": "Suspicious Activity",
    "severity": "critical",
    "status": "escalated",
    "alertTime": "2024-01-15T10:30:00Z",
    "assignedTo": [
      {
        "id": "uuid",
        "user": {
          "id": "user-uuid",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com",
          "role": { "name": "L1 Analyst" }
        }
      }
    ]
  }
]
```

---

## Incidents API

### Incident CRUD

#### GET /incidents
List incidents with filtering and pagination.

**Query Parameters:**
- `skip` (optional): Offset for pagination (default: 0)
- `take` (optional): Limit results (default: 20)
- `severity` (optional): Filter by severity
- `status` (optional): Filter by status

**Response:**
```json
{
  "incidents": [
    {
      "id": "uuid",
      "incidentCode": "INC-001",
      "title": "Ransomware Attack - Finance System",
      "description": "Multiple systems encrypted, ransom demand received",
      "severity": "critical",
      "status": "investigating",
      "owner": "user-id",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T11:00:00Z",
      "tickets": []
    }
  ],
  "total": 5,
  "page": 0,
  "limit": 20
}
```

#### POST /incidents
Create incident.

**Request Body:**
```json
{
  "title": "Security Incident",
  "description": "Detailed description of incident",
  "severity": "critical",
  "owner": "user-id (optional)"
}
```

#### GET /incidents/:id
Get incident details.

**Response:** Full incident object with tickets

#### PATCH /incidents/:id
Update incident.

**Request Body:**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "severity": "high",
  "owner": "new-owner-id"
}
```

#### DELETE /incidents/:id
Delete incident and related tickets.

---

### Incident Workflow

#### POST /incidents/:id/assign
Assign incident to owner.

**Request Body:**
```json
{
  "owner": "user-id"
}
```

#### PATCH /incidents/:id/status
Update incident status.

**Request Body:**
```json
{
  "status": "investigating"
}
```

**Valid statuses:** open, investigating, contained, remediated, recovered, closed, reopened

#### POST /incidents/:id/contain
Mark incident as contained.

**Request Body:**
```json
{
  "details": "Isolated affected systems from network"
}
```

#### POST /incidents/:id/remediate
Mark incident as remediated.

**Request Body:**
```json
{
  "details": "Removed malware, patched systems"
}
```

#### POST /incidents/:id/recover
Mark incident as recovered.

**Request Body:**
```json
{
  "details": "Systems restored from clean backups"
}
```

#### POST /incidents/:id/close
Close incident.

**Request Body:**
```json
{
  "details": "Post-incident review completed"
}
```

#### POST /incidents/:id/reopen
Reopen closed incident.

**Request Body:**
```json
{
  "reason": "Additional indicators of compromise discovered"
}
```

---

### Incident-Alert Relationships

#### POST /incidents/:id/alerts
Add alert to incident.

**Request Body:**
```json
{
  "alertId": "uuid"
}
```

**Response:**
```json
{
  "id": "uuid",
  "incidentId": "uuid",
  "alertId": "uuid",
  "title": "Alert: Suspicious Activity",
  "severity": "high",
  "status": "open"
}
```

#### GET /incidents/:id/alerts
Get all alerts linked to incident.

**Response:**
```json
[
  {
    "id": "uuid",
    "incidentId": "uuid",
    "alertId": "uuid",
    "title": "Alert: Suspicious Activity",
    "severity": "high",
    "alert": { ...alert object... },
    "comments": [...]
  }
]
```

#### DELETE /incidents/:id/alerts/:alertId
Remove alert from incident.

---

### Incident-Asset Relationships

#### POST /incidents/:id/assets
Add asset to incident.

**Request Body:**
```json
{
  "assetId": "uuid"
}
```

#### GET /incidents/:id/assets
Get all affected assets for incident.

**Response:**
```json
[
  {
    "id": "uuid",
    "hostname": "prod-web-01",
    "ip": "10.0.0.5",
    "criticality": "critical",
    "assetType": "server"
  }
]
```

#### DELETE /incidents/:id/assets/:assetId
Remove asset from incident.

---

### Create Incident from Alert

#### POST /alerts/:id/create-incident
Create incident from alert (links alert to new incident).

**Request Body:**
```json
{
  "title": "Custom incident title (optional)",
  "description": "Custom description (optional)",
  "owner": "user-id (optional)"
}
```

**Response:** Created incident object

---

## Tickets API

### Ticket CRUD

#### GET /tickets
List tickets with filtering and pagination.

**Query Parameters:**
- `skip` (optional): Offset for pagination (default: 0)
- `take` (optional): Limit results (default: 20)
- `status` (optional): Filter by status
- `severity` (optional): Filter by severity

**Response:**
```json
{
  "tickets": [
    {
      "id": "uuid",
      "ticketCode": "TKT-001",
      "title": "System Access Issue",
      "description": "User unable to access finance system",
      "severity": "high",
      "status": "open",
      "ownerId": "uuid",
      "dueTime": "2024-01-16T18:00:00Z",
      "createdAt": "2024-01-15T10:00:00Z",
      "alert": {...},
      "comments": [...]
    }
  ],
  "total": 45,
  "page": 0,
  "limit": 20
}
```

#### POST /tickets
Create ticket.

**Request Body:**
```json
{
  "title": "Ticket title",
  "description": "Detailed description",
  "severity": "high",
  "status": "open",
  "assignedTeam": "IT Support",
  "ownerId": "user-id (optional)",
  "dueTime": "2024-01-16T18:00:00Z (optional)",
  "alertId": "alert-id (optional)",
  "incidentId": "incident-id (optional)"
}
```

#### GET /tickets/:id
Get ticket with comments and related alert.

**Response:** Full ticket object

#### PATCH /tickets/:id
Update ticket fields.

**Request Body:**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "severity": "critical",
  "assignedTeam": "Security Team",
  "ownerId": "user-id",
  "dueTime": "2024-01-17T18:00:00Z"
}
```

#### DELETE /tickets/:id
Delete ticket and comments.

---

### Ticket Workflow

#### PATCH /tickets/:id/status
Update ticket status.

**Request Body:**
```json
{
  "status": "in_progress"
}
```

**Valid statuses:** open, assigned, in_progress, waiting_user, waiting_it, resolved, closed, reopened

#### POST /tickets/:id/assign
Assign ticket to owner.

**Request Body:**
```json
{
  "ownerId": "user-id"
}
```

#### POST /tickets/:id/escalate
Escalate ticket severity by one level.

**Request Body:**
```json
{
  "reason": "User reports data loss (optional)"
}
```

**Severity progression:** low → medium → high → critical

#### POST /tickets/:id/resolve
Mark ticket as resolved with notes.

**Request Body:**
```json
{
  "resolutionNotes": "Issue resolved by resetting password"
}
```

#### POST /tickets/:id/close
Close ticket.

#### POST /tickets/:id/reopen
Reopen closed ticket.

---

### Ticket Comments

#### GET /tickets/:id/comments
Get all comments for ticket.

**Response:**
```json
[
  {
    "id": "uuid",
    "content": "Issue under investigation",
    "author": "john@example.com",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

#### POST /tickets/:id/comments
Add comment to ticket.

**Request Body:**
```json
{
  "content": "Awaiting user feedback on issue"
}
```

#### PUT /tickets/:id/comments/:commentId
Edit comment.

**Request Body:**
```json
{
  "content": "Updated comment content"
}
```

#### DELETE /tickets/:id/comments/:commentId
Delete comment.

---

## Reports API

### Time-Based Reports

#### GET /reports/daily
Daily report with metrics.

**Query Parameters:**
- `date` (optional): ISO date (2024-01-15)

**Response:**
```json
{
  "date": "2024-01-15",
  "alerts": 42,
  "incidents": 3,
  "tickets": 15,
  "truePositives": 28,
  "falsePositives": 12,
  "accuracy": "66.67"
}
```

#### GET /reports/weekly
Weekly report with daily averages.

**Query Parameters:**
- `weeks` (optional): Number of weeks (default: 1)

**Response:**
```json
{
  "startDate": "2024-01-08",
  "daysIncluded": 7,
  "alerts": 294,
  "incidents": 21,
  "tickets": 105,
  "truePositives": 196,
  "falsePositives": 84,
  "accuracy": "66.67",
  "dailyAverage": {
    "alerts": 42,
    "incidents": 3,
    "tickets": 15
  }
}
```

#### GET /reports/monthly
Monthly report with aggregated metrics.

**Query Parameters:**
- `months` (optional): Number of months (default: 1)

---

### Summary Reports

#### GET /reports/alerts-summary
Breakdown of all alerts by status, severity, source, verdict.

**Response:**
```json
{
  "summary": {
    "newAlerts": 25,
    "inProgress": 8,
    "escalated": 3,
    "closed": 150
  },
  "byStatus": [
    { "name": "new", "count": 25 },
    { "name": "in_progress", "count": 8 }
  ],
  "bySeverity": [
    { "name": "critical", "count": 5 },
    { "name": "high", "count": 15 }
  ],
  "bySource": [
    { "name": "wazuh", "count": 150 }
  ],
  "byVerdict": [
    { "name": "unclassified", "count": 100 }
  ]
}
```

#### GET /reports/incidents-summary
Current incident status breakdown.

**Response:**
```json
{
  "open": 5,
  "investigating": 2,
  "contained": 1,
  "remediated": 3,
  "recovered": 1,
  "closed": 48,
  "total": 60
}
```

#### GET /reports/tickets-summary
Ticket status metrics.

**Response:**
```json
{
  "open": 12,
  "assigned": 8,
  "inProgress": 5,
  "resolved": 20,
  "closed": 145,
  "total": 190
}
```

---

### Performance Reports

#### GET /reports/sla
SLA compliance and breach tracking.

**Response:**
```json
{
  "breachCount": 5,
  "totalEscalated": 50,
  "breachRate": "10.00",
  "recentBreaches": [...]
}
```

#### GET /reports/analyst-performance
Per-analyst metrics.

**Response:**
```json
[
  {
    "userId": "uuid",
    "analyst": "John Doe",
    "email": "john@example.com",
    "alertsAssigned": 42,
    "alertsClosed": 35,
    "closureRate": "83.33"
  }
]
```

#### GET /reports/true-positive
True positive rate and trending.

**Response:**
```json
{
  "count": 150,
  "percentage": "42.86",
  "recentAlerts": [...]
}
```

#### GET /reports/false-positive
False positive rate analysis.

**Response:**
```json
{
  "count": 85,
  "percentage": "24.29",
  "recentAlerts": [...]
}
```

#### GET /reports/noisy-rules
Top alert-generating rules (rule tuning candidates).

**Response:**
```json
[
  {
    "ruleId": "rule-123",
    "count": 456,
    "percentage": "45.60"
  }
]
```

---

### Export Functionality

#### GET /reports/daily/export/pdf
Export daily report as PDF.

**Query Parameters:**
- `date` (optional): Target date

**Response:** PDF file download

#### GET /reports/daily/export/excel
Export daily report as Excel.

#### GET /reports/daily/export/csv
Export daily report as CSV.

#### GET /reports/alerts/export/pdf
Export alerts summary as PDF.

#### GET /reports/alerts/export/excel
Export alerts summary as Excel.

#### GET /reports/alerts/export/csv
Export alerts summary as CSV.

---

## Dashboard API

### GET /dashboard/summary
Dashboard summary overview metrics.

**Response:**
```json
{
  "new_alerts": 25,
  "in_progress": 8,
  "escalated": 3,
  "true_positive": 6,
  "false_positive": 12,
  "closed_today": 18,
  "critical_alerts": 5,
  "sla_breached": 2
}
```

### GET /dashboard/alert-counts
Breakdown of alerts by status.

**Response:**
```json
{
  "new": 25,
  "in_progress": 8,
  "escalated": 3,
  "closed": 150,
  "archived": 42
}
```

### GET /dashboard/severity-counts
Alert distribution by severity level.

**Response:**
```json
[
  { "name": "critical", "count": 5 },
  { "name": "high", "count": 15 },
  { "name": "medium", "count": 32 },
  { "name": "low", "count": 48 }
]
```

### GET /dashboard/status-counts
Alert distribution by status.

**Response:**
```json
[
  { "name": "new", "count": 25 },
  { "name": "in_progress", "count": 8 },
  { "name": "escalated", "count": 3 },
  { "name": "closed", "count": 150 },
  { "name": "archived", "count": 42 }
]
```

### GET /dashboard/verdict-counts
Alert distribution by verdict classification.

**Response:**
```json
[
  { "name": "unclassified", "count": 18 },
  { "name": "true_positive", "count": 6 },
  { "name": "false_positive", "count": 12 },
  { "name": "suspicious", "count": 8 },
  { "name": "benign", "count": 5 }
]
```

### GET /dashboard/source-counts
Top 10 alert sources.

**Response:**
```json
[
  { "name": "wazuh", "count": 150 },
  { "name": "deep-security", "count": 89 },
  { "name": "firewall", "count": 42 }
]
```

### GET /dashboard/sla-breaches
Recent SLA breached alerts.

**Response:**
```json
[
  {
    "id": "uuid",
    "alertCode": "ALERT-12345",
    "name": "Suspicious Login Attempt",
    "severity": "high",
    "alertTime": "2024-01-15T10:30:00Z",
    "escalatedAt": "2024-01-15T11:15:00Z"
  }
]
```

### GET /dashboard/analyst-workload
Alert count per analyst.

**Response:**
```json
[
  {
    "userId": "uuid",
    "analyst": "John Doe",
    "email": "john@example.com",
    "alertCount": 12
  },
  {
    "userId": "uuid",
    "analyst": "Jane Smith",
    "email": "jane@example.com",
    "alertCount": 8
  }
]
```

### GET /dashboard/alert-trends
Daily alert trends by severity.

**Query Parameters:**
- `days` (optional): Number of days to include (default: 7)

**Response:**
```json
[
  {
    "date": "2024-01-15",
    "critical": 2,
    "high": 5,
    "medium": 8,
    "low": 12
  },
  {
    "date": "2024-01-16",
    "critical": 1,
    "high": 4,
    "medium": 10,
    "low": 15
  }
]
```

### GET /dashboard/top-risk-assets
Highest-risk assets by alert count.

**Query Parameters:**
- `limit` (optional): Number of results (default: 10)

**Response:**
```json
[
  {
    "assetId": "uuid",
    "hostname": "prod-web-01",
    "alertCount": 45,
    "criticality": "critical"
  },
  {
    "assetId": "uuid",
    "hostname": "prod-db-01",
    "alertCount": 32,
    "criticality": "high"
  }
]
```

### GET /dashboard/top-noisy-rules
Most frequently triggered rules.

**Query Parameters:**
- `limit` (optional): Number of results (default: 10)

**Response:**
```json
[
  { "ruleId": "rule-123", "count": 156 },
  { "ruleId": "rule-456", "count": 98 },
  { "ruleId": "rule-789", "count": 72 }
]
```

---

---

## Audit Logs API

#### GET /audit-logs
List audit logs with filtering and pagination.

**Query Parameters:**
- `skip` (optional): Offset (default: 0)
- `take` (optional): Limit (default: 20)
- `userId` (optional): Filter by user
- `action` (optional): Filter by action type
- `resource` (optional): Filter by resource

**Response:**
```json
{
  "logs": [
    {
      "id": "uuid",
      "userId": "uuid",
      "action": "alert.assigned",
      "resource": "alert-id",
      "changes": {...},
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1250,
  "page": 0,
  "limit": 20
}
```

#### GET /audit-logs/:id
Get single audit log entry.

#### GET /audit-logs/user/:userId
Get all logs for user.

#### GET /audit-logs/resource/:resource
Get all logs for resource.

**Common Actions:**
- user.login
- user.logout
- alert.assigned
- alert.escalated
- alert.closed
- verdict.changed
- ticket.created
- incident.created
- api_key.created
- api_key.deleted

---

## Log Sources API

#### GET /log-sources
List all log sources.

**Response:**
```json
{
  "sources": [
    {
      "id": "uuid",
      "name": "Wazuh Manager",
      "type": "wazuh",
      "status": "active",
      "config": { "apiUrl": "...", "user": "..." },
      "lastSyncAt": "2024-01-15T10:30:00Z",
      "lastError": null,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 5,
  "limit": 20
}
```

#### GET /log-sources/:id
Get source details.

#### POST /log-sources
Add log source.

**Request Body:**
```json
{
  "name": "Wazuh Manager",
  "type": "wazuh",
  "config": {
    "apiUrl": "https://wazuh.example.com",
    "user": "admin",
    "password": "secret"
  }
}
```

#### PATCH /log-sources/:id
Update source.

**Request Body:**
```json
{
  "name": "Updated Name",
  "config": {...}
}
```

#### DELETE /log-sources/:id
Remove source.

#### POST /log-sources/:id/test-connection
Verify connection to source.

**Response:**
```json
{
  "success": true,
  "message": "Wazuh connection test passed"
}
```

#### GET /log-sources/:id/health
Get source health status.

**Response:**
```json
{
  "id": "uuid",
  "name": "Wazuh Manager",
  "type": "wazuh",
  "status": "active",
  "lastSyncAt": "2024-01-15T10:30:00Z",
  "lastError": null,
  "alertCount": 1250,
  "healthy": true
}
```

#### POST /log-sources/:id/sync
Trigger manual sync (queues background job).

**Response:**
```json
{
  "message": "Sync job queued",
  "sourceId": "uuid"
}
```

**Supported Sources:**
- wazuh
- deep-security
- firewall
- windows-logs
- syslog
- email-security
- proxy-dns
- custom-api

---

## Users & Roles API

### User Management

#### GET /users
List users with pagination.

**Query Parameters:**
- `skip` (optional): Offset (default: 0)
- `take` (optional): Limit (default: 20)

**Response:**
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1-555-0123",
      "active": true,
      "role": { "id": "uuid", "name": "Admin" },
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 25,
  "page": 0,
  "limit": 20
}
```

#### GET /users/:id
Get user details with permissions.

#### POST /users
Create user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1-555-0123",
  "department": "SOC",
  "role": "Admin",
  "password": "CustomPass123! (optional)"
}
```

#### PATCH /users/:id
Update user.

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+1-555-9876",
  "department": "Security",
  "role": "L1 Analyst"
}
```

#### DELETE /users/:id
Delete user.

#### POST /users/:id/deactivate
Deactivate user account.

#### POST /users/:id/activate
Reactivate user account.

#### POST /users/:id/reset-password
Generate temporary password.

**Response:**
```json
{
  "message": "Password reset. Send temp password to user.",
  "tempPassword": "A1B2C3D4E5F6"
}
```

---

### Role Management

#### GET /roles
List all roles with permissions.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Admin",
    "description": "Full system access",
    "permissions": [...]
  }
]
```

#### GET /roles/:id
Get role with users and permissions.

#### POST /roles
Create role.

**Request Body:**
```json
{
  "name": "L2 Responder",
  "description": "Escalated alert handling",
  "permissions": ["perm-id-1", "perm-id-2"]
}
```

#### PATCH /roles/:id
Update role.

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

#### DELETE /roles/:id
Delete role (fails if users assigned).

---

### Permission Management

#### GET /permissions
List all permissions.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "view_alerts",
    "description": "View security alerts"
  }
]
```

#### POST /permissions
Create permission.

**Request Body:**
```json
{
  "name": "escalate_alerts",
  "description": "Escalate alerts to L2"
}
```

#### GET /roles/:roleId/permissions
Get permissions for role.

#### POST /roles/:roleId/permissions
Add permissions to role.

**Request Body:**
```json
{
  "permissionIds": ["perm-id-1", "perm-id-2"]
}
```

#### PUT /roles/:roleId/permissions
Replace all role permissions.

**Request Body:**
```json
{
  "permissionIds": ["perm-id-1", "perm-id-2"]
}
```

---

## Background Jobs

Jobs run automatically on schedule. No API endpoints. Monitor via logs.

**Scheduled Tasks:**

| Job | Schedule | Purpose |
|-----|----------|---------|
| Wazuh Sync | Every 5 min | Pull alerts from Wazuh API |
| SLA Breach Check | Every 1 min | Detect escalated alerts over 1h old |
| Daily Report | 8 AM daily | Generate SOC summary (TP/FP counts) |
| Alert Dedup | Every 10 min | Archive duplicate alerts by source:name:asset |
| Health Check | Every 5 min | Monitor log sources, mark disconnected if >30m no sync |
| Audit Cleanup | 1st of month | Delete audit logs > 90 days |
| Alert Archive | 1st of month | Archive closed alerts > 60 days |

**Features:**
- Async execution (non-blocking)
- Error logging & recovery
- Event triggers on major actions
- Integration with Notifications service
- Automatic retry on failure

---

## Notifications API

#### GET /notifications
List all notifications with pagination.

**Query Parameters:**
- `skip` (optional): Offset (default: 0)
- `take` (optional): Limit (default: 20)

**Response:**
```json
{
  "notifications": [
    {
      "id": "uuid",
      "userId": "uuid",
      "title": "New Critical Alert",
      "message": "Suspicious PowerShell detected on PC-IT-01",
      "type": "alert.created",
      "relatedId": "alert-id",
      "read": false,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 150,
  "limit": 20
}
```

#### GET /notifications/unread
Get unread notifications only.

#### POST /notifications/:id/read
Mark single notification as read.

#### POST /notifications/read-all
Mark all notifications as read for current user.

#### DELETE /notifications/:id
Delete notification.

#### GET /notifications/summary/daily
Get daily summary with counts.

**Response:**
```json
{
  "date": "2024-01-15",
  "alertsCreated": 42,
  "incidentsCreated": 3,
  "ticketsCreated": 15,
  "recentNotifications": [...]
}
```

**Notification Types:**
- alert.created/escalated/assigned/closed
- ticket.created/updated
- incident.created/updated
- sla.breached
- logsource.disconnected

**Channels:** In-app, Email, Slack, Teams

---

## Error Responses

All errors return standard format:
```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "BadRequest"
}
```

### Common Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting
Not currently implemented. Coming soon.

---

## Versioning
Current API version: v1 (no version prefix in URLs)
