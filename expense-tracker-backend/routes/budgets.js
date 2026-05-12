const express = require('express');
const authMiddleware = require('../middleware/auth');
const {
  setBudget,
  getBudgets,
  getBudgetStatus,
  deleteBudget,
} = require('../controllers/budgetController');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Routes
router.post('/', setBudget);
router.get('/', getBudgets);
router.get('/:categoryId/status', getBudgetStatus);
router.delete('/:id', deleteBudget);

module.exports = router;