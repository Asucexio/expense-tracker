const express = require('express');
const authMiddleware = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  changePassword,
  getSummary,
} = require('../controllers/userController');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Routes
router.get('/me', getProfile);
router.get('/summary/dashboard', getSummary);
router.put('/profile', updateProfile);
router.post('/password/change', changePassword);

module.exports = router;