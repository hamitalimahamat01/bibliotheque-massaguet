const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn'] : ['error'],
});

// Gestion des erreurs de connexion
prisma.$on('error', (e) => {
  console.error('❌ Erreur Prisma:', e.message);
});

// Hook pour la fermeture propre
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;
