const express = require('express');
const { exec } = require('child_process');
const router = express.Router();

// Route pour ouvrir un fichier dans l'explorateur Windows
router.post('/open-file', (req, res) => {
  const { command } = req.body;

  // Vérifier que la commande est valide
  if (!command || !command.startsWith('explorer.exe /select,')) {
    console.error('Commande invalide reçue:', command);
    return res.status(400).json({ 
      success: false,
      error: 'Commande invalide' 
    });
  }

  console.log('Exécution de la commande:', command);

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('Erreur lors de l\'exécution de la commande:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Erreur lors de l\'ouverture du fichier',
        details: error.message 
      });
    }

    if (stderr) {
      console.warn('Avertissement lors de l\'exécution:', stderr);
    }

    console.log('Commande exécutée avec succès');
    res.json({ 
      success: true,
      message: 'Fichier localisé avec succès'
    });
  });
});

module.exports = router;
