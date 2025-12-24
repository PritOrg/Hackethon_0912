const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const config = require('../config/environment');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', config.logging.dir);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create a write stream for access logs
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'),
  { flags: 'a' }
);

// Custom token for response time in milliseconds
morgan.token('response-time-ms', (req, res) => {
  const responseTime = res.getHeader('X-Response-Time');
  return responseTime ? `${responseTime}ms` : 'N/A';
});

// Development logger - detailed logs in console
const developmentLogger = morgan('dev');

// Production logger - write to file
const productionLogger = morgan(
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms',
  { stream: accessLogStream }
);

// Combined logger - both console and file
const combinedLogger = (req, res, next) => {
  developmentLogger(req, res, () => {});
  productionLogger(req, res, () => {});
  next();
};

module.exports = {
  developmentLogger,
  productionLogger,
  combinedLogger,
};
