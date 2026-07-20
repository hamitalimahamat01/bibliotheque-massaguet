const { z } = require('zod');

// Schémas de validation
const schemas = {
  register: z.object({
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(50, 'Le nom est trop long'),
    email: z.string().email('Email invalide'),
    password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  }),

  login: z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(1, 'Le mot de passe est requis'),
  }),

  createBook: z.object({
    title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(200, 'Le titre est trop long'),
    description: z.string().max(1000, 'La description est trop longue').optional(),
    author: z.string().min(2, 'L\'auteur est requis').max(100, 'L\'auteur est trop long'),
    categoryId: z.string().uuid('Catégorie invalide').optional(),
    subCategory: z.string().optional(),
    subject: z.string().optional(),
    year: z.string().optional(),
  }),

  updateBook: z.object({
    title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(200, 'Le titre est trop long').optional(),
    description: z.string().max(1000, 'La description est trop longue').optional(),
    author: z.string().min(2, 'L\'auteur est requis').max(100, 'L\'auteur est trop long').optional(),
    categoryId: z.string().uuid('Catégorie invalide').optional(),
    subCategory: z.string().optional(),
    subject: z.string().optional(),
    year: z.string().optional(),
    isPublished: z.boolean().optional(),
  }),

  updateProfile: z.object({
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(50, 'Le nom est trop long').optional(),
    bio: z.string().max(200, 'La bio est trop longue').optional(),
  }),

  review: z.object({
    rating: z.number().min(1, 'Note minimale 1').max(5, 'Note maximale 5'),
    comment: z.string().max(500, 'Le commentaire est trop long').optional(),
  }),
};

// Middleware de validation
const validate = (schema) => {
  return (req, res, next) => {
    try {
      const result = schema.parse(req.body);
      req.validatedData = result;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation échouée',
          details: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      next(error);
    }
  };
};

module.exports = {
  validate,
  schemas,
};
