const express = require('express');
const router = express.Router();
const { validate, schemas } = require('../middlewares/validation.middleware');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth.middleware');
const { uploadMultiple, handleUploadError } = require('../middlewares/upload.middleware');
const {
  createBook,
  getBooks,
  getBookById,
  downloadBook,
  updateBook,
  deleteBook,
  toggleFavorite,
  addReview,
} = require('../controllers/book.controller');

// Routes publiques
router.get('/', getBooks);
router.get('/:id', getBookById);
router.get('/:id/download', downloadBook);

// Routes protégées
router.post(
  '/',
  authMiddleware,
  uploadMultiple,
  handleUploadError,
  validate(schemas.createBook),
  createBook
);

router.put(
  '/:id',
  authMiddleware,
  validate(schemas.updateBook),
  updateBook
);

router.delete('/:id', authMiddleware, deleteBook);

// Favoris
router.post('/:id/favorite', authMiddleware, toggleFavorite);

// Reviews
router.post(
  '/:id/review',
  authMiddleware,
  validate(schemas.review),
  addReview
);

module.exports = router;
