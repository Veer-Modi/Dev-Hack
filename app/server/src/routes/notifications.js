import express from 'express';
import { User } from '../models/User.js';
import { Incident } from '../models/Incident.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { auth, authorize } from '../middleware/auth.js';

// In-memory storage for subscriptions (in production, use a database)
let subscriptions = [];

export const notificationsRouter = (io) => {
  const router = express.Router();

  // Subscribe user to notifications
  router.post('/subscribe', auth, async (req, res) => {
    try {
      const { token, filters } = req.body;
      const userId = req.user.id;

      // Validate required fields
      if (!token) {
        return res.status(400).json({ error: 'FCM token is required' });
      }

      // Check if subscription already exists
      const existingIndex = subscriptions.findIndex(
        sub => sub.userId === userId && sub.token === token
      );

      if (existingIndex !== -1) {
        // Update existing subscription
        subscriptions[existingIndex].filters = filters || {};
        subscriptions[existingIndex].updatedAt = new Date();
      } else {
        // Create new subscription
        const newSubscription = {
          userId,
          token,
          filters: filters || {},
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        subscriptions.push(newSubscription);
      }

      res.json({ message: 'Successfully subscribed to notifications' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to subscribe to notifications' });
    }
  });

  // Unsubscribe user from notifications
  router.post('/unsubscribe', auth, async (req, res) => {
    try {
      const { token } = req.body;
      const userId = req.user.id;

      if (!token) {
        return res.status(400).json({ error: 'FCM token is required' });
      }

      // Remove subscription
      subscriptions = subscriptions.filter(
        sub => !(sub.userId === userId && sub.token === token)
      );

      res.json({ message: 'Successfully unsubscribed from notifications' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to unsubscribe from notifications' });
    }
  });

  // Get user's notification subscriptions
  router.get('/subscriptions/:userId', auth, async (req, res) => {
    try {
      const { userId } = req.params;

      // Only allow users to get their own subscriptions or admins to get any
      if (req.user.id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to view these subscriptions' });
      }

      const userSubscriptions = subscriptions.filter(sub => sub.userId === userId);

      res.json(userSubscriptions);
    } catch (err) {
      res.status(500).json({ error: 'Failed to get subscriptions' });
    }
  });

  // Send notification to user (for testing/admin purposes)
  router.post('/send', auth, authorize(['admin', 'responder']), async (req, res) => {
    try {
      const { userId, title, body, data } = req.body;

      // In a real implementation, this would send to FCM
      // For now, we'll just emit via socket to simulate
      io.to(userId).emit('notification', {
        title,
        body,
        data,
        timestamp: new Date(),
      });

      // Log the notification activity
      await ActivityLog.create({
        userId: req.user.id,
        userName: req.user.name,
        action: 'Sent notification',
        details: `To: ${userId}, Title: ${title}`,
        timestamp: new Date(),
      });

      res.json({ message: 'Notification sent' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to send notification' });
    }
  });

  // Get notification preferences for user
  router.get('/preferences/:userId', auth, async (req, res) => {
    try {
      const { userId } = req.params;

      // Only allow users to get their own preferences or admins
      if (req.user.id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized' });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Return notification preferences
      res.json({
        userId: user.id,
        preferences: {
          emailNotifications: user.emailNotifications ?? true,
          pushNotifications: true, // Always enabled if subscribed
          incidentUpdates: user.incidentUpdates ?? true,
          systemAlerts: user.systemAlerts ?? true,
          subscriptionAreas: user.subscriptionAreas ?? [],
          subscriptionTypes: user.subscriptionTypes ?? [],
        }
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to get notification preferences' });
    }
  });

  // Update notification preferences for user
  router.patch('/preferences/:userId', auth, async (req, res) => {
    try {
      const { userId } = req.params;
      const updates = req.body;

      // Only allow users to update their own preferences
      if (req.user.id !== userId) {
        return res.status(403).json({ error: 'Not authorized to update these preferences' });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Update user notification preferences
      const allowedUpdates = [
        'emailNotifications', 'incidentUpdates', 'systemAlerts', 
        'subscriptionAreas', 'subscriptionTypes'
      ];

      for (const key of allowedUpdates) {
        if (key in updates) {
          user[key] = updates[key];
        }
      }

      await user.save();

      res.json({
        message: 'Notification preferences updated',
        preferences: {
          emailNotifications: user.emailNotifications,
          pushNotifications: true,
          incidentUpdates: user.incidentUpdates,
          systemAlerts: user.systemAlerts,
          subscriptionAreas: user.subscriptionAreas,
          subscriptionTypes: user.subscriptionTypes,
        }
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update notification preferences' });
    }
  });

  return router;
};

// Function to notify users of new incidents based on their subscriptions
export const notifyUsersOfIncident = async (io, incident) => {
  try {
    // Find all subscriptions that match the incident criteria
    const matchingSubscriptions = subscriptions.filter(sub => {
      const filters = sub.filters || {};
      
      // Check if incident matches subscription filters
      let matches = true;
      
      if (filters.severity && filters.severity.length > 0) {
        matches = matches && filters.severity.includes(incident.severity);
      }
      
      if (filters.types && filters.types.length > 0) {
        matches = matches && filters.types.includes(incident.type);
      }
      
      if (filters.radius && filters.location) {
        // Calculate distance between incident and subscription location
        const distance = calculateDistance(
          incident.location.lat,
          incident.location.lng,
          filters.location.lat,
          filters.location.lng
        );
        matches = matches && distance <= filters.radius;
      }
      
      return matches;
    });

    // Emit notifications to matching users
    for (const sub of matchingSubscriptions) {
      io.to(sub.userId).emit('incident:notification', {
        incident,
        timestamp: new Date(),
      });
    }
  } catch (error) {
    console.error('Error notifying users of incident:', error);
  }
};

// Helper function to calculate distance between two coordinates
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lng2 - lng1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const deg2rad = (deg) => {
  return deg * (Math.PI/180);
};