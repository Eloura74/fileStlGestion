const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Servir les fichiers statiques du dossier stl-files
const STL_FILES_DIR = path.join(__dirname, '..', '..', 'stl-files');
app.use('/stl-files', express.static(STL_FILES_DIR));

// Fonction pour créer le fichier metadata.json
async function createMetadataFile(sourcePath, destPath, metadata) {
  const metadataPath = destPath.replace(/\.[^.]+$/, '.metadata.json');
  const metadataContent = {
    ...metadata,
    description: "Description à remplir",
    dimensions: {
      x: 0,
      y: 0,
      z: 0
    },
    auteur: "Non spécifié",
    parametresImpression: {
      temperature: 200,
      vitesse: 60,
      remplissage: 20
    }
  };

  await fs.writeFile(metadataPath, JSON.stringify(metadataContent, null, 2));
  return metadataPath;
}

// Fonction pour copier un fichier et créer ses métadonnées
async function copyFileWithMetadata(sourcePath, fileName) {
  const destPath = path.join(STL_FILES_DIR, fileName);

  // Créer le dossier stl-files s'il n'existe pas
  if (!fsSync.existsSync(STL_FILES_DIR)) {
    await fs.mkdir(STL_FILES_DIR, { recursive: true });
  }

  // Copier le fichier s'il n'existe pas déjà
  if (!fsSync.existsSync(destPath)) {
    await fs.copyFile(sourcePath, destPath);
    console.log(`Fichier copié : ${fileName}`);
  }

  const metadata = await getFileMetadata(sourcePath);
  const metadataPath = await createMetadataFile(sourcePath, destPath, metadata);
  
  return { ...metadata, metadataPath };
}

// Fonction pour obtenir les métadonnées d'un fichier
async function getFileMetadata(filePath) {
  try {
    const stats = await fs.stat(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const fileName = path.basename(filePath);
    return {
      id: Buffer.from(filePath).toString('base64'),
      nom: path.basename(filePath, ext),
      format: ext.substring(1).toUpperCase(),
      taille: Math.round(stats.size / (1024 * 1024) * 100) / 100, // Taille en Mo
      dateCreation: stats.birthtime.toISOString().split('T')[0],
      thumbnail: '/vite.svg',
      chemin: filePath,
      categorie: 'Non classé',
      fileUrl: `/stl-files/${fileName}`
    };
  } catch (error) {
    console.error(`Erreur lors de la lecture du fichier ${filePath}:`, error);
    return null;
  }
}

// Endpoint pour lister les modèles
app.get('/api/models', async (req, res) => {
  try {
    const files = await fs.readdir(STL_FILES_DIR);
    const models = [];

    for (const file of files) {
      if (file.toLowerCase().endsWith('.stl')) {
        const filePath = path.join(STL_FILES_DIR, file);
        const stats = await fs.stat(filePath);
        const metadataPath = path.join(
          STL_FILES_DIR,
          file.replace(/\.stl$/i, '.metadata.json')
        );

        let metadata = {};
        if (fsSync.existsSync(metadataPath)) {
          const metadataContent = await fs.readFile(metadataPath, 'utf8');
          metadata = JSON.parse(metadataContent);
        }

        models.push({
          id: Buffer.from(file).toString('base64'),
          nom: metadata.nom || file.replace(/\.stl$/i, ''),
          format: 'STL',
          taille: stats.size,
          dateCreation: metadata.dateCreation || stats.birthtime,
          dateModification: metadata.dateModification || stats.mtime,
          categorie: metadata.categorie || 'filament',
          theme: metadata.theme || 'autre',
          fileUrl: `/stl-files/${encodeURIComponent(file)}`
        });
      }
    }

    res.json(models);
  } catch (error) {
    console.error('Erreur lors de la lecture des modèles:', error);
    res.status(500).json({ error: 'Erreur lors de la lecture des modèles' });
  }
});

// Endpoint pour mettre à jour un modèle
app.put('/api/models/:id', async (req, res) => {
  try {
    const modelId = decodeURIComponent(req.params.id);
    const updateData = req.body;
    console.log('ID reçu:', modelId);
    console.log('Données reçues:', updateData);
    
    const fileName = Buffer.from(modelId, 'base64').toString();
    const filePath = path.join(STL_FILES_DIR, fileName);
    console.log('Chemin du fichier:', filePath);
    
    // Vérifier si le fichier existe
    if (!fsSync.existsSync(filePath)) {
      console.error('Fichier non trouvé:', filePath);
      return res.status(404).json({ error: 'Modèle non trouvé' });
    }

    // Mettre à jour le fichier metadata.json associé
    const metadataPath = path.join(
      STL_FILES_DIR,
      fileName.replace(/\.stl$/i, '.metadata.json')
    );
    console.log('Chemin metadata:', metadataPath);
    
    let metadata = {};
    
    if (fsSync.existsSync(metadataPath)) {
      const metadataContent = await fs.readFile(metadataPath, 'utf8');
      metadata = JSON.parse(metadataContent);
      console.log('Metadata existant:', metadata);
    }

    // Fusionner les anciennes et nouvelles données
    const updatedMetadata = {
      ...metadata,
      ...updateData,
      dateModification: new Date().toISOString()
    };
    console.log('Metadata mis à jour:', updatedMetadata);

    // Sauvegarder les modifications
    await fs.writeFile(metadataPath, JSON.stringify(updatedMetadata, null, 2));
    console.log('Metadata sauvegardé avec succès');

    res.json(updatedMetadata);
  } catch (error) {
    console.error('Erreur détaillée lors de la mise à jour du modèle:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la mise à jour du modèle',
      details: error.message,
      stack: error.stack 
    });
  }
});

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
