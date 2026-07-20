const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware de sécurité
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api', limiter);

app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Base de données SQLite
const db = new sqlite3.Database('./bibliotheque.db');

// Créer les tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      bio TEXT,
      documents_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      author TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      sub_category TEXT DEFAULT '',
      subject TEXT,
      file_type TEXT NOT NULL,
      file_url TEXT NOT NULL,
      file_key TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      cover_url TEXT,
      cover_key TEXT,
      year TEXT,
      downloads INTEGER DEFAULT 0,
      views INTEGER DEFAULT 0,
      uploaded_by INTEGER REFERENCES users(id),
      uploaded_by_name TEXT,
      is_published INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Tables SQLite créées');
});

// ===================== MIDDLEWARE AUTH =====================

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token manquant' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Token invalide' });
  }
};

// ===================== ROUTES =====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API Bibliothèque Massaguet (SQLite)' });
});

// ===== AUTH =====

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existing = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });

    if (existing) {
      return res.status(400).json({ error: 'Email déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name, email, hashedPassword],
        function(err) {
          if (err) reject(err);
          resolve(this.lastID);
        }
      );
    });

    const token = jwt.sign({ id: result, email }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    res.json({
      success: true,
      token,
      user: { id: result, name, email }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });

    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    delete user.password;
    res.json({ success: true, token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/auth/profile', auth, (req, res) => {
  db.get('SELECT id, name, email, role, bio, documents_count FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) return res.status(500).json({ error: 'Erreur' });
    res.json({ success: true, user });
  });
});

// ===== STATS =====

app.get('/api/documents/stats', (req, res) => {
  db.get('SELECT COUNT(*) as total FROM books', (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur' });
    res.json({ success: true, stats: { documents: result.total || 0 } });
  });
});

// ===== BOOKS =====

app.get('/api/books', (req, res) => {
  const { category, search, limit = 12, page = 1 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  let query = 'SELECT * FROM books WHERE is_published = 1';
  const params = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  if (search) {
    query += ' AND (title LIKE ? OR author LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  db.all(query, params, (err, books) => {
    if (err) return res.status(500).json({ error: 'Erreur' });
    
    db.get('SELECT COUNT(*) as count FROM books WHERE is_published = 1', (err, total) => {
      res.json({
        success: true,
        books,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total.count,
          pages: Math.ceil(total.count / parseInt(limit))
        }
      });
    });
  });
});

// ===== DÉMARRAGE =====

// Créer le dossier uploads
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

app.listen(PORT, () => {
  console.log(`🚀 Serveur: http://localhost:${PORT}`);
  console.log('📁 Base de données: SQLite (bibliotheque.db)');
  console.log('📁 Uploads: ./uploads');
});
