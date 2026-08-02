// ... (le reste du code)

// S'assurer que le dossier uploads est accessible
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
