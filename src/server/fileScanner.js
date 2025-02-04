import fs from 'fs';
import path from 'path';

function createMetadataIfNotExists(filePath, modelData) {
  const metadataPath = filePath.replace(/\.[^.]+$/, '.metadata.json');
  
  if (!fs.existsSync(metadataPath)) {
    const metadata = {
      nom: modelData.nom,
      description: "Description à remplir",
      dimensions: {
        x: 0,
        y: 0,
        z: 0
      },
      dateCreation: modelData.dateCreation,
      auteur: "Non spécifié",
      parametresImpression: {
        temperature: 200,
        vitesse: 60,
        remplissage: 20
      },
      categorie: modelData.categorie,
      format: modelData.format,
      taille: modelData.taille
    };

    try {
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
      console.log(`Fichier de métadonnées créé : ${metadataPath}`);
    } catch (error) {
      console.error(`Erreur lors de la création du fichier de métadonnées : ${error}`);
    }
  }

  return metadataPath;
}

export function scanDirectory(directoryPath) {
  try {
    const files = fs.readdirSync(directoryPath);
    const models = [];
    const supportedFormats = ['.stl', '.obj', '.3mf'];

    files.forEach((file) => {
      const ext = path.extname(file).toLowerCase();
      if (supportedFormats.includes(ext)) {
        const filePath = path.join(directoryPath, file);
        const stats = fs.statSync(filePath);
        
        const modelData = {
          id: Buffer.from(filePath).toString('base64'),
          nom: path.basename(file, ext),
          format: ext.substring(1).toUpperCase(),
          taille: Math.round(stats.size / (1024 * 1024) * 100) / 100, // Taille en Mo
          dateCreation: stats.birthtime.toISOString().split('T')[0],
          thumbnail: '/vite.svg',
          chemin: filePath,
          categorie: 'Non classé'
        };

        // Créer le fichier metadata.json si nécessaire
        const metadataPath = createMetadataIfNotExists(filePath, modelData);

        // Si le fichier metadata.json existe, on lit ses données
        if (fs.existsSync(metadataPath)) {
          try {
            const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
            // On fusionne les données du metadata avec modelData
            Object.assign(modelData, {
              description: metadata.description,
              dimensions: metadata.dimensions,
              auteur: metadata.auteur,
              parametresImpression: metadata.parametresImpression,
              categorie: metadata.categorie
            });
          } catch (error) {
            console.error(`Erreur lors de la lecture du fichier de métadonnées : ${error}`);
          }
        }

        models.push(modelData);
      }
    });

    return models;
  } catch (error) {
    console.error('Erreur lors du scan du dossier:', error);
    return [];
  }
}
