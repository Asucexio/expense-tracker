const pool = require('../config/database');
const Joi = require('joi');

const categorySchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  icon: Joi.string().max(10),
  color: Joi.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

// Get all categories for user
const getCategories = async (req, res) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      `SELECT id, name, icon, color, is_custom FROM expense_categories 
       WHERE user_id = $1 
       ORDER BY is_custom ASC, name ASC`,
      [userId]
    );

    const categories = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      icon: row.icon,
      color: row.color,
      isCustom: row.is_custom,
    }));

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching categories',
    });
  }
};

// Create custom category
const createCategory = async (req, res) => {
  try {
    const { error, value } = categorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const userId = req.userId;
    const { name, icon, color } = value;

    // Check if category with same name already exists for this user
    const existingCategory = await pool.query(
      'SELECT id FROM expense_categories WHERE user_id = $1 AND LOWER(name) = LOWER($2)',
      [userId, name]
    );

    if (existingCategory.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Category with this name already exists',
      });
    }

    const result = await pool.query(
      `INSERT INTO expense_categories (user_id, name, icon, color, is_custom) 
       VALUES ($1, $2, $3, $4, true) 
       RETURNING id, name, icon, color, is_custom`,
      [userId, name, icon || null, color || '#3B82F6']
    );

    const category = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: {
        id: category.id,
        name: category.name,
        icon: category.icon,
        color: category.color,
        isCustom: category.is_custom,
      },
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating category',
    });
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { error, value } = categorySchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { name, icon, color } = value;

    // Verify category belongs to user and is custom
    const categoryCheck = await pool.query(
      'SELECT is_custom FROM expense_categories WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (categoryCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    if (!categoryCheck.rows[0].is_custom) {
      return res.status(403).json({
        success: false,
        message: 'Cannot modify default categories',
      });
    }

    // Check if new name conflicts with existing category
    const nameCheck = await pool.query(
      'SELECT id FROM expense_categories WHERE user_id = $1 AND LOWER(name) = LOWER($2) AND id != $3',
      [userId, name, id]
    );

    if (nameCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Category with this name already exists',
      });
    }

    const result = await pool.query(
      `UPDATE expense_categories 
       SET name = $1, icon = $2, color = $3 
       WHERE id = $4 AND user_id = $5 
       RETURNING id, name, icon, color, is_custom`,
      [name, icon || null, color || '#3B82F6', id, userId]
    );

    const category = result.rows[0];

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: {
        id: category.id,
        name: category.name,
        icon: category.icon,
        color: category.color,
        isCustom: category.is_custom,
      },
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating category',
    });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Check if category is custom and doesn't have expenses
    const categoryCheck = await pool.query(
      'SELECT is_custom FROM expense_categories WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (categoryCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    if (!categoryCheck.rows[0].is_custom) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete default categories',
      });
    }

    const expenseCheck = await pool.query(
      'SELECT COUNT(*) FROM expenses WHERE category_id = $1',
      [id]
    );

    if (parseInt(expenseCheck.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with existing expenses',
      });
    }

    await pool.query(
      'DELETE FROM expense_categories WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting category',
    });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};