const prisma = require('../config/database');
const { uploadBookToS3, uploadCoverToS3, deleteFromS3, getSignedDownloadUrl } = require('../config/s3');
const { schemas } = require('../middlewares/validation.middleware');

// ============= CRÉER UN LIVRE =============
exports.createBook = async (req, res) => {
  try {
    const data = req.validatedData;
    const file = req.file;
    const cover = req.cover;

    if (!file) {
      return res.status(400).json({ error: 'Fichier requis' });
    }

    // Upload du fichier vers S3
    const fileKey = await uploadBookToS3(file);
    const fileUrl = `/api/books/${fileKey}`;

    // Upload de la couverture (optionnel)
    let coverKey = null;
    let coverUrl = null;
    if (cover) {
      coverKey = await uploadCoverToS3(cover);
      coverUrl = `/api/books/cover/${coverKey}`;
    }

    // Créer le livre dans la base de données
    const book = await prisma.book.create({
      data: {
        title: data.title,
        description: data.description || '',
        author: data.author,
        categoryId: data.categoryId || null,
        subCategory: data.subCategory || '',
        subject: data.subject || '',
        fileType: file.mimetype || 'application/octet-stream',
        fileUrl,
        fileKey,
        fileName: file.originalname,
        fileSize: file.size,
        coverUrl,
        coverKey,
        year: data.year || '',
        uploadedById: req.user.id,
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Livre ajouté avec succès',
      book,
    });
  } catch (error) {
    console.error('Erreur création livre:', error);
    res.status(500).json({ error: 'Erreur lors de la création du livre' });
  }
};

// ============= LISTER LES LIVRES =============
exports.getBooks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      sort = 'recent',
      subCategory,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Construire la requête
    const where = { isPublished: true };
    const orderBy = {};

    if (category) {
      where.categoryId = category;
    }

    if (subCategory) {
      where.subCategory = subCategory;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
      ];
    }

    switch (sort) {
      case 'recent':
        orderBy.createdAt = 'desc';
        break;
      case 'popular':
        orderBy.downloads = 'desc';
        break;
      case 'views':
        orderBy.views = 'desc';
        break;
      case 'title':
        orderBy.title = 'asc';
        break;
      default:
        orderBy.createdAt = 'desc';
    }

    // Exécuter les requêtes
    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy,
        include: {
          uploadedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          category: true,
          _count: {
            select: {
              downloadsHistory: true,
              favorites: true,
              reviews: true,
            },
          },
        },
      }),
      prisma.book.count({ where }),
    ]);

    res.json({
      success: true,
      books,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Erreur liste livres:', error);
    res.status(500).json({ error: 'Erreur lors du chargement des livres' });
  }
};

// ============= RÉCUPÉRER UN LIVRE =============
exports.getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    // Incrémenter les vues
    await prisma.book.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        category: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            downloadsHistory: true,
            favorites: true,
          },
        },
      },
    });

    if (!book) {
      return res.status(404).json({ error: 'Livre non trouvé' });
    }

    // Générer l'URL de téléchargement signée
    const downloadUrl = await getSignedDownloadUrl(book.fileKey);

    res.json({
      success: true,
      book: {
        ...book,
        downloadUrl,
      },
    });
  } catch (error) {
    console.error('Erreur récupération livre:', error);
    res.status(500).json({ error: 'Erreur lors du chargement du livre' });
  }
};

// ============= TÉLÉCHARGER UN LIVRE =============
exports.downloadBook = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await prisma.book.findUnique({
      where: { id },
    });

    if (!book) {
      return res.status(404).json({ error: 'Livre non trouvé' });
    }

    // Incrémenter le compteur de téléchargements
    await prisma.book.update({
      where: { id },
      data: { downloads: { increment: 1 } },
    });

    // Enregistrer le téléchargement
    if (req.user) {
      await prisma.download.create({
        data: {
          userId: req.user.id,
          bookId: id,
          ipAddress: req.ip || req.connection.remoteAddress,
        },
      });
    }

    // Générer l'URL signée
    const downloadUrl = await getSignedDownloadUrl(book.fileKey, 3600);

    res.json({
      success: true,
      downloadUrl,
      fileName: book.fileName,
    });
  } catch (error) {
    console.error('Erreur téléchargement:', error);
    res.status(500).json({ error: 'Erreur lors du téléchargement' });
  }
};

// ============= METTRE À JOUR UN LIVRE =============
exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.validatedData;

    const book = await prisma.book.findUnique({
      where: { id },
    });

    if (!book) {
      return res.status(404).json({ error: 'Livre non trouvé' });
    }

    // Vérifier les permissions
    if (book.uploadedById !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    const updatedBook = await prisma.book.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.author !== undefined && { author: data.author }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.subCategory !== undefined && { subCategory: data.subCategory }),
        ...(data.subject !== undefined && { subject: data.subject }),
        ...(data.year !== undefined && { year: data.year }),
        ...(data.isPublished !== undefined && { isPublished: data.isPublished }),
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: true,
      },
    });

    res.json({
      success: true,
      message: 'Livre mis à jour',
      book: updatedBook,
    });
  } catch (error) {
    console.error('Erreur mise à jour livre:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
};

// ============= SUPPRIMER UN LIVRE =============
exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await prisma.book.findUnique({
      where: { id },
    });

    if (!book) {
      return res.status(404).json({ error: 'Livre non trouvé' });
    }

    // Vérifier les permissions
    if (book.uploadedById !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    // Supprimer les fichiers de S3
    await deleteFromS3(book.fileKey);
    if (book.coverKey) {
      await deleteFromS3(book.coverKey);
    }

    // Supprimer de la base de données
    await prisma.book.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Livre supprimé avec succès',
    });
  } catch (error) {
    console.error('Erreur suppression livre:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
};

// ============= FAVORIS =============
exports.toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const book = await prisma.book.findUnique({
      where: { id },
    });

    if (!book) {
      return res.status(404).json({ error: 'Livre non trouvé' });
    }

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId: id,
        },
      },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: {
          userId_bookId: {
            userId,
            bookId: id,
          },
        },
      });
      return res.json({
        success: true,
        message: 'Retiré des favoris',
        isFavorite: false,
      });
    }

    await prisma.favorite.create({
      data: {
        userId,
        bookId: id,
      },
    });

    res.json({
      success: true,
      message: 'Ajouté aux favoris',
      isFavorite: true,
    });
  } catch (error) {
    console.error('Erreur favoris:', error);
    res.status(500).json({ error: 'Erreur lors de la gestion des favoris' });
  }
};

// ============= REVIEWS =============
exports.addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.validatedData;
    const userId = req.user.id;

    const book = await prisma.book.findUnique({
      where: { id },
    });

    if (!book) {
      return res.status(404).json({ error: 'Livre non trouvé' });
    }

    // Vérifier si l'utilisateur a déjà commenté
    const existing = await prisma.review.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId: id,
        },
      },
    });

    let review;
    if (existing) {
      review = await prisma.review.update({
        where: {
          userId_bookId: {
            userId,
            bookId: id,
          },
        },
        data: {
          rating,
          comment: comment || '',
        },
      });
    } else {
      review = await prisma.review.create({
        data: {
          userId,
          bookId: id,
          rating,
          comment: comment || '',
        },
      });
    }

    // Calculer la note moyenne
    const avgRating = await prisma.review.aggregate({
      where: { bookId: id },
      _avg: { rating: true },
    });

    res.json({
      success: true,
      message: existing ? 'Avis mis à jour' : 'Avis ajouté',
      review,
      averageRating: avgRating._avg.rating || 0,
    });
  } catch (error) {
    console.error('Erreur review:', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout de l\'avis' });
  }
};

// ============= CATÉGORIES =============
exports.getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { books: true },
        },
      },
    });

    res.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error('Erreur catégories:', error);
    res.status(500).json({ error: 'Erreur lors du chargement des catégories' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, slug, description, icon, color } = req.body;

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        icon,
        color,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Catégorie créée',
      category,
    });
  } catch (error) {
    console.error('Erreur création catégorie:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la catégorie' });
  }
};
