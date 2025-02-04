const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Fonction pour obtenir les métadonnées d'un fichier
async function getFileMetadata(filePath) {
  try {
    const stats = await fs.stat(filePath);
    const ext = path.extname(filePath).toLowerCase();
    return {
      id: Buffer.from(filePath).toString('base64'),
      nom: path.basename(filePath, ext),
      format: ext.substring(1).toUpperCase(),
      taille: Math.round(stats.size / (1024 * 1024) * 100) / 100, // Taille en Mo
      dateCreation: stats.birthtime.toISOString().split('T')[0],
      thumbnail: '/vite.svg',
      chemin: filePath,
      categorie: 'Non classé'
    };
  } catch (error) {
    console.error(`Erreur lors de la lecture du fichier ${filePath}:`, error);
    return null;
  }
}

// Endpoint pour récupérer la liste des fichiers 3D
app.get('/api/models', async (req, res) => {
  try {
    const directoryPath = 'C:\\Users\\Quentin\\Documents\\fichier3d';
    const files = await fs.readdir(directoryPath);
    const supportedFormats = ['.stl', '.obj', '.3mf'];
    
    const modelFiles = files.filter(file => 
      supportedFormats.includes(path.extname(file).toLowerCase())
    );

    const filesMetadata = await Promise.all(
      modelFiles.map(file => getFileMetadata(path.join(directoryPath, file)))
    );

    const validFiles = filesMetadata.filter(metadata => metadata !== null);
    res.json(validFiles);
  } catch (error) {
    console.error('Erreur lors de la récupération des fichiers 3D:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des fichiers 3D' });
  }
});

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
