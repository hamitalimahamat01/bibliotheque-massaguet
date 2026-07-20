const app = require('./app');
const prisma = require('./src/config/database');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Vérifier la connexion à la base de données
    await prisma.$connect();
    console.log('✅ PostgreSQL connecté');

    // Démarrer le serveur
    app.listen(PORT, () => {
      console.log(`🚀 Serveur backend sur http://localhost:${PORT}`);
      console.log(`📊 Environnement: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📁 Uploads: ${process.env.UPLOAD_PATH || './uploads'}`);
    });
  } catch (error) {
    console.error('❌ Erreur de démarrage:', error);
    process.exit(1);
  }
}

// Gestion des signaux pour une fermeture propre
process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt du serveur...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Arrêt du serveur...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
