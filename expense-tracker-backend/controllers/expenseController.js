const pool = require('../config/database');
const Joi = require('joi');

// Validation schema
const expenseSchema = Joi.object({
  categoryId: Joi.string().uuid().required(),
  amount: Joi.number().positive().required(),
  description: Joi.string().max(500),
  paymentMethod: Joi.string().max(50),
  date: Joi.date().required(),
  tags: Joi.array().items(Joi.string()),
  notes: Joi.string().max(1000),
});

// Create expense
const createExpense = async (req, res) => {
  try {
    const { error, value } = expenseSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const {
      categoryId,
      amount,
      description,
      paymentMethod,
      date,
      tags,
      notes,
    } = value;

    const userId = req.userId;

    // Verify category belongs to user
    const categoryResult = await pool.query(
      'SELECT id FROM expense_categories WHERE id = $1 AND user_id = $2',
      [categoryId, userId]
    );

    if (categoryResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Insert expense
    const result = await pool.query(
      `INSERT INTO expenses (user_id, category_id, amount, description, payment_method, date, tags, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, user_id, category_id, amount, description, payment_method, date, tags, notes, created_at`,
      [userId, categoryId, amount, description || null, paymentMethod || null, date, tags || [], notes || null]
    );

    const expense = result.rows[0];

    // Update monthly summary
    await updateMonthlySummary(userId, date);

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: {
        id: expense.id,
        categoryId: expense.category_id,
        amount: parseFloat(expense.amount),
        description: expense.description,
        paymentMethod: expense.payment_method,
        date: expense.date,
        tags: expense.tags,
        notes: expense.notes,
        createdAt: expense.created_at,
      },
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating expense',
    });
  }
};

// Get all expenses with filters
const getExpenses = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      categoryId,
      startDate,
      endDate,
      paymentMethod,
      sortBy = 'date',
      sortOrder = 'DESC',
      page = 1,
      limit = 20,
    } = req.query;

    let query = 'SELECT * FROM expenses WHERE user_id = $1';
    const params = [userId];
    let paramCount = 1;

    // Apply filters
    if (categoryId) {
      paramCount++;
      query += ` AND category_id = $${paramCount}`;
      params.push(categoryId);
    }

    if (startDate) {
      paramCount++;
      query += ` AND date >= $${paramCount}`;
      params.push(startDate);
    }

    if (endDate) {
      paramCount++;
      query += ` AND date <= $${paramCount}`;
      params.push(endDate);
    }

    if (paymentMethod) {
      paramCount++;
      query += ` AND payment_method = $${paramCount}`;
      params.push(paymentMethod);
    }

    // Sorting
    const validSortFields = ['date', 'amount', 'created_at'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'date';
    const validSortOrder = ['ASC', 'DESC'];
    const order = validSortOrder.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    query += ` ORDER BY ${sortField} ${order}`;

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(parseInt(limit));
    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM expenses WHERE user_id = $1';
    const countParams = [userId];

    if (categoryId) countQuery += ` AND category_id = $2`;
    if (startDate) countQuery += ` AND date >= $${countParams.length + 1}`;
    if (endDate) countQuery += ` AND date <= $${countParams.length + 2}`;
    if (paymentMethod) countQuery += ` AND payment_method = $${countParams.length + 3}`;

    if (categoryId) countParams.push(categoryId);
    if (startDate) countParams.push(startDate);
    if (endDate) countParams.push(endDate);
    if (paymentMethod) countParams.push(paymentMethod);

    const countResult = await pool.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);

    const expenses = result.rows.map(row => ({
      id: row.id,
      categoryId: row.category_id,
      amount: parseFloat(row.amount),
      description: row.description,
      paymentMethod: row.payment_method,
      date: row.date,
      tags: row.tags,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    res.json({
      success: true,
      data: {
        expenses,
        pagination: {
          total: totalCount,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(totalCount / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching expenses',
    });
  }
};

// Get single expense
const getExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const result = await pool.query(
      'SELECT * FROM expenses WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    const row = result.rows[0];
    res.json({
      success: true,
      data: {
        id: row.id,
        categoryId: row.category_id,
        amount: parseFloat(row.amount),
        description: row.description,
        paymentMethod: row.payment_method,
        date: row.date,
        tags: row.tags,
        notes: row.notes,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching expense',
    });
  }
};

// Update expense
const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { error, value } = expenseSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const existingExpense = await pool.query(
      'SELECT date FROM expenses WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existingExpense.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    const oldDate = existingExpense.rows[0].date;
    const {
      categoryId,
      amount,
      description,
      paymentMethod,
      date,
      tags,
      notes,
    } = value;

    const result = await pool.query(
      `UPDATE expenses 
       SET category_id = $1, amount = $2, description = $3, payment_method = $4, date = $5, tags = $6, notes = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 AND user_id = $9
       RETURNING *`,
      [categoryId, amount, description || null, paymentMethod || null, date, tags || [], notes || null, id, userId]
    );

    const expense = result.rows[0];

    // Update monthly summaries
    if (oldDate !== date) {
      await updateMonthlySummary(userId, oldDate);
    }
    await updateMonthlySummary(userId, date);

    res.json({
      success: true,
      message: 'Expense updated successfully',
      data: {
        id: expense.id,
        categoryId: expense.category_id,
        amount: parseFloat(expense.amount),
        description: expense.description,
        paymentMethod: expense.payment_method,
        date: expense.date,
        tags: expense.tags,
        notes: expense.notes,
        updatedAt: expense.updated_at,
      },
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating expense',
    });
  }
};

// Delete expense
const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const existingExpense = await pool.query(
      'SELECT date FROM expenses WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existingExpense.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    const date = existingExpense.rows[0].date;

    await pool.query(
      'DELETE FROM expenses WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    await updateMonthlySummary(userId, date);

    res.json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting expense',
    });
  }
};

// Get statistics
const getStats = async (req, res) => {
  try {
    const userId = req.userId;
    const { month, year } = req.query;

    let startDate, endDate;

    if (month && year) {
      startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      endDate = new Date(parseInt(year), parseInt(month), 1);
    } else {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Get total spending
    const totalResult = await pool.query(
      'SELECT SUM(amount) as total FROM expenses WHERE user_id = $1 AND date >= $2 AND date < $3',
      [userId, startDateStr, endDateStr]
    );

    const totalSpent = parseFloat(totalResult.rows[0].total) || 0;

    // Get breakdown by category
    const categoryResult = await pool.query(
      `SELECT 
        ec.id, 
        ec.name, 
        ec.icon, 
        ec.color,
        SUM(e.amount) as amount,
        COUNT(e.id) as count
       FROM expense_categories ec
       LEFT JOIN expenses e ON ec.id = e.category_id AND e.user_id = $1 AND e.date >= $2 AND e.date < $3
       WHERE ec.user_id = $1
       GROUP BY ec.id, ec.name, ec.icon, ec.color
       ORDER BY amount DESC`,
      [userId, startDateStr, endDateStr]
    );

    // Get spending by day
    const dailyResult = await pool.query(
      `SELECT 
        date,
        SUM(amount) as amount
       FROM expenses
       WHERE user_id = $1 AND date >= $2 AND date < $3
       GROUP BY date
       ORDER BY date ASC`,
      [userId, startDateStr, endDateStr]
    );

    // Get payment method breakdown
    const paymentResult = await pool.query(
      `SELECT 
        payment_method,
        SUM(amount) as amount,
        COUNT(id) as count
       FROM expenses
       WHERE user_id = $1 AND date >= $2 AND date < $3
       GROUP BY payment_method
       ORDER BY amount DESC`,
      [userId, startDateStr, endDateStr]
    );

    res.json({
      success: true,
      data: {
        period: {
          startDate: startDateStr,
          endDate: endDateStr,
        },
        totalSpent,
        byCategory: categoryResult.rows.map(row => ({
          id: row.id,
          name: row.name,
          icon: row.icon,
          color: row.color,
          amount: parseFloat(row.amount) || 0,
          count: parseInt(row.count),
          percentage: totalSpent > 0 ? ((parseFloat(row.amount) || 0) / totalSpent * 100).toFixed(1) : 0,
        })),
        dailySpending: dailyResult.rows.map(row => ({
          date: row.date,
          amount: parseFloat(row.amount),
        })),
        byPaymentMethod: paymentResult.rows.map(row => ({
          method: row.payment_method || 'Unknown',
          amount: parseFloat(row.amount),
          count: parseInt(row.count),
        })),
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching statistics',
    });
  }
};

// Helper function to update monthly summary
const updateMonthlySummary = async (userId, date) => {
  try {
    const dateObj = new Date(date);
    const monthYear = new Date(dateObj.getFullYear(), dateObj.getMonth(), 1)
      .toISOString()
      .split('T')[0];

    const result = await pool.query(
      `SELECT SUM(amount) as total FROM expenses 
       WHERE user_id = $1 AND DATE_TRUNC('month', date) = DATE_TRUNC('month', $2::date)`,
      [userId, date]
    );

    const totalExpenses = parseFloat(result.rows[0].total) || 0;

    await pool.query(
      `INSERT INTO monthly_summaries (user_id, month_year, total_expenses, last_updated)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, month_year)
       DO UPDATE SET total_expenses = $3, last_updated = CURRENT_TIMESTAMP`,
      [userId, monthYear, totalExpenses]
    );
  } catch (error) {
    console.error('Update monthly summary error:', error);
  }
};

module.exports = {
  createExpense,
  getExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
  getStats,
};