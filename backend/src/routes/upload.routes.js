const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.docx', '.ppt', '.pptx', '.jpg', '.jpeg', '.png', '.webp'];
    cb(null, allowed.includes(path.extname(file.originalname).toLowerCase()));
  }
});

// ===== UPLOAD FILE =====
router.post('/file', authMiddleware, upload.single('file'), async (req, res) => {
  const startTime = Date.now();
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier' });
    }

    console.log(`📤 Fichier uploadé en ${Date.now() - startTime}ms`);
    res.json({
      success: true,
      message: 'Fichier uploadé',
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        path: `/uploads/${req.file.filename}`,
      },
    });
  } catch (error) {
    console.error('❌ Erreur upload:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===== UPLOAD COVER =====
router.post('/cover', authMiddleware, upload.single('cover'), async (req, res) => {
  const startTime = Date.now();
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucune image' });
    }

    console.log(`🖼️ Couverture uploadée en ${Date.now() - startTime}ms`);
    res.json({
      success: true,
      message: 'Image uploadée',
      cover: {
        filename: req.file.filename,
        path: `/uploads/${req.file.filename}`,
      },
    });
  } catch (error) {
    console.error('❌ Erreur upload cover:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
