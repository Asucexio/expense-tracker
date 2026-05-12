const pool = require('../config/database');
const Joi = require('joi');

const budgetSchema = Joi.object({
  categoryId: Joi.string().uuid().required(),
  monthlyLimit: Joi.number().positive().required(),
  alertThreshold: Joi.number().min(1).max(100).default(80),
});

// Set budget
const setBudget = async (req, res) => {
  try {
    const { error, value } = budgetSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const userId = req.userId;
    const { categoryId, monthlyLimit, alertThreshold } = value;

    // Get current month
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const monthYear = `${year}-${month}-01`;

    // Verify category belongs to user
    const categoryCheck = await pool.query(
      'SELECT id FROM expense_categories WHERE id = $1 AND user_id = $2',
      [categoryId, userId]
    );

    if (categoryCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    const result = await pool.query(
      `INSERT INTO budgets (user_id, category_id, monthly_limit, alert_threshold, month_year)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, category_id, month_year)
       DO UPDATE SET monthly_limit = $3, alert_threshold = $4
       RETURNING *`,
      [userId, categoryId, monthlyLimit, alertThreshold, monthYear]
    );

    const budget = result.rows[0];

    // Get category details
    const categoryResult = await pool.query(
      'SELECT name, icon FROM expense_categories WHERE id = $1',
      [categoryId]
    );

    const category = categoryResult.rows[0];

    // Calculate current month spending
    const spendingResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as spent
       FROM expenses 
       WHERE user_id = $1 AND category_id = $2 
         AND DATE_TRUNC('month', date) = DATE_TRUNC('month', $3::date)`,
      [userId, categoryId, monthYear]
    );

    const spent = parseFloat(spendingResult.rows[0].spent) || 0;
    const monthlyLimitNum = parseFloat(budget.monthly_limit);
    const percentageUsed = (spent / monthlyLimitNum * 100).toFixed(1);

    res.status(201).json({
      success: true,
      message: 'Budget set successfully',
      data: {
        id: budget.id,
        categoryId: budget.category_id,
        categoryName: category.name,
        categoryIcon: category.icon,
        monthlyLimit: monthlyLimitNum,
        spent,
        remaining: Math.max(0, monthlyLimitNum - spent),
        percentageUsed: parseFloat(percentageUsed),
        isOverBudget: spent > monthlyLimitNum,
        alertThreshold: parseFloat(budget.alert_threshold),
        alertTriggered: percentageUsed >= budget.alert_threshold,
        monthYear: budget.month_year,
        isActive: budget.is_active,
      },
    });
  } catch (error) {
    console.error('Set budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error setting budget',
    });
  }
};

// Get all budgets
const getBudgets = async (req, res) => {
  try {
    const userId = req.userId;
    const { month, year } = req.query;

    let query = `
      SELECT 
        b.*,
        ec.name as category_name,
        ec.icon,
        ec.color,
        COALESCE(SUM(e.amount), 0) as spent
      FROM budgets b
      JOIN expense_categories ec ON b.category_id = ec.id
      LEFT JOIN expenses e ON b.category_id = e.category_id 
        AND e.user_id = $1 
        AND DATE_TRUNC('month', e.date) = DATE_TRUNC('month', b.month_year::date)
      WHERE b.user_id = $1 AND b.is_active = true
    `;

    const params = [userId];

    if (month && year) {
      const monthYear = new Date(parseInt(year), parseInt(month) - 1, 1)
        .toISOString()
        .split('T')[0];
      query += ` AND DATE_TRUNC('month', b.month_year::date) = DATE_TRUNC('month', $2::date)`;
      params.push(monthYear);
    } else {
      query += ` AND DATE_TRUNC('month', b.month_year::date) = DATE_TRUNC('month', CURRENT_DATE)`;
    }

    query += ` GROUP BY b.id, ec.id ORDER BY b.created_at DESC`;

    const result = await pool.query(query, params);

    const budgets = result.rows.map(budget => {
      const monthlyLimit = parseFloat(budget.monthly_limit);
      const spent = parseFloat(budget.spent);
      const percentageUsed = (spent / monthlyLimit * 100).toFixed(1);

      return {
        id: budget.id,
        categoryId: budget.category_id,
        categoryName: budget.category_name,
        categoryIcon: budget.icon,
        categoryColor: budget.color,
        monthlyLimit,
        spent,
        remaining: Math.max(0, monthlyLimit - spent),
        percentageUsed: parseFloat(percentageUsed),
        isOverBudget: spent > monthlyLimit,
        alertThreshold: parseFloat(budget.alert_threshold),
        alertTriggered: percentageUsed >= budget.alert_threshold,
        monthYear: budget.month_year,
      };
    });

    res.json({
      success: true,
      data: budgets,
    });
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching budgets',
    });
  }
};

// Get budget status for specific category
const getBudgetStatus = async (req, res) => {
  try {
    const userId = req.userId;
    const { categoryId } = req.params;

    const result = await pool.query(
      `SELECT 
        b.*,
        ec.name as category_name,
        COALESCE(SUM(e.amount), 0) as spent
      FROM budgets b
      JOIN expense_categories ec ON b.category_id = ec.id
      LEFT JOIN expenses e ON b.category_id = e.category_id 
        AND e.user_id = $1 
        AND DATE_TRUNC('month', e.date) = DATE_TRUNC('month', b.month_year::date)
      WHERE b.user_id = $1 AND b.category_id = $2 AND b.is_active = true
        AND DATE_TRUNC('month', b.month_year::date) = DATE_TRUNC('month', CURRENT_DATE)
      GROUP BY b.id, ec.id`,
      [userId, categoryId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found',
      });
    }

    const budget = result.rows[0];
    const spent = parseFloat(budget.spent);
    const limit = parseFloat(budget.monthly_limit);
    const percentageUsed = (spent / limit * 100).toFixed(1);

    res.json({
      success: true,
      data: {
        id: budget.id,
        categoryName: budget.category_name,
        monthlyLimit: limit,
        spent,
        remaining: Math.max(0, limit - spent),
        percentageUsed: parseFloat(percentageUsed),
        isOverBudget: spent > limit,
        alertThreshold: parseFloat(budget.alert_threshold),
        alertTriggered: percentageUsed >= budget.alert_threshold,
      },
    });
  } catch (error) {
    console.error('Get budget status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching budget status',
    });
  }
};

// Delete budget
const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const result = await pool.query(
      'DELETE FROM budgets WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found',
      });
    }

    res.json({
      success: true,
      message: 'Budget deleted successfully',
    });
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting budget',
    });
  }
};

module.exports = {
  setBudget,
  getBudgets,
  getBudgetStatus,
  deleteBudget,
};