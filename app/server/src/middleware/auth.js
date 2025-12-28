import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error();

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) throw new Error();

    req.token = token;
    req.user = user;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Please authenticate.' });
  }
};

export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};
