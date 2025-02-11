import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
const PORT = 5000;

const STL_DIRECTORY = "C:/Users/Quentin/Documents/fichier3d"; // 📌 Dossier cible

// 🔹 Middleware CORS
app.use(cors());

// 🔹 Endpoint pour récupérer la liste des fichiers
app.get("/stl-files", (req, res) => {
  fs.readdir(STL_DIRECTORY, (err, files) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Erreur de lecture du dossier", error: err });
    }
    console.log("fichier trouver dans le dossier", files);
    const stlFiles = files.filter((file) => file.endsWith(".stl"));
    res.json(stlFiles);
  });
});
// 🔹 Route pour récupérer la liste des fichiers STL
app.get("/stl-files/:filename", (req, res) => {
  const fileName = decodeURIComponent(req.params.filename);
  const filePath = path.join(STL_DIRECTORY, fileName);

  console.log(`🔍 Fichier demandé : ${fileName}`);
  console.log(`📂 Chemin complet : ${filePath}`);

  if (fs.existsSync(filePath)) {
    console.log("✅ Fichier trouvé, envoi en cours...");
    res.sendFile(filePath);
  } else {
    console.error("❌ Fichier introuvable :", filePath);
    res.status(404).json({ message: "Fichier non trouvé", path: filePath });
  }
});

// 🔹 Lancement du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur backend démarré sur http://localhost:${PORT}`);
});
