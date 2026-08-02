const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const prisma = require('../config/database');

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

// ===== POST /api/books - Upload d'un livre =====
router.post('/', authMiddleware, upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), async (req, res) => {
  const startTime = Date.now();
  try {
    console.log('📤 Upload reçu');
    
    const files = req.files;
    const file = files?.file?.[0] || null;
    const cover = files?.cover?.[0] || null;

    if (!file) {
      return res.status(400).json({ error: 'Aucun fichier' });
    }

    const { title, description, author, category, subCategory, subject, year } = req.body;

    if (!title || !author) {
      return res.status(400).json({ error: 'Titre et auteur requis' });
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const fileTypeMap = {
      '.pdf': 'pdf',
      '.docx': 'docx',
      '.ppt': 'ppt',
      '.pptx': 'ppt'
    };
    const fileType = fileTypeMap[ext] || 'pdf';

    const coverUrl = cover ? `/uploads/${cover.filename}` : null;

    const book = await prisma.book.create({
      data: {
        title,
        description: description || '',
        author,
        category: category || 'general',
        subCategory: subCategory || '',
        subject: subject || '',
        year: year || '',
        fileType,
        fileUrl: `/uploads/${file.filename}`,
        fileKey: file.filename,
        fileName: file.originalname,
        fileSize: file.size,
        coverUrl: coverUrl,
        coverKey: cover ? cover.filename : null,
        uploadedById: req.user.id,
        uploadedByName: req.user.name || 'Anonyme',
      },
    });

    // Incrémenter le compteur de documents
    await prisma.user.update({
      where: { id: req.user.id },
      data: { documentsCount: { increment: 1 } },
    });

    console.log(`✅ Document créé en ${Date.now() - startTime}ms`);
    res.status(201).json({
      success: true,
      message: 'Document partagé avec succès',
      book
    });
  } catch (error) {
    console.error('❌ Erreur create book:', error);
    ['file', 'cover'].forEach(key => {
      if (req.files?.[key]?.[0]?.path) {
        try { fs.unlinkSync(req.files[key][0].path); } catch(e) {}
      }
    });
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===== GET /api/books - Liste des livres =====
router.get('/', async (req, res) => {
  try {
    const { category, search, limit = 12, page = 1, subCategory, subject, year } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {
      isPublished: true,
      ...(category && { category }),
      ...(subCategory && { subCategory }),
      ...(year && { year }),
      ...(subject && { subject: { contains: subject, mode: 'insensitive' } }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { author: { contains: search, mode: 'insensitive' } },
        ]
      }),
    };

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip: offset,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.book.count({ where })
    ]);

    res.json({
      success: true,
      books,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Erreur books:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===== GET /api/books/:id - Détail d'un livre =====
router.get('/:id', async (req, res) => {
  try {
    const book = await prisma.book.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!book) {
      return res.status(404).json({ error: 'Document non trouvé' });
    }

    res.json({ success: true, book });
  } catch (error) {
    console.error('❌ Erreur get book:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===== GET /api/books/:id/download - Téléchargement =====
router.get('/:id/download', async (req, res) => {
  try {
    const book = await prisma.book.findUnique({
      where: { id: parseInt(req.params.id) },
      select: { fileUrl: true, fileName: true }
    });

    if (!book) {
      return res.status(404).json({ error: 'Document non trouvé' });
    }

    const filePath = path.join(__dirname, '../../', book.fileUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Fichier introuvable' });
    }

    await prisma.book.update({
      where: { id: parseInt(req.params.id) },
      data: { downloads: { increment: 1 } },
    });

    res.download(filePath, book.fileName);
  } catch (error) {
    console.error('❌ Erreur download:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
