# Quick Reference & Checklist
## Development Standards & Common Tasks

---

## Development Environment Setup

### First Time Setup
```bash
# Clone and install backend
cd node-api
npm install
cp .env.example .env
# Edit .env with your values

# Install and run
npm run dev

# In another terminal - setup frontend
cd pro
npm install
npm start

# Frontend runs at: http://localhost:4200
# Backend runs at: http://localhost:1969
# API docs: http://localhost:1969/api-docs
```

### MongoDB Connection
```javascript
// Use MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
```

### Environment Variables Checklist
- [ ] MONGODB_URI set
- [ ] JWT_SECRET set (min 32 chars)
- [ ] PORT configured
- [ ] CORS_ORIGIN set
- [ ] NODE_ENV set correctly

---

## Code Quality Checklist

### Before Committing Code

#### Backend
```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests
npm run test

# Check test coverage
npm run test:coverage
```

#### Frontend
```bash
# Run linting
ng lint

# Run tests
ng test

# Check coverage
ng test --code-coverage
```

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/feature-name

# Make changes
git add .
git commit -m "type(scope): description"

# Commit types: feat, fix, refactor, docs, test, chore, style
# Examples:
# feat(auth): implement JWT refresh token
# fix(employee): correct pagination calculation
# docs(api): update endpoint documentation

# Push and create PR
git push origin feature/feature-name
```

---

## API Development Checklist

### When Creating New Endpoint

- [ ] Define request schema with Joi validation
- [ ] Add controller function with proper error handling
- [ ] Create service layer for business logic
- [ ] Add response with standard format
- [ ] Update Swagger documentation
- [ ] Add unit tests (minimum 2 test cases)
- [ ] Test with Postman/curl
- [ ] Handle edge cases
- [ ] Add logging
- [ ] Verify CORS if applicable
- [ ] Check database indexes
- [ ] Verify authentication requirement
- [ ] Review error messages (no sensitive data)

### Standard Controller Template
```javascript
router.post('/', validateSchema, async (req, res, next) => {
  try {
    // Validate
    const { field } = req.body;
    
    // Process
    const result = await Service.create(field);
    
    // Respond
    res.status(201).json({
      status: 'success',
      data: result,
      message: 'Created successfully'
    });
  } catch (error) {
    next(error);
  }
});
```

---

## Frontend Development Checklist

### When Creating New Component

- [ ] Generate with Angular CLI
- [ ] Implement proper TypeScript interfaces
- [ ] Use reactive forms
- [ ] Add loading state
- [ ] Add error handling
- [ ] Implement OnDestroy with cleanup
- [ ] Add unit tests
- [ ] Use async pipe in template
- [ ] Add ARIA labels for accessibility
- [ ] Test responsive design
- [ ] Add loading spinner/skeleton
- [ ] Add form validation messages

### Component Template
```typescript
@Component({
  selector: 'app-feature',
  templateUrl: './feature.component.html',
  styleUrls: ['./feature.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeatureComponent implements OnInit, OnDestroy {
  data$ = this.service.data$;
  loading$ = this.service.loading$;
  error$ = this.service.error$;
  
  form!: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(private service: Service, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  private initForm(): void {
    this.form = this.fb.group({
      field: ['', Validators.required]
    });
  }

  private loadData(): void {
    this.service.getData()
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

---

## Database Maintenance

### Common Tasks

```bash
# Backup database
mongodump --uri="mongodb+srv://..." --out=./backup

# Restore database
mongorestore --uri="mongodb+srv://..." ./backup

# Check indexes
db.collection.getIndexes()

# Create index
db.collection.createIndex({ field: 1 })

# Drop index
db.collection.dropIndex("field_1")

# Check database stats
db.stats()

# Check collection stats
db.collection.stats()
```

### Performance Optimization
```javascript
// Add indexes for frequently queried fields
employeeSchema.index({ email: 1 });
employeeSchema.index({ companyId: 1, department: 1 });
employeeSchema.index({ firstName: 'text', lastName: 'text' });

// Analyze slow queries
db.setProfilingLevel(1, { slowms: 100 })
db.system.profile.find().pretty()
```

---

## Testing Patterns

### Backend Test Structure
```javascript
describe('Feature Name', () => {
  let variable;

  beforeEach(async () => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  describe('Specific Function', () => {
    it('should do X when Y', async () => {
      // Arrange
      const input = {};

      // Act
      const result = await service.method(input);

      // Assert
      expect(result).toBe(expected);
    });

    it('should handle error when Z', async () => {
      expect(() => {
        service.method(invalid);
      }).toThrow();
    });
  });
});
```

### Frontend Test Structure
```typescript
describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MyComponent],
      providers: [MockService]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display data when loaded', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.title')).toContainText('Expected Text');
  });
});
```

---

## Debugging Tips

### Backend Debugging

```javascript
// Add logging
console.log('Debug point:', variableName);

// Use VS Code debugger
// Add breakpoints and press F5 in VS Code

// Check environment
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Config:', require('./config/environment'));

// MongoDB debugging
db.collection('employees').find({}).pretty()
```

### Frontend Debugging

```typescript
// Angular DevTools browser extension
// Open Chrome DevTools: F12

// Add logging
console.log('Component state:', this.myVariable);

// Use debugger
debugger; // Pauses execution

// Check RxJS subscriptions
// Open Angular DevTools -> Profiler -> Dependencies

// Network tab to check API calls
// Network tab -> XHR -> Click request -> Preview/Response
```

---

## Common Issues & Solutions

### Backend Issues

**MongoDB Connection Failed**
```
Issue: Cannot connect to MongoDB
Solution: 
1. Check MONGODB_URI in .env
2. Verify credentials
3. Check IP whitelist in MongoDB Atlas
4. Ensure mongod is running locally
```

**Port Already in Use**
```
Issue: EADDRINUSE: address already in use :::1969
Solution:
1. Change PORT in .env
2. Kill process: lsof -i :1969 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

**JWT Authentication Failures**
```
Issue: Token invalid or expired
Solution:
1. Check JWT_SECRET is set
2. Verify token format (Bearer token)
3. Check token expiration
4. Check Authorization header
```

### Frontend Issues

**Module Not Found**
```
Issue: Cannot find module '@angular/...'
Solution:
1. npm install
2. Clear node_modules: rm -rf node_modules && npm install
3. Clear Angular cache: ng cache clean
```

**CORS Error**
```
Issue: Access to XMLHttpRequest blocked by CORS policy
Solution:
1. Check CORS_ORIGIN in backend .env
2. Verify frontend URL matches origin
3. Check request headers
4. Restart backend server
```

**RxJS Subscription Leaks**
```
Issue: Memory leaks, multiple subscriptions
Solution:
1. Use takeUntil(destroy$) pattern
2. Use async pipe in templates
3. Check OnDestroy cleanup
```

---

## Performance Metrics Targets

| Metric | Current | Target | How to Improve |
|--------|---------|--------|-----------------|
| API Response Time | ~500ms | <200ms | Add caching, optimize queries, indexes |
| Frontend Load | ~3s | <1s | Lazy load, tree-shake, compress |
| Bundle Size | ? | <500KB | Tree-shake, remove unused code |
| Test Coverage | 0% | >80% | Write more tests |
| Lighthouse Score | N/A | >90 | Image optimization, lazy load, caching |

---

## Security Checklist

### Before Deployment

- [ ] No credentials in code
- [ ] Environment variables configured
- [ ] JWT secrets strong (32+ chars)
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Input validation on all endpoints
- [ ] XSS protection enabled
- [ ] Rate limiting configured
- [ ] Error messages safe (no sensitive data)
- [ ] Dependencies updated (npm audit)
- [ ] No console.log of sensitive data
- [ ] Database backups scheduled
- [ ] Monitoring configured
- [ ] Logs rotation enabled

---

## Deployment Checklist

### Production Deployment

```bash
# Backend
export NODE_ENV=production
export MONGODB_URI=production-mongodb-uri
export JWT_SECRET=your-production-secret
npm install --production
npm start

# Frontend
ng build --configuration production
# Deploy dist/pro to web server

# Docker
docker build -t ems-backend .
docker run -d -p 1969:1969 --env-file .env ems-backend
```

### Health Check After Deployment

```bash
# Check backend
curl http://localhost:1969/health

# Check database connection
curl http://localhost:1969/api/employees

# Check frontend
Open http://localhost:4200 in browser
Test login
Test key features
```

---

## Quick Command Reference

### Backend Commands
```bash
npm run dev              # Development mode
npm start               # Production mode
npm run lint            # Check code style
npm run lint:fix        # Auto-fix style issues
npm test                # Run tests
npm run test:coverage   # Test coverage report
```

### Frontend Commands
```bash
ng serve                        # Development server
ng build                        # Production build
ng test                         # Run tests
ng lint                         # Lint code
ng generate component name      # Create component
ng generate service name        # Create service
ng generate module name         # Create module
```

### MongoDB Commands
```bash
mongosh                         # Connect to local MongoDB
show dbs                        # List databases
use My_Ems                      # Select database
show collections                # List collections
db.collection.find().pretty()   # View documents
db.collection.count()           # Count documents
```

### Git Commands
```bash
git status                      # Check status
git add .                       # Stage all changes
git commit -m "message"         # Commit
git push origin branch          # Push to remote
git pull origin branch          # Pull from remote
git branch -a                   # List all branches
git checkout -b feature/name    # Create new branch
```

---

## Useful Links

### Documentation
- [Express.js Docs](https://expressjs.com/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [Angular Docs](https://angular.io/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [RxJS Docs](https://rxjs.dev/)

### Tools & Services
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Postman](https://www.postman.com/)
- [GitHub](https://github.com/)
- [VS Code](https://code.visualstudio.com/)
- [Angular DevTools](https://angular.io/guide/devtools)

### Learning Resources
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Angular Style Guide](https://angular.io/guide/styleguide)
- [REST API Best Practices](https://restfulapi.net/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

## Getting Help

### Debug Steps
1. Check error message carefully
2. Google the error
3. Check relevant documentation
4. Review similar working code
5. Add console logs
6. Use debugger
7. Ask team lead/mentor

### Reporting Issues
```
When reporting a bug, include:
1. Exact error message
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Environment (OS, Node version, etc.)
6. Logs/screenshots
7. Code sample if applicable
```

---

**Document Version:** 1.0  
**Last Updated:** December 24, 2025  
**Status:** Production Ready
