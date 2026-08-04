// ... (le reste du code)

// ===== MISE À JOUR D'UN LIVRE =====
app.put('/api/books/:id', auth, async function(req, res) {
  try {
    const { id } = req.params;
    const { title, description, author, category, subCategory, subject, year } = req.body;

    // Vérifier que le livre existe
    const existing = await pool.query('SELECT * FROM books WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Document non trouvé' });
    }

    const book = existing.rows[0];

    // Vérifier les permissions
    if (book.uploaded_by !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    const result = await pool.query(
      `UPDATE books 
       SET title = $1, description = $2, author = $3, category = $4, 
           sub_category = $5, subject = $6, year = $7
       WHERE id = $8
       RETURNING *`,
      [title, description, author, category, subCategory, subject, year, id]
    );

    res.json({
      success: true,
      message: 'Document mis à jour',
      book: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Erreur update book:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===== SUPPRESSION D'UN LIVRE =====
app.delete('/api/books/:id', auth, async function(req, res) {
  try {
    const { id } = req.params;

    // Vérifier que le livre existe
    const existing = await pool.query('SELECT * FROM books WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Document non trouvé' });
    }

    const book = existing.rows[0];

    // Vérifier les permissions
    if (book.uploaded_by !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    // Supprimer de la base de données
    await pool.query('DELETE FROM books WHERE id = $1', [id]);

    // Décrémenter le compteur de documents de l'utilisateur
    await pool.query('UPDATE users SET documents_count = documents_count - 1 WHERE id = $1', [req.user.id]);

    res.json({
      success: true,
      message: 'Document supprimé avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur delete book:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ... (le reste du code)
