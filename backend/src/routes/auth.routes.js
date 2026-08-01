const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { body, validationResult } = require('express-validator');

// ===== VALIDATION =====
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// ===== INSCRIPTION =====
router.post('/register', [
  body('name').notEmpty().withMessage('Le nom est requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 6 }).withMessage('Mot de passe trop court'),
  validate
], async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    });

    if (existing) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'USER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({ success: true, token, user });
  } catch (error) {
    console.error('❌ Erreur register:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===== CONNEXION =====
router.post('/login', [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Mot de passe requis'),
  validate
], async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    const { password: _, ...userData } = user;
    res.json({ success: true, token, user: userData });
  } catch (error) {
    console.error('❌ Erreur login:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===== PROFIL =====
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bio: true,
        avatar: true,
        firstName: true,
        lastName: true,
        gender: true,
        city: true,
        birthDate: true,
        documentsCount: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('❌ Erreur profile:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===== METTRE À JOUR LE PROFIL =====
router.put('/profile', authMiddleware, [
  body('firstName').optional().isString(),
  body('lastName').optional().isString(),
  body('gender').optional().isIn(['M', 'F', 'A']),
  body('city').optional().isString(),
  body('birthDate').optional().isString(),
  body('bio').optional().isString(),
  validate
], async (req, res) => {
  try {
    const { firstName, lastName, gender, city, birthDate, bio } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        firstName,
        lastName,
        gender,
        city,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        bio,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bio: true,
        avatar: true,
        firstName: true,
        lastName: true,
        gender: true,
        city: true,
        birthDate: true,
        documentsCount: true,
      },
    });

    res.json({ success: true, user });
  } catch (error) {
    console.error('❌ Erreur update profile:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===== STATISTIQUES =====
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const [totalUsers, totalBooks, totalDownloads] = await Promise.all([
      prisma.user.count(),
      prisma.book.count({ where: { isPublished: true } }),
      prisma.download.count(),
    ]);

    const topBooks = await prisma.book.findMany({
      where: { isPublished: true },
      orderBy: { downloads: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        author: true,
        downloads: true,
        views: true,
      },
    });

    res.json({
      success: true,
      stats: {
        users: totalUsers,
        books: totalBooks,
        downloads: totalDownloads,
        topBooks,
      },
    });
  } catch (error) {
    console.error('❌ Erreur stats:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===== DÉCONNEXION =====
router.post('/logout', authMiddleware, async (req, res) => {
  res.json({ success: true, message: 'Déconnexion réussie' });
});

module.exports = router;
