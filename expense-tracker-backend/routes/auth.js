const express = require('express');
const {
    register,
    login,
    refreshToken,
    getCurrentUser,
    forgotPassword,
    resetPassword,
} = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', authMiddleware, getCurrentUser);

module.exports = router;