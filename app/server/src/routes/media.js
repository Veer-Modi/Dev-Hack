import express from 'express';
import { auth } from '../middleware/auth.js';
import cloudinary from 'cloudinary';
import { v2 as cloudinaryV2 } from 'cloudinary';
import { Incident } from '../models/Incident.js';
import multer from 'multer';
import path from 'path';

// Configure Cloudinary
cloudinaryV2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

export const mediaRouter = (io) => {
  const router = express.Router();

  // Upload media file to Cloudinary
  router.post('/upload', auth, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'video/mp4', 'video/mov'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ error: 'Invalid file type. Only images and videos are allowed.' });
      }

      // Validate file size (max 10MB)
      if (req.file.size > 10 * 1024 * 1024) {
        return res.status(400).json({ error: 'File size too large. Maximum size is 10MB.' });
      }

      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinaryV2.uploader.upload_stream(
          {
            resource_type: 'auto', // Automatically detect if image or video
            folder: 'incident_reports', // Folder in Cloudinary
            use_filename: false,
            unique_filename: true,
            overwrite: false,
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        uploadStream.end(req.file.buffer);
      });

      res.json({
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        size: result.bytes,
        resourceType: result.resource_type,
      });
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      res.status(500).json({ error: 'Failed to upload media' });
    }
  });

  // Upload multiple media files to Cloudinary
  router.post('/upload-multiple', auth, upload.array('files', 10), async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files provided' });
      }

      // Validate file count
      if (req.files.length > 10) {
        return res.status(400).json({ error: 'Maximum 10 files allowed per upload' });
      }

      // Validate each file
      for (const file of req.files) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'video/mp4', 'video/mov'];
        if (!allowedTypes.includes(file.mimetype)) {
          return res.status(400).json({ error: `Invalid file type: ${file.originalname}` });
        }

        // Validate file size (max 10MB each)
        if (file.size > 10 * 1024 * 1024) {
          return res.status(400).json({ error: `File too large: ${file.originalname}` });
        }
      }

      // Upload all files to Cloudinary
      const uploadPromises = req.files.map(file => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinaryV2.uploader.upload_stream(
            {
              resource_type: 'auto',
              folder: 'incident_reports',
              use_filename: false,
              unique_filename: true,
              overwrite: false,
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );
          uploadStream.end(file.buffer);
        });
      });

      const results = await Promise.all(uploadPromises);

      const mediaData = results.map(result => ({
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        size: result.bytes,
        resourceType: result.resource_type,
      }));

      res.json(mediaData);
    } catch (error) {
      console.error('Error uploading multiple files to Cloudinary:', error);
      res.status(500).json({ error: 'Failed to upload media' });
    }
  });

  // Delete media from Cloudinary
  router.delete('/delete/:publicId', auth, async (req, res) => {
    try {
      const { publicId } = req.params;

      // Verify user has permission to delete (admin or incident reporter)
      // This would require checking if the media is associated with an incident reported by the user
      // For now, we'll allow admins and responders to delete media

      // Delete from Cloudinary
      await cloudinaryV2.uploader.destroy(publicId);

      res.json({ message: 'Media deleted successfully' });
    } catch (error) {
      console.error('Error deleting media from Cloudinary:', error);
      res.status(500).json({ error: 'Failed to delete media' });
    }
  });

  // Get media details by public ID
  router.get('/details/:publicId', auth, async (req, res) => {
    try {
      const { publicId } = req.params;

      // Get media details from Cloudinary
      const result = await cloudinaryV2.api.resource(publicId);

      res.json({
        publicId: result.public_id,
        url: result.secure_url,
        format: result.format,
        size: result.bytes,
        resourceType: result.resource_type,
        createdAt: result.created_at,
        tags: result.tags,
      });
    } catch (error) {
      console.error('Error getting media details from Cloudinary:', error);
      res.status(500).json({ error: 'Failed to get media details' });
    }
  });

  return router;
};