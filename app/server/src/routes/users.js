import express from 'express';
import { User } from '../models/User.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { generateRandomPassword, sendPasswordEmail } from '../utils/email.js';

export const usersRouter = express.Router();

// List users (protected)
usersRouter.get('/', authenticateToken, requireRole(['admin']), async (req, res) => {
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

// Create user (admin only, generates password and sends email)
usersRouter.post('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { name, email, role, password } = req.body;

    console.log('Create user request:', { name, email, role, hasCustomPassword: !!password });

    // Validate input
    if (!name || !email || !role) {
      return res.status(400).json({ 
        error: 'Name, email, and role are required' 
      });
    }

    if (!['citizen', 'responder', 'admin'].includes(role)) {
      return res.status(400).json({ 
        error: 'Invalid role. Must be citizen, responder, or admin' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'User with this email already exists' 
      });
    }

    // Use provided password or generate random one
    let userPassword = password;
    if (!password) {
      userPassword = generateRandomPassword();
    }
    
    console.log(`Password for ${email}: ${userPassword}`);

    // Create user with password (will be hashed by pre-save middleware)
    const created = await User.create({ 
      name, 
      email, 
      role, 
      passwordHash: userPassword,
      emailVerified: true // Admin-created users are pre-verified
    });

    console.log('User created successfully:', created._id);

    // Send password email (non-blocking)
    sendPasswordEmail(email, name, userPassword, role).catch(err => {
      console.error('Email sending failed:', err);
    });

    // Return user without password
    const userResponse = created.toJSON();
    delete userResponse.passwordHash;

    const message = password 
      ? 'User created successfully with custom password.'
      : 'User created successfully. Password sent to email.';

    res.status(201).json({
      ...userResponse,
      message,
      password: password ? undefined : userPassword // Include generated password in response for admin to see
    });

  } catch (e) {
    console.error('Create user error:', e);
    if (e.code === 11000) { // MongoDB duplicate key error
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    if (e.name === 'ValidationError') {
      return res.status(400).json({ error: e.message });
    }
    res.status(500).json({ error: 'Failed to create user: ' + e.message });
  }
});

// Update user (admin only)
usersRouter.patch('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { name, email, role, isActive } = req.body;
    const updateData = {};
    
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (isActive != null) updateData.isActive = isActive;

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );
    
    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json(updated);
  } catch (e) {
    console.error('Update user error:', e);
    if (e.code === 11000) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(400).json({ error: 'Failed to update user' });
  }
});

// Delete user (admin only)
usersRouter.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'User not found' });
    res.json({ ok: true, message: 'User deleted successfully' });
  } catch (e) {
    console.error('Delete user error:', e);
    res.status(400).json({ error: 'Failed to delete user' });
  }
});

// Reset user password (admin only)
usersRouter.post('/:id/reset-password', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Generate new password
    const newPassword = generateRandomPassword();
    
    // Update password
    user.passwordHash = newPassword;
    await user.save();

    // Send new password via email
    const emailSent = await sendPasswordEmail(user.email, user.name, newPassword, user.role);
    
    if (!emailSent) {
      console.warn(`Failed to send password reset email to ${user.email}`);
    }

    res.json({ 
      message: 'Password reset successfully. New password sent to email.' 
    });

  } catch (e) {
    console.error('Reset password error:', e);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});
