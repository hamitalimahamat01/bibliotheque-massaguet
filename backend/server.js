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
  ssl: { rejectUnauthorized: false }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Configuration Multer
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
  const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'image/jpeg', 'image/png', 'image/webp'];
  const allowedExts = ['.pdf', '.docx', '.ppt', '.pptx', '.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(file.mimetype) || allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Format de fichier non supporté'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter
});

// ===== AUTH MIDDLEWARE =====
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

// ===== HEALTH CHECK =====
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
      { id: user.id, email: user.email, role: user.role }, 
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

// ===== DOCUMENTS ROUTES =====

// Upload d'un document (avec couverture)
app.post('/api/books', auth, upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), async (req, res) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const file = files.file?.[0];
    const cover = files.cover?.[0];

    if (!file) {
      return res.status(400).json({ error: 'Aucun fichier téléchargé' });
    }

    const { title, description, author, category, subCategory, subject, year } = req.body;

    // Déterminer le type de fichier
    const ext = path.extname(file.originalname).toLowerCase();
    const fileTypeMap = {
      '.pdf': 'pdf',
      '.docx': 'docx',
      '.ppt': 'ppt',
      '.pptx': 'ppt'
    };
    const fileType = fileTypeMap[ext] || 'pdf';

    // URL de la couverture
    const coverUrl = cover ? `/uploads/${cover.filename}` : null;
    const coverKey = cover ? cover.filename : null;

    // Créer le document dans la base de données
    const result = await pool.query(
      `INSERT INTO books 
       (title, description, author, category, sub_category, subject, 
        file_type, file_url, file_key, file_name, file_size, 
        cover_url, cover_key, uploaded_by, uploaded_by_name, year)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       RETURNING id, title, author, file_url, cover_url`,
      [
        title, description || '', author, category || 'general', 
        subCategory || '', subject || '',
        fileType, `/uploads/${file.filename}`, file.filename,
        file.originalname, file.size,
        coverUrl, coverKey, req.user.id, req.user.name || 'Anonyme', year || ''
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Document partagé avec succès',
      book: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Erreur upload:', error);
    // Supprimer les fichiers en cas d'erreur
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    if (files) {
      Object.values(files).flat().forEach(f => {
        if (f.path && fs.existsSync(f.path)) {
          fs.unlinkSync(f.path);
        }
      });
    }
    res.status(500).json({ error: 'Erreur lors du téléchargement' });
  }
});

// Récupérer tous les livres
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

// Récupérer un livre par ID
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

// Télécharger un livre
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

    res.download(filePath, result.rows[0].file_name);
  } catch (error) {
    console.error('❌ Erreur download:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===== DÉMARRAGE =====

// Créer les tables si elles n'existent pas
const initDB = async () => {
  try {
    // Table users
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

    // Table books
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

    console.log('✅ Tables vérifiées/créées');
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
