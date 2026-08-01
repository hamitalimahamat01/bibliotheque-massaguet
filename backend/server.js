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

// PostgreSQL Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// ===== CONFIGURATION CORS CORRECTE =====
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://bibliotheque-frontend-ec0x.onrender.com',
  'https://bibliotheque-frontend.onrender.com',
];

app.use(cors({
  origin: function (origin, callback) {
    // Permettre les requêtes sans origine (comme les apps mobiles ou curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ Origine bloquée par CORS:', origin);
      callback(null, true); // En développement, on autorise tout
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));

// Middleware
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

// ===== HEALTH CHECK =====
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API Bibliothèque Massaguet (PostgreSQL)' });
});

// ===== AUTH ROUTES =====

// Inscription
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
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
});

// Connexion
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 Tentative de connexion:', email);

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
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

// Profil
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

// Mettre à jour le profil
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
