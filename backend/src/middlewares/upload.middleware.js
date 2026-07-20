const multer = require('multer');
const path = require('path');

const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.ppt', '.pptx'];
const MAX_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024;

// Configuration Multer (mémoire pour S3)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Format de fichier non supporté. Utilisez PDF, DOCX ou PPT.'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_SIZE,
  },
  fileFilter,
});

// Middleware pour les fichiers
const uploadBook = upload.single('file');
const uploadCover = upload.single('cover');

// Middleware pour plusieurs fichiers
const uploadMultiple = upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'cover', maxCount: 1 },
]);

// Gestion d'erreur Multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'FILE_TOO_LARGE') {
      return res.status(400).json({ error: 'Fichier trop volumineux (max 50MB)' });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

module.exports = {
  upload,
  uploadBook,
  uploadCover,
  uploadMultiple,
  handleUploadError,
  ALLOWED_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_SIZE,
};
