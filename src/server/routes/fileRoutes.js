const express = require('express');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

// Route pour mettre à jour les métadonnées d'un modèle
router.put("/api/models/:id", async (req, res) => {
  try {
    const modelId = req.params.id;
    const updatedData = req.body;
    
    console.log('='.repeat(50));
    console.log("Mise à jour du modèle");
    console.log("ID:", modelId);
    console.log("Données reçues:", updatedData);
    
    // Chemin vers le fichier de métadonnées
    const metadataPath = path.join(process.cwd(), "stl-files/metadata", modelId.replace(".stl", ".json"));
    console.log("Chemin du fichier:", metadataPath);
    
    // Vérifier si le fichier existe
    try {
      await fs.access(metadataPath);
      console.log("Fichier trouvé:", metadataPath);
    } catch (error) {
      console.error("Fichier non trouvé:", metadataPath);
      return res.status(404).json({
        success: false,
        message: "Fichier de métadonnées non trouvé",
      });
    }
    
    // Lire les métadonnées existantes
    const existingData = JSON.parse(await fs.readFile(metadataPath, "utf8"));
    console.log("Données existantes:", existingData);
    
    // Fusionner les données existantes avec les nouvelles données
    const newData = {
      ...existingData,
      description: updatedData.description,
      categorie: updatedData.categorie,
      theme: updatedData.theme,
      tags: updatedData.tags,
      auteur: updatedData.auteur,
      dateModification: new Date().toISOString(),
    };
    
    console.log("Nouvelles données:", newData);
    
    // Écrire les nouvelles métadonnées
    await fs.writeFile(metadataPath, JSON.stringify(newData, null, 2), "utf8");
    
    console.log("Mise à jour réussie");
    console.log('='.repeat(50));
    
    res.json({
      success: true,
      message: "Modèle mis à jour avec succès",
      data: newData,
    });
  } catch (error) {
    console.error('='.repeat(50));
    console.error("Erreur lors de la mise à jour");
    console.error(error);
    console.error('='.repeat(50));
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour du modèle",
      error: error.message,
    });
  }
});

// Route pour ouvrir un fichier dans l'explorateur Windows
router.post("/api/open-file", (req, res) => {
  const { command } = req.body;

  // Vérifier que la commande est valide
  if (!command || !command.startsWith("explorer.exe /select,")) {
    console.error("Commande invalide reçue:", command);
    return res.status(400).json({
      success: false,
      error: "Commande invalide",
    });
  }

  console.log("Exécution de la commande:", command);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("Erreur lors de l'exécution de la commande:", error);
      return res.status(500).json({
        success: false,
        error: "Erreur lors de l'ouverture du fichier",
        details: error.message,
      });
    }

    if (stderr) {
      console.warn("Avertissement lors de l'exécution:", stderr);
    }

    console.log("Commande exécutée avec succès");
    res.json({
      success: true,
      message: "Fichier localisé avec succès",
    });
  });
});

module.exports = router;
