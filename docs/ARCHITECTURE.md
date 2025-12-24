# Architecture & Best Practices Guide
## Professional-Grade Implementation Standards

---

## Table of Contents
1. [Backend Architecture](#backend-architecture)
2. [Frontend Architecture](#frontend-architecture)
3. [Database Design](#database-design)
4. [API Design Standards](#api-design-standards)
5. [Code Quality Standards](#code-quality-standards)
6. [Security Best Practices](#security-best-practices)
7. [Performance Optimization](#performance-optimization)
8. [Testing Strategy](#testing-strategy)

---

## Backend Architecture

### Recommended Structure

```
node-api/
├── src/
│   ├── config/
│   │   ├── database.js       # Database configuration
│   │   ├── environment.js    # Environment variables
│   │   └── constants.js      # App constants
│   ├── controllers/          # Route handlers
│   ├── middleware/           # Express middleware
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API routes
│   ├── services/            # Business logic
│   ├── utils/               # Utility functions
│   ├── validators/          # Input validation
│   ├── tests/               # Test files
│   └── index.js             # Entry point
├── logs/                    # Application logs
├── uploads/                 # File uploads
├── .env.example             # Environment template
├── .eslintrc.json          # Linting rules
├── .prettierrc              # Code formatting
├── package.json
└── README.md
```

### Controller Pattern

```javascript
// controllers/employeeController.js
const Employee = require('../models/employee');
const { handleError } = require('../utils/errorHandler');

class EmployeeController {
  async getAllEmployees(req, res, next) {
    try {
      const { page = 1, limit = 10, search, department } = req.query;
      
      const query = {};
      if (search) query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
      if (department) query.department = department;

      const total = await Employee.countDocuments(query);
      const employees = await Employee
        .find(query)
        .select('-password') // Never return password
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      res.json({
        status: 'success',
        data: employees,
        meta: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeById(req, res, next) {
    try {
      const { id } = req.params;
      
      const employee = await Employee
        .findById(id)
        .select('-password')
        .populate('leaveRequests');

      if (!employee) {
        return res.status(404).json({
          status: 'error',
          code: 'NOT_FOUND',
          message: 'Employee not found'
        });
      }

      res.json({
        status: 'success',
        data: employee
      });
    } catch (error) {
      next(error);
    }
  }

  async createEmployee(req, res, next) {
    try {
      const { email } = req.body;

      // Check if employee exists
      const existingEmployee = await Employee.findOne({ email });
      if (existingEmployee) {
        return res.status(409).json({
          status: 'error',
          code: 'DUPLICATE_EMAIL',
          message: 'Employee with this email already exists'
        });
      }

      const employee = new Employee(req.body);
      await employee.save();

      res.status(201).json({
        status: 'success',
        data: employee,
        message: 'Employee created successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async updateEmployee(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Prevent password updates through this endpoint
      delete updates.password;

      const employee = await Employee.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
      ).select('-password');

      if (!employee) {
        return res.status(404).json({
          status: 'error',
          code: 'NOT_FOUND',
          message: 'Employee not found'
        });
      }

      res.json({
        status: 'success',
        data: employee,
        message: 'Employee updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteEmployee(req, res, next) {
    try {
      const { id } = req.params;

      const employee = await Employee.findByIdAndDelete(id);

      if (!employee) {
        return res.status(404).json({
          status: 'error',
          code: 'NOT_FOUND',
          message: 'Employee not found'
        });
      }

      res.json({
        status: 'success',
        message: 'Employee deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EmployeeController();
```

### Service Layer Pattern

```javascript
// services/employeeService.js
const Employee = require('../models/employee');
const { AppError } = require('../utils/errorHandler');

class EmployeeService {
  async getEmployeeWithLeaves(id) {
    const employee = await Employee.findById(id)
      .populate({
        path: 'leaveRequests',
        match: { status: 'Approved' }
      });

    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    return employee;
  }

  async calculateLeaveBalance(employeeId) {
    const employee = await Employee.findById(employeeId);
    const leaveRequests = await LeaveRequest.find({
      employeeId,
      status: 'Approved'
    });

    const leaveBalance = {
      annual: 20,
      sick: 10,
      casual: 12,
      maternity: employee.gender === 'Female' ? 120 : 0
    };

    leaveRequests.forEach(request => {
      const days = this.calculateBusinessDays(
        request.startDate,
        request.endDate
      );

      if (leaveBalance[request.leaveType]) {
        leaveBalance[request.leaveType] -= days;
      }
    });

    return leaveBalance;
  }

  calculateBusinessDays(startDate, endDate) {
    let count = 0;
    const current = new Date(startDate);

    while (current <= endDate) {
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (current.getDay() % 6 !== 0) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  }

  async validateLeaveRequest(employeeId, leaveData) {
    const employee = await Employee.findById(employeeId);
    const balance = await this.calculateLeaveBalance(employeeId);

    if (balance[leaveData.leaveType] < 1) {
      throw new AppError(
        `Insufficient ${leaveData.leaveType} balance`,
        400
      );
    }

    return true;
  }
}

module.exports = new EmployeeService();
```

---

## Frontend Architecture

### Recommended Structure

```
pro/src/
├── app/
│   ├── core/                 # Core services, guards, interceptors
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── services/
│   │   └── core.module.ts
│   ├── shared/               # Shared components, pipes, directives
│   │   ├── components/
│   │   ├── directives/
│   │   ├── pipes/
│   │   ├── models/
│   │   └── shared.module.ts
│   ├── features/             # Feature modules
│   │   ├── dashboard/
│   │   ├── employees/
│   │   ├── leave-management/
│   │   ├── attendance/
│   │   └── admin/
│   ├── app-routing.module.ts
│   ├── app.component.ts
│   └── app.module.ts
├── assets/
├── environments/
└── styles/
```

### Service Pattern with RxJS

```typescript
// services/employee.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  map,
  shareReplay,
  switchMap,
  tap
} from 'rxjs/operators';
import { environment } from '../../environments/environment';

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface ApiResponse<T> {
  status: string;
  data: T;
  meta?: PaginationMeta;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private readonly API_URL = `${environment.apiUrl}/api/employee`;
  private readonly cache$ = new Map<string, Observable<any>>();

  private loadingSubject$ = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject$.asObservable();

  private errorSubject$ = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject$.asObservable();

  private employeeListSubject$ = new BehaviorSubject<any[]>([]);
  public employeeList$ = this.employeeListSubject$.asObservable();

  constructor(private http: HttpClient) {}

  getEmployees(
    page = 1,
    limit = 10,
    search = '',
    department = ''
  ): Observable<ApiResponse<any[]>> {
    const cacheKey = `employees-${page}-${limit}-${search}-${department}`;

    if (this.cache$.has(cacheKey)) {
      return this.cache$.get(cacheKey)!;
    }

    this.loadingSubject$.next(true);
    this.errorSubject$.next(null);

    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) params = params.set('search', search);
    if (department) params = params.set('department', department);

    const request$ = this.http.get<ApiResponse<any[]>>(this.API_URL, {
      params
    }).pipe(
      tap(response => {
        this.employeeListSubject$.next(response.data);
        this.cacheList(10000); // Cache for 10 seconds
      }),
      finalize(() => this.loadingSubject$.next(false)),
      catchError(error => this.handleError(error)),
      shareReplay(1)
    );

    this.cache$.set(cacheKey, request$);
    
    // Clear cache after 5 minutes
    setTimeout(() => this.cache$.delete(cacheKey), 300000);

    return request$;
  }

  getEmployeeById(id: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.API_URL}/${id}`)
      .pipe(
        catchError(error => this.handleError(error))
      );
  }

  createEmployee(data: any): Observable<ApiResponse<any>> {
    this.loadingSubject$.next(true);

    return this.http.post<ApiResponse<any>>(this.API_URL, data)
      .pipe(
        tap(() => this.clearCache()),
        finalize(() => this.loadingSubject$.next(false)),
        catchError(error => this.handleError(error))
      );
  }

  updateEmployee(id: string, data: any): Observable<ApiResponse<any>> {
    this.loadingSubject$.next(true);

    return this.http.put<ApiResponse<any>>(`${this.API_URL}/${id}`, data)
      .pipe(
        tap(() => this.clearCache()),
        finalize(() => this.loadingSubject$.next(false)),
        catchError(error => this.handleError(error))
      );
  }

  deleteEmployee(id: string): Observable<ApiResponse<any>> {
    this.loadingSubject$.next(true);

    return this.http.delete<ApiResponse<any>>(`${this.API_URL}/${id}`)
      .pipe(
        tap(() => this.clearCache()),
        finalize(() => this.loadingSubject$.next(false)),
        catchError(error => this.handleError(error))
      );
  }

  private cacheList(duration: number) {
    setTimeout(() => this.clearCache(), duration);
  }

  private clearCache() {
    this.cache$.clear();
  }

  private handleError(error: any): Observable<never> {
    let message = 'An error occurred';

    if (error.error?.message) {
      message = error.error.message;
    } else if (error.status === 401) {
      message = 'Unauthorized. Please login again.';
    } else if (error.status === 404) {
      message = 'Resource not found.';
    } else if (error.status === 500) {
      message = 'Server error. Please try again later.';
    }

    this.errorSubject$.next(message);
    console.error('API Error:', error);

    return throwError(() => new Error(message));
  }
}
```

### Component Pattern

```typescript
// features/employees/employees-list/employees-list.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { EmployeeService } from '../../../core/services/employee.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-employees-list',
  templateUrl: './employees-list.component.html',
  styleUrls: ['./employees-list.component.scss']
})
export class EmployeesListComponent implements OnInit, OnDestroy {
  employees$ = this.employeeService.employeeList$;
  loading$ = this.employeeService.loading$;
  error$ = this.employeeService.error$;

  filterForm!: FormGroup;
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;

  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();

  constructor(
    private employeeService: EmployeeService,
    private fb: FormBuilder,
    private router: Router,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setupSearch();
    this.loadEmployees();
  }

  private initializeForm(): void {
    this.filterForm = this.fb.group({
      search: [''],
      department: ['']
    });
  }

  private setupSearch(): void {
    this.filterForm.get('search')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => {
        this.currentPage = 1;
        this.loadEmployees();
      });
  }

  loadEmployees(): void {
    const { search, department } = this.filterForm.value;

    this.employeeService.getEmployees(
      this.currentPage,
      this.pageSize,
      search,
      department
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        if (response.meta) {
          this.totalItems = response.meta.total;
        }
      },
      error: (error) => {
        this.notification.error('Failed to load employees');
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadEmployees();
  }

  onEdit(id: string): void {
    this.router.navigate(['/employees', id, 'edit']);
  }

  onDelete(id: string): void {
    if (confirm('Are you sure you want to delete this employee?')) {
      this.employeeService.deleteEmployee(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.notification.success('Employee deleted successfully');
            this.loadEmployees();
          },
          error: () => {
            this.notification.error('Failed to delete employee');
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

---

## Database Design

### Schema Best Practices

```javascript
// models/employee.js
const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  // Personal Info
  firstName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
  },
  password: {
    type: String,
    required: true,
    select: false // Don't return by default
  },
  phone: {
    type: String,
    required: true,
    match: /^\d{10}$/
  },
  dob: {
    type: Date,
    required: true
  },
  
  // Employment Info
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true // Frequently queried
  },
  department: {
    type: String,
    required: true,
    index: true // Frequently filtered
  },
  position: {
    type: String,
    required: true
  },
  joiningDate: {
    type: Date,
    required: true
  },
  role: {
    type: String,
    enum: ['employee', 'manager', 'admin'],
    default: 'employee'
  },
  
  // Leave Info
  leaveBalance: {
    annual: { type: Number, default: 20 },
    sick: { type: Number, default: 10 },
    casual: { type: Number, default: 12 },
    maternity: { type: Number, default: 0 }
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  indexes: [
    { companyId: 1, department: 1 }, // Compound index
    { email: 1 },
    { isActive: 1, createdAt: -1 }
  ]
});

// Indexes
employeeSchema.index({ firstName: 'text', lastName: 'text', email: 'text' });

// Virtuals
employeeSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save hooks
employeeSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    const bcrypt = require('bcrypt');
    this.password = await bcrypt.hash(this.password, 10);
  }
  this.updatedAt = new Date();
  next();
});

// Methods
employeeSchema.methods.comparePassword = async function(password) {
  const bcrypt = require('bcrypt');
  return bcrypt.compare(password, this.password);
};

// Statics
employeeSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

module.exports = mongoose.model('Employee', employeeSchema);
```

---

## API Design Standards

### Response Format Standard

```javascript
// Success Response
{
  "status": "success",
  "data": { /* response data */ },
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  },
  "message": "Operation completed successfully",
  "timestamp": "2025-12-24T10:30:00.000Z"
}

// Error Response
{
  "status": "error",
  "code": "VALIDATION_ERROR",
  "message": "One or more validation errors occurred",
  "details": [
    { "field": "email", "message": "Invalid email format" },
    { "field": "password", "message": "Minimum 8 characters required" }
  ],
  "timestamp": "2025-12-24T10:30:00.000Z"
}
```

### API Endpoints Specification

```
Employee Management API v1

Authentication:
POST   /api/auth/login              - Login
POST   /api/auth/logout             - Logout
POST   /api/auth/refresh-token      - Refresh JWT
POST   /api/auth/reset-password     - Reset password

Employee CRUD:
GET    /api/employees               - Get all (paginated, searchable)
GET    /api/employees/:id           - Get by ID
POST   /api/employees               - Create
PUT    /api/employees/:id           - Update
DELETE /api/employees/:id           - Delete
GET    /api/employees/:id/leaves    - Get employee leaves

Leave Management:
GET    /api/leaves                  - Get all leaves
POST   /api/leaves                  - Create leave request
PATCH  /api/leaves/:id              - Update leave status
GET    /api/leaves/:id/balance      - Get leave balance

Attendance:
GET    /api/attendance              - Get records
POST   /api/attendance/check-in     - Clock in
POST   /api/attendance/check-out    - Clock out

Admin:
GET    /api/admin/reports           - Get reports
GET    /api/admin/dashboard         - Dashboard data
POST   /api/admin/settings          - Update settings
```

---

## Code Quality Standards

### TypeScript Best Practices (Frontend)

```typescript
// ✓ Good
export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  joinDate: Date;
}

export type EmployeeRole = 'admin' | 'manager' | 'employee';

@Injectable()
export class EmployeeService {
  private readonly http = inject(HttpClient);
  
  getEmployee(id: string): Observable<Employee> {
    return this.http.get<Employee>(`/api/employees/${id}`);
  }
}

// ✗ Bad
export class EmployeeService {
  constructor(private http: HttpClient) {}
  
  getEmployee(id: any): any {
    return this.http.get(`/api/employees/${id}`);
  }
}
```

### JavaScript Best Practices (Backend)

```javascript
// ✓ Good - Clear, DRY, error handling
async function getEmployees(req, res, next) {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [employees, total] = await Promise.all([
      Employee.find().skip(skip).limit(limit),
      Employee.countDocuments()
    ]);

    res.json({
      status: 'success',
      data: employees,
      meta: { total, page, limit, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
}

// ✗ Bad - No error handling, repeated code
function getEmployees(req, res) {
  const employees = Employee.find();
  const total = Employee.countDocuments();
  res.send(employees);
}
```

---

## Security Best Practices

### OWASP Top 10 Compliance

| Risk | Implementation |
|------|-----------------|
| Injection | Use parameterized queries, input validation |
| Broken Auth | JWT + refresh tokens, secure session handling |
| Sensitive Data | Encrypt PII, HTTPS only, no logs of secrets |
| XML External | Disable XML parsing of untrusted data |
| Broken Access | RBAC, permission checks on all endpoints |
| Security Misconfiguration | Secure defaults, security headers (Helmet) |
| XSS | Input sanitization, CSP headers, output encoding |
| Insecure Deserialization | Validate & sanitize all input |
| Using Components with Known Vulnerabilities | Regular npm audit, keep dependencies updated |
| Insufficient Logging/Monitoring | Structured logging, error tracking, alerts |

---

## Performance Optimization

### Backend Optimization

```javascript
// Database Indexing
employeeSchema.index({ email: 1 });
employeeSchema.index({ companyId: 1, isActive: 1 });
employeeSchema.index({ firstName: 'text', lastName: 'text' });

// Query Optimization
// ✓ Good - Select only needed fields
Employee.find(query)
  .select('firstName lastName email department')
  .limit(limit)
  .skip(skip);

// Caching
const redis = require('redis');
const client = redis.createClient();

const getCachedEmployee = async (id) => {
  const cached = await client.get(`employee:${id}`);
  if (cached) return JSON.parse(cached);
  
  const employee = await Employee.findById(id);
  await client.setEx(`employee:${id}`, 3600, JSON.stringify(employee));
  return employee;
};

// Pagination Always
app.get('/api/employees', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);
  const page = Math.max(parseInt(req.query.page) || 1, 1);
});
```

### Frontend Optimization

```typescript
// OnPush Change Detection
@Component({
  selector: 'app-employee',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `{{ employee$ | async }}`
})
export class EmployeeComponent {
  @Input() employee$: Observable<Employee>;
}

// Unsubscribe Pattern
export class MyComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(private service: MyService) {
    this.service.data$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => console.log(data));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

// Lazy Loading Routes
const routes: Routes = [
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.module')
      .then(m => m.DashboardModule)
  }
];
```

---

## Testing Strategy

### Backend Testing Template

```javascript
// __tests__/employee.test.js
const request = require('supertest');
const app = require('../index');
const Employee = require('../models/employee');

describe('Employee API', () => {
  beforeEach(async () => {
    await Employee.deleteMany({});
  });

  describe('POST /api/employees', () => {
    it('should create a new employee', async () => {
      const res = await request(app)
        .post('/api/employees')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'Password123',
          phone: '1234567890',
          dob: '1990-01-01',
          department: 'IT',
          position: 'Developer',
          companyId: '123456789'
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.email).toBe('john@example.com');
    });

    it('should return error for duplicate email', async () => {
      await Employee.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'hashed',
        phone: '1234567890',
        dob: new Date('1990-01-01'),
        department: 'IT',
        position: 'Developer',
        companyId: '123456789'
      });

      const res = await request(app)
        .post('/api/employees')
        .send({
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'Password123',
          phone: '0987654321',
          dob: '1992-05-15',
          department: 'HR',
          position: 'Manager',
          companyId: '123456789'
        });

      expect(res.status).toBe(409);
      expect(res.body.code).toBe('DUPLICATE_EMAIL');
    });
  });
});
```

### Frontend Testing Template

```typescript
// employee.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EmployeeService } from './employee.service';

describe('EmployeeService', () => {
  let service: EmployeeService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EmployeeService]
    });
    service = TestBed.inject(EmployeeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch employees', () => {
    const mockEmployees = [
      { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' }
    ];

    service.getEmployees(1, 10).subscribe(response => {
      expect(response.data.length).toBe(1);
      expect(response.data[0].firstName).toBe('John');
    });

    const req = httpMock.expectOne(request =>
      request.url.includes('/api/employee')
    );
    expect(req.request.method).toBe('GET');
    req.flush({ status: 'success', data: mockEmployees });
  });
});
```

---

## Summary of Key Principles

1. **Security First** - Environment variables, input validation, rate limiting
2. **Scalability** - Pagination, caching, indexes, async/await
3. **Maintainability** - Clear structure, DRY code, proper documentation
4. **Performance** - Lazy loading, caching, query optimization
5. **Testing** - High coverage, unit & integration tests
6. **Error Handling** - Try-catch, proper error messages, logging
7. **User Experience** - Loading states, error messages, responsive design

---

**Document Status:** Complete  
**Version:** 1.0  
**Last Updated:** December 24, 2025
