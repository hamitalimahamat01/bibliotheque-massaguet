const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middlewares/auth.middleware');
const prisma = require('../config/database');

// ===== GET CATEGORIES =====
router.get('/', async (req, res) => {
  const startTime = Date.now();
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        icon: true,
        color: true,
        _count: {
          select: { books: true }
        }
      }
    });

    console.log(`📂 ${categories.length} catégories chargées en ${Date.now() - startTime}ms`);
    res.json({ success: true, categories });
  } catch (error) {
    console.error('❌ Erreur categories:', error);
    // Fallback: catégories statiques
    res.json({
      success: true,
      categories: [
        { id: '1', name: 'Mathématiques', _count: { books: 0 } },
        { id: '2', name: 'Physique', _count: { books: 0 } },
        { id: '3', name: 'Chimie', _count: { books: 0 } },
        { id: '4', name: 'Anglais', _count: { books: 0 } },
        { id: '5', name: 'Philosophie', _count: { books: 0 } },
        { id: '6', name: 'Histoire', _count: { books: 0 } },
      ]
    });
  }
});

// ===== CREATE CATEGORY =====
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, slug, description, icon, color } = req.body;

    const category = await prisma.category.create({
      data: {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        description,
        icon,
        color,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Catégorie créée',
      category
    });
  } catch (error) {
    console.error('❌ Erreur create category:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
