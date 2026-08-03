const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage pour Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bibliotheque',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'docx', 'ppt', 'pptx'],
    resource_type: 'auto',
  },
});

module.exports = {
  cloudinary,
  storage,
};
