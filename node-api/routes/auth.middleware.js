// auth.middleware.js

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // Extract the token from the request headers or cookies
    const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        // Verify the token and attach user details to the request
        const decodedToken = jwt.verify(token, 'your-secret-key');
        req.user = { id: decodedToken.userId, email: decodedToken.email };
        next();
    } catch (error) {
        console.error('Error:', error);
        res.status(401).json({ message: 'Unauthorized' });
    }
};
