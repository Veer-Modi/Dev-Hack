import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { auth, authorize } from '../middleware/auth.js';

export const usersRouter = express.Router();

// Register
usersRouter.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 8);
    const user = new User({
      name,
      email,
      passwordHash,
      role: role || 'citizen',
    });

    await user.save();
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret');
    res.status(201).json({ user, token });
  } catch (e) {
    res.status(400).json({ error: 'Failed to register' });
  }
});

// Login
usersRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.isActive) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret');
    res.json({ user, token });
  } catch (e) {
    res.status(400).json({ error: 'Login failed' });
  }
});

// Get current user
usersRouter.get('/me', auth, async (req, res) => {
  res.json(req.user);
});

// List users (Admin only)
usersRouter.get('/', auth, authorize(['admin']), async (req, res) => {
  try {
    const { role, active } = req.query;
    const q = {};
    if (role) q.role = role;
    if (active != null) q.isActive = active === 'true';
    const users = await User.find(q).sort({ createdAt: -1 });
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create user
usersRouter.post('/', async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const created = await User.create({ name, email, role });
    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ error: 'Failed to create user' });
  }
});

// Update user (name/email), change role, activate/deactivate
usersRouter.patch('/:id', async (req, res) => {
  try {
    const { name, email, role, isActive } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { ...(name && { name }), ...(email && { email }), ...(role && { role }), ...(isActive != null && { isActive }) } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: 'Failed to update user' });
  }
});

// Delete user
usersRouter.delete('/:id', async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: 'Failed to delete user' });
  }
});
