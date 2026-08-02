const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Importer les routes
const authRoutes = require('./src/routes/auth.routes');
const bookRoutes = require('./src/routes/book.routes');
const categoryRoutes = require('./src/routes/category.routes');
const userRoutes = require('./src/routes/user.routes');
const uploadRoutes = require('./src/routes/upload.routes');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

console.log('🚀 Démarrage du serveur...');

// PostgreSQL Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Configuration CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://bibliotheque-frontend-ec0x.onrender.com',
  'https://bibliotheque-frontend.onrender.com',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ Origine bloquée par CORS:', origin);
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static('uploads'));

// ===== AUTH MIDDLEWARE =====
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token invalide' });
  }
};

// ===== ROUTES =====
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);

// ===== HEALTH CHECK =====
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API Bibliothèque Massaguet (PostgreSQL)' });
});

// ===== INIT =====
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'USER',
        bio TEXT,
        avatar TEXT,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        gender VARCHAR(20),
        city VARCHAR(100),
        birth_date DATE,
        is_active BOOLEAN DEFAULT TRUE,
        documents_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        last_login TIMESTAMP
      )
    `);
    console.log('✅ Table users vérifiée');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS books (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        author VARCHAR(100) NOT NULL,
        category VARCHAR(20) DEFAULT 'general',
        sub_category VARCHAR(20) DEFAULT '',
        subject VARCHAR(100),
        file_type VARCHAR(10) NOT NULL,
        file_url VARCHAR(500) NOT NULL,
        file_key VARCHAR(500) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_size INTEGER NOT NULL,
        cover_url VARCHAR(500),
        cover_key VARCHAR(500),
        year VARCHAR(20),
        downloads INTEGER DEFAULT 0,
        views INTEGER DEFAULT 0,
        uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        uploaded_by_name VARCHAR(100),
        is_published BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Table books vérifiée');
  } catch (error) {
    console.error('❌ Erreur création tables:', error);
  }
};

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads', { recursive: true });
}

initDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur: http://0.0.0.0:${PORT}`);
    console.log('📊 Base de données: PostgreSQL (Neon)');
    console.log('📁 Uploads: ./uploads');
  });
});
