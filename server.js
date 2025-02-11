import express from "express";
import cors from "cors";
import stlRoutes from "./src/server/routes/stlRoutes.js";
import path from "path";

const app = express();
const PORT = 5000;

// Middleware pour les erreurs CORS
app.use(
  cors({
    origin: "http://localhost:5173", // URL de votre frontend Vite
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

// Middleware pour parser le JSON
app.use(express.json());

// Gestion des erreurs JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ message: "Format JSON invalide" });
  }
  next();
});

// Routes API
app.use("/api", stlRoutes);

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ message: "Route non trouvée" });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur backend démarré sur http://localhost:${PORT}`);
});
