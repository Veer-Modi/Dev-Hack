import express from 'express';
import mongoose from 'mongoose';
import { Incident } from '../models/Incident.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { User } from '../models/User.js';
import { Config } from '../models/Config.js';

export const adminRouter = express.Router();

// -------- Analytics endpoints --------
// Summary KPIs
adminRouter.get('/analytics/summary', async (req, res) => {
  try {
    const [{ total = 0 } = {}] = await Incident.aggregate([{ $count: 'total' }]);
    const [{ verified = 0 } = {}] = await Incident.aggregate([
      { $match: { status: { $in: ['verified', 'in-progress', 'resolved'] } } },
      { $count: 'verified' },
    ]);
    const activeUsers = await User.countDocuments({ isActive: true });

    // crude peak hour: max count in last 7 days by hour
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const peaks = await Incident.aggregate([
      { $match: { reportedAt: { $gte: since } } },
      { $project: { hour: { $hour: '$reportedAt' } } },
      { $group: { _id: '$hour', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);
    const peakHour = peaks[0]?.['_id'] ?? null;
    const verificationRate = total > 0 ? Math.round((verified / total) * 100) : 0;

    res.json({ totals: { incidents: total, verified, unverified: Math.max(0, total - verified) }, verificationRate, activeUsers, peakHour });
  } catch (e) {
    res.status(500).json({ error: 'Failed to compute summary' });
  }
});

// Timeseries: incidents grouped by day
adminRouter.get('/analytics/timeseries', async (req, res) => {
  try {
    const { from, to, type, severity } = req.query;
    const q = {};
    if (from || to) q['reportedAt'] = {};
    if (from) q['reportedAt'].$gte = new Date(from);
    if (to) q['reportedAt'].$lte = new Date(to);
    if (type) q['type'] = { $in: String(type).split(',') };
    if (severity) q['severity'] = { $in: String(severity).split(',') };

    const data = await Incident.aggregate([
      { $match: q },
      {
        $group: {
          _id: {
            y: { $year: '$reportedAt' },
            m: { $month: '$reportedAt' },
            d: { $dayOfMonth: '$reportedAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $project: { ts: { $dateFromParts: { year: '$_id.y', month: '$_id.m', day: '$_id.d' } }, count: 1, _id: 0 } },
      { $sort: { ts: 1 } },
    ]);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Failed to compute timeseries' });
  }
});

// Severity distribution
adminRouter.get('/analytics/severity', async (req, res) => {
  try {
    const { from, to, type } = req.query;
    const q = {};
    if (from || to) q['reportedAt'] = {};
    if (from) q['reportedAt'].$gte = new Date(from);
    if (to) q['reportedAt'].$lte = new Date(to);
    if (type) q['type'] = { $in: String(type).split(',') };

    const buckets = await Incident.aggregate([
      { $match: q },
      { $group: { _id: '$severity', count: { $sum: 1 } } },
    ]);
    const out = { critical: 0, high: 0, medium: 0, low: 0 };
    for (const b of buckets) out[b._id] = b.count;
    res.json(out);
  } catch (e) {
    res.status(500).json({ error: 'Failed to compute severity' });
  }
});

// Peak hours
adminRouter.get('/analytics/peaks', async (req, res) => {
  try {
    const { from, to } = req.query;
    const q = {};
    if (from || to) q['reportedAt'] = {};
    if (from) q['reportedAt'].$gte = new Date(from);
    if (to) q['reportedAt'].$lte = new Date(to);

    const data = await Incident.aggregate([
      { $match: q },
      { $project: { hour: { $hour: '$reportedAt' } } },
      { $group: { _id: '$hour', count: { $sum: 1 } } },
      { $project: { hour: '$_id', count: 1, _id: 0 } },
      { $sort: { hour: 1 } },
    ]);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Failed to compute peaks' });
  }
});

// -------- Configuration endpoints --------
// Get current config
adminRouter.get('/config', async (_req, res) => {
  try {
    const cfg = await Config.findOne().sort({ updatedAt: -1 });
    res.json(cfg ?? (await Config.create({})).toJSON());
  } catch (e) {
    res.status(500).json({ error: 'Failed to load config' });
  }
});

// Update config (full replace)
adminRouter.put('/config', async (req, res) => {
  try {
    const payload = req.body || {};
    const existing = await Config.findOne();
    const next = existing
      ? await Config.findByIdAndUpdate(existing.id, { $set: payload }, { new: true })
      : await Config.create(payload);
    // Log a config change activity entry (optional)
    await ActivityLog.create({
      userId: 'admin',
      userName: 'admin',
      action: 'Updated configuration',
      timestamp: new Date(),
    });
    res.json(next);
  } catch (e) {
    res.status(400).json({ error: 'Failed to update config' });
  }
});
