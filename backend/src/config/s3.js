const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');
const path = require('path');

// Configuration S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.AWS_S3_BUCKET;
const ALLOWED_TYPES = ['pdf', 'docx', 'ppt', 'pptx'];

// Générer un nom unique
const generateKey = (filename) => {
  const ext = path.extname(filename);
  const name = crypto.randomBytes(16).toString('hex');
  return `books/${Date.now()}-${name}${ext}`;
};

// Upload vers S3
const uploadToS3 = async (file, key, contentType) => {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: contentType,
    ACL: 'private',
  });

  await s3Client.send(command);
  return key;
};

// Upload de couverture
const uploadCoverToS3 = async (file) => {
  if (!file) return null;
  const key = `covers/${Date.now()}-${crypto.randomBytes(8).toString('hex')}${path.extname(file.originalname)}`;
  const contentType = file.mimetype || 'image/jpeg';
  await uploadToS3(file, key, contentType);
  return key;
};

// Upload de fichier (livre)
const uploadBookToS3 = async (file) => {
  const key = generateKey(file.originalname);
  const contentType = file.mimetype || 'application/octet-stream';
  await uploadToS3(file, key, contentType);
  return key;
};

// Supprimer un fichier de S3
const deleteFromS3 = async (key) => {
  if (!key) return;
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  await s3Client.send(command);
};

// Générer une URL signée (téléchargement)
const getSignedDownloadUrl = async (key, expiresIn = 3600) => {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  return getSignedUrl(s3Client, command, { expiresIn });
};

// Obtenir l'URL publique (si bucket est public)
const getPublicUrl = (key) => {
  return `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};

module.exports = {
  s3Client,
  BUCKET,
  ALLOWED_TYPES,
  uploadToS3,
  uploadCoverToS3,
  uploadBookToS3,
  deleteFromS3,
  getSignedDownloadUrl,
  getPublicUrl,
};
