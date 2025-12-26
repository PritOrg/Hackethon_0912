// auth.middleware.js

const jwt = require('jsonwebtoken');
const config = require('../config/environment');

module.exports = (req, res, next) => {
    // Extract the token from the request headers or cookies
    const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;

    console.log('🔐 Auth Middleware - Token:', token ? 'Present' : 'Missing');
    console.log('🔐 Auth Middleware - Headers:', req.headers.authorization);

    if (!token) {
        console.error('❌ No token provided');
        return res.status(401).json({ message: 'Unauthorized - No token provided' });
    }

    try {
        // Verify the token and attach user details to the request
        // Use config.jwt.secret (not config.security.jwtSecret)
        const decodedToken = jwt.verify(token, config.jwt.secret);
        
        console.log('✅ Token decoded successfully:', decodedToken);
        
        // Extract user information from token (matching token generation structure)
        req.user = { 
            id: decodedToken.id,           // Token uses 'id', not 'userId'
            email: decodedToken.email,
            role: decodedToken.role,       // Extract role for access control
            companyId: decodedToken.companyId
        };
        
        console.log('✅ User authenticated:', req.user);
        next();
    } catch (error) {
        console.error('❌ Token verification failed:', error.message);
        res.status(401).json({ 
            message: 'Unauthorized - Invalid or expired token',
            error: error.message 
        });
    }
};
