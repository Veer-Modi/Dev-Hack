import express from 'express';
import { Incident } from '../models/Incident.js';
import { ActivityLog } from '../models/ActivityLog.js';

export const incidentsRouter = (io) => {
  const router = express.Router();

  // List incidents with basic filters
  router.get('/', async (req, res) => {
    try {
      const { status, severity, limit = 50, page = 1 } = req.query;
      const query = {};
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

  // Create incident
  router.post('/', async (req, res) => {
    try {
      const { type, title, description, severity, location, mediaUrls, reportedBy = 'citizen' } = req.body;
      const incident = await Incident.create({
        type,
        title,
        description,
        severity,
        status: 'unverified',
        location,
        mediaUrls: mediaUrls ?? [],
        reportedBy,
      });
      // log activity
      await ActivityLog.create({
        userId: reportedBy,
        userName: reportedBy,
        action: 'Created incident',
        incidentId: incident.id,
        details: `${type} - ${title}`,
        timestamp: new Date(),
      });
      io.emit('incident:new', incident);
      res.status(201).json(incident);
    } catch (err) {
      res.status(400).json({ error: 'Failed to create incident' });
    }
  });

  // Update status
  router.patch('/:id/status', async (req, res) => {
    try {
      const { status } = req.body;
      const incident = await Incident.findByIdAndUpdate(
        req.params.id,
        { status, updatedAt: new Date() },
        { new: true }
      );
      if (!incident) return res.status(404).json({ error: 'Not found' });
      await ActivityLog.create({
        userId: 'responder',
        userName: 'responder',
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

  // General update (title, description, severity, location, assignedTo)
  router.patch('/:id', async (req, res) => {
    try {
      const allowed = ['title', 'description', 'severity', 'location', 'assignedTo'];
      const updates = {};
      for (const k of allowed) if (k in req.body) updates[k] = req.body[k];
      updates.updatedAt = new Date();
      const incident = await Incident.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
      if (!incident) return res.status(404).json({ error: 'Not found' });
      await ActivityLog.create({
        userId: 'responder',
        userName: 'responder',
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

  // Confirm (upvote)
  router.post('/:id/confirm', async (req, res) => {
    try {
      const incident = await Incident.findByIdAndUpdate(
        req.params.id,
        { $inc: { upvotes: 1 }, updatedAt: new Date() },
        { new: true }
      );
      if (!incident) return res.status(404).json({ error: 'Not found' });
      await ActivityLog.create({
        userId: 'citizen',
        userName: 'citizen',
        action: 'Confirmed incident',
        incidentId: incident.id,
        timestamp: new Date(),
      });
      io.emit('incident:confirm', { id: incident.id, upvotes: incident.upvotes, updatedAt: incident.updatedAt });
      res.json(incident);
    } catch (err) {
      res.status(400).json({ error: 'Failed to confirm incident' });
    }
  });

  return router;
};
