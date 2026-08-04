// ... (le reste du code)

// ===== TÉLÉCHARGEMENT DES FICHIERS =====
app.get('/api/books/:id/download', async function(req, res) {
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
    console.log('📥 URL actuelle:', book.file_url);

    await pool.query('UPDATE books SET downloads = downloads + 1 WHERE id = $1', [req.params.id]);

    // 🔥 Extraire le public_id de Cloudinary
    if (book.file_url && book.file_url.includes('cloudinary.com')) {
      const urlParts = book.file_url.split('/');
      // Trouver l'index de 'upload' ou 'raw'
      const uploadIndex = urlParts.indexOf('upload') !== -1 ? urlParts.indexOf('upload') : urlParts.indexOf('raw');
      const publicId = urlParts.slice(uploadIndex + 2).join('/').split('.')[0];
      
      console.log('📥 Public ID:', publicId);
      
      // 🔥 Essayer d'abord avec 'raw'
      let downloadUrl = cloudinary.url(publicId, {
        resource_type: 'raw',
        flags: 'attachment',
      });
      
      console.log('📥 URL raw:', downloadUrl);
      
      // 🔥 Vérifier si le fichier raw existe
      try {
        await cloudinary.api.resource(publicId, { resource_type: 'raw' });
        console.log('✅ Fichier raw trouvé');
        return res.json({ success: true, downloadUrl: downloadUrl });
      } catch (error) {
        console.log('⚠️ Fichier raw non trouvé, tentative avec image');
        
        // 🔥 Fallback: utiliser 'image'
        downloadUrl = cloudinary.url(publicId, {
          resource_type: 'image',
          flags: 'attachment',
          format: 'pdf',
        });
        
        console.log('📥 URL image:', downloadUrl);
        return res.json({ success: true, downloadUrl: downloadUrl });
      }
    }

    // 🔥 Fallback: si c'est un fichier local
    const filePath = path.join(__dirname, book.file_url);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Fichier introuvable' });
    }

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename="' + encodeURIComponent(book.file_name) + '"');
    res.setHeader('Content-Length', fs.statSync(filePath).size);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('❌ Erreur download:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ... (le reste du code)
