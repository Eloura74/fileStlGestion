const express = require("express");
const cors = require("cors");
const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path");
const fileRoutes = require("./routes/fileRoutes");
const { v4: uuidv4 } = require('uuid');

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
let cheminBase = path.join(__dirname, "..", "..", "stl-files");

// Charger la configuration au démarrage
async function chargerConfiguration() {
  try {
    if (fsSync.existsSync(configPath)) {
      const configContent = await fs.readFile(configPath, "utf8");
      const config = JSON.parse(configContent);

      if (config.cheminBase && fsSync.existsSync(config.cheminBase)) {
        cheminBase = config.cheminBase;
        console.log(
          "Configuration chargée avec succès. Chemin de base:",
          cheminBase
        );
      } else {
        console.log(
          "Chemin de base invalide dans la configuration, utilisation du chemin par défaut:",
          cheminBase
        );
        // Si le chemin n'existe pas, on le crée
        if (config.cheminBase) {
          try {
            await fs.mkdir(config.cheminBase, { recursive: true });
            cheminBase = config.cheminBase;
            console.log("Dossier créé avec succès:", cheminBase);
          } catch (error) {
            console.error("Erreur lors de la création du dossier:", error);
          }
        }
      }
    } else {
      console.log(
        "Fichier de configuration non trouvé, création avec le chemin par défaut:",
        cheminBase
      );
      await sauvegarderConfiguration();
    }
  } catch (error) {
    console.error("Erreur lors du chargement de la configuration:", error);
    console.log("Utilisation du chemin par défaut:", cheminBase);
    await sauvegarderConfiguration();
  }
}

// Sauvegarder la configuration
async function sauvegarderConfiguration() {
  try {
    const config = {
      cheminBase,
      lastUpdate: new Date().toISOString(),
    };
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    console.log("Configuration sauvegardée avec succès");
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de la configuration:", error);
  }
}

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

// Endpoint pour lister les modèles
appExpress.get("/api/models", async (req, res) => {
  try {
    console.log("Récupération de la liste des modèles...");
    const files = await fs.readdir(modelsPath);
    const models = [];

    for (const file of files) {
      if (file.toLowerCase().endsWith('.stl')) {
        const filePath = path.join(modelsPath, file);
        const stats = await fs.stat(filePath);
        const metadataPath = `${filePath}.metadata.json`;
        console.log("Recherche des métadonnées:", metadataPath);

        let metadata = {
          id: file, // Utiliser le nom du fichier comme ID par défaut
          nom: file,
          format: "STL",
          taille: stats.size,
          dateCreation: stats.birthtime,
          dateModification: stats.mtime,
          categorie: "filament",
          theme: "autre",
          fileUrl: `http://localhost:3001/stl-files/${encodeURIComponent(file)}`
        };

        try {
          if (fsSync.existsSync(metadataPath)) {
            const metadataContent = await fs.readFile(metadataPath, 'utf8');
            const existingMetadata = JSON.parse(metadataContent);
            
            // Si pas d'ID dans les métadonnées existantes, en créer un
            if (!existingMetadata.id) {
              existingMetadata.id = file;
              await fs.writeFile(metadataPath, JSON.stringify(existingMetadata, null, 2));
            }
            
            metadata = { ...metadata, ...existingMetadata };
          } else {
            // Créer le fichier metadata s'il n'existe pas
            await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
          }
        } catch (metadataError) {
          console.error("Erreur lors de la lecture des métadonnées:", metadataError);
        }

        models.push(metadata);
      }
    }

    console.log("Modèles trouvés:", models.map(m => ({ id: m.id, nom: m.nom })));
    res.json(models);
  } catch (error) {
    console.error("Erreur lors de la récupération des modèles:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des modèles" });
  }
});

// Route pour modifier un modèle
appExpress.put("/api/models/:id", async (req, res) => {
  try {
    const modelId = decodeURIComponent(req.params.id);
    const updateData = req.body;
    console.log("Modification du modèle:", modelId, updateData);

    // Trouver le fichier correspondant à l'ID dans les métadonnées
    const files = await fs.readdir(modelsPath);
    let currentFile = null;
    let currentMetadata = null;

    for (const file of files) {
      if (file.toLowerCase().endsWith('.stl')) {
        const metadataPath = path.join(modelsPath, `${file}.metadata.json`);
        if (fsSync.existsSync(metadataPath)) {
          try {
            const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
            // Comparer avec le nom du fichier si pas d'ID
            if (metadata.id === modelId || (!metadata.id && file === modelId)) {
              currentFile = file;
              currentMetadata = metadata;
              // Si pas d'ID, en créer un
              if (!metadata.id) {
                metadata.id = uuidv4();
                currentMetadata = metadata;
                await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
              }
              break;
            }
          } catch (err) {
            console.warn(`Erreur de lecture des métadonnées pour ${file}:`, err);
          }
        }
      }
    }

    if (!currentFile || !currentMetadata) {
      console.error("Modèle non trouvé:", modelId);
      return res.status(404).json({ error: "Modèle non trouvé" });
    }

    // Construire les chemins
    const currentPath = path.join(modelsPath, currentFile);
    const currentMetadataPath = `${currentPath}.metadata.json`;

    // Si le nom a changé, renommer le fichier
    if (updateData.nom && updateData.nom !== currentFile) {
      const newFileName = updateData.nom.toLowerCase().endsWith('.stl') 
        ? updateData.nom 
        : `${updateData.nom}.stl`;
      const newPath = path.join(modelsPath, newFileName);
      const newMetadataPath = `${newPath}.metadata.json`;

      // Vérifier si le nouveau nom n'existe pas déjà
      if (fsSync.existsSync(newPath)) {
        return res.status(400).json({ 
          error: "Un fichier avec ce nom existe déjà" 
        });
      }

      try {
        // Renommer le fichier et ses métadonnées
        await fs.rename(currentPath, newPath);
        await fs.rename(currentMetadataPath, newMetadataPath);

        // Renommer également dans le dossier source
        const sourceFile = path.join(cheminBase, currentFile);
        const newSourceFile = path.join(cheminBase, newFileName);
        if (fsSync.existsSync(sourceFile)) {
          await fs.rename(sourceFile, newSourceFile);
        }

        // Mettre à jour les métadonnées
        const updatedMetadata = {
          ...currentMetadata,
          nom: newFileName,
          categorie: updateData.categorie || currentMetadata.categorie,
          theme: updateData.theme || currentMetadata.theme,
          dateModification: new Date().toISOString(),
          taille: (await fs.stat(newPath)).size
        };

        await fs.writeFile(newMetadataPath, JSON.stringify(updatedMetadata, null, 2));
        return res.json({ success: true, model: updatedMetadata });
      } catch (error) {
        console.error("Erreur lors du renommage:", error);
        return res.status(500).json({
          error: "Erreur lors du renommage du fichier: " + error.message
        });
      }
    } else {
      // Si seules les métadonnées sont modifiées
      const updatedMetadata = {
        ...currentMetadata,
        categorie: updateData.categorie || currentMetadata.categorie,
        theme: updateData.theme || currentMetadata.theme,
        dateModification: new Date().toISOString()
      };

      await fs.writeFile(currentMetadataPath, JSON.stringify(updatedMetadata, null, 2));
      return res.json({ success: true, model: updatedMetadata });
    }
  } catch (error) {
    console.error("Erreur lors de la modification:", error);
    res.status(500).json({
      error: "Erreur lors de la modification du modèle: " + error.message,
    });
  }
});

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

          // Créer ou mettre à jour les métadonnées
          await createMetadataFile(cheminDestination);
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
    await chargerConfiguration();
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
