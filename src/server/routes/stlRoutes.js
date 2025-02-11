import express from "express";
import { StlController } from "../controllers/stlController.js";
import path from "path";
import fs from "fs";

const router = express.Router();
const stlController = new StlController();

// Obtenir la liste des fichiers avec leurs métadonnées
router.get("/stl-files", async (req, res) => {
  try {
    const files = await stlController.getStlFiles();
    res.json(files);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des fichiers",
      error: error.message,
    });
  }
});

// Télécharger un fichier STL spécifique
router.get("/stl-files/:filename", async (req, res) => {
  try {
    const fileName = decodeURIComponent(req.params.filename);
    const filePath = path.join(
      process.env.STL_DIRECTORY || "C:/Users/Quentin/Documents/fichier3d",
      fileName
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Fichier non trouvé" });
    }

    res.sendFile(filePath);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors du téléchargement du fichier",
      error: error.message,
    });
  }
});

// Mettre à jour les métadonnées d'un fichier
router.put("/stl-files/:filename/metadata", async (req, res) => {
  try {
    const fileName = decodeURIComponent(req.params.filename);
    const updatedMetadata = await stlController.updateStlMetadata(
      fileName,
      req.body
    );
    res.json(updatedMetadata);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la mise à jour des métadonnées",
      error: error.message,
    });
  }
});

export default router;
