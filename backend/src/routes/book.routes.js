const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const prisma = require('../config/database');
const { authMiddleware } = require('../middlewares/auth.middleware');

// ===== CONFIGURATION MULTER =====
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

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// ===== GET BOOKS (avec cache) =====
router.get('/', async (req, res) => {
  const startTime = Date.now();
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
        select: {
          id: true,
          title: true,
          description: true,
          author: true,
          category: true,
          subCategory: true,
          subject: true,
          fileType: true,
          fileUrl: true,
          coverUrl: true,
          downloads: true,
          views: true,
          createdAt: true,
          year: true,
          uploadedBy: {
            select: { id: true, name: true }
          }
        }
      }),
      prisma.book.count({ where })
    ]);

    console.log(`📚 ${books.length} livres chargés en ${Date.now() - startTime}ms`);
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

// ===== GET BOOK BY ID =====
router.get('/:id', async (req, res) => {
  const startTime = Date.now();
  try {
    const book = await prisma.book.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true },
        },
        reviews: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { downloadsHistory: true, favorites: true },
        },
      },
    });

    if (!book) {
      return res.status(404).json({ error: 'Document non trouvé' });
    }

    // Incrémenter les vues
    await prisma.book.update({
      where: { id: book.id },
      data: { views: { increment: 1 } },
    });

    console.log(`📖 Livre ${book.id} chargé en ${Date.now() - startTime}ms`);
    res.json({ success: true, book });
  } catch (error) {
    console.error('❌ Erreur get book:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===== CREATE BOOK =====
router.post('/', authMiddleware, upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), [
  body('title').notEmpty().withMessage('Le titre est requis'),
  body('author').notEmpty().withMessage('L\'auteur est requis'),
  validate
], async (req, res) => {
  const startTime = Date.now();
  try {
    const files = req.files;
    const file = files?.file?.[0] || null;
    const cover = files?.cover?.[0] || null;

    if (!file) {
      return res.status(400).json({ error: 'Aucun fichier' });
    }

    const { title, description, author, category, subCategory, subject, year } = req.body;

    // Déterminer le type de fichier
    const ext = path.extname(file.originalname).toLowerCase();
    const fileTypeMap = { '.pdf': 'pdf', '.docx': 'docx', '.ppt': 'ppt', '.pptx': 'ppt' };
    const fileType = fileTypeMap[ext] || 'pdf';

    // Créer le livre
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
        coverUrl: cover ? `/uploads/${cover.filename}` : null,
        coverKey: cover ? cover.filename : null,
        uploadedById: req.user.id,
        uploadedByName: req.user.name || 'Anonyme',
      },
      select: {
        id: true,
        title: true,
        author: true,
        fileUrl: true,
        coverUrl: true,
        createdAt: true,
      }
    });

    // Incrémenter le compteur de documents de l'utilisateur
    await prisma.user.update({
      where: { id: req.user.id },
      data: { documentsCount: { increment: 1 } },
    });

    console.log(`✅ Document ${book.id} créé en ${Date.now() - startTime}ms`);
    res.status(201).json({
      success: true,
      message: 'Document partagé avec succès',
      book
    });
  } catch (error) {
    console.error('❌ Erreur create book:', error);
    // Nettoyer les fichiers
    ['file', 'cover'].forEach(key => {
      if (req.files?.[key]?.[0]?.path) {
        try { fs.unlinkSync(req.files[key][0].path); } catch(e) {}
      }
    });
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===== DOWNLOAD BOOK =====
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

    // Incrémenter les téléchargements
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

// ===== DELETE BOOK =====
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const book = await prisma.book.findUnique({
      where: { id: parseInt(req.params.id) },
      select: { uploadedById: true, fileKey: true, coverKey: true, fileUrl: true, coverUrl: true }
    });

    if (!book) {
      return res.status(404).json({ error: 'Document non trouvé' });
    }

    if (book.uploadedById !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    // Supprimer les fichiers
    ['fileUrl', 'coverUrl'].forEach(key => {
      if (book[key]) {
        const filePath = path.join(__dirname, '../../', book[key]);
        if (fs.existsSync(filePath)) {
          try { fs.unlinkSync(filePath); } catch(e) {}
        }
      }
    });

    await prisma.book.delete({ where: { id: parseInt(req.params.id) } });

    // Décrémenter le compteur de documents
    await prisma.user.update({
      where: { id: req.user.id },
      data: { documentsCount: { decrement: 1 } },
    });

    res.json({ success: true, message: 'Document supprimé' });
  } catch (error) {
    console.error('❌ Erreur delete:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===== UPDATE BOOK =====
router.put('/:id', authMiddleware, [
  body('title').optional().isString(),
  body('description').optional().isString(),
  body('author').optional().isString(),
  body('category').optional().isString(),
  body('subCategory').optional().isString(),
  body('subject').optional().isString(),
  body('year').optional().isString(),
  body('isPublished').optional().isBoolean(),
  validate
], async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, author, category, subCategory, subject, year, isPublished } = req.body;

    const book = await prisma.book.findUnique({
      where: { id: parseInt(id) },
      select: { uploadedById: true }
    });

    if (!book) {
      return res.status(404).json({ error: 'Document non trouvé' });
    }

    if (book.uploadedById !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    const updated = await prisma.book.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        author,
        category,
        subCategory,
        subject,
        year,
        isPublished,
      },
      select: {
        id: true,
        title: true,
        description: true,
        author: true,
        category: true,
        year: true,
        isPublished: true,
      }
    });

    res.json({ success: true, message: 'Document mis à jour', book: updated });
  } catch (error) {
    console.error('❌ Erreur update:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
