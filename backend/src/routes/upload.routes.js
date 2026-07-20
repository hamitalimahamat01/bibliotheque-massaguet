const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth.middleware');
const { uploadBook, handleUploadError } = require('../middlewares/upload.middleware');
const { uploadBookToS3, uploadCoverToS3 } = require('../config/s3');

// Upload d'un fichier unique
router.post(
  '/file',
  authMiddleware,
  uploadBook,
  handleUploadError,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Aucun fichier' });
      }

      const key = await uploadBookToS3(req.file);

      res.json({
        success: true,
        message: 'Fichier uploadé',
        file: {
          key,
          url: `/api/books/${key}`,
          name: req.file.originalname,
          size: req.file.size,
          type: req.file.mimetype,
        },
      });
    } catch (error) {
      console.error('Erreur upload:', error);
      res.status(500).json({ error: 'Erreur lors de l\'upload' });
    }
  }
);

// Upload d'une image (couverture)
router.post(
  '/cover',
  authMiddleware,
  uploadBook,
  handleUploadError,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Aucune image' });
      }

      const key = await uploadCoverToS3(req.file);

      res.json({
        success: true,
        message: 'Image uploadée',
        cover: {
          key,
          url: `/api/books/cover/${key}`,
        },
      });
    } catch (error) {
      console.error('Erreur upload cover:', error);
      res.status(500).json({ error: 'Erreur lors de l\'upload' });
    }
  }
);

module.exports = router;
