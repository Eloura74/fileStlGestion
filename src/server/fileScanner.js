import fs from 'fs';
import path from 'path';

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
        
        models.push({
          id: Buffer.from(filePath).toString('base64'),
          nom: path.basename(file, ext),
          format: ext.substring(1).toUpperCase(),
          taille: Math.round(stats.size / (1024 * 1024) * 100) / 100, // Taille en Mo
          dateCreation: stats.birthtime.toISOString().split('T')[0],
          thumbnail: '/vite.svg',
          chemin: filePath,
          categorie: 'Non classé'
        });
      }
    });

    return models;
  } catch (error) {
    console.error('Erreur lors du scan du dossier:', error);
    return [];
  }
}
