const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const routes = require('./src/routes');
const { errorHandler, notFoundHandler } = require('./src/middlewares/error.middleware');

const app = express();

// ============= MIDDLEWARES =============

// Sécurité
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Logs
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes par IP
  message: 'Trop de requêtes, veuillez réessayer plus tard.',
});
app.use('/api', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fichiers statiques (uploads locaux)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============= ROUTES =============

app.use('/api', routes);

// ============= ERREURS =============

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
