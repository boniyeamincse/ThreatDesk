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
