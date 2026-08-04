const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// CHARGER DOTENV EN PREMIER
dotenv.config();

// MAINTENANT charger Cloudinary
const { storage } = require('./src/config/cloudinary');

const app = express();
const PORT = process.env.PORT || 5000;

console.log('🚀 Démarrage du serveur...');

// PostgreSQL Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ===== MIDDLEWARE =====
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://bibliotheque-frontend-ec0x.onrender.com',
    'https://bibliotheque-frontend.onrender.com',
    '*'
  ],
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ===== SERVRIR LES FICHIERS STATIQUES (LOCAL) =====
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===== CONFIGURATION MULTER AVEC CLOUDINARY =====
const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 50 * 1024 * 1024,
    files: 2
  },
});

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

// ===== HEALTH CHECK =====
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      status: 'OK', 
      message: 'API Bibliothèque Massaguet (PostgreSQL + Cloudinary)',
      database: '✅ Connecté à Neon',
      storage: '✅ Cloudinary'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Erreur de connexion à la base de données'
    });
  }
});

// ===== AUTH ROUTES =====
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
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
    res.json({ success: true, token, user });
  } catch (error) {
    console.error('❌ Erreur register:', error);
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
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
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

// ===== BOOKS ROUTES =====
app.post('/api/books', auth, upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('📤 Upload reçu');
    
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

    // URL Cloudinary
    const fileUrl = file.path;
    const coverUrl = cover ? cover.path : null;

    console.log('📄 Fichier Cloudinary URL:', fileUrl);
    console.log('🖼️ Couverture Cloudinary URL:', coverUrl);

    const ext = path.extname(file.originalname).toLowerCase();
    const fileTypeMap = {
      '.pdf': 'pdf',
      '.docx': 'docx',
      '.ppt': 'ppt',
      '.pptx': 'ppt'
    };
    const fileType = fileTypeMap[ext] || 'pdf';

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
        fileType, fileUrl, file.filename,
        file.originalname, file.size,
        coverUrl, req.user.id, req.user.name || 'Anonyme', year || ''
      ]
    );

    await pool.query('UPDATE users SET documents_count = documents_count + 1 WHERE id = $1', [req.user.id]);

    console.log('✅ Document créé avec Cloudinary:', result.rows[0].id);
    res.status(201).json({
      success: true,
      message: 'Document partagé avec succès',
      book: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Erreur upload:', error);
    res.status(500).json({ error: 'Erreur serveur: ' + error.message });
  }
});

app.get('/api/books', async (req, res) => {
  try {
    const { category, search, limit = 12, page = 1, subCategory } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let query = 'SELECT * FROM books';
    const params = [];
    let paramCount = 1;
    const conditions = [];

    if (category) {
      conditions.push(`category = $${paramCount}`);
      params.push(category);
      paramCount++;
    }

    if (subCategory) {
      conditions.push(`sub_category = $${paramCount}`);
      params.push(subCategory);
      paramCount++;
    }

    if (search) {
      conditions.push(`(title ILIKE $${paramCount} OR author ILIKE $${paramCount})`);
      params.push(`%${search}%`);
      paramCount++;
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit), offset);

    const books = await pool.query(query, params);
    const total = await pool.query('SELECT COUNT(*) as count FROM books');

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

// 🔥 Téléchargement avec headers pour forcer le téléchargement
app.get('/api/books/:id/download', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT file_url, file_name, file_type FROM books WHERE id = $1',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document non trouvé' });
    }

    const book = result.rows[0];
    console.log('📥 Téléchargement:', book.file_name);

    // Si c'est une URL Cloudinary (commence par http)
    if (book.file_url && book.file_url.startsWith('http')) {
      // Rediriger vers Cloudinary avec headers de téléchargement
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(book.file_name)}"`);
      return res.redirect(302, book.file_url);
    }

    // Si c'est un fichier local
    const filePath = path.join(__dirname, book.file_url);
    if (!fs.existsSync(filePath)) {
      console.error('❌ Fichier introuvable:', filePath);
      return res.status(404).json({ error: 'Fichier introuvable' });
    }

    // 🔥 Forcer le téléchargement avec les bons headers
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(book.file_name)}"`);
    res.setHeader('Content-Length', fs.statSync(filePath).size);
    res.setHeader('Cache-Control', 'no-cache');
    
    // Incrémenter les téléchargements
    await pool.query('UPDATE books SET downloads = downloads + 1 WHERE id = $1', [req.params.id]);
    
    // Envoyer le fichier
    res.download(filePath, book.file_name, (err) => {
      if (err) {
        console.error('❌ Erreur download:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Erreur lors du téléchargement' });
        }
      }
    });
  } catch (error) {
    console.error('❌ Erreur download:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===== CATEGORIES =====
app.get('/api/categories', (req, res) => {
  res.json({
    success: true,
    categories: [
      { id: '1', name: 'Mathématiques' },
      { id: '2', name: 'Physique' },
      { id: '3', name: 'Chimie' },
      { id: '4', name: 'Anglais' },
      { id: '5', name: 'Philosophie' },
      { id: '6', name: 'Histoire' },
    ]
  });
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
// Créer le dossier uploads
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads', { recursive: true });
}

initDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur: http://0.0.0.0:${PORT}`);
    console.log('📊 Base de données: PostgreSQL (Neon)');
    console.log('☁️  Stockage: Cloudinary');
  });
});
