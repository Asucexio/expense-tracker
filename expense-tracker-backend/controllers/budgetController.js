const Joi = require('joi');
const pool = require('../config/database');

const budgetSchema = Joi.object({
  categoryId: Joi.string().uuid().required(),
  monthlyLimit: Joi.number().positive().precision(2).required(),
  alertThreshold: Joi.number().positive().max(100).default(80),
  monthYear: Joi.date().iso().required(),
  isActive: Joi.boolean().default(true),
});

const getBudgets = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.id, b.monthly_limit, b.alert_threshold, b.month_year, b.is_active,
              b.created_at, c.id AS category_id, c.name AS category_name,
              c.icon AS category_icon, c.color AS category_color,
              COALESCE(SUM(e.amount), 0) AS spent
       FROM budgets b
       JOIN expense_categories c ON c.id = b.category_id
       LEFT JOIN expenses e ON e.category_id = b.category_id
        AND e.user_id = b.user_id
        AND DATE_TRUNC('month', e.date) = DATE_TRUNC('month', b.month_year)
       WHERE b.user_id = $1
       GROUP BY b.id, c.id
       ORDER BY b.month_year DESC, c.name ASC`,
      [req.userId]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching budgets' });
  }
};

const createBudget = async (req, res) => {
  try {
    const { error, value } = budgetSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const result = await pool.query(
      `INSERT INTO budgets (user_id, category_id, monthly_limit, alert_threshold, month_year, is_active)
       VALUES ($1, $2, $3, $4, DATE_TRUNC('month', $5::date), $6)
       RETURNING id, category_id, monthly_limit, alert_threshold, month_year, is_active, created_at`,
      [
        req.userId,
        value.categoryId,
        value.monthlyLimit,
        value.alertThreshold,
        value.monthYear,
        value.isActive,
      ]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: 'Budget already exists for this month' });
    }
    if (error.code === '23503') {
      return res.status(400).json({ success: false, message: 'Invalid category' });
    }
    console.error('Create budget error:', error);
    res.status(500).json({ success: false, message: 'Server error creating budget' });
  }
};

const updateBudget = async (req, res) => {
  try {
    const { error, value } = budgetSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const result = await pool.query(
      `UPDATE budgets
       SET category_id = $1,
           monthly_limit = $2,
           alert_threshold = $3,
           month_year = DATE_TRUNC('month', $4::date),
           is_active = $5
       WHERE id = $6 AND user_id = $7
       RETURNING id, category_id, monthly_limit, alert_threshold, month_year, is_active, created_at`,
      [
        value.categoryId,
        value.monthlyLimit,
        value.alertThreshold,
        value.monthYear,
        value.isActive,
        req.params.id,
        req.userId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: 'Budget already exists for this month' });
    }
    if (error.code === '23503') {
      return res.status(400).json({ success: false, message: 'Invalid category' });
    }
    console.error('Update budget error:', error);
    res.status(500).json({ success: false, message: 'Server error updating budget' });
  }
};

const deleteBudget = async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM budgets WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    res.json({ success: true, message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting budget' });
  }
};

module.exports = {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
};
