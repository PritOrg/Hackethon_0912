Here is the complete **API Endpoint Matrix** needed to support this Enterprise-Grade EMS. I have categorized them by **Module** and defined the **Role-Based Access Control (RBAC)** for each.

### **Legend for Roles**

* **Admin:** Full system access.
* **HR:** Can manage employees, leaves, attendance, and reviews.
* **Manager:** Can manage their specific team, approve requests, and view their projects.
* **Employee:** Can view own data, request leaves, and clock in/out.

---

### **1. Authentication & Security Module**

*New capabilities: 2FA, Password Reset, Refresh Tokens*

| Method | Endpoint | Description | Access Level |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Register a new company (SaaS setup) | Public |
| `POST` | `/api/auth/login` | Login with Email/Password | Public |
| `POST` | `/api/auth/logout` | Logout (invalidate token) | All |
| `POST` | `/api/auth/refresh-token` | Get new access token using refresh token | All |
| `POST` | `/api/auth/forgot-password` | Request password reset email | Public |
| `POST` | `/api/auth/reset-password` | Reset password using token | Public |
| `POST` | `/api/auth/setup-2fa` | Generate QR code for 2FA | All |
| `POST` | `/api/auth/verify-2fa` | Verify and enable 2FA | All |

---

### **2. Employee Module**

*New capabilities: Hierarchy, Document Management, Salary Structure*

| Method | Endpoint | Description | Access Level |
| --- | --- | --- | --- |
| `POST` | `/api/employees` | Create a new employee | Admin, HR |
| `GET` | `/api/employees` | List all employees (Filter by Dept/Role) | Admin, HR, Manager |
| `GET` | `/api/employees/me` | Get my own profile | All |
| `GET` | `/api/employees/:id` | Get specific employee details | Admin, HR, Manager |
| `PUT` | `/api/employees/:id` | Update employee profile (General info) | Admin, HR |
| `PUT` | `/api/employees/:id/salary` | Update salary structure (Sensitive) | Admin, HR |
| `PUT` | `/api/employees/:id/status` | Change status (Terminate/Resign) | Admin, HR |
| `POST` | `/api/employees/:id/documents` | Upload document (Resume, Contract) | Admin, HR |
| `GET` | `/api/employees/:id/documents` | View employee documents | Admin, HR |
| `GET` | `/api/employees/:id/hierarchy` | Get reporting tree (Manager/Subordinates) | All |

---

### **3. Attendance Module**

*New capabilities: Geo-fencing, Breaks, Regularization*

| Method | Endpoint | Description | Access Level |
| --- | --- | --- | --- |
| `POST` | `/api/attendance/clock-in` | Clock In (Captures Lat/Lng/IP) | All |
| `POST` | `/api/attendance/clock-out` | Clock Out (Captures Lat/Lng/IP) | All |
| `POST` | `/api/attendance/break/start` | Start a break (Lunch/Tea) | All |
| `POST` | `/api/attendance/break/end` | End a break | All |
| `GET` | `/api/attendance/me` | Get my attendance history | All |
| `GET` | `/api/attendance` | View all attendance (Date range filters) | Admin, HR, Manager |
| `POST` | `/api/attendance/regularize` | Request to fix a missed punch | All |
| `PUT` | `/api/attendance/:id/approve` | Approve/Reject regularization | Manager, HR |
| `GET` | `/api/attendance/stats` | Get dashboard stats (Late/Absent count) | Admin, HR, Manager |

---

### **4. Leave Module**

*New capabilities: Approval Workflow, Balance Tracking, Calendar*

| Method | Endpoint | Description | Access Level |
| --- | --- | --- | --- |
| `POST` | `/api/leaves` | Apply for leave | All |
| `GET` | `/api/leaves/me` | Get my leave history | All |
| `GET` | `/api/leaves/balance` | Get my current leave balance | All |
| `GET` | `/api/leaves/pending` | Get requests waiting for my approval | Manager, HR |
| `PUT` | `/api/leaves/:id/approve` | Approve/Reject leave request | Manager, HR |
| `PUT` | `/api/leaves/:id/cancel` | Cancel/Withdraw my own leave | All |
| `GET` | `/api/leaves/calendar` | Get team leave calendar (Who is off?) | All |

---

### **5. Project Module**

*New capabilities: Resource Allocation, Milestones, Billing*

| Method | Endpoint | Description | Access Level |
| --- | --- | --- | --- |
| `POST` | `/api/projects` | Create a new project | Admin, Manager |
| `GET` | `/api/projects` | Get all projects | Admin, Manager, HR |
| `GET` | `/api/projects/my-projects` | Get projects assigned to me | Employee |
| `GET` | `/api/projects/:id` | Get project details & progress | Assigned Members |
| `PUT` | `/api/projects/:id` | Update project details | Admin, Manager |
| `POST` | `/api/projects/:id/members` | Assign employee to project | Admin, Manager |
| `DELETE` | `/api/projects/:id/members` | Remove employee from project | Admin, Manager |
| `POST` | `/api/projects/:id/milestones` | Add a new milestone | Admin, Manager |
| `PUT` | `/api/projects/:id/milestones` | Update milestone status | Admin, Manager |

---

### **6. Asset Module**

*New capabilities: Lifecycle Management, Assignment History*

| Method | Endpoint | Description | Access Level |
| --- | --- | --- | --- |
| `POST` | `/api/assets` | Add new asset to inventory | Admin, IT |
| `GET` | `/api/assets` | List all assets (Filter by status) | Admin, IT, HR |
| `GET` | `/api/assets/me` | View assets assigned to me | All |
| `POST` | `/api/assets/:id/assign` | Assign asset to employee | Admin, IT |
| `POST` | `/api/assets/:id/return` | Return asset to inventory | Admin, IT |
| `POST` | `/api/assets/:id/maintenance` | Log maintenance/repair | Admin, IT |

---

### **7. Performance Module**

*New capabilities: KPI Scoring, 360 Feedback*

| Method | Endpoint | Description | Access Level |
| --- | --- | --- | --- |
| `POST` | `/api/reviews` | Initiate a review cycle | Admin, HR |
| `GET` | `/api/reviews/me` | Get my reviews | All |
| `GET` | `/api/reviews/team` | Get team reviews | Manager |
| `PUT` | `/api/reviews/:id/self` | Submit self-assessment | Employee |
| `PUT` | `/api/reviews/:id/manager` | Submit manager assessment | Manager |
| `GET` | `/api/reviews/:id/report` | Get final review report | Admin, HR, Manager |

---

### **8. Department Module**

*New capabilities: Department Hierarchy*

| Method | Endpoint | Description | Access Level |
| --- | --- | --- | --- |
| `POST` | `/api/departments` | Create department | Admin, HR |
| `GET` | `/api/departments` | List all departments | All |
| `PUT` | `/api/departments/:id` | Update department details | Admin, HR |

---

### **9. Notification Module**

*New capabilities: Read/Unread status*

| Method | Endpoint | Description | Access Level |
| --- | --- | --- | --- |
| `GET` | `/api/notifications` | Get my notifications | All |
| `PUT` | `/api/notifications/read` | Mark all as read | All |

---

### **Summary of Workload**

* **Total Endpoints:** ~65-70 Endpoints
* **Complex Logic Areas:**
* **Attendance:** Calculating net hours with breaks and geo-fencing validation.
* **Leaves:** Handling approval chains (Employee -> Manager -> HR).
* **Projects:** Tracking budget burn and milestone progress.

Based on your **v2 schemas** (especially `company_v2.js` and `project_v2.js`), the previous list missed several **"X-Factor" endpoints** that are critical for an enterprise-grade system.

These missing endpoints handle **Automation**, **Configuration**, **Financials**, and **Analytics**—the features that separate a basic CRUD app from a commercial SaaS product.

Here are the **4 Additional Modules** and specific endpoints you need to add:

### **10. Company Settings & SaaS Configuration (Admin Module)**

*Why:* Your `company_v2.js` schema has a complex `settings` object (geo-fencing radius, IP restrictions, payroll rules) and `subscriptionStatus`. You need endpoints to manage these.

| Method | Endpoint | Description | Access Level |
| --- | --- | --- | --- |
| `GET` | `/api/company/settings` | Fetch company rules (Attendance, Leave policies) | Admin, HR |
| `PUT` | `/api/company/settings` | Update rules (e.g., toggle Geo-fencing, set Pay Day) | Admin |
| `GET` | `/api/company/billing` | View SaaS subscription & invoice history | Admin |
| `PUT` | `/api/company/billing/upgrade` | Upgrade subscription plan | Admin |
| `GET` | `/api/company/audit-logs` | View system-wide audit trail (Who changed what?) | Admin |

### **11. Payroll & Financial Module (The "Real" X-Factor)**

*Why:* You have salary data in `Employee` and attendance data in `Attendance`. The system must calculate paychecks automatically to be useful.

| Method | Endpoint | Description | Access Level |
| --- | --- | --- | --- |
| `POST` | `/api/payroll/generate` | Trigger payroll calculation for a month | Admin, HR |
| `GET` | `/api/payroll/slips` | List generated payslips (Filter by month) | Admin, HR |
| `GET` | `/api/payroll/slips/me` | Employee views their own payslips | Employee |
| `GET` | `/api/payroll/slips/:id/pdf` | Download payslip as PDF | All |
| `GET` | `/api/payroll/summary` | Financial overview (Total payout, Tax liabilities) | Admin |

### **12. Shift & Roster Management**

*Why:* `attendance_v2.js` supports shifts, but you need a way to **assign** them before people can clock in.

| Method | Endpoint | Description | Access Level |
| --- | --- | --- | --- |
| `GET` | `/api/shifts` | List available shift templates (Morning, Night) | Admin, HR |
| `POST` | `/api/shifts/assign` | Assign shift to employee/team for a date range | Manager, HR |
| `GET` | `/api/shifts/roster` | View team schedule (Calendar view data) | All |
| `PUT` | `/api/shifts/swap` | Request shift swap with colleague | Employee |

### **13. Advanced Project Management (Risks & Files)**

*Why:* Your `project_v2.js` schema includes `risks` and `documents`. These need dedicated management endpoints.

| Method | Endpoint | Description | Access Level |
| --- | --- | --- | --- |
| `POST` | `/api/projects/:id/risks` | Log a new project risk | Manager, Admin |
| `PUT` | `/api/projects/:id/risks/:riskId` | Update risk status (Mitigate/Close) | Manager, Admin |
| `POST` | `/api/projects/:id/files` | Upload project spec/contract | Manager, Admin |
| `GET` | `/api/projects/dashboard` | Portfolio Health (Budget burn, Risk heatmap) | Admin, Manager |

### **14. Global Dashboard & Analytics**

*Why:* C-Level executives don't look at individual records; they need aggregated insights.

| Method | Endpoint | Description | Access Level |
| --- | --- | --- | --- |
| `GET` | `/api/dashboard/admin` | Headcount, Attrition, Total Payroll Cost | Admin |
| `GET` | `/api/dashboard/hr` | Leave trends, Hiring pipeline, Compliance status | HR |
| `GET` | `/api/dashboard/manager` | Team attendance, Project deadlines, Budget usage | Manager |
| `GET` | `/api/search` | **Global Search** (Employees, Projects, Assets, Files) | All |

### **15. System Utilities**

*Why:* These are required for the frontend to function smoothly.

| Method | Endpoint | Description | Access Level |
| --- | --- | --- | --- |
| `POST` | `/api/upload` | Generic S3/Cloudinary upload (returns URL) | All |
| `GET` | `/api/holidays` | List public holidays (for calendar UI) | All |
| `POST` | `/api/holidays` | Add/Import public holidays | Admin, HR |
| `POST` | `/api/notifications/device` | Register mobile device token (FCM) for push auth | All |

### **Summary of "X-Factor" Additions**

Adding these ~25 endpoints transforms the system from a "Database Interface" into a **Productivity Suite**.

* **Payroll** makes it sticky (hard to switch away from).
* **Rosters** make it usable for operations.
* **Global Search** improves UX significantly.
* **Audit Logs** make it enterprise-compliant.