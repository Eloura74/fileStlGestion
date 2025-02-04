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
const WATCH_DIR = 'C:\\Users\\Quentin\\Documents\\fichier3d';
app.use('/stl-files', express.static(STL_FILES_DIR));

// Fonction pour créer le fichier metadata.json
async function createMetadataFile(filePath) {
  const fileName = path.basename(filePath);
  const stats = await fs.stat(filePath);
  const metadataPath = path.join(
    STL_FILES_DIR,
    fileName.replace(/\.stl$/i, '.metadata.json')
  );

  const metadata = {
    nom: fileName.replace(/\.stl$/i, ''),
    format: 'STL',
    taille: stats.size,
    dateCreation: stats.birthtime,
    dateModification: stats.mtime,
    categorie: 'filament',
    theme: 'autre'
  };

  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  return metadata;
}

// Fonction pour copier un fichier et créer ses métadonnées
async function copyFileWithMetadata(sourcePath) {
  try {
    const fileName = path.basename(sourcePath);
    const destPath = path.join(STL_FILES_DIR, fileName);

    // Créer le dossier stl-files s'il n'existe pas
    if (!fsSync.existsSync(STL_FILES_DIR)) {
      await fs.mkdir(STL_FILES_DIR, { recursive: true });
    }

    // Copier le fichier s'il n'existe pas déjà ou s'il a été modifié
    let shouldCopy = true;
    if (fsSync.existsSync(destPath)) {
      const sourceStats = await fs.stat(sourcePath);
      const destStats = await fs.stat(destPath);
      shouldCopy = sourceStats.mtime > destStats.mtime;
    }

    if (shouldCopy) {
      await fs.copyFile(sourcePath, destPath);
      console.log(`Fichier copié: ${fileName}`);
    }

    // Créer ou mettre à jour le fichier metadata
    const metadata = await createMetadataFile(destPath);
    return {
      id: Buffer.from(fileName).toString('base64'),
      ...metadata,
      fileUrl: `/stl-files/${encodeURIComponent(fileName)}`
    };
  } catch (error) {
    console.error(`Erreur lors de la copie de ${sourcePath}:`, error);
    return null;
  }
}

// Endpoint pour lister les modèles
app.get('/api/models', async (req, res) => {
  try {
    // Scanner le dossier source pour les nouveaux fichiers
    const sourceFiles = await fs.readdir(WATCH_DIR);
    const stlFiles = sourceFiles.filter(file => 
      file.toLowerCase().endsWith('.stl')
    );

    // Copier les nouveaux fichiers
    await Promise.all(
      stlFiles.map(file => 
        copyFileWithMetadata(path.join(WATCH_DIR, file))
      )
    );

    // Lire tous les fichiers du dossier stl-files
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
