const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { generateTokens, verifyRefreshToken } = require('../config/jwt');
const { schemas } = require('../middlewares/validation.middleware');

// ============= INSCRIPTION =============
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.validatedData;

    // Vérifier si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé.' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bio: true,
        avatar: true,
        createdAt: true,
      },
    });

    // Générer les tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Sauvegarder le refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
      },
    });

    res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
};

// ============= CONNEXION =============
exports.login = async (req, res) => {
  try {
    const { email, password } = req.validatedData;

    // Récupérer l'utilisateur avec son mot de passe
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Compte désactivé.' });
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    // Mettre à jour la dernière connexion
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Générer les tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Sauvegarder le refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Retourner l'utilisateur sans le mot de passe
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Connexion réussie',
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
};

// ============= REFRESH TOKEN =============
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token requis' });
    }

    // Vérifier le refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Vérifier dans la base de données
    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        userId: decoded.id,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!storedToken) {
      return res.status(401).json({ error: 'Refresh token invalide ou expiré' });
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bio: true,
        avatar: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Utilisateur introuvable' });
    }

    // Révoquer l'ancien refresh token
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    // Générer de nouveaux tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    // Sauvegarder le nouveau refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    res.json({
      success: true,
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error('Erreur refresh token:', error);
    res.status(401).json({ error: 'Refresh token invalide' });
  }
};

// ============= DÉCONNEXION =============
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: {
          token: refreshToken,
          userId: req.user.id,
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      });
    }

    res.json({
      success: true,
      message: 'Déconnexion réussie',
    });
  } catch (error) {
    console.error('Erreur déconnexion:', error);
    res.status(500).json({ error: 'Erreur lors de la déconnexion' });
  }
};

// ============= PROFIL =============
exports.getProfile = async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, bio } = req.validatedData;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(bio !== undefined && { bio }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bio: true,
        avatar: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      message: 'Profil mis à jour',
      user,
    });
  } catch (error) {
    console.error('Erreur mise à jour profil:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' });
  }
};

// ============= STATISTIQUES =============
exports.getStats = async (req, res) => {
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
    console.error('Erreur statistiques:', error);
    res.status(500).json({ error: 'Erreur lors du chargement des statistiques' });
  }
};
