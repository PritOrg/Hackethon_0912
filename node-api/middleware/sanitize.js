const mongoSanitize = require('express-mongo-sanitize');

// Sanitize request data to prevent MongoDB injection
const sanitizeData = () => {
  return mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
      console.warn(`Request sanitized on key: ${key}`);
    },
  });
};

module.exports = sanitizeData;
