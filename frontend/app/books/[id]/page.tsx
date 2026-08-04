// ... (le reste du code)

  // 🔥 Téléchargement avec Cloudinary
  const handleDownload = async () => {
    if (!book) return;
    
    setDownloading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://bibliotheque-backend-wfkn.onrender.com';
      const response = await fetch(`${baseUrl}/api/books/${book.id}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      const data = await response.json();
      console.log('📥 Réponse téléchargement:', data);
      
      if (data.success && data.downloadUrl) {
        // 🔥 Ouvrir l'URL de téléchargement Cloudinary
        window.open(data.downloadUrl, '_blank');
        toast.success('Téléchargement démarré !');
      } else {
        toast.error('URL de téléchargement non disponible');
      }
    } catch (error: any) {
      console.error('❌ Erreur téléchargement:', error);
      toast.error('Erreur lors du téléchargement');
    } finally {
      setDownloading(false);
    }
  };

// ... (le reste du code)
