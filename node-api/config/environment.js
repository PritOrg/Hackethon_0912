require('dotenv').config();

module.exports = {
  database: {
    uri: process.env.MONGODB_URI,
    name: process.env.DB_NAME,
  },
  server: {
    port: process.env.PORT || 1969,
    nodeEnv: process.env.NODE_ENV || 'development',
    host: process.env.HOST || 'localhost',
  },
  security: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiry: process.env.JWT_EXPIRY || '24h',
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10,
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },
  file: {
    maxSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880,
    uploadPath: process.env.UPLOAD_PATH || './uploads',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    dir: process.env.LOG_DIR || './logs',
  },
};
