import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';

const uploadRoot = path.resolve('uploads', 'recipes');
fs.mkdirSync(uploadRoot, { recursive: true });

const allowedTypes = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
]);

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadRoot);
  },
  filename: (_req, file, callback) => {
    const extension = allowedTypes.get(file.mimetype) || path.extname(file.originalname).toLowerCase();
    callback(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedTypes.has(file.mimetype)) {
      callback(new Error('Only JPG, PNG and WebP images are supported.'));
      return;
    }

    callback(null, true);
  },
});

export const uploadRoutes = express.Router();

uploadRoutes.post('/recipe-image', requireAuth, (req, res, next) => {
  upload.single('photo')(req, res, (error) => {
    if (error) {
      const message = error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE'
        ? 'Recipe photo must be 5 MB or smaller.'
        : error.message || 'Could not upload the recipe photo.';
      return res.status(400).json({ message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please choose a recipe photo to upload.' });
    }

    res.status(201).json({
      url: `/uploads/recipes/${req.file.filename}`,
    });
  });
});
