import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import {
  readdir,
  statSync,
  mkdirSync,
  existsSync,
  copyFileSync,
  watch,
} from "fs";
import { promisify } from "util";
import fs from "fs";

const readdirAsync = promisify(readdir);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// Activation de CORS pour permettre les requêtes depuis le frontend
app.use(cors());

// Lecture de la configuration
const configPath = join(__dirname, "src", "server", "config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

// Dossiers source des fichiers
const SOURCE_DIRECTORY = config.cheminBase;
const METADATA_DIRECTORY = join(SOURCE_DIRECTORY, "metadata");
const STL_DIRECTORY = join(__dirname, "stl-files");
const STL_METADATA_DIRECTORY = join(STL_DIRECTORY, "metadata");

// Création des dossiers nécessaires
[STL_DIRECTORY, STL_METADATA_DIRECTORY].forEach((dir) => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
});

// Fonction pour synchroniser les fichiers
const syncFiles = async () => {
  try {
    console.log("Début de la synchronisation...");
    console.log(`Dossier source STL: ${SOURCE_DIRECTORY}`);
    console.log(`Dossier source metadata: ${METADATA_DIRECTORY}`);
    console.log(`Dossier destination STL: ${STL_DIRECTORY}`);
    console.log(`Dossier destination metadata: ${STL_METADATA_DIRECTORY}`);

    // Vérification des dossiers source
    if (!existsSync(SOURCE_DIRECTORY) || !existsSync(METADATA_DIRECTORY)) {
      console.error("Dossiers source manquants!");
      return;
    }

    // Lecture des fichiers
    const sourceStlFiles = await readdirAsync(SOURCE_DIRECTORY);
    const sourceMetadataFiles = await readdirAsync(METADATA_DIRECTORY);
    const destStlFiles = existsSync(STL_DIRECTORY)
      ? await readdirAsync(STL_DIRECTORY)
      : [];
    const destMetadataFiles = existsSync(STL_METADATA_DIRECTORY)
      ? await readdirAsync(STL_METADATA_DIRECTORY)
      : [];

    // Synchronisation des fichiers STL
    for (const file of sourceStlFiles) {
      if (file.toLowerCase().endsWith(".stl")) {
        const sourcePath = join(SOURCE_DIRECTORY, file);
        const destPath = join(STL_DIRECTORY, file);
        const sourceStats = statSync(sourcePath);

        if (
          !destStlFiles.includes(file) ||
          (destStlFiles.includes(file) &&
            sourceStats.mtime > statSync(destPath).mtime)
        ) {
          console.log(`Copie du fichier STL: ${file}`);
          copyFileSync(sourcePath, destPath);
        }

        // Recherche et copie du fichier JSON associé
        const jsonFile = `${file}.json`;
        if (sourceMetadataFiles.includes(jsonFile)) {
          const sourceJsonPath = join(METADATA_DIRECTORY, jsonFile);
          const destJsonPath = join(STL_METADATA_DIRECTORY, jsonFile);
          console.log(`Copie du fichier metadata: ${jsonFile}`);
          copyFileSync(sourceJsonPath, destJsonPath);
        }
      }
    }

    // Synchronisation inverse (destination vers source)
    for (const file of destStlFiles) {
      if (file.toLowerCase().endsWith(".stl")) {
        const sourcePath = join(SOURCE_DIRECTORY, file);
        const destPath = join(STL_DIRECTORY, file);

        if (!sourceStlFiles.includes(file)) {
          console.log(`Synchronisation inverse du fichier STL: ${file}`);
          copyFileSync(destPath, sourcePath);

          // Copie du fichier JSON associé s'il existe
          const jsonFile = `${file}.json`;
          if (destMetadataFiles.includes(jsonFile)) {
            const sourceJsonPath = join(METADATA_DIRECTORY, jsonFile);
            const destJsonPath = join(STL_METADATA_DIRECTORY, jsonFile);
            console.log(`Synchronisation inverse du metadata: ${jsonFile}`);
            copyFileSync(destJsonPath, sourceJsonPath);
          }
        }
      }
    }

    console.log("Synchronisation terminée avec succès");
  } catch (error) {
    console.error("Erreur lors de la synchronisation:", error);
  }
};

// Route pour synchroniser les fichiers
app.get("/sync", (req, res) => {
  syncFiles()
    .then(() => res.json({ success: true }))
    .catch((error) => res.status(500).json({ error: error.message }));
});

// Synchronisation initiale
syncFiles();

// Surveillance des changements
watch(SOURCE_DIRECTORY, (eventType, filename) => {
  if (filename) {
    console.log(`Changement détecté dans le dossier source: ${filename}`);
    syncFiles();
  }
});

watch(METADATA_DIRECTORY, (eventType, filename) => {
  if (filename) {
    console.log(`Changement détecté dans le dossier metadata: ${filename}`);
    syncFiles();
  }
});

// Route pour lister les fichiers STL
app.get("/api/models", async (req, res) => {
  try {
    const files = await readdirAsync(STL_DIRECTORY);
    const stlFiles = files.filter((file) =>
      file.toLowerCase().endsWith(".stl")
    );

    // Parcourir les fichiers STL et les métadonnées
    const modelsPromises = stlFiles.map(async (file) => {
      const filePath = join(STL_DIRECTORY, file);
      const stats = statSync(filePath);
      const metadataPath = join(STL_METADATA_DIRECTORY, `${file}.json`);

      let metadata = {
        name: file.replace(".STL", ""),
        category: "filament",
        theme: "autre",
      };

      if (existsSync(metadataPath)) {
        try {
          metadata = JSON.parse(
            await fs.promises.readFile(metadataPath, "utf-8")
          );
        } catch (error) {
          console.error(
            `Erreur lors de la lecture des métadonnées pour ${file}:`,
            error
          );
        }
      }

      return {
        id: file,
        fileUrl: `http://localhost:${PORT}/stl-files/${file}`,
        size: stats.size,
        date: stats.mtime,
        ...metadata,
      };
    });

    const models = await Promise.all(modelsPromises);
    res.json(models);
  } catch (error) {
    console.error("Erreur lors de la lecture des fichiers:", error);
    res.status(500).json({ error: "Erreur lors de la lecture des fichiers" });
  }
});

// Route pour mettre à jour un modèle
app.put("/api/models/:id", express.json(), async (req, res) => {
  const { id } = req.params;
  const { name, category, theme } = req.body;

  try {
    // Vérifier si le fichier existe
    const filePath = join(STL_DIRECTORY, id);
    if (!existsSync(filePath)) {
      return res.status(404).json({ error: `Le fichier ${id} n'existe pas` });
    }

    // Dans une vraie application, vous stockeriez ces métadonnées dans une base de données
    // Pour l'instant, nous allons les stocker dans un fichier JSON à côté du fichier STL
    const metadataPath = join(STL_METADATA_DIRECTORY, `${id}.json`);
    const metadata = {
      id,
      name: name || id.replace(".STL", ""),
      category: category || "filament",
      theme: theme || "autre",
      lastModified: new Date().toISOString(),
    };

    // Sauvegarder les métadonnées
    await fs.promises.writeFile(
      metadataPath,
      JSON.stringify(metadata, null, 2)
    );

    res.json({
      ...metadata,
      message: "Modèle mis à jour avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du modèle:", error);
    res.status(500).json({ error: "Erreur lors de la mise à jour du modèle" });
  }
});

// Route pour récupérer les métadonnées d'un modèle
app.get("/api/models/:id/metadata", async (req, res) => {
  const { id } = req.params;
  const metadataPath = join(STL_METADATA_DIRECTORY, `${id}.json`);

  try {
    if (existsSync(metadataPath)) {
      const metadata = JSON.parse(
        await fs.promises.readFile(metadataPath, "utf-8")
      );
      res.json(metadata);
    } else {
      res.json({
        id,
        name: id.replace(".STL", ""),
        category: "filament",
        theme: "autre",
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la lecture des métadonnées" });
  }
});

// Route pour servir les fichiers STL statiques
app.use("/stl-files", express.static(STL_DIRECTORY));

// Route de test pour vérifier que le serveur fonctionne
app.get("/", (req, res) => {
  res.json({
    message: "Serveur STL opérationnel",
    sourceDirectory: SOURCE_DIRECTORY,
    targetDirectory: STL_DIRECTORY,
  });
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
  console.log(`Dossier source STL: ${SOURCE_DIRECTORY}`);
  console.log(`Dossier destination STL: ${STL_DIRECTORY}`);
});
