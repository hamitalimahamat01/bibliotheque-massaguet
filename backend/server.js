const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

console.log('🚀 Démarrage du serveur...');

// ===== CONFIGURATION MULTER =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExts = ['.pdf', '.docx', '.ppt', '.pptx', '.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  cb(null, allowedExts.includes(ext));
};

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter
});

// ===== POSTGRESQL =====
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// ===== CORS =====
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://bibliotheque-frontend-ec0x.onrender.com',
    'https://bibliotheque-frontend.onrender.com'
  ],
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

// ===== HEALTH =====
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API Bibliothèque Massaguet' });
});

// ===== AUTH =====

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log('📝 Inscription:', email);

    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, 'USER']
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({ success: true, token, user });
  } catch (error) {
    console.error('❌ Erreur register:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 Connexion:', email);

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    delete user.password;
    res.json({ success: true, token, user });
  } catch (error) {
    console.error('❌ Erreur login:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Profile
app.get('/api/auth/profile', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, bio, avatar, first_name, last_name, gender, city, birth_date, documents_count FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error('❌ Erreur profile:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Update Profile
app.put('/api/auth/profile', auth, async (req, res) => {
  try {
    const { first_name, last_name, gender, city, birth_date, bio } = req.body;
    const result = await pool.query(
      `UPDATE users 
       SET first_name = $1, last_name = $2, gender = $3, city = $4, birth_date = $5, bio = $6
       WHERE id = $7 
       RETURNING id, name, email, role, bio, first_name, last_name, gender, city, birth_date, documents_count`,
      [first_name, last_name, gender, city, birth_date, bio, req.user.id]
    );
    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error('❌ Erreur update profile:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===== BOOKS =====

// Upload
app.post('/api/books', auth, upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), async (req, res) => {
  try {
    const files = req.files;
    const file = files?.file?.[0] || null;
    const cover = files?.cover?.[0] || null;

    if (!file) {
      return res.status(400).json({ error: 'Aucun fichier' });
    }

    const { title, description, author, category, subCategory, subject, year } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Le titre est requis' });
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const fileTypeMap = {
      '.pdf': 'pdf',
      '.docx': 'docx',
      '.ppt': 'ppt',
      '.pptx': 'ppt'
    };
    const fileType = fileTypeMap[ext] || 'pdf';

    const coverUrl = cover ? `/uploads/${cover.filename}` : null;

    const result = await pool.query(
      `INSERT INTO books 
       (title, description, author, category, sub_category, subject, 
        file_type, file_url, file_key, file_name, file_size, cover_url, 
        uploaded_by, uploaded_by_name, year)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING id, title, author, file_url, cover_url`,
      [
        title, description || '', author || 'Anonyme', category || 'general', 
        subCategory || '', subject || '',
        fileType, `/uploads/${file.filename}`, file.filename,
        file.originalname, file.size,
        coverUrl, req.user.id, req.user.name || 'Anonyme', year || ''
      ]
    );

    await pool.query('UPDATE users SET documents_count = documents_count + 1 WHERE id = $1', [req.user.id]);

    res.status(201).json({
      success: true,
      message: 'Document partagé avec succès',
      book: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Erreur upload:', error);
    if (req.files) {
      ['file', 'cover'].forEach(key => {
        if (req.files[key]?.[0]?.path && fs.existsSync(req.files[key][0].path)) {
          try { fs.unlinkSync(req.files[key][0].path); } catch(e) {}
        }
      });
    }
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get all books - CORRIGÉ
app.get('/api/books', async (req, res) => {
  try {
    const { category, search, limit = 12, page = 1 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let query = 'SELECT * FROM books WHERE is_published = true';  // ← CORRECTION: true au lieu de 1
    const params = [];
    let paramCount = 1;

    if (category) {
      query += ` AND category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (search) {
      query += ` AND (title ILIKE $${paramCount} OR author ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit), offset);

    const books = await pool.query(query, params);
    const total = await pool.query('SELECT COUNT(*) as count FROM books WHERE is_published = true');

    res.json({
      success: true,
      books: books.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total.rows[0].count),
        pages: Math.ceil(parseInt(total.rows[0].count) / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Erreur books:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get book by ID
app.get('/api/books/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM books WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document non trouvé' });
    }
    res.json({ success: true, book: result.rows[0] });
  } catch (error) {
    console.error('❌ Erreur get book:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Download book
app.get('/api/books/:id/download', async (req, res) => {
  try {
    const result = await pool.query('SELECT file_url, file_name FROM books WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document non trouvé' });
    }

    const filePath = path.join(__dirname, result.rows[0].file_url);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Fichier introuvable' });
    }

    await pool.query('UPDATE books SET downloads = downloads + 1 WHERE id = $1', [req.params.id]);
    res.download(filePath, result.rows[0].file_name);
  } catch (error) {
    console.error('❌ Erreur download:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===== CATEGORIES =====
app.get('/api/categories', (req, res) => {
  const categories = [
    { id: '1', name: 'Mathématiques' },
    { id: '2', name: 'Physique' },
    { id: '3', name: 'Chimie' },
    { id: '4', name: 'Anglais' },
    { id: '5', name: 'Philosophie' },
    { id: '6', name: 'Histoire' },
  ];
  res.json({ success: true, categories });
});

// ===== INIT DB =====
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
    console.log('✅ Table users prête');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS books (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        author VARCHAR(100) DEFAULT 'Anonyme',
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
    console.log('✅ Table books prête');
  } catch (error) {
    console.error('❌ Erreur init DB:', error);
  }
};

// ===== START =====
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads', { recursive: true });
}

initDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur: http://0.0.0.0:${PORT}`);
    console.log('📊 Base de données: PostgreSQL (Neon)');
  });
});
