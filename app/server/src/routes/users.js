import express from 'express';
import { User } from '../models/User.js';

export const usersRouter = express.Router();

// List users
usersRouter.get('/', async (req, res) => {
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
