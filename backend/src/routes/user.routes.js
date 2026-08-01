const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middlewares/auth.middleware');
const prisma = require('../config/database');

// ===== GET ALL USERS =====
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  const startTime = Date.now();
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bio: true,
        avatar: true,
        isActive: true,
        documentsCount: true,
        createdAt: true,
        lastLogin: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`👥 ${users.length} utilisateurs chargés en ${Date.now() - startTime}ms`);
    res.json({ success: true, users });
  } catch (error) {
    console.error('❌ Erreur users:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===== GET USER BY ID =====
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bio: true,
        avatar: true,
        documentsCount: true,
        createdAt: true,
        _count: {
          select: {
            books: true,
            downloads: true,
            favorites: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('❌ Erreur get user:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===== TOGGLE USER STATUS =====
router.patch('/:id/toggle', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: { isActive: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const updated = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
      },
    });

    res.json({
      success: true,
      message: updated.isActive ? 'Utilisateur activé' : 'Utilisateur désactivé',
      user: updated,
    });
  } catch (error) {
    console.error('❌ Erreur toggle user:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
