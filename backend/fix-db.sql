-- Supprimer la table books si elle existe
DROP TABLE IF EXISTS books CASCADE;

-- Recréer la table books avec toutes les colonnes nécessaires
CREATE TABLE books (
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
);

-- Créer les index
CREATE INDEX idx_books_category ON books(category);
CREATE INDEX idx_books_created_at ON books(created_at DESC);
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_author ON books(author);

-- Ajouter des commentaires
COMMENT ON TABLE books IS 'Table des documents partagés';
COMMENT ON COLUMN books.category IS 'Catégorie du document (general, prepa)';
COMMENT ON COLUMN books.sub_category IS 'Sous-catégorie (bac, bef)';
