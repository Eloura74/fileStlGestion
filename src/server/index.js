const express = require("express");
const cors = require("cors");
const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path");
const fileRoutes = require("./routes/fileRoutes");
const { v4: uuidv4 } = require('uuid');
const GestionSTL = require('./utils/stlMetadata');

const appExpress = express();
const port = 3001;

// Middleware
appExpress.use(
  cors({
    origin: "http://localhost:5173", // URL de votre application Vite
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);
appExpress.use(express.json());

// Servir les fichiers statiques
const modelsPath = path.join(__dirname, "..", "..", "stl-files");
console.log("Chemin des modèles:", modelsPath);

if (!fsSync.existsSync(modelsPath)) {
  console.log("Création du dossier des modèles");
  fsSync.mkdirSync(modelsPath, { recursive: true });
}

// Configuration des routes statiques
appExpress.use("/stl-files", express.static(modelsPath));
appExpress.use("/models", express.static(modelsPath)); // Pour la rétrocompatibilité

let cheminBase = '';

// Charger la configuration au démarrage
async function chargerConfiguration() {
  try {
    const configPath = path.join(__dirname, "config.json");
    if (fsSync.existsSync(configPath)) {
      const config = JSON.parse(await fs.readFile(configPath, "utf8"));
      cheminBase = config.cheminBase || "";
    }
  } catch (error) {
    console.error("Erreur lors du chargement de la configuration:", error);
  }
}

// Initialiser le gestionnaire STL avec le dossier source
let gestionnaireSTL;

// Fonction pour initialiser le gestionnaire STL
async function initialiserGestionnaireSTL() {
  await chargerConfiguration();
  gestionnaireSTL = new GestionSTL(modelsPath, cheminBase);
  await gestionnaireSTL.initialiserTousLesFichiers();
  console.log('Métadonnées STL initialisées avec succès');
}

// Route pour récupérer le chemin de base
appExpress.get("/api/config/base-path", (req, res) => {
  try {
    const configPath = path.join(__dirname, "config.json");
    if (fsSync.existsSync(configPath)) {
      const config = JSON.parse(fsSync.readFileSync(configPath, "utf8"));
      res.json({ basePath: config.cheminBase || "" });
    } else {
      // Si le fichier n'existe pas, créer une configuration par défaut
      const defaultConfig = { cheminBase: modelsPath };
      fsSync.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
      res.json({ basePath: modelsPath });
    }
  } catch (error) {
    console.error("Erreur lors de la lecture de la configuration:", error);
    res
      .status(500)
      .json({ error: "Erreur lors de la lecture de la configuration" });
  }
});

// Middleware pour logger les requêtes de fichiers
appExpress.use((req, res, next) => {
  console.log("Requête reçue:", req.method, req.url);
  next();
});

// Monter les routes du fichier fileRoutes avec le préfixe /api
appExpress.use("/api", fileRoutes);

// Variables globales
const configPath = path.join(__dirname, "config.json");

// Endpoint pour lister les modèles
appExpress.get("/api/models", async (req, res) => {
  try {
    console.log("Récupération de la liste des modèles...");
    const files = await fs.readdir(modelsPath);
    const modelPromises = files
      .filter((file) => file.toLowerCase().endsWith(".stl"))
      .map(async (file) => {
        const filePath = path.join(modelsPath, file);
        const stats = await fs.stat(filePath);
        const metadata = await gestionnaireSTL.getMetadata(file) || {};
        
        return {
          id: encodeURIComponent(file),
          name: file,
          path: filePath,
          size: stats.size,
          lastModified: stats.mtime,
          ...metadata
        };
      });

    const models = await Promise.all(modelPromises);
    res.json(models);
  } catch (error) {
    console.error("Erreur lors de la récupération des modèles:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des modèles" });
  }
});

// Endpoint pour mettre à jour un modèle
appExpress.put("/api/models/:id", async (req, res) => {
  try {
    const modelId = decodeURIComponent(req.params.id);
    const updateData = req.body;
    console.log("Modification du modèle:", modelId, updateData);

    const oldFilePath = path.join(modelsPath, modelId);
    const oldSourcePath = path.join(cheminBase, modelId);

    if (!fsSync.existsSync(oldFilePath)) {
      return res.status(404).json({ error: "Modèle non trouvé" });
    }

    // Si le nom a été modifié, renommer le fichier
    let currentModelId = modelId;
    if (updateData.nom && updateData.nom !== modelId) {
      const newFilePath = path.join(modelsPath, updateData.nom);
      const newSourcePath = path.join(cheminBase, updateData.nom);

      // Renommer dans le dossier de l'application
      await fs.rename(oldFilePath, newFilePath);
      
      // Renommer dans le dossier source
      if (fsSync.existsSync(oldSourcePath)) {
        await fs.rename(oldSourcePath, newSourcePath);
      }

      // Mettre à jour l'ID du modèle
      currentModelId = updateData.nom;

      // Renommer les fichiers de métadonnées
      const oldMetadataName = `${path.parse(modelId).name}.json`;
      const newMetadataName = `${path.parse(updateData.nom).name}.json`;
      const oldMetadataPath = path.join(modelsPath, 'metadata', oldMetadataName);
      const newMetadataPath = path.join(modelsPath, 'metadata', newMetadataName);
      const oldSourceMetadataPath = path.join(cheminBase, 'metadata', oldMetadataName);
      const newSourceMetadataPath = path.join(cheminBase, 'metadata', newMetadataName);

      if (fsSync.existsSync(oldMetadataPath)) {
        await fs.rename(oldMetadataPath, newMetadataPath);
      }
      if (fsSync.existsSync(oldSourceMetadataPath)) {
        await fs.rename(oldSourceMetadataPath, newSourceMetadataPath);
      }
    }

    // Mettre à jour les métadonnées
    await gestionnaireSTL.mettreAJourMetadata(currentModelId, updateData);

    // Obtenir les métadonnées mises à jour
    const metadata = await gestionnaireSTL.getMetadata(currentModelId);
    const stats = await fs.stat(path.join(modelsPath, currentModelId));

    // Synchroniser les métadonnées
    await gestionnaireSTL.synchroniserMetadonnees();

    // Préparer la réponse avec toutes les données nécessaires
    const updatedModel = {
      nom: currentModelId,
      name: currentModelId,
      path: path.join(modelsPath, currentModelId),
      taille: stats.size,
      size: stats.size,
      dateModification: stats.mtime,
      lastModified: stats.mtime,
      ...metadata
    };

    res.json(updatedModel);
  } catch (error) {
    console.error("Erreur lors de la modification du modèle:", error);
    res.status(500).json({ error: "Erreur lors de la modification du modèle: " + error.message });
  }
});

// Fonction pour créer le fichier metadata.json
async function createMetadataFile(filePath) {
  const fileName = path.basename(filePath);
  const stats = await fs.stat(filePath);
  const metadataPath = `${filePath}.metadata.json`;

  let metadata = {
    id: uuidv4(), // Génération d'un ID unique
    nom: fileName,
    format: "STL",
    taille: stats.size,
    dateCreation: stats.birthtime,
    dateModification: stats.mtime,
    categorie: "filament",
    theme: "autre"
  };

  // Si le fichier metadata existe déjà, préserver l'ID existant
  if (fsSync.existsSync(metadataPath)) {
    try {
      const existingMetadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
      metadata = {
        ...metadata,
        id: existingMetadata.id || metadata.id,
        categorie: existingMetadata.categorie || metadata.categorie,
        theme: existingMetadata.theme || metadata.theme
      };
    } catch (error) {
      console.warn(`Erreur lors de la lecture des métadonnées existantes pour ${fileName}:`, error);
    }
  }

  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  return metadata;
}

// Fonction pour copier un fichier et créer ses métadonnées
async function copyFileWithMetadata(sourcePath) {
  try {
    const fileName = path.basename(sourcePath);
    const destPath = path.join(modelsPath, fileName);

    // Créer le dossier stl-files s'il n'existe pas
    if (!fsSync.existsSync(modelsPath)) {
      await fs.mkdir(modelsPath, { recursive: true });
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
      id: metadata.id,
      ...metadata,
      fileUrl: `/stl-files/${encodeURIComponent(fileName)}`,
    };
  } catch (error) {
    console.error(`Erreur lors de la copie de ${sourcePath}:`, error);
    return null;
  }
}

// Fonction pour synchroniser les fichiers
async function synchroniserFichiers() {
  try {
    console.log("Début de la synchronisation des fichiers...");
    console.log("Dossier source:", cheminBase);
    console.log("Dossier destination:", modelsPath);

    // Lecture du dossier source
    const fichiers = await fs.readdir(cheminBase);
    const fichiersSTL = fichiers.filter((f) =>
      f.toLowerCase().endsWith(".stl")
    );
    console.log("Fichiers STL trouvés dans le dossier source:", fichiersSTL);

    // Pour chaque fichier STL
    for (const fichier of fichiersSTL) {
      const cheminSource = path.join(cheminBase, fichier);
      const cheminDestination = path.join(modelsPath, fichier);

      try {
        // Vérifier si le fichier existe déjà dans la destination
        const sourceStats = await fs.stat(cheminSource);
        let destinationStats;
        try {
          destinationStats = await fs.stat(cheminDestination);
        } catch {
          destinationStats = null;
        }

        // Copier si le fichier n'existe pas ou si la taille est différente
        if (!destinationStats || sourceStats.size !== destinationStats.size) {
          console.log(`Copie du fichier ${fichier}...`);
          await fs.copyFile(cheminSource, cheminDestination);
          console.log(`Fichier ${fichier} copié avec succès`);

          // Synchroniser les métadonnées
          await gestionnaireSTL.synchroniserMetadonnees();
        } else {
          console.log(`Le fichier ${fichier} existe déjà et est à jour`);
        }
      } catch (err) {
        console.error(`Erreur lors de la copie de ${fichier}:`, err);
      }
    }
    console.log("Synchronisation terminée");
  } catch (error) {
    console.error("Erreur lors de la synchronisation:", error);
  }
}

// Démarrer la synchronisation au démarrage du serveur et toutes les 30 secondes
async function demarrerServeur() {
  try {
    // Initialiser le gestionnaire STL
    await initialiserGestionnaireSTL();
    
    console.log("Chemin de base des fichiers STL:", cheminBase);
    console.log("Dossier des modèles:", modelsPath);

    // Synchronisation initiale
    await synchroniserFichiers();

    // Synchronisation périodique
    setInterval(synchroniserFichiers, 30000);

    appExpress.listen(port, () => {
      console.log(`Serveur démarré sur le port ${port}`);
    });
  } catch (error) {
    console.error("Erreur lors du démarrage du serveur:", error);
  }
}

// Démarrer le serveur
demarrerServeur();
