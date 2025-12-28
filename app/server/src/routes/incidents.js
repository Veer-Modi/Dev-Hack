import express from 'express';
import stringSimilarity from 'string-similarity';
import { Incident } from '../models/Incident.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { User } from '../models/User.js';
import { auth, authorize } from '../middleware/auth.js';
import twilio from 'twilio';
import nodemailer from 'nodemailer';
import { notifyUsersOfIncident } from './notifications.js';
import { triggerSurveyForIncident } from './surveys.js';

export const incidentsRouter = (io) => {
  const router = express.Router();

  const calculateSeverity = (description, type) => {
    const highKeywords = ['fire', 'explosion', 'bleeding', 'unconscious', 'weapon', 'shooting', 'collapse'];
    const mediumKeywords = ['accident', 'injury', 'leak', 'flood', 'theft', 'break-in'];
    
    const desc = description.toLowerCase();
    if (highKeywords.some(k => desc.includes(k))) return 'critical';
    if (mediumKeywords.some(k => desc.includes(k))) return 'high';
    
    // Type based defaults
    if (['fire', 'medical emergency'].includes(type.toLowerCase())) return 'high';
    
    return 'medium';
  };

  const findDuplicates = async (incident) => {
    const nearby = await Incident.find({
      _id: { $ne: incident._id },
      type: incident.type,
      status: { $ne: 'resolved' },
      reportedAt: { $gte: new Date(Date.now() - 2 * 60 * 60 * 1000) }, // 2 hours
      'location.lat': { $gte: incident.location.lat - 0.01, $lte: incident.location.lat + 0.01 },
      'location.lng': { $gte: incident.location.lng - 0.01, $lte: incident.location.lng + 0.01 },
    });

    const duplicates = nearby.filter(other => {
      const similarity = stringSimilarity.compareTwoStrings(incident.description, other.description);
      return similarity > 0.6;
    });

    return duplicates;
  };

  const sendEmergencyAlert = async (incident) => {
    try {
      // Initialize Twilio client if credentials are provided
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        const client = twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );

        // Send SMS to emergency contacts
        if (process.env.EMERGENCY_PHONE) {
          await client.messages.create({
            body: `EMERGENCY ALERT: ${incident.type} reported at ${incident.location.address}. Severity: ${incident.severity}. Description: ${incident.description}`,
            from: process.env.TWILIO_PHONE_NUMBER || '+1234567890',
            to: process.env.EMERGENCY_PHONE
          });
        }
      }

      // Send email alert if configured
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const transporter = nodemailer.createTransporter({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: process.env.EMERGENCY_EMAIL || 'emergency@localauthority.gov',
          subject: `URGENT: Emergency Incident - ${incident.type}`,
          html: `
            <h2>Emergency Incident Report</h2>
            <p><strong>Type:</strong> ${incident.type}</p>
            <p><strong>Severity:</strong> ${incident.severity}</p>
            <p><strong>Location:</strong> ${incident.location.address}</p>
            <p><strong>Coordinates:</strong> ${incident.location.lat}, ${incident.location.lng}</p>
            <p><strong>Description:</strong> ${incident.description}</p>
            <p><strong>Reported at:</strong> ${incident.reportedAt}</p>
            <p><strong>Incident ID:</strong> ${incident.id}</p>
          `
        };

        await transporter.sendMail(mailOptions);
      }
    } catch (error) {
      console.error('Failed to send emergency alert:', error);
    }
  };

  // List incidents with basic filters
  router.get('/', async (req, res) => {
    try {
      const { status, severity, limit = 50, page = 1 } = req.query;
      const query = { isDuplicate: false };
      if (status) query.status = status;
      if (severity) query.severity = severity;
      const items = await Incident.find(query)
        .sort({ updatedAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));
      res.json(items);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch incidents' });
    }
  });

  // Get single incident with duplication suggestions
  router.get('/:id', async (req, res) => {
    try {
      const incident = await Incident.findById(req.params.id);
      if (!incident) return res.status(404).json({ error: 'Not found' });
      
      const suggestions = await findDuplicates(incident);
      res.json({ incident, suggestions });
    } catch (e) {
      res.status(500).json({ error: 'Failed' });
    }
  });

  // Create incident
  router.post('/', auth, async (req, res) => {
    try {
      const { type, title, description, location, mediaUrls } = req.body;
      const severity = calculateSeverity(description, type);
      
      const incident = await Incident.create({
        type,
        title: title || `${type} reported`,
        description,
        severity,
        status: 'unverified',
        location,
        mediaUrls: mediaUrls ?? [],
        reportedBy: req.user.id,
      });

      // Update reporter stats
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { 'stats.totalReports': 1 },
        'stats.lastReportDate': new Date(),
      });

      await ActivityLog.create({
        userId: req.user.id,
        userName: req.user.name,
        action: 'Created incident',
        incidentId: incident.id,
        details: `${type} - ${severity}`,
        timestamp: new Date(),
      });

      const duplicates = await findDuplicates(incident);
      if (duplicates.length > 0) {
        io.emit('incident:potential-duplicate', { incident, potentialDuplicates: duplicates });
      }

      io.emit('incident:new', incident);
      
      // Trigger notifications for subscribed users
      if (typeof notifyUsersOfIncident === 'function') {
        await notifyUsersOfIncident(io, incident);
      }
      
      res.status(201).json({ incident, potentialDuplicates: duplicates });
    } catch (err) {
      res.status(400).json({ error: 'Failed to create incident' });
    }
  });

  // Vote (upvote/downvote)
  router.post('/:id/vote', auth, async (req, res) => {
    try {
      const { type } = req.body; // 'up' or 'down'
      const incident = await Incident.findById(req.params.id);
      if (!incident) return res.status(404).json({ error: 'Not found' });

      if (incident.votedBy.includes(req.user.id)) {
        return res.status(400).json({ error: 'Already voted' });
      }

      const update = type === 'up' ? { $inc: { upvotes: 1 } } : { $inc: { downvotes: 1 } };
      const updated = await Incident.findByIdAndUpdate(
        req.params.id,
        { ...update, $push: { votedBy: req.user.id }, updatedAt: new Date() },
        { new: true }
      );

      // Verification logic: auto-verify if threshold reached
      if (updated.upvotes >= 5 && updated.status === 'unverified') {
        updated.status = 'verified';
        await updated.save();
        
        // Reward reporter
        const reporter = await User.findById(updated.reportedBy);
        if (reporter) {
          reporter.points += 10;
          reporter.stats.verifiedReports += 1;
          if (reporter.points >= 100 && !reporter.badges.includes('reliable-reporter')) {
            reporter.badges.push('reliable-reporter');
          }
          await reporter.save();
        }
      }
      
      // Update user stats for voting
      if (type === 'up') {
        // Update voter stats
        await User.findByIdAndUpdate(req.user.id, {
          $inc: { 'stats.totalUpvotes': 1 },
        });
      }

      await ActivityLog.create({
        userId: req.user.id,
        userName: req.user.name,
        action: `Voted ${type}`,
        incidentId: updated.id,
        timestamp: new Date(),
      });

      io.emit('incident:update', updated);
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: 'Failed to vote' });
    }
  });

  // Update status (Responder/Admin)
  router.patch('/:id/status', auth, authorize(['responder', 'admin']), async (req, res) => {
    try {
      const { status } = req.body;
      const incident = await Incident.findById(req.params.id);
      if (!incident) return res.status(404).json({ error: 'Not found' });
      
      const oldStatus = incident.status;
      incident.status = status;
      incident.updatedAt = new Date();
      await incident.save();
      
      // Update reporter stats when incident is resolved
      if (status === 'resolved' && oldStatus !== 'resolved') {
        await User.findByIdAndUpdate(incident.reportedBy, {
          $inc: { 'stats.resolvedReports': 1 },
          points: 5, // Additional points for resolved incidents
        });
        
        // Trigger survey for the reporter
        if (typeof triggerSurveyForIncident === 'function') {
          await triggerSurveyForIncident(incident.id, incident.reportedBy);
        }
      }
      
      await ActivityLog.create({
        userId: req.user.id,
        userName: req.user.name,
        action: `Updated status to ${status}`,
        incidentId: incident.id,
        timestamp: new Date(),
      });
      io.emit('incident:status', { id: incident.id, status: incident.status, updatedAt: incident.updatedAt });
      res.json(incident);
    } catch (err) {
      res.status(400).json({ error: 'Failed to update status' });
    }
  });

  // General update (Responder/Admin)
  router.patch('/:id', auth, authorize(['responder', 'admin']), async (req, res) => {
    try {
      const allowed = ['title', 'description', 'severity', 'location', 'assignedTo', 'isDuplicate', 'duplicateOf'];
      const updates = {};
      for (const k of allowed) if (k in req.body) updates[k] = req.body[k];
      updates.updatedAt = new Date();
      
      const incident = await Incident.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
      if (!incident) return res.status(404).json({ error: 'Not found' });
      
      await ActivityLog.create({
        userId: req.user.id,
        userName: req.user.name,
        action: 'Updated incident details',
        incidentId: incident.id,
        details: Object.keys(updates).join(','),
        timestamp: new Date(),
      });
      
      io.emit('incident:update', incident);
      res.json(incident);
    } catch (err) {
      res.status(400).json({ error: 'Failed to update incident' });
    }
  });

  // Escalate incident to emergency services (Responder/Admin only)
  router.post('/:id/escalate', auth, authorize(['responder', 'admin']), async (req, res) => {
    try {
      const incident = await Incident.findById(req.params.id);
      if (!incident) return res.status(404).json({ error: 'Not found' });
      
      // Send emergency alert
      await sendEmergencyAlert(incident);
      
      // Log the escalation activity
      await ActivityLog.create({
        userId: req.user.id,
        userName: req.user.name,
        action: 'Escalated to emergency services',
        incidentId: incident.id,
        details: `Severity: ${incident.severity}, Type: ${incident.type}`,
        timestamp: new Date(),
      });
      
      res.json({ message: 'Incident escalated to emergency services', incidentId: incident.id });
    } catch (err) {
      res.status(400).json({ error: 'Failed to escalate incident' });
    }
  });

  return router;
};
