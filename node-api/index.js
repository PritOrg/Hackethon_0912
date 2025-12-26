const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerDoc = require('./swagger-output.json');
const config = require('./config/environment');
const { apiLimiter } = require('./middleware/rateLimiter');
const sanitizeData = require('./middleware/sanitize');
const { developmentLogger } = require('./middleware/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

mongoose.connect(config.database.uri).then(() => {
  console.log('Connection to mongoose successfully.');
  console.log(`Database: ${config.database.name}`);
  
  const app = express();

  // Security Middleware
  app.use(helmet()); // Security headers
  app.use(sanitizeData()); // Sanitize data to prevent MongoDB injection
  
  // Logging
  if (config.server.nodeEnv === 'development') {
    app.use(developmentLogger);
  }
  
  // CORS Configuration
  const corsOptions = {
    origin: config.cors.origin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: config.cors.credentials,
    optionsSuccessStatus: 204,
  };
  
  app.use(cors(corsOptions));
  app.use(express.json({ limit: '10mb' })); // Parse JSON in the request body with size limit
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // Apply rate limiting to all API routes
  app.use('/api/', apiLimiter);
  
  const authRoutes = require('./routes/authRoutes');
  const companyRoutes = require('./routes/companyRoutes');
  const companySettingsRoutes = require('./routes/companySettingsRoutes');
  const employeeRoutes = require('./routes/employeeRoutes');
  const leaveRequestRoutes = require('./routes/leaveRequestsRoutes');
  const holidayRoutes = require('./routes/holidayRoutes');
  const notificationRoutes = require('./routes/notificationRoutes');
  const attendanceRoutes = require('./routes/attendaceRoutes');
  const departmentRoutes = require('./routes/departmentRoutes');
  const assetRoutes = require('./routes/assetRoutes');
  const performanceReviewRoutes = require('./routes/performanceReviewRoutes');
  const projectRoutes = require('./routes/projectRoutes');
  const shiftRoutes = require('./routes/shiftRoutes');
  const dashboardRoutes = require('./routes/dashboardRoutes');
  
  // API Documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'success',
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      environment: config.server.nodeEnv,
    });
  });
  
  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/leave-requests', leaveRequestRoutes);
  app.use('/api/company', companyRoutes);
  app.use('/api/company', companySettingsRoutes);
  app.use('/api/holiday', holidayRoutes);
  app.use('/api/notification', notificationRoutes);
  app.use('/api/employee', employeeRoutes);
  app.use('/api/attendance', attendanceRoutes);
  app.use('/api/department', departmentRoutes);
  app.use('/api/asset', assetRoutes);
  app.use('/api/performance-review', performanceReviewRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/shifts', shiftRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  
  // 404 Handler - must be after all routes
  app.use(notFoundHandler);
  
  // Global Error Handler - must be last
  app.use(errorHandler);
  
  const PORT = config.server.port;
  app.listen(PORT, () => {
    console.log(`✓ API running on http://${config.server.host}:${PORT}/`);
    console.log(`✓ Environment: ${config.server.nodeEnv}`);
    console.log(`✓ Swagger Docs: http://${config.server.host}:${PORT}/api-docs`);
    console.log(`✓ Health Check: http://${config.server.host}:${PORT}/health`);
  });
}).catch((err) => {
  console.error('Failed to connect to MongoDB:', err.message);
  process.exit(1);
});

