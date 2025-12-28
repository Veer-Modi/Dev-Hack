import express from 'express';
import { ActivityLog } from '../models/ActivityLog.js';

export const activityRouter = express.Router();

// List activity logs with optional filters
activityRouter.get('/', async (req, res) => {
  try {
    const { userId, incidentId, limit = 50, page = 1 } = req.query;
    const q = {};
    if (userId) q.userId = userId;
    if (incidentId) q.incidentId = incidentId;
    const items = await ActivityLog.find(q)
      .sort({ timestamp: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});
