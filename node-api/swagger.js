const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Enterprise HRMS API',
    description: 'Comprehensive API for Human Resource Management System with attendance, leave, assets, and performance reviews',
    version: '2.0.0'
  },
  host: 'localhost:1969',
  schemes: ['http'],
  tags: [
    { name: 'Authentication', description: 'Authentication and authorization endpoints' },
    { name: 'Employees', description: 'Employee management' },
    { name: 'Attendance', description: 'Attendance tracking with geo-fencing' },
    { name: 'Leave Requests', description: 'Leave management and approval workflow' },
    { name: 'Company', description: 'Company settings and SaaS configuration' },
    { name: 'Department', description: 'Department hierarchy management' },
    { name: 'Holiday', description: 'Holiday calendar management' },
    { name: 'Notification', description: 'User notifications' },
    { name: 'Assets', description: 'Asset lifecycle management' },
    { name: 'Performance Reviews', description: 'Performance appraisals and KPIs' }
  ],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'Authorization',
      description: 'Bearer token for authentication'
    }
  }
};

const outputFile = './swagger-output.json';
const routes = [
  './routes/employeeRoutes.js',
  './routes/attendaceRoutes.js',
  './routes/leaveRequestsRoutes.js',
  './routes/companyRoutes.js',
  './routes/departmentRoutes.js',
  './routes/holidayRoutes.js',
  './routes/notificationRoutes.js',
  './routes/assetRoutes.js',
  './routes/performanceReviewRoutes.js'
];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen(outputFile, routes, doc);