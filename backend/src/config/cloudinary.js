const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

console.log('📦 Chargement de cloudinary.js');
console.log('☁️ Cloudinary cloud_name:', process.env.CLOUDINARY_CLOUD_NAME);

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Vérifier la configuration
console.log('☁️ Cloudinary configuré avec:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? '✅' : '❌',
  api_key: process.env.CLOUDINARY_API_KEY ? '✅' : '❌',
  api_secret: process.env.CLOUDINARY_API_SECRET ? '✅' : '❌',
});

// 🔥 Storage pour Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const ext = file.originalname.split('.').pop().toLowerCase();
    const documentTypes = ['pdf', 'docx', 'doc', 'ppt', 'pptx', 'xls', 'xlsx'];
    const imageTypes = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];
    
    // 🔥 Pour les images de couverture
    if (file.fieldname === 'cover') {
      return {
        folder: 'bibliotheque/covers',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        resource_type: 'image',
        transformation: [
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
          { width: 800, height: 1200, crop: 'limit' }
        ]
      };
    }
    
    // 🔥 Pour les documents (PDF, DOCX, PPT) - STOCKER EN RAW
    if (documentTypes.includes(ext)) {
      return {
        folder: 'bibliotheque/documents',
        allowed_formats: ['pdf', 'docx', 'doc', 'ppt', 'pptx'],
        resource_type: 'raw', // 🔥 IMPORTANT: 'raw' pour les fichiers non-images
        format: ext,
      };
    }
    
    // 🔥 Fallback pour les images
    return {
      folder: 'bibliotheque/images',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      resource_type: 'image',
    };
  }
});

console.log('✅ Cloudinary storage créé');

module.exports = {
  cloudinary,
  storage,
};
