const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

console.log('🚀 Démarrage du serveur...');
console.log('📌 PORT:', PORT);
console.log('📌 DATABASE_URL:', process.env.DATABASE_URL ? '✅ Défini' : '❌ Non défini');

// PostgreSQL Connection
let pool;
try {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  console.log('✅ PostgreSQL configuré');
} catch (error) {
  console.error('❌ Erreur configuration PostgreSQL:', error.message);
}

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// ===== AUTH =====
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

// Health check
app.get('/api/health', async (req, res) => {
  try {
    if (!pool) {
      throw new Error('Pool non initialisé');
    }
    await pool.query('SELECT 1');
    res.json({ 
      status: 'OK', 
      message: 'API Bibliothèque Massaguet (PostgreSQL)',
      database: '✅ Connecté à Neon'
    });
  } catch (error) {
    console.error('❌ Erreur health check:', error.message);
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Erreur de connexion à la base de données',
      error: error.message
    });
  }
});

// ===== AUTH ROUTES =====
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    res.json({ success: true, token, user });
  } catch (error) {
    console.error('❌ Erreur register:', error);
    res.status(500).json({ error: 'Erreur serveur' });
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

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    delete user.password;

    res.json({ success: true, token, user });
  } catch (error) {
    console.error('❌ Erreur login:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/auth/profile', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, bio, documents_count FROM users WHERE id = $1',
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

// ===== STATS =====
app.get('/api/documents/stats', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) as total FROM books');
    res.json({ success: true, stats: { documents: parseInt(result.rows[0].total) || 0 } });
  } catch (error) {
    console.error('❌ Erreur stats:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===== BOOKS =====
app.get('/api/books', async (req, res) => {
  try {
    const { category, search, limit = 12, page = 1 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let query = 'SELECT * FROM books WHERE is_published = 1';
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
    const total = await pool.query('SELECT COUNT(*) as count FROM books WHERE is_published = 1');

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

// ===== DÉMARRAGE =====
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur: http://0.0.0.0:${PORT}`);
  console.log('📊 Base de données: PostgreSQL (Neon)');
  console.log('📁 Uploads: ./uploads');
});

// Gestion des erreurs non capturées
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
});
