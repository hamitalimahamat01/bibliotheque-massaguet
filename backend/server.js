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

// PostgreSQL Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

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
    await pool.query('SELECT 1');
    res.json({ 
      status: 'OK', 
      message: 'API Bibliothèque Massaguet (PostgreSQL)',
      database: '✅ Connecté à Neon'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Erreur de connexion à la base de données'
    });
  }
});

// ===== AUTH ROUTES =====

// Inscription
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Vérifier si l'utilisateur existe
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Créer l'utilisateur
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, 'USER']
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role }, 
      process.env.JWT_SECRET || 'secret', 
      { expiresIn: '7d' }
    );

    res.json({ success: true, token, user });
  } catch (error) {
    console.error('❌ Erreur register:', error);
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
});

// Connexion
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Récupérer l'utilisateur
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const user = result.rows[0];
    
    // Vérifier le mot de passe
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Générer le token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role }, 
      process.env.JWT_SECRET || 'secret', 
      { expiresIn: '7d' }
    );

    // Retourner l'utilisateur sans le mot de passe
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
      'SELECT id, name, email, role, bio, avatar, first_name, last_name, gender, city, birth_date FROM users WHERE id = $1',
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
       RETURNING id, name, email, role, bio, first_name, last_name, gender, city, birth_date`,
      [first_name, last_name, gender, city, birth_date, bio, req.user.id]
    );
    
    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error('❌ Erreur update profile:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});

// ===== DÉMARRAGE =====
// Créer les tables si elles n'existent pas
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
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Tables vérifiées/créées');
  } catch (error) {
    console.error('❌ Erreur création tables:', error);
  }
};

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

initDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur: http://0.0.0.0:${PORT}`);
    console.log('📊 Base de données: PostgreSQL (Neon)');
    console.log('📁 Uploads: ./uploads');
  });
});
