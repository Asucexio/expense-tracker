const Joi = require('joi');
const pool = require('../config/database');

const expenseSchema = Joi.object({
  categoryId: Joi.string().uuid().required(),
  amount: Joi.number().positive().precision(2).required(),
  description: Joi.string().allow('', null),
  paymentMethod: Joi.string().max(50).allow('', null),
  date: Joi.date().iso().required(),
  receiptUrl: Joi.string().uri().allow('', null),
  tags: Joi.array().items(Joi.string().max(50)).default([]),
  notes: Joi.string().allow('', null),
});

const getExpenses = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.id, e.amount, e.description, e.payment_method, e.date, e.receipt_url,
              e.tags, e.notes, e.created_at, e.updated_at,
              c.id AS category_id, c.name AS category_name, c.icon AS category_icon,
              c.color AS category_color
       FROM expenses e
       JOIN expense_categories c ON c.id = e.category_id
       WHERE e.user_id = $1
       ORDER BY e.date DESC, e.created_at DESC`,
      [req.userId]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching expenses' });
  }
};

const getExpense = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.id, e.amount, e.description, e.payment_method, e.date, e.receipt_url,
              e.tags, e.notes, e.created_at, e.updated_at,
              c.id AS category_id, c.name AS category_name, c.icon AS category_icon,
              c.color AS category_color
       FROM expenses e
       JOIN expense_categories c ON c.id = e.category_id
       WHERE e.id = $1 AND e.user_id = $2`,
      [req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching expense' });
  }
};

const createExpense = async (req, res) => {
  try {
    const { error, value } = expenseSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const result = await pool.query(
      `INSERT INTO expenses
        (user_id, category_id, amount, description, payment_method, date, receipt_url, tags, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, category_id, amount, description, payment_method, date, receipt_url,
                 tags, notes, created_at, updated_at`,
      [
        req.userId,
        value.categoryId,
        value.amount,
        value.description || null,
        value.paymentMethod || null,
        value.date,
        value.receiptUrl || null,
        value.tags,
        value.notes || null,
      ]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    if (error.code === '23503') {
      return res.status(400).json({ success: false, message: 'Invalid category' });
    }
    console.error('Create expense error:', error);
    res.status(500).json({ success: false, message: 'Server error creating expense' });
  }
};

const updateExpense = async (req, res) => {
  try {
    const { error, value } = expenseSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const result = await pool.query(
      `UPDATE expenses
       SET category_id = $1,
           amount = $2,
           description = $3,
           payment_method = $4,
           date = $5,
           receipt_url = $6,
           tags = $7,
           notes = $8
       WHERE id = $9 AND user_id = $10
       RETURNING id, category_id, amount, description, payment_method, date, receipt_url,
                 tags, notes, created_at, updated_at`,
      [
        value.categoryId,
        value.amount,
        value.description || null,
        value.paymentMethod || null,
        value.date,
        value.receiptUrl || null,
        value.tags,
        value.notes || null,
        req.params.id,
        req.userId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    if (error.code === '23503') {
      return res.status(400).json({ success: false, message: 'Invalid category' });
    }
    console.error('Update expense error:', error);
    res.status(500).json({ success: false, message: 'Server error updating expense' });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting expense' });
  }
};

module.exports = {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
};
