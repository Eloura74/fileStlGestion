import fs from "fs/promises";
import path from "path";

const METADATA_FILE = path.join(
  process.cwd(),
  "src",
  "server",
  "data",
  "metadata.json"
);
const STL_DIRECTORY = "C:/Users/Quentin/Documents/fichier3d";

// Classe pour gérer les métadonnées d'un fichier STL
class StlMetadata {
  constructor(fileName) {
    this.fileName = fileName;
    this.id = Math.random().toString(36).substr(2, 9); // ID unique
    this.type = ""; // Type d'impression (filament/résine)
    this.categorie = ""; // Catégorie (jeux, déco, etc.)
    this.dateAjout = new Date().toISOString();
    this.lastModified = new Date().toISOString();
    this.description = "";
    this.tags = [];
  }
}

// Fonction pour initialiser le système de fichiers
const initializeFileSystem = async () => {
  try {
    // Créer le dossier data s'il n'existe pas
    await fs.mkdir(path.dirname(METADATA_FILE), { recursive: true });

    // Vérifier si le fichier metadata.json existe
    try {
      await fs.access(METADATA_FILE);
    } catch {
      // Créer le fichier metadata.json s'il n'existe pas
      await fs.writeFile(METADATA_FILE, JSON.stringify({}, null, 2));
    }
  } catch (error) {
    console.error("Erreur lors de l'initialisation:", error);
  }
};

export class StlController {
  constructor() {
    // Initialiser le système de fichiers au démarrage
    initializeFileSystem();
  }

  // Charger les métadonnées
  async loadMetadata() {
    try {
      const data = await fs.readFile(METADATA_FILE, "utf8");
      return JSON.parse(data);
    } catch (error) {
      console.error("Erreur lors du chargement des métadonnées:", error);
      return {};
    }
  }

  // Sauvegarder les métadonnées
  async saveMetadata(metadata) {
    try {
      await fs.writeFile(METADATA_FILE, JSON.stringify(metadata, null, 2));
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des métadonnées:", error);
      throw error;
    }
  }

  // Obtenir la liste des fichiers avec leurs métadonnées
  async getStlFiles() {
    try {
      const files = await fs.readdir(STL_DIRECTORY);
      const stlFiles = files.filter((file) => file.endsWith(".stl"));
      const metadata = await this.loadMetadata();

      return stlFiles.map((fileName) => {
        if (!metadata[fileName]) {
          metadata[fileName] = new StlMetadata(fileName);
          this.saveMetadata(metadata).catch(console.error);
        }
        return metadata[fileName];
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des fichiers:", error);
      throw error;
    }
  }

  // Mettre à jour les métadonnées d'un fichier
  async updateStlMetadata(fileName, newMetadata) {
    try {
      const metadata = await this.loadMetadata();
      metadata[fileName] = {
        ...metadata[fileName],
        ...newMetadata,
        lastModified: new Date().toISOString(),
      };
      await this.saveMetadata(metadata);
      return metadata[fileName];
    } catch (error) {
      console.error("Erreur lors de la mise à jour des métadonnées:", error);
      throw error;
    }
  }
}
