const express = require('express');
const router = express.Router();

// Importer les routes
const authRoutes = require('./auth.routes');
const bookRoutes = require('./book.routes');
const categoryRoutes = require('./category.routes');
const userRoutes = require('./user.routes');
const uploadRoutes = require('./upload.routes');

// Utiliser les routes
router.use('/auth', authRoutes);
router.use('/books', bookRoutes);
router.use('/categories', categoryRoutes);
router.use('/users', userRoutes);
router.use('/upload', uploadRoutes);

// Route de test
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API Bibliothèque Massaguet',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
