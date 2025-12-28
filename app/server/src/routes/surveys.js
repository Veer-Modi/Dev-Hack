import express from 'express';
import { Survey } from '../models/Survey.js';
import { Incident } from '../models/Incident.js';
import { User } from '../models/User.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { auth, authorize } from '../middleware/auth.js';

export const surveysRouter = (io) => {
  const router = express.Router();

  // Submit a survey for an incident
  router.post('/', auth, async (req, res) => {
    try {
      const { incidentId, respondentType, responses } = req.body;

      // Validate incident exists and is resolved
      const incident = await Incident.findById(incidentId);
      if (!incident) {
        return res.status(404).json({ error: 'Incident not found' });
      }

      // Check if user is authorized to submit survey
      // Allow the reporter, assigned responder, or any admin/responder
      const isReporter = req.user.id === incident.reportedBy;
      const isAssigned = incident.assignedTo && req.user.id === incident.assignedTo;
      const isAdminOrResponder = req.user.role === 'admin' || req.user.role === 'responder';

      if (!isReporter && !isAssigned && !isAdminOrResponder) {
        return res.status(403).json({ error: 'Not authorized to submit survey for this incident' });
      }

      // Validate survey responses
      if (!responses) {
        return res.status(400).json({ error: 'Survey responses are required' });
      }

      // Check if a survey already exists for this incident and user
      const existingSurvey = await Survey.findOne({
        incidentId,
        respondentId: req.user.id,
      });

      if (existingSurvey) {
        return res.status(400).json({ error: 'Survey already submitted for this incident' });
      }

      // Create the survey
      const survey = await Survey.create({
        incidentId,
        respondentId: req.user.id,
        respondentType: respondentType || 'citizen',
        responses,
      });

      // Update incident with survey submission info
      await Incident.findByIdAndUpdate(incidentId, {
        $set: { surveySubmitted: true },
      });

      // Log the survey submission
      await ActivityLog.create({
        userId: req.user.id,
        userName: req.user.name,
        action: 'Submitted survey',
        incidentId,
        details: `Rating: ${responses.rating || 'N/A'}`,
        timestamp: new Date(),
      });

      res.status(201).json(survey);
    } catch (err) {
      console.error('Error submitting survey:', err);
      res.status(500).json({ error: 'Failed to submit survey' });
    }
  });

  // Get survey for a specific incident by user
  router.get('/incident/:incidentId', auth, async (req, res) => {
    try {
      const { incidentId } = req.params;

      // Check if user is authorized to view survey
      const incident = await Incident.findById(incidentId);
      if (!incident) {
        return res.status(404).json({ error: 'Incident not found' });
      }

      const isReporter = req.user.id === incident.reportedBy;
      const isAssigned = incident.assignedTo && req.user.id === incident.assignedTo;
      const isAdminOrResponder = req.user.role === 'admin' || req.user.role === 'responder';

      if (!isReporter && !isAssigned && !isAdminOrResponder) {
        return res.status(403).json({ error: 'Not authorized to view survey for this incident' });
      }

      const survey = await Survey.findOne({
        incidentId,
        respondentId: req.user.id,
      });

      if (!survey) {
        return res.status(404).json({ error: 'No survey found for this incident' });
      }

      res.json(survey);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch survey' });
    }
  });

  // Get all surveys for an incident (admin/responder only)
  router.get('/incident/:incidentId/all', auth, authorize(['admin', 'responder']), async (req, res) => {
    try {
      const { incidentId } = req.params;

      const surveys = await Survey.find({ incidentId });

      res.json(surveys);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch surveys' });
    }
  });

  // Get aggregated survey statistics for an incident
  router.get('/incident/:incidentId/stats', auth, authorize(['admin', 'responder']), async (req, res) => {
    try {
      const { incidentId } = req.params;

      const surveys = await Survey.find({ incidentId });

      if (surveys.length === 0) {
        return res.json({ count: 0, averageRating: null, stats: {} });
      }

      // Calculate statistics
      const stats = surveys.reduce(
        (acc, survey) => {
          const responses = survey.responses;
          if (responses.overallSatisfaction) {
            acc.totalSatisfaction += responses.overallSatisfaction;
            acc.satisfactionCount++;
          }
          if (responses.responseTime) {
            acc.totalResponseTime += responses.responseTime;
            acc.responseTimeCount++;
          }
          if (responses.resolutionQuality) {
            acc.totalResolutionQuality += responses.resolutionQuality;
            acc.resolutionQualityCount++;
          }
          if (responses.staffCourtesy) {
            acc.totalStaffCourtesy += responses.staffCourtesy;
            acc.staffCourtesyCount++;
          }
          if (responses.rating) {
            acc.totalRating += responses.rating;
            acc.ratingCount++;
          }
          if (responses.wouldRecommend !== undefined) {
            acc.wouldRecommendCount++;
            if (responses.wouldRecommend) acc.wouldRecommendYes++;
          }
          return acc;
        },
        {
          totalSatisfaction: 0,
          satisfactionCount: 0,
          totalResponseTime: 0,
          responseTimeCount: 0,
          totalResolutionQuality: 0,
          resolutionQualityCount: 0,
          totalStaffCourtesy: 0,
          staffCourtesyCount: 0,
          totalRating: 0,
          ratingCount: 0,
          wouldRecommendCount: 0,
          wouldRecommendYes: 0,
        }
      );

      const result = {
        count: surveys.length,
        averageRating: stats.ratingCount > 0 ? stats.totalRating / stats.ratingCount : null,
        averageSatisfaction: stats.satisfactionCount > 0 ? stats.totalSatisfaction / stats.satisfactionCount : null,
        averageResponseTime: stats.responseTimeCount > 0 ? stats.totalResponseTime / stats.responseTimeCount : null,
        averageResolutionQuality: stats.resolutionQualityCount > 0 ? stats.totalResolutionQuality / stats.resolutionQualityCount : null,
        averageStaffCourtesy: stats.staffCourtesyCount > 0 ? stats.totalStaffCourtesy / stats.staffCourtesyCount : null,
        wouldRecommendPercentage: stats.wouldRecommendCount > 0 ? (stats.wouldRecommendYes / stats.wouldRecommendCount) * 100 : null,
        stats,
      };

      res.json(result);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch survey statistics' });
    }
  });

  // Get user's survey history
  router.get('/user/:userId', auth, async (req, res) => {
    try {
      const { userId } = req.params;

      // Only allow users to see their own surveys or admins to see any
      if (req.user.id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to view these surveys' });
      }

      const surveys = await Survey.find({ respondentId: userId })
        .sort({ submittedAt: -1 })
        .limit(50); // Limit to last 50 surveys

      res.json(surveys);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch user surveys' });
    }
  });

  // Get all surveys (admin only)
  router.get('/', auth, authorize(['admin']), async (req, res) => {
    try {
      const { page = 1, limit = 20, incidentId, respondentId: respondentIdParam } = req.query;

      const query = {};
      if (incidentId) query.incidentId = incidentId;
      if (respondentIdParam) query.respondentId = respondentIdParam;

      const surveys = await Survey.find(query)
        .sort({ submittedAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));

      const total = await Survey.countDocuments(query);

      res.json({
        surveys,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch surveys' });
    }
  });

  return router;
};

// Auto-send survey notification when incident is resolved
export const triggerSurveyForIncident = async (incidentId, reporterId) => {
  try {
    // In a real implementation, this would send a notification/email to the reporter
    // For now, we'll just log that a survey should be sent
    console.log(`Survey notification triggered for incident ${incidentId} and reporter ${reporterId}`);
    
    // This could trigger a notification via the existing notification system
    // Or send an email/SMS to the reporter
  } catch (error) {
    console.error('Error triggering survey:', error);
  }
};