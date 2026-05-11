const Joi = require('joi');
const pool = require('../config/database');

const categorySchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  icon: Joi.string().max(50).allow('', null),
  color: Joi.string()
    .pattern(/^#[0-9A-Fa-f]{6}$/)
    .default('#3B82F6'),
});

const getCategories = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, icon, color, is_custom, created_at
       FROM expense_categories
       WHERE user_id = $1
       ORDER BY name ASC`,
      [req.userId]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching categories' });
  }
};

const createCategory = async (req, res) => {
  try {
    const { error, value } = categorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const result = await pool.query(
      `INSERT INTO expense_categories (user_id, name, icon, color, is_custom)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id, name, icon, color, is_custom, created_at`,
      [req.userId, value.name, value.icon || null, value.color]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: 'Category already exists' });
    }
    console.error('Create category error:', error);
    res.status(500).json({ success: false, message: 'Server error creating category' });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { error, value } = categorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const result = await pool.query(
      `UPDATE expense_categories
       SET name = $1, icon = $2, color = $3
       WHERE id = $4 AND user_id = $5
       RETURNING id, name, icon, color, is_custom, created_at`,
      [value.name, value.icon || null, value.color, req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: 'Category already exists' });
    }
    console.error('Update category error:', error);
    res.status(500).json({ success: false, message: 'Server error updating category' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM expense_categories WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    if (error.code === '23503') {
      return res.status(409).json({
        success: false,
        message: 'Category is used by expenses or budgets and cannot be deleted',
      });
    }
    console.error('Delete category error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting category' });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
