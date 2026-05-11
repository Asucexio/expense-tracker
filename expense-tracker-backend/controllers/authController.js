const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const pool = require('../config/database');

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(50).required(),
  fullName: Joi.string().min(2).max(100).allow('', null),
  currency: Joi.string().length(3).uppercase().default('USD'),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const createToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const serializeUser = (user) => ({
  id: user.id,
  email: user.email,
  fullName: user.full_name,
  avatarUrl: user.avatar_url,
  currency: user.currency,
  createdAt: user.created_at,
});

const register = async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { email, password, fullName, currency } = value;
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [
      email.toLowerCase(),
    ]);

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Email is already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, currency)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, full_name, avatar_url, currency, created_at`,
      [email.toLowerCase(), passwordHash, fullName || null, currency]
    );

    const user = result.rows[0];
    const token = createToken(user);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: { user: serializeUser(user), token },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error creating account' });
  }
};

const login = async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const result = await pool.query(
      `SELECT id, email, password_hash, full_name, avatar_url, currency, created_at
       FROM users WHERE email = $1`,
      [value.email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(value.password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = createToken(user);

    res.json({
      success: true,
      message: 'Logged in successfully',
      data: { user: serializeUser(user), token },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error logging in' });
  }
};

module.exports = {
  register,
  login,
};
