// Schéma des métadonnées pour les fichiers STL
export class StlMetadata {
  constructor(fileName) {
    this.fileName = fileName;
    this.id = generateUniqueId(); // Fonction à implémenter
    this.type = ""; // Type d'impression (filament/résine)
    this.categorie = ""; // Catégorie (jeux, déco, etc.)
    this.dateAjout = new Date().toISOString();
    this.lastModified = new Date().toISOString();
    this.description = "";
    this.tags = [];
  }
}
