const express = require('express');
const authMiddleware = require('../middleware/auth');
const {
  createExpense,
  getExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
  getStats,
} = require('../controllers/expenseController');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Statistics route
router.get('/stats/summary', getStats);

// CRUD routes
router.post('/', createExpense);
router.get('/', getExpenses);
router.get('/:id', getExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;