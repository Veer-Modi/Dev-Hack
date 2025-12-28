import express from 'express';
import { User } from '../models/User.js';
import { Incident } from '../models/Incident.js';
import { auth, authorize } from '../middleware/auth.js';

export const leaderboardsRouter = (io) => {
  const router = express.Router();

  // Get top reporters leaderboard
  router.get('/top-reporters', auth, async (req, res) => {
    try {
      const { limit = 10, days = 30 } = req.query;
      const daysAgo = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);
      
      // Get top reporters based on verified reports and points
      const topReporters = await User.aggregate([
        { $match: { isActive: true } },
        { $sort: { points: -1, 'stats.verifiedReports': -1 } },
        { $limit: parseInt(limit) },
        { 
          $project: { 
            name: 1, 
            email: 1, 
            role: 1, 
            points: 1, 
            level: 1,
            badges: 1,
            'stats.totalReports': 1,
            'stats.verifiedReports': 1,
            'stats.resolvedReports': 1,
            'stats.totalUpvotes': 1,
            'stats.streak': 1
          } 
        }
      ]);
      
      res.json(topReporters);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
  });

  // Get user profile with stats
  router.get('/profile/:userId', auth, async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      if (!user) return res.status(404).json({ error: 'User not found' });
      
      // Calculate level based on points
      const level = Math.floor(user.points / 100) + 1;
      
      // Calculate progress to next level
      const progressToNextLevel = (user.points % 100);
      
      res.json({
        ...user.toObject(),
        level,
        progressToNextLevel,
        nextLevelPoints: 100 - progressToNextLevel
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch user profile' });
    }
  });

  // Get user's activity stats
  router.get('/stats/:userId', auth, async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      if (!user) return res.status(404).json({ error: 'User not found' });
      
      // Get recent activity
      const recentIncidents = await Incident.find({ 
        reportedBy: req.params.userId 
      })
      .sort({ reportedAt: -1 })
      .limit(10)
      .select('title type severity status reportedAt');
      
      res.json({
        stats: user.stats,
        recentActivity: recentIncidents,
        totalPoints: user.points,
        level: user.level,
        badges: user.badges
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch user stats' });
    }
  });

  // Get achievement badges
  router.get('/badges', auth, async (req, res) => {
    try {
      // Define available badges
      const badges = [
        { 
          id: 'first-report', 
          name: 'First Report', 
          description: 'Made your first incident report',
          icon: '🚨',
          condition: 'totalReports >= 1'
        },
        { 
          id: 'verified-reporter', 
          name: 'Verified Reporter', 
          description: 'Had 5 reports verified by the community',
          icon: '✅',
          condition: 'stats.verifiedReports >= 5'
        },
        { 
          id: 'active-contributor', 
          name: 'Active Contributor', 
          description: 'Made 20 reports',
          icon: '🔥',
          condition: 'totalReports >= 20'
        },
        { 
          id: 'responder', 
          name: 'Problem Solver', 
          description: 'Had 10 reports resolved',
          icon: '🏆',
          condition: 'stats.resolvedReports >= 10'
        },
        { 
          id: 'upvoted', 
          name: 'Popular', 
          description: 'Received 50 upvotes from community',
          icon: '👍',
          condition: 'stats.totalUpvotes >= 50'
        },
        { 
          id: 'streak', 
          name: 'Streak Master', 
          description: 'Maintained a 7-day reporting streak',
          icon: '🔥',
          condition: 'stats.streak >= 7'
        }
      ];
      
      res.json(badges);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch badges' });
    }
  });

  return router;
};