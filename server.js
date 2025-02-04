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

// Dossier source des fichiers STL
const SOURCE_DIRECTORY = "C:\\Users\\faber\\Documents\\fichier3d";
// Dossier où sont stockés les fichiers STL
const STL_DIRECTORY = join(__dirname, "stl-files");

// Création du dossier s'il n'existe pas
if (!existsSync(STL_DIRECTORY)) {
  mkdirSync(STL_DIRECTORY);
}

// Fonction pour copier les fichiers STL
const copySTLFiles = async () => {
  try {
    // Vérifier si le dossier source existe
    if (!existsSync(SOURCE_DIRECTORY)) {
      console.error(`Le dossier source n'existe pas: ${SOURCE_DIRECTORY}`);
      return;
    }

    const files = await readdirAsync(SOURCE_DIRECTORY);
    const stlFiles = files.filter((file) =>
      file.toLowerCase().endsWith(".stl")
    );

    console.log(`Fichiers STL trouvés: ${stlFiles.length}`);

    for (const file of stlFiles) {
      const sourcePath = join(SOURCE_DIRECTORY, file);
      const targetPath = join(STL_DIRECTORY, file);

      try {
        // Vérifier si le fichier existe déjà et si sa taille est différente
        const sourceStats = statSync(sourcePath);
        const targetExists = existsSync(targetPath);
        const targetStats = targetExists ? statSync(targetPath) : null;

        if (!targetExists || sourceStats.size !== targetStats?.size) {
          copyFileSync(sourcePath, targetPath);
          console.log(`Fichier copié avec succès: ${file}`);
        } else {
          console.log(`Le fichier existe déjà et n'a pas changé: ${file}`);
        }
      } catch (err) {
        console.error(`Erreur lors de la copie de ${file}:`, err);
      }
    }
  } catch (error) {
    console.error("Erreur lors de la lecture du dossier source:", error);
  }
};

// Copier les fichiers au démarrage
copySTLFiles();

// Surveiller le dossier source pour les changements
let watchTimeout;
try {
  watch(SOURCE_DIRECTORY, (eventType, filename) => {
    if (filename && filename.toLowerCase().endsWith(".stl")) {
      // Debounce pour éviter les copies multiples
      clearTimeout(watchTimeout);
      watchTimeout = setTimeout(() => {
        console.log(`Changement détecté dans le fichier: ${filename}`);
        copySTLFiles();
      }, 1000);
    }
  });
  console.log(`Surveillance du dossier source activée: ${SOURCE_DIRECTORY}`);
} catch (error) {
  console.error("Erreur lors de la mise en place de la surveillance:", error);
}

// Route pour lister les fichiers STL
app.get("/api/models", async (req, res) => {
  try {
    const files = await readdirAsync(STL_DIRECTORY);
    const stlFiles = files.filter((file) =>
      file.toLowerCase().endsWith(".stl")
    );

    const modelsPromises = stlFiles.map(async (file) => {
      const filePath = join(STL_DIRECTORY, file);
      const stats = statSync(filePath);
      const metadataPath = join(STL_DIRECTORY, `${file}.metadata.json`);

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
    const metadataPath = join(STL_DIRECTORY, `${id}.metadata.json`);
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
  const metadataPath = join(STL_DIRECTORY, `${id}.metadata.json`);

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
