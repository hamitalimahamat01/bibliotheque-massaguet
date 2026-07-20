const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middlewares/auth.middleware');
const {
  getCategories,
  createCategory,
} = require('../controllers/book.controller');

// Routes publiques
router.get('/', getCategories);

// Routes protégées (admin)
router.post('/', authMiddleware, adminMiddleware, createCategory);

module.exports = router;
