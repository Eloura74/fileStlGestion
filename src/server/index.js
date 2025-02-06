// Charger les variables d'environnement en premier
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

// Afficher les variables d'environnement pour le débogage
console.log("=== Variables d'environnement ===");
console.log("BASE_WATCH_DIRS:", process.env.BASE_WATCH_DIRS);
console.log("BASE_WATCH_DIR:", process.env.BASE_WATCH_DIR);
console.log("================================");

const express = require("express");
const cors = require("cors");
const fs = require("fs").promises;
const fsSync = require("fs");
const fileRoutes = require("./routes/fileRoutes");
const { v4: uuidv4 } = require("uuid");
const GestionSTL = require("./utils/stlMetadata");

// Configuration du logging
const logFile = path.join(__dirname, "server.log");
function logToFile(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}\n`;
  fsSync.appendFileSync(logFile, logMessage);
  console.log(message); // Affiche aussi dans la console
}

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
logToFile(`Chemin des modèles: ${modelsPath}`);

if (!fsSync.existsSync(modelsPath)) {
  logToFile("Création du dossier des modèles");
  fsSync.mkdirSync(modelsPath, { recursive: true });
}

// Configuration des routes statiques
appExpress.use("/stl-files", express.static(modelsPath));
appExpress.use("/models", express.static(modelsPath)); // Pour la rétrocompatibilité

let cheminBase = "";
let watchConfig = { watchDirectories: [] };

// Obtenir les chemins de base depuis les variables d'environnement
const BASE_WATCH_DIRS = process.env.BASE_WATCH_DIRS
  ? process.env.BASE_WATCH_DIRS.split(";").map((path) => path.trim())
  : [];

if (BASE_WATCH_DIRS.length === 0) {
  logToFile("⚠️ Aucun dossier configuré dans BASE_WATCH_DIRS");
  // Utiliser le dossier par défaut
  BASE_WATCH_DIRS.push("C:/Users/Default/Documents/STL");
}

logToFile("=== Configuration des dossiers surveillés ===");
logToFile(`Nombre de dossiers: ${BASE_WATCH_DIRS.length}`);
BASE_WATCH_DIRS.forEach((dir, index) => {
  logToFile(`${index + 1}. ${dir}`);
});

// Charger la configuration au démarrage
async function chargerConfiguration() {
  try {
    logToFile("=== Chargement de la configuration ===");
    
    // Utiliser directement la variable d'environnement pour le chemin de base
    cheminBase = process.env.BASE_WATCH_DIR || "";
    logToFile(`Chemin de base chargé depuis .env: ${cheminBase}`);

    // Sauvegarder dans config.json
    const configPath = path.join(__dirname, "config.json");
    await fs.writeFile(
      configPath,
      JSON.stringify(
        {
          cheminBase: cheminBase,
          lastUpdate: new Date().toISOString(),
        },
        null,
        2
      )
    );

    // Charger la configuration des dossiers surveillés
    const watchConfigPath = path.join(__dirname, "watch-config.json");
    
    // Créer la configuration avec les chemins depuis .env
    const baseWatchDirs = process.env.BASE_WATCH_DIRS ? 
      process.env.BASE_WATCH_DIRS.split(",") : 
      [process.env.BASE_WATCH_DIR];

    watchConfig = {
      watchDirectories: baseWatchDirs.map((dirPath, index) => ({
        id: `dir_${index}`,
        path: dirPath.trim(),
        description: `Dossier STL ${index + 1}`,
        active: true,
      })),
    };

    // Sauvegarder la nouvelle configuration
    await fs.writeFile(
      watchConfigPath,
      JSON.stringify(watchConfig, null, 2)
    );
    
    logToFile(`Configuration des dossiers mise à jour: ${JSON.stringify(watchConfig.watchDirectories)}`);
  } catch (error) {
    logToFile(`Erreur lors du chargement de la configuration: ${error}`);
  }
}

// Initialiser le gestionnaire STL avec le dossier source
let gestionnaireSTL;

// Fonction pour initialiser le gestionnaire STL
async function initialiserGestionnaireSTL() {
  await chargerConfiguration();
  gestionnaireSTL = new GestionSTL(modelsPath, cheminBase);
  await gestionnaireSTL.initialiserTousLesFichiers();
  logToFile("Métadonnées STL initialisées avec succès");
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
    logToFile(`Erreur lors de la lecture de la configuration: ${error}`);
    res
      .status(500)
      .json({ error: "Erreur lors de la lecture de la configuration" });
  }
});

// Middleware pour logger les requêtes de fichiers
appExpress.use((req, res, next) => {
  logToFile(`Requête reçue: ${req.method} ${req.url}`);
  next();
});

// Monter les routes du fichier fileRoutes avec le préfixe /api
appExpress.use("/api", fileRoutes);

// Variables globales
const configPath = path.join(__dirname, "config.json");

// Endpoint pour lister les modèles
appExpress.get("/api/models", async (req, res) => {
  try {
    logToFile("\n=== Récupération des modèles ===");
    logToFile(`Lecture du dossier: ${modelsPath}`);
    
    const files = await fs.readdir(modelsPath);
    logToFile(`Fichiers trouvés: ${files.length}`);
    
    const stlFiles = files.filter((file) => file.toLowerCase().endsWith(".stl"));
    logToFile(`Fichiers STL trouvés: ${stlFiles.length}`);
    
    const modelPromises = stlFiles.map(async (file) => {
      const filePath = path.join(modelsPath, file);
      const stats = await fs.stat(filePath);
      
      const model = {
        id: file,
        name: file,
        nom: path.parse(file).name, 
        path: filePath,
        size: stats.size,
        lastModified: stats.mtime.toISOString()
      };
      return model;
    });

    const models = await Promise.all(modelPromises);
    logToFile(`Nombre total de modèles: ${models.length}`);
    res.json(models);
  } catch (error) {
    logToFile(`Erreur lors de la récupération des modèles: ${error}`);
    res.status(500).json({ error: "Erreur lors de la récupération des modèles" });
  }
});

// Endpoint pour mettre à jour un modèle
appExpress.put("/api/models/:id", async (req, res) => {
  try {
    const modelId = req.params.id;
    const updateData = req.body;
    logToFile(
      `Modification du modèle: ${modelId} ${JSON.stringify(updateData)}`
    );

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
      const oldMetadataPath = path.join(
        modelsPath,
        "metadata",
        oldMetadataName
      );
      const newMetadataPath = path.join(
        modelsPath,
        "metadata",
        newMetadataName
      );
      const oldSourceMetadataPath = path.join(
        cheminBase,
        "metadata",
        oldMetadataName
      );
      const newSourceMetadataPath = path.join(
        cheminBase,
        "metadata",
        newMetadataName
      );

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
      ...metadata,
    };

    res.json(updatedModel);
  } catch (error) {
    logToFile(`Erreur lors de la modification du modèle: ${error}`);
    res.status(500).json({
      error: `Erreur lors de la modification du modèle: ${error}`,
    });
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
    theme: "autre",
  };

  // Si le fichier metadata existe déjà, préserver l'ID existant
  if (fsSync.existsSync(metadataPath)) {
    try {
      const existingMetadata = JSON.parse(
        await fs.readFile(metadataPath, "utf8")
      );
      metadata = {
        ...metadata,
        id: existingMetadata.id || metadata.id,
        categorie: existingMetadata.categorie || metadata.categorie,
        theme: existingMetadata.theme || metadata.theme,
      };
    } catch (error) {
      logToFile(
        `Erreur lors de la lecture des métadonnées existantes pour ${fileName}: ${error}`
      );
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
      logToFile(`Fichier copié: ${fileName}`);
    }

    // Créer ou mettre à jour le fichier metadata
    const metadata = await createMetadataFile(destPath);
    return {
      id: metadata.id,
      ...metadata,
      fileUrl: `/stl-files/${encodeURIComponent(fileName)}`,
    };
  } catch (error) {
    logToFile(`Erreur lors de la copie de ${sourcePath}: ${error}`);
    return null;
  }
}

// Fonction pour synchroniser les fichiers
async function synchroniserFichiers() {
  try {
    logToFile("\n=== Début de la synchronisation des fichiers ===");
    logToFile(`Dossier destination: ${modelsPath}`);

    // Vérifier si le dossier de destination existe
    if (!fsSync.existsSync(modelsPath)) {
      logToFile(`Création du dossier de destination: ${modelsPath}`);
      fsSync.mkdirSync(modelsPath, { recursive: true });
    }

    // Pour chaque dossier surveillé
    for (const dossierSource of BASE_WATCH_DIRS) {
      logToFile(`\nTraitement du dossier: ${dossierSource}`);

      try {
        // Vérifier si le dossier existe
        if (!fsSync.existsSync(dossierSource)) {
          logToFile(`Le dossier ${dossierSource} n'existe pas, passage au suivant`);
          continue;
        }

        // Lecture du dossier source
        const fichiers = await fs.readdir(dossierSource);
        const fichiersSTL = fichiers.filter((f) => f.toLowerCase().endsWith(".stl"));
        logToFile(`Nombre de fichiers STL trouvés: ${fichiersSTL.length}`);

        // Pour chaque fichier STL
        for (const fichier of fichiersSTL) {
          const cheminSource = path.join(dossierSource, fichier);
          const cheminDestination = path.join(modelsPath, fichier);
          logToFile(`\nTraitement du fichier: ${fichier}`);

          try {
            // Vérifier si le fichier existe déjà dans la destination
            const sourceStats = await fs.stat(cheminSource);
            let destinationStats;
            try {
              destinationStats = await fs.stat(cheminDestination);
              logToFile("Le fichier existe déjà dans la destination");
            } catch {
              destinationStats = null;
              logToFile("Le fichier n'existe pas encore dans la destination");
            }

            // Copier si le fichier n'existe pas ou si la taille est différente
            if (!destinationStats || sourceStats.size !== destinationStats.size) {
              logToFile("Copie du fichier...");
              await fs.copyFile(cheminSource, cheminDestination);
              logToFile("Fichier copié avec succès");
            } else {
              logToFile("Le fichier est déjà à jour");
            }
          } catch (err) {
            logToFile(`Erreur lors de la copie de ${fichier}: ${err}`);
          }
        }
      } catch (err) {
        logToFile(`Erreur lors de la lecture du dossier ${dossierSource}: ${err}`);
      }
    }
    logToFile("\n=== Synchronisation terminée ===");
  } catch (error) {
    logToFile(`Erreur lors de la synchronisation: ${error}`);
  }
}

// Démarrer la synchronisation au démarrage du serveur et toutes les 30 secondes
async function demarrerServeur() {
  try {
    // Initialiser le gestionnaire STL
    await initialiserGestionnaireSTL();

    logToFile(`Chemin de base des fichiers STL: ${cheminBase}`);
    logToFile(`Dossier des modèles: ${modelsPath}`);

    // Synchronisation initiale
    await synchroniserFichiers();

    // Synchronisation périodique
    setInterval(synchroniserFichiers, 30000);

    appExpress.listen(port, () => {
      logToFile(`Serveur démarré sur le port ${port}`);
    });
  } catch (error) {
    logToFile(`Erreur lors du démarrage du serveur: ${error}`);
  }
}

// Routes pour la gestion des dossiers surveillés
appExpress.get("/api/watch-config", async (req, res) => {
  try {
    const watchConfigPath = path.join(__dirname, "watch-config.json");
    if (fsSync.existsSync(watchConfigPath)) {
      const config = JSON.parse(await fs.readFile(watchConfigPath, "utf8"));
      res.json(config);
    } else {
      res.json({ watchDirectories: [] });
    }
  } catch (error) {
    logToFile(`Erreur lors de la lecture de la configuration: ${error}`);
    res
      .status(500)
      .json({ error: "Erreur lors de la lecture de la configuration" });
  }
});

appExpress.post("/api/watch-config", async (req, res) => {
  try {
    const watchConfigPath = path.join(__dirname, "watch-config.json");
    const newConfig = req.body;
    await fs.writeFile(watchConfigPath, JSON.stringify(newConfig, null, 2));
    watchConfig = newConfig;
    res.json(newConfig);
  } catch (error) {
    logToFile(`Erreur lors de la mise à jour de la configuration: ${error}`);
    res
      .status(500)
      .json({ error: "Erreur lors de la mise à jour de la configuration" });
  }
});

appExpress.post("/api/watch-directory", async (req, res) => {
  try {
    const { path: dirPath, description } = req.body;
    if (!dirPath) {
      return res.status(400).json({ error: "Le chemin est requis" });
    }

    const newDir = {
      id: uuidv4(),
      path: dirPath,
      description: description || "Nouveau dossier surveillé",
      active: true,
    };

    watchConfig.watchDirectories.push(newDir);
    const watchConfigPath = path.join(__dirname, "watch-config.json");
    await fs.writeFile(watchConfigPath, JSON.stringify(watchConfig, null, 2));

    res.json(newDir);
  } catch (error) {
    logToFile(`Erreur lors de l'ajout du dossier: ${error}`);
    res.status(500).json({ error: "Erreur lors de l'ajout du dossier" });
  }
});

appExpress.delete("/api/watch-directory/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const dirIndex = watchConfig.watchDirectories.findIndex(
      (dir) => dir.id === id
    );

    if (dirIndex === -1) {
      return res.status(404).json({ error: "Dossier non trouvé" });
    }

    watchConfig.watchDirectories.splice(dirIndex, 1);
    const watchConfigPath = path.join(__dirname, "watch-config.json");
    await fs.writeFile(watchConfigPath, JSON.stringify(watchConfig, null, 2));

    res.json({ success: true });
  } catch (error) {
    logToFile(`Erreur lors de la suppression du dossier: ${error}`);
    res.status(500).json({ error: "Erreur lors de la suppression du dossier" });
  }
});

// Démarrer le serveur
demarrerServeur();
