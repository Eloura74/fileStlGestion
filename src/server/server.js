const express = require('express');
const cors = require('cors');
const path = require('path');
const fileRoutes = require('./routes/fileRoutes');

const app = express();

// Middleware de logging
app.use((req, res, next) => {
  console.log('='.repeat(50));
  console.log(`Requête reçue: ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('='.repeat(50));
  next();
});

// Middleware
app.use(cors());
app.use(express.json());

// Afficher le chemin absolu des fichiers statiques
const staticPath = path.join(process.cwd(), 'stl-files');
console.log('Chemin des fichiers statiques:', staticPath);
app.use('/models', express.static(staticPath));

// Routes
app.use('/', fileRoutes);

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('=== Erreur serveur ===');
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Erreur serveur',
    error: err.message
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
  console.log('Routes disponibles:');
  console.log('- PUT /models/:id (mise à jour des métadonnées)');
  console.log('- POST /open-file (ouvrir dans l\'explorateur)');
  console.log('='.repeat(50));
});
