// Charger les variables d'environnement en premier
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const { exec } = require("child_process");

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

// Configuration CORS détaillée
const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
appExpress.use(cors(corsOptions));
appExpress.use(express.json());

// Middleware pour les en-têtes CORS personnalisés
appExpress.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Gérer les requêtes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Servir les fichiers statiques
const modelsPath = path.join(__dirname, "..", "..", "stl-files");
logToFile(`Chemin des modèles: ${modelsPath}`);

if (!fsSync.existsSync(modelsPath)) {
  logToFile("Création du dossier des modèles");
  fsSync.mkdirSync(modelsPath, { recursive: true });
}

// Configuration des routes statiques
appExpress.use("/stl-files", express.static(modelsPath));
appExpress.use(
  "/models",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:5173");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
  },
  express.static(modelsPath)
); // Pour la rétrocompatibilité

// Configuration initiale
const cheminBase =
  process.env.VITE_BASE_WATCH_DIRS || "C:/Users/Quentin/Documents/fichier3d"; // Chemin fixe vers fichier3d
console.log("=== Configuration des chemins ===");
console.log("cheminBase:", cheminBase);
console.log("modelsPath:", modelsPath);

// Configuration de la surveillance des dossiers
const watchConfig = {
  watchDirectories: [],
  initialized: false,
};

// Fonction pour charger la configuration
async function chargerConfiguration() {
  try {
    logToFile("=== Chargement de la configuration ===");

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

    // Créer la configuration avec les chemins depuis .env
    const baseWatchDirs = process.env.BASE_WATCH_DIRS
      ? process.env.BASE_WATCH_DIRS.split(",")
      : [cheminBase];

    const watchConfigPath = path.join(__dirname, "watch-config.json");
    const watchConfig = {
      watchDirectories: baseWatchDirs.map((dirPath, index) => ({
        id: `dir_${index}`,
        path: dirPath.trim(),
        description: `Dossier STL ${index + 1}`,
        active: true,
      })),
    };

    // Sauvegarder la nouvelle configuration
    await fs.writeFile(watchConfigPath, JSON.stringify(watchConfig, null, 2));

    logToFile(
      `Configuration des dossiers mise à jour: ${JSON.stringify(
        watchConfig.watchDirectories
      )}`
    );

    return watchConfig;
  } catch (error) {
    logToFile(`Erreur lors du chargement de la configuration: ${error}`);
    throw error;
  }
}

// Fonction pour créer les dossiers nécessaires
async function initializeFolders() {
  try {
    // Créer le dossier fichier3d s'il n'existe pas
    if (!fsSync.existsSync(cheminBase)) {
      await fs.mkdir(cheminBase, { recursive: true });
      console.log("Dossier fichier3d créé:", cheminBase);
    }

    // Créer le dossier metadata dans fichier3d
    const sourceMetadataPath = path.join(cheminBase, "metadata");
    if (!fsSync.existsSync(sourceMetadataPath)) {
      await fs.mkdir(sourceMetadataPath, { recursive: true });
      console.log("Dossier metadata créé dans fichier3d:", sourceMetadataPath);
    }

    // Créer le fichier metadata.json s'il n'existe pas
    const metadataJsonPath = path.join(cheminBase, "metadata.json");
    if (!fsSync.existsSync(metadataJsonPath)) {
      await fs.writeFile(metadataJsonPath, JSON.stringify({}, null, 2));
      console.log("Fichier metadata.json créé:", metadataJsonPath);
    }

    // Créer le dossier metadata dans l'application
    const appMetadataPath = path.join(modelsPath, "metadata");
    if (!fsSync.existsSync(appMetadataPath)) {
      await fs.mkdir(appMetadataPath, { recursive: true });
      console.log("Dossier metadata créé dans l'application:", appMetadataPath);
    }

    console.log("Initialisation des dossiers terminée");
  } catch (error) {
    console.error("Erreur lors de l'initialisation des dossiers:", error);
    process.exit(1);
  }
}

// Fonction pour copier un fichier
async function copyFile(source, destination) {
  try {
    await fs.copyFile(source, destination);
    console.log(`Fichier copié de ${source} vers ${destination}`);
    return true;
  } catch (error) {
    console.error(`Erreur lors de la copie du fichier: ${error}`);
    return false;
  }
}

// Fonction pour synchroniser un fichier entre les deux dossiers
async function syncFile(fileName, fromPath, toPath) {
  const sourceFile = path.join(fromPath, fileName);
  const destFile = path.join(toPath, fileName);

  if (fsSync.existsSync(sourceFile)) {
    await copyFile(sourceFile, destFile);
    return true;
  }
  return false;
}

// Fonction principale pour démarrer le serveur
async function demarrerServeur() {
  try {
    // Initialiser les dossiers
    await initializeFolders();

    console.log("Dossier surveillé :", cheminBase);

    // Obtenir les chemins de base depuis les variables d'environnement
    const BASE_WATCH_DIRS = process.env.BASE_WATCH_DIRS
      ? process.env.BASE_WATCH_DIRS.split(";").map((path) => path.trim())
      : [];

    // Configuration de base
    watchConfig.watchDirectories = BASE_WATCH_DIRS;

    // Initialiser le gestionnaire STL avec le dossier source
    let gestionnaireSTL;

    // Fonction pour initialiser le gestionnaire STL
    async function initialiserGestionnaireSTL() {
      const config = await chargerConfiguration();
      gestionnaireSTL = new GestionSTL(modelsPath, cheminBase);
      await gestionnaireSTL.initialiserTousLesFichiers();
      logToFile("Métadonnées STL initialisées avec succès");
      return gestionnaireSTL;
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
          fsSync.writeFileSync(
            configPath,
            JSON.stringify(defaultConfig, null, 2)
          );
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

        const stlFiles = files.filter((file) =>
          file.toLowerCase().endsWith(".stl")
        );
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
            lastModified: stats.mtime.toISOString(),
          };
          return model;
        });

        const models = await Promise.all(modelPromises);
        logToFile(`Nombre total de modèles: ${models.length}`);
        res.json(models);
      } catch (error) {
        logToFile(`Erreur lors de la récupération des modèles: ${error}`);
        res
          .status(500)
          .json({ error: "Erreur lors de la récupération des modèles" });
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
              logToFile(
                `Le dossier ${dossierSource} n'existe pas, passage au suivant`
              );
              continue;
            }

            // Lecture du dossier source
            const fichiers = await fs.readdir(dossierSource);
            const fichiersSTL = fichiers.filter((f) =>
              f.toLowerCase().endsWith(".stl")
            );
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
                  logToFile(
                    "Le fichier n'existe pas encore dans la destination"
                  );
                }

                // Copier si le fichier n'existe pas ou si la taille est différente
                if (
                  !destinationStats ||
                  sourceStats.size !== destinationStats.size
                ) {
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
            logToFile(
              `Erreur lors de la lecture du dossier ${dossierSource}: ${err}`
            );
          }
        }
        logToFile("\n=== Synchronisation terminée ===");
      } catch (error) {
        logToFile(`Erreur lors de la synchronisation: ${error}`);
      }
    }

    // Route pour ouvrir l'explorateur Windows
    appExpress.get("/api/open-explorer/:filename", async (req, res) => {
      try {
        const { filename } = req.params;
        console.log("\n=== Requête d'ouverture de fichier ===");
        console.log("Nom du fichier demandé:", filename);
        console.log("Chemins de recherche actuels:", {
          cheminBase,
          modelsPath,
        });

        // Vérifier d'abord dans le dossier cheminBase
        let filePath = path.join(cheminBase, filename);
        console.log("Chemin complet recherché:", filePath);

        // Vérifier si le fichier existe
        const fileExists = fsSync.existsSync(filePath);
        console.log("Le fichier existe dans cheminBase:", fileExists);

        if (!fileExists) {
          // Essayer dans le dossier modelsPath
          filePath = path.join(modelsPath, filename);
          const existsInModels = fsSync.existsSync(filePath);
          console.log("Le fichier existe dans modelsPath:", existsInModels);

          if (!existsInModels) {
            console.log("Fichier non trouvé dans les deux emplacements");
            // Lister les fichiers dans cheminBase pour debug
            try {
              const filesInDir = fsSync.readdirSync(cheminBase);
              console.log("Contenu de cheminBase:", filesInDir);
            } catch (error) {
              console.error("Erreur lors de la lecture du dossier:", error);
            }

            return res.status(404).json({
              success: false,
              message: "Fichier non trouvé dans les dossiers surveillés",
              searchedPaths: [
                path.join(cheminBase, filename),
                path.join(modelsPath, filename),
              ],
            });
          }
        }

        console.log(
          "Fichier trouvé, ouverture de l'explorateur avec:",
          filePath
        );
        // Utiliser explorer.exe pour ouvrir le dossier et sélectionner le fichier
        exec(`explorer.exe /select,"${filePath}"`, (error) => {
          // On ignore l'erreur car explorer.exe ne renvoie pas de résultat
          // mais ouvre quand même l'explorateur
          res.json({
            success: true,
            message: "Explorateur ouvert avec succès",
            path: filePath,
          });
        });
      } catch (error) {
        console.error("Erreur serveur:", error);
        res.status(500).json({
          success: false,
          message:
            "Erreur lors de l'ouverture de l'explorateur: " + error.message,
        });
      }
    });

    // Démarrer la synchronisation au démarrage du serveur et toutes les 30 secondes
    await initialiserGestionnaireSTL();
    await synchroniserFichiers();
    setInterval(synchroniserFichiers, 30000);

    // Route pour modifier un modèle
    appExpress.put("/api/models/:id", async (req, res) => {
      try {
        const modelId = req.params.id;
        const updateData = req.body;
        console.log("Mise à jour du modèle:", modelId, updateData);

        // Si le nom a changé, renommer le fichier
        if (updateData.nom && updateData.nom !== modelId) {
          // Assurer que le nouveau nom a l'extension .stl
          const newName = !updateData.nom.toLowerCase().endsWith(".stl")
            ? `${updateData.nom}.stl`
            : updateData.nom;

          updateData.nom = newName; // Mettre à jour le nom avec l'extension

          // Chemins dans le dossier de l'application
          const oldPath = path.join(modelsPath, modelId);
          const newPath = path.join(modelsPath, newName);

          // Chemins dans le dossier fichier3d
          const oldSourcePath = path.join(cheminBase, modelId);
          const newSourcePath = path.join(cheminBase, newName);

          console.log("État des chemins:", {
            cheminBase,
            modelsPath,
            oldPath,
            newPath,
            oldSourcePath,
            newSourcePath,
            existsInApp: fsSync.existsSync(oldPath),
            existsInSource: fsSync.existsSync(oldSourcePath),
          });

          try {
            // Renommer dans les deux emplacements
            if (fsSync.existsSync(oldPath)) {
              await fs.rename(oldPath, newPath);
              console.log("Fichier renommé dans l'application");
            }

            if (fsSync.existsSync(oldSourcePath)) {
              await fs.rename(oldSourcePath, newSourcePath);
              console.log("Fichier renommé dans fichier3d");
            }

            // Mettre à jour les métadonnées
            const metadata = {
              nom: newName,
              dateModification: new Date().toISOString(),
              ...updateData,
            };

            // Chemins des métadonnées
            const metadataFileName = `${path.parse(newName).name}.json`;
            const appMetadataPath = path.join(
              modelsPath,
              "metadata",
              metadataFileName
            );
            const sourceMetadataPath = path.join(
              cheminBase,
              "metadata",
              metadataFileName
            );

            // Créer les dossiers metadata s'ils n'existent pas
            await fs.mkdir(path.join(modelsPath, "metadata"), {
              recursive: true,
            });
            await fs.mkdir(path.join(cheminBase, "metadata"), {
              recursive: true,
            });

            // Écrire les métadonnées dans les deux emplacements
            const metadataContent = JSON.stringify(metadata, null, 2);
            await fs.writeFile(appMetadataPath, metadataContent);
            await fs.writeFile(sourceMetadataPath, metadataContent);

            // Mettre à jour le fichier metadata.json principal
            const mainMetadataPath = path.join(cheminBase, "metadata.json");
            let mainMetadata = {};
            try {
              const mainMetadataContent = await fs.readFile(
                mainMetadataPath,
                "utf8"
              );
              mainMetadata = JSON.parse(mainMetadataContent);
            } catch (error) {
              console.log("Création d'un nouveau metadata.json");
            }

            // Supprimer l'ancienne entrée et ajouter la nouvelle
            delete mainMetadata[modelId];
            mainMetadata[newName] = metadata;
            await fs.writeFile(
              mainMetadataPath,
              JSON.stringify(mainMetadata, null, 2)
            );

            console.log("Synchronisation terminée avec succès");
          } catch (error) {
            console.error("Erreur lors du renommage:", error);
            return res.status(500).json({
              success: false,
              message: "Erreur lors du renommage du fichier: " + error.message,
            });
          }
        }

        res.json({
          success: true,
          message: "Modèle mis à jour avec succès",
          data: updateData,
        });
      } catch (error) {
        console.error("Erreur lors de la mise à jour:", error);
        res.status(500).json({
          success: false,
          message: error.message,
        });
      }
    });

    // API pour l'inscription
    appExpress.post("/api/auth/register", async (req, res) => {
      const { email, motDePasse } = req.body;

      // Simulation d'un utilisateur enregistré (normalement, on stocke en base de données)
      const user = {
        email: "faber.quentin@gmail.com",
        motDePasse: "000000",
      };

      // Vérification si l'email existe déjà (normalement, on vérifie en base)
      if (email === user.email) {
        return res.status(400).json({
          success: false,
          message: "Cet email est déjà utilisé",
        });
      }

      // Simuler l'enregistrement d'un utilisateur (normalement, on l'ajoute en base)
      res.json({
        success: true,
        message: "Utilisateur enregistré avec succès",
        user: { email },
      });
    });

    // API pour la connexion
    appExpress.post("/api/auth/login", async (req, res) => {
      const { email, motDePasse } = req.body;

      // Simulation d'un utilisateur en base de données
      const user = {
        email: "faber.quentin@gmail.com",
        motDePasse: "000000",
      };

      // Vérification des identifiants
      if (email !== user.email || motDePasse !== user.motDePasse) {
        return res.status(401).json({
          success: false,
          message: "Identifiants invalides",
        });
      }

      // Simuler un token (dans un vrai cas, utilise JWT)
      const token = "fake-jwt-token";

      res.json({ token });
    });

    // Démarrer le serveur
    appExpress.listen(port, () => {
      logToFile(`Serveur démarré sur le port ${port}`);
    });
  } catch (error) {
    console.error("Erreur lors du démarrage du serveur:", error);
    process.exit(1);
  }
}
// _________________________________
// _________________________________
// Démarrer le serveur
demarrerServeur().catch((error) => {
  console.error("Erreur fatale:", error);
  process.exit(1);
});
