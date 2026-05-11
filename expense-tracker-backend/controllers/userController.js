const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const Joi = require('joi');

const updateProfileSchema = Joi.object({
  fullName: Joi.string().min(2).max(100),
  currency: Joi.string().length(3),
  avatarUrl: Joi.string().uri(),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).max(50).required(),
});

// Get user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      `SELECT id, email, full_name, avatar_url, currency, created_at 
       FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const user = result.rows[0];

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        avatarUrl: user.avatar_url,
        currency: user.currency,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile',
    });
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    const { error, value } = updateProfileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const userId = req.userId;
    const { fullName, currency, avatarUrl } = value;

    const result = await pool.query(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name),
           currency = COALESCE($2, currency),
           avatar_url = COALESCE($3, avatar_url)
       WHERE id = $4
       RETURNING id, email, full_name, avatar_url, currency, created_at`,
      [fullName || null, currency || null, avatarUrl || null, userId]
    );

    const user = result.rows[0];

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        avatarUrl: user.avatar_url,
        currency: user.currency,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile',
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { error, value } = changePasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const userId = req.userId;
    const { currentPassword, newPassword } = value;

    // Get current password hash
    const userResult = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const user = userResult.rows[0];

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [hashedPassword, userId]
    );

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error changing password',
    });
  }
};

// Get user summary
const getSummary = async (req, res) => {
  try {
    const userId = req.userId;

    // Get current month dates
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split('T')[0];
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
      .toISOString()
      .split('T')[0];

    // Get total expenses this month
    const expenseResult = await pool.query(
      `SELECT SUM(amount) as total FROM expenses 
       WHERE user_id = $1 AND date >= $2 AND date < $3`,
      [userId, startDate, endDate]
    );

    const totalExpenses = parseFloat(expenseResult.rows[0].total) || 0;

    // Get budget summary
    const budgetResult = await pool.query(
      `SELECT 
        COUNT(*) as total_budgets,
        SUM(CASE WHEN COALESCE(spent, 0) > monthly_limit THEN 1 ELSE 0 END) as over_budget
       FROM (
        SELECT 
          b.monthly_limit,
          COALESCE(SUM(e.amount), 0) as spent
        FROM budgets b
        LEFT JOIN expenses e ON b.category_id = e.category_id 
          AND e.user_id = $1 
          AND DATE_TRUNC('month', e.date) = DATE_TRUNC('month', b.month_year::date)
        WHERE b.user_id = $1 AND DATE_TRUNC('month', b.month_year::date) = DATE_TRUNC('month', CURRENT_DATE)
        GROUP BY b.id, b.monthly_limit
       ) as budget_data`,
      [userId]
    );

    const budgetData = budgetResult.rows[0];

    // Get number of expenses this month
    const expenseCountResult = await pool.query(
      `SELECT COUNT(*) as count FROM expenses 
       WHERE user_id = $1 AND date >= $2 AND date < $3`,
      [userId, startDate, endDate]
    );

    res.json({
      success: true,
      data: {
        totalExpensesThisMonth: totalExpenses,
        expenseCountThisMonth: parseInt(expenseCountResult.rows[0].count),
        activeBudgets: parseInt(budgetData.total_budgets) || 0,
        budgetsOverLimit: parseInt(budgetData.over_budget) || 0,
      },
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching summary',
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getSummary,
};