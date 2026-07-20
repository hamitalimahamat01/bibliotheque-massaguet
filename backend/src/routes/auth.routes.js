const express = require('express');
const router = express.Router();
const { validate, schemas } = require('../middlewares/validation.middleware');
const { authMiddleware } = require('../middlewares/auth.middleware');
const {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  getStats,
} = require('../controllers/auth.controller');

// Routes publiques
router.post('/register', validate(schemas.register), register);
router.post('/login', validate(schemas.login), login);
router.post('/refresh', refreshToken);

// Routes protégées
router.post('/logout', authMiddleware, logout);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, validate(schemas.updateProfile), updateProfile);
router.get('/stats', authMiddleware, getStats);

module.exports = router;
