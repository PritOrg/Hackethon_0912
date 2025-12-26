# Quick API Reference - New Endpoints

## Authentication Module

### Company Registration
```bash
POST /api/auth/register
Content-Type: application/json

{
  "companyName": "Acme Corp",
  "industry": "Technology",
  "email": "admin@acme.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@acme.com",
  "password": "SecurePass123!"
}

# Response with 2FA enabled:
{
  "success": true,
  "data": {
    "requires2FA": true,
    "tempToken": "eyJ...",
    "employeeId": "..."
  }
}
```

### Setup 2FA
```bash
POST /api/auth/setup-2fa
Authorization: Bearer <token>

# Response:
{
  "success": true,
  "data": {
    "secret": "...",
    "qrCodeUrl": "otpauth://totp/EMS:user@email.com?secret=...",
    "message": "Scan QR code with Google Authenticator app"
  }
}
```

### Verify 2FA
```bash
POST /api/auth/verify-2fa
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "123456"
}

# Response:
{
  "success": true,
  "data": {
    "message": "2FA enabled successfully",
    "backupCodes": ["ABCD1234", "EFGH5678", ...]
  }
}
```

### Forgot Password
```bash
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@company.com"
}
```

### Reset Password
```bash
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePass123!"
}
```

### Refresh Token
```bash
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJ..."
}
```

---

## Project Management Module

### Create Project
```bash
POST /api/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "companyId": "...",
  "name": "Website Redesign",
  "description": "Complete overhaul of company website",
  "managerId": "...",
  "startDate": "2025-01-01",
  "endDate": "2025-06-30",
  "billingType": "Fixed",
  "budget": {
    "amount": 50000,
    "currency": "USD"
  },
  "technologies": ["React", "Node.js", "MongoDB"],
  "priority": "High"
}
```

### Get My Projects
```bash
GET /api/projects/my-projects?status=Active
Authorization: Bearer <token>
```

### Assign Team Member
```bash
POST /api/projects/:projectId/members
Authorization: Bearer <token>
Content-Type: application/json

{
  "employeeId": "...",
  "role": "Developer",
  "allocation": 50,
  "billable": true,
  "hourlyRate": 75,
  "startDate": "2025-01-01"
}
```

### Add Milestone
```bash
POST /api/projects/:projectId/milestones
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Design Phase Complete",
  "description": "All mockups approved",
  "dueDate": "2025-02-28",
  "paymentAmount": 10000,
  "deliverables": ["Wireframes", "High-fidelity mockups", "Design system"]
}
```

### Update Milestone
```bash
PUT /api/projects/:projectId/milestones/:milestoneId
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "Completed"
}
```

### Add Risk
```bash
POST /api/projects/:projectId/risks
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "Key developer may leave",
  "severity": "High",
  "mitigation": "Cross-train team members",
  "status": "Open"
}
```

### Project Dashboard
```bash
GET /api/projects/dashboard?companyId=...
Authorization: Bearer <token>

# Response:
{
  "totalProjects": 15,
  "activeProjects": 8,
  "totalBudget": 500000,
  "totalSpent": 320000,
  "criticalProjects": [...],
  "delayedMilestones": 3
}
```

---

## Company Settings Module

### Get Settings
```bash
GET /api/company/settings?companyId=...
Authorization: Bearer <token>
```

### Update Settings
```bash
PUT /api/company/settings?companyId=...
Authorization: Bearer <token>
Content-Type: application/json

{
  "attendance": {
    "geoFencingEnabled": true,
    "geoFencingRadius": 200,
    "autoClockOut": true,
    "autoClockOutTime": "18:00"
  },
  "leave": {
    "annualLeaveLimit": 20,
    "sickLeaveLimit": 10,
    "carryForwardLimit": 5
  }
}
```

### Get Billing Info
```bash
GET /api/company/billing?companyId=...
Authorization: Bearer <token>

# Response:
{
  "companyName": "Acme Corp",
  "plan": "Professional",
  "status": "active",
  "employeeCount": 50,
  "maxEmployees": 100,
  "endDate": "2025-12-31"
}
```

### Upgrade Subscription
```bash
PUT /api/company/billing/upgrade?companyId=...
Authorization: Bearer <token>
Content-Type: application/json

{
  "plan": "Enterprise",
  "maxEmployees": 500,
  "billingCycle": "yearly"
}
```

---

## Shift & Roster Management Module

### Get All Shifts
```bash
GET /api/shifts?companyId=...
Authorization: Bearer <token>

# Response:
[
  {
    "name": "Morning Shift",
    "code": "SHIFT-MORNING",
    "startTime": "09:00",
    "endTime": "17:00",
    "breakDuration": 60,
    "workingDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  }
]
```

### Create Shift Template
```bash
POST /api/shifts
Authorization: Bearer <token>
Content-Type: application/json

{
  "companyId": "...",
  "name": "Night Shift",
  "startTime": "22:00",
  "endTime": "06:00",
  "breakDuration": 30,
  "gracePeriod": 15,
  "minimumHours": 8,
  "workingDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
}
```

### Assign Shift
```bash
POST /api/shifts/assign
Authorization: Bearer <token>
Content-Type: application/json

{
  "companyId": "...",
  "employeeIds": ["...", "..."],
  "shiftId": "...",
  "startDate": "2025-01-01",
  "endDate": "2025-03-31",
  "recurring": {
    "enabled": true,
    "pattern": "Weekly",
    "interval": 1
  }
}
```

### Get Team Roster
```bash
GET /api/shifts/roster?companyId=...&startDate=2025-01-01&endDate=2025-01-31
Authorization: Bearer <token>

# Response: Array of roster assignments with employee and shift details
```

### Request Shift Swap
```bash
PUT /api/shifts/swap
Authorization: Bearer <token>
Content-Type: application/json

{
  "rosterId": "...",
  "swapWithEmployeeId": "...",
  "reason": "Personal appointment"
}
```

### Approve Shift Swap
```bash
PUT /api/shifts/swap/:rosterId/approve
Authorization: Bearer <token>
Content-Type: application/json

{
  "action": "approve"
}
```

---

## Dashboard & Analytics Module

### Admin Dashboard
```bash
GET /api/dashboard/admin?companyId=...
Authorization: Bearer <token>

# Response:
{
  "employees": {
    "total": 150,
    "active": 145,
    "newHiresThisMonth": 5,
    "attritionRate": 3.5
  },
  "attendance": {
    "presentToday": 140,
    "absentToday": 5,
    "attendanceRate": 96.5
  },
  "projects": {
    "total": 20,
    "active": 12,
    "totalBudget": 1000000,
    "totalSpent": 650000
  },
  "assets": {
    "total": 200,
    "assigned": 180,
    "available": 20
  }
}
```

### HR Dashboard
```bash
GET /api/dashboard/hr?companyId=...
Authorization: Bearer <token>

# Response:
{
  "leaveTrends": {
    "thisMonth": 25,
    "lastMonth": 20,
    "trend": 25,
    "byType": [
      { "_id": "Sick Leave", "count": 10 },
      { "_id": "Annual Leave", "count": 15 }
    ]
  },
  "pendingActions": {
    "leaveRequests": 5,
    "regularizations": 3,
    "performanceReviews": 8
  },
  "compliance": {
    "employeesWithoutDocuments": 2,
    "complianceRate": 85
  }
}
```

### Manager Dashboard
```bash
GET /api/dashboard/manager?companyId=...
Authorization: Bearer <token>

# Response:
{
  "team": {
    "size": 12,
    "presentToday": 11,
    "absentToday": 1,
    "attendanceRate": 91.67
  },
  "pendingActions": {
    "leaveApprovals": 2
  },
  "projects": {
    "active": 3,
    "upcomingDeadlines": 5,
    "budgetUsage": 65.5
  },
  "budget": {
    "allocated": 100000,
    "spent": 65500,
    "remaining": 34500
  }
}
```

### Global Search
```bash
GET /api/search?companyId=...&q=john
Authorization: Bearer <token>

# Response:
{
  "employees": [
    {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@company.com",
      "empCode": "EMP001",
      "role": "Developer"
    }
  ],
  "projects": [
    {
      "name": "Project Alpha",
      "code": "PROJ-2025-001",
      "status": "Active"
    }
  ],
  "assets": [],
  "totalResults": 2
}
```

---

## Testing Tips

### 1. Test Authentication Flow
```bash
# Step 1: Register company
curl -X POST http://localhost:1969/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{...}'

# Step 2: Login
curl -X POST http://localhost:1969/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@acme.com","password":"SecurePass123!"}'

# Step 3: Use token in subsequent requests
curl -X GET http://localhost:1969/api/employees/me \
  -H "Authorization: Bearer <your-token>"
```

### 2. Test 2FA Setup
```bash
# Enable 2FA
curl -X POST http://localhost:1969/api/auth/setup-2fa \
  -H "Authorization: Bearer <token>"

# Scan QR code with Google Authenticator

# Verify with code
curl -X POST http://localhost:1969/api/auth/verify-2fa \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"code":"123456"}'
```

### 3. Test Project Management
```bash
# Create project
curl -X POST http://localhost:1969/api/projects \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Add milestone
curl -X POST http://localhost:1969/api/projects/<projectId>/milestones \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

---

## Common Query Parameters

### Pagination
- `page=1` - Page number (default: 1)
- `limit=10` - Items per page (default: 10)

### Sorting
- `sortBy=-createdAt` - Sort by creation date (descending)
- `sortBy=name` - Sort by name (ascending)
- `sortBy=-priority,name` - Multiple sort fields

### Filtering
- `status=Active` - Filter by status
- `startDate=2025-01-01` - Filter by start date
- `search=keyword` - Search in relevant fields

---

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error message here",
  "timestamp": "2025-12-24T10:30:00.000Z",
  "errors": [] // Optional validation errors
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error
