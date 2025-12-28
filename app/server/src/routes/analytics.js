import express from 'express';
import { Incident } from '../models/Incident.js';
import { User } from '../models/User.js';
import { auth, authorize } from '../middleware/auth.js';
import { analyzeHotspots, predictIncidents } from '../lib/prediction.js';

export const analyticsRouter = (io) => {
  const router = express.Router();

  // Get incident analytics for admin dashboard
  router.get('/incidents', auth, authorize(['admin', 'responder']), async (req, res) => {
    try {
      const { days = 30 } = req.query;
      const daysAgo = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);
      
      // Get basic statistics
      const totalIncidents = await Incident.countDocuments({ reportedAt: { $gte: daysAgo } });
      const resolvedIncidents = await Incident.countDocuments({ 
        reportedAt: { $gte: daysAgo }, 
        status: 'resolved' 
      });
      const activeIncidents = await Incident.countDocuments({ 
        reportedAt: { $gte: daysAgo }, 
        status: { $ne: 'resolved' } 
      });
      
      // Get incidents by type
      const incidentsByType = await Incident.aggregate([
        { $match: { reportedAt: { $gte: daysAgo } } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      
      // Get incidents by severity
      const incidentsBySeverity = await Incident.aggregate([
        { $match: { reportedAt: { $gte: daysAgo } } },
        { $group: { _id: '$severity', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      
      res.json({
        total: totalIncidents,
        resolved: resolvedIncidents,
        active: activeIncidents,
        byType: incidentsByType,
        bySeverity: incidentsBySeverity
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });

  // Get incident hotspots
  router.get('/hotspots', auth, authorize(['admin', 'responder']), async (req, res) => {
    try {
      const hotspots = await analyzeHotspots();
      res.json(hotspots);
    } catch (err) {
      res.status(500).json({ error: 'Failed to analyze hotspots' });
    }
  });

  // Predict incidents for a specific location
  router.post('/predict', auth, authorize(['admin', 'responder']), async (req, res) => {
    try {
      const { location, timeRange = 24 } = req.body;
      
      if (!location || !location.lat || !location.lng) {
        return res.status(400).json({ error: 'Location with lat/lng is required' });
      }
      
      const predictions = await predictIncidents(location, timeRange);
      res.json(predictions);
    } catch (err) {
      res.status(500).json({ error: 'Failed to predict incidents' });
    }
  });

  // Get user engagement analytics
  router.get('/users', auth, authorize(['admin']), async (req, res) => {
    try {
      const { days = 30 } = req.query;
      const daysAgo = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);
      
      // Get user statistics
      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({ isActive: true });
      const newUsers = await User.countDocuments({ createdAt: { $gte: daysAgo } });
      
      // Get top reporters
      const topReporters = await User.aggregate([
        { $match: { points: { $gt: 0 } } },
        { $sort: { points: -1 } },
        { $limit: 10 },
        { $project: { name: 1, email: 1, role: 1, points: 1, badges: 1 } }
      ]);
      
      res.json({
        total: totalUsers,
        active: activeUsers,
        new: newUsers,
        topReporters
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch user analytics' });
    }
  });

  return router;
};