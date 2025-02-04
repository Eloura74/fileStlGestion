const express = require("express");
const cors = require("cors");
const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path");
const fileRoutes = require("./routes/fileRoutes");

const app = express();
const port = 3001;

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // URL de votre application Vite
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json());

// Monter les routes du fichier fileRoutes avec le préfixe /api
app.use('/api', fileRoutes);

// Servir les fichiers statiques du dossier stl-files
const STL_FILES_DIR = path.join(__dirname, "..", "..", "stl-files");
const WATCH_DIR = "C:\\Users\\faber\\Documents\\fichier3d";
app.use("/stl-files", express.static(STL_FILES_DIR));

// Servir les fichiers STL directement depuis le dossier source
app.use("/models", (req, res, next) => {
  const fileName = decodeURIComponent(req.path).slice(1); // Enlever le / initial
  const filePath = path.join(WATCH_DIR, fileName);

  // Si le fichier n'a pas d'extension .stl, on l'ajoute
  const filePathWithExt = fileName.toLowerCase().endsWith(".stl")
    ? filePath
    : `${filePath}.stl`;

  console.log("Tentative d'accès au fichier:", filePathWithExt);

  if (fsSync.existsSync(filePathWithExt)) {
    res.setHeader("Content-Type", "application/sla");
    res.sendFile(filePathWithExt);
  } else {
    console.error("Fichier non trouvé:", filePathWithExt);
    res.status(404).send("Fichier non trouvé");
  }
});

// Fonction pour créer le fichier metadata.json
async function createMetadataFile(filePath) {
  const fileName = path.basename(filePath);
  const stats = await fs.stat(filePath);
  const metadataPath = path.join(
    STL_FILES_DIR,
    fileName.replace(/\.stl$/i, ".metadata.json")
  );

  const metadata = {
    nom: fileName.replace(/\.stl$/i, ""),
    format: "STL",
    taille: stats.size,
    dateCreation: stats.birthtime,
    dateModification: stats.mtime,
    categorie: "filament",
    theme: "autre",
  };

  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  return metadata;
}

// Fonction pour copier un fichier et créer ses métadonnées
async function copyFileWithMetadata(sourcePath) {
  try {
    const fileName = path.basename(sourcePath);
    const destPath = path.join(STL_FILES_DIR, fileName);

    // Créer le dossier stl-files s'il n'existe pas
    if (!fsSync.existsSync(STL_FILES_DIR)) {
      await fs.mkdir(STL_FILES_DIR, { recursive: true });
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
      id: Buffer.from(fileName).toString("base64"),
      ...metadata,
      fileUrl: `/stl-files/${encodeURIComponent(fileName)}`,
    };
  } catch (error) {
    console.error(`Erreur lors de la copie de ${sourcePath}:`, error);
    return null;
  }
}

// Endpoint pour lister les modèles
app.get("/api/models", async (req, res) => {
  try {
    console.log("Récupération de la liste des modèles...");
    const files = await fs.readdir(WATCH_DIR);
    const models = [];

    for (const file of files) {
      if (file.toLowerCase().endsWith(".stl")) {
        const filePath = path.join(WATCH_DIR, file);
        const stats = await fs.stat(filePath);

        // Construire le chemin du fichier metadata
        const metadataPath = path.join(STL_FILES_DIR, `${file}.metadata.json`);
        console.log("Recherche des métadonnées:", metadataPath);

        let metadata = {
          nom: file,
          format: "STL",
          taille: stats.size,
          dateModification: stats.mtime,
          categorie: "filament",
          theme: "autre",
        };

        if (fsSync.existsSync(metadataPath)) {
          try {
            const metadataContent = await fs.readFile(metadataPath, "utf8");
            const savedMetadata = JSON.parse(metadataContent);
            metadata = { ...metadata, ...savedMetadata };
            console.log("Métadonnées trouvées pour", file, ":", metadata);
          } catch (error) {
            console.error(
              "Erreur lors de la lecture des métadonnées pour",
              file,
              ":",
              error
            );
          }
        } else {
          console.log("Pas de métadonnées trouvées pour", file);
          // Créer le fichier metadata s'il n'existe pas
          await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
        }

        models.push(metadata);
      }
    }

    console.log("Modèles trouvés:", models);
    res.json(models);
  } catch (error) {
    console.error("Erreur lors de la récupération des modèles:", error);
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des modèles" });
  }
});

// Route pour modifier un modèle
app.put("/api/models/:id", async (req, res) => {
  try {
    const modelId = req.params.id;
    const updateData = req.body;
    console.log("Modification du modèle:", modelId, updateData);

    // Vérifier si le fichier STL existe
    const oldStlPath = path.join(WATCH_DIR, modelId);
    if (!fsSync.existsSync(oldStlPath)) {
      console.error("Fichier STL non trouvé:", oldStlPath);
      return res.status(404).json({ error: "Fichier STL non trouvé" });
    }

    // Si le nom a changé, copier le fichier avec le nouveau nom
    let newStlPath = oldStlPath;
    if (updateData.nom && updateData.nom !== modelId) {
      const newFileName = updateData.nom.endsWith(".stl")
        ? updateData.nom
        : `${updateData.nom}.stl`;
      newStlPath = path.join(WATCH_DIR, newFileName);

      // Vérifier si le nouveau nom n'existe pas déjà
      if (fsSync.existsSync(newStlPath)) {
        return res
          .status(400)
          .json({ error: "Un fichier avec ce nom existe déjà" });
      }

      try {
        // Copier le fichier avec le nouveau nom
        console.log("Copie du fichier:", oldStlPath, "->", newStlPath);
        await fs.copyFile(oldStlPath, newStlPath);

        // Attendre un peu pour s'assurer que la copie est terminée
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Supprimer l'ancien fichier
        try {
          await fs.unlink(oldStlPath);
        } catch (deleteError) {
          console.warn(
            "Impossible de supprimer l'ancien fichier:",
            deleteError
          );
          // On continue même si la suppression échoue
        }
      } catch (copyError) {
        console.error("Erreur lors de la copie du fichier:", copyError);
        return res.status(500).json({
          error:
            "Erreur lors de la copie du fichier. Vérifiez les permissions du dossier.",
        });
      }
    }

    // Construire les chemins des fichiers metadata
    const oldMetadataPath = path.join(
      STL_FILES_DIR,
      `${modelId}.metadata.json`
    );
    const newMetadataPath = path.join(
      STL_FILES_DIR,
      `${path.basename(newStlPath)}.metadata.json`
    );

    // Lire les métadonnées existantes ou créer de nouvelles
    let metadata = {
      nom: path.basename(newStlPath),
      format: "STL",
      taille: (await fs.stat(newStlPath)).size,
      dateModification: new Date(),
      categorie: updateData.categorie || "filament",
      theme: updateData.theme || "autre",
    };

    if (fsSync.existsSync(oldMetadataPath)) {
      try {
        const existingMetadata = JSON.parse(
          await fs.readFile(oldMetadataPath, "utf8")
        );
        metadata = { ...metadata, ...existingMetadata };

        // Si l'ancien fichier metadata existe et que le nom a changé, le supprimer
        if (oldMetadataPath !== newMetadataPath) {
          try {
            await fs.unlink(oldMetadataPath);
          } catch (error) {
            console.warn(
              "Impossible de supprimer l'ancien fichier metadata:",
              error
            );
          }
        }
      } catch (error) {
        console.error(
          "Erreur lors de la lecture des métadonnées existantes:",
          error
        );
      }
    }

    // Mettre à jour avec les nouvelles données
    metadata = {
      ...metadata,
      ...updateData,
      nom: path.basename(newStlPath),
      dateModification: new Date(),
    };

    console.log("Sauvegarde des métadonnées:", newMetadataPath, metadata);
    await fs.writeFile(newMetadataPath, JSON.stringify(metadata, null, 2));

    res.json(metadata);
  } catch (error) {
    console.error("Erreur lors de la modification:", error);
    res
      .status(500)
      .json({
        error: "Erreur lors de la modification du modèle: " + error.message,
      });
  }
});

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
