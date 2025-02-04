import React, { useState } from "react";
import {
  PencilIcon,
  TrashIcon,
  FolderOpenIcon,
} from "@heroicons/react/24/outline";
import STLViewer from "../STLViewer/STLViewer";

// Constante pour le chemin du dossier de base
const WATCH_DIR = "C:\\Users\\faber\\Documents\\fichier3d";

const ModelCard = ({ model, onEdit, onDelete, setModel }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    nom: model.nom,
    categorie: model.categorie,
    theme: model.theme,
  });

  const themes = ["figurine", "jeux", "decoration", "fonctionnel", "autre"];
  const categories = ["resine", "filament"];

  const formatBytes = (bytes) => {
    if (!bytes) return "0 Mo";
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(2) + " Mo";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedModel = await onEdit(model.nom, editForm);
      setIsEditing(false);
      // Mettre à jour le modèle local avec les nouvelles données
      setModel(updatedModel);
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      alert(`Erreur lors de la modification du modèle: ${error.message}`);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const ouvrirDansExplorateur = async () => {
    try {
      // S'assurer que le nom du fichier a l'extension .stl
      const nomFichier = model.nom.toLowerCase().endsWith(".stl")
        ? model.nom
        : `${model.nom}.stl`;
      const cheminComplet = `${WATCH_DIR}\\${nomFichier}`;
      const commande = `explorer.exe /select,"${cheminComplet}"`;

      console.log("Tentative de localisation:", cheminComplet);

      const response = await fetch("http://localhost:3001/api/open-file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ command: commande }),
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Échec de la localisation du fichier");
      }

      console.log("Fichier localisé avec succès");
    } catch (error) {
      console.error("Erreur:", error);
      alert(
        `Impossible de localiser le fichier dans l'explorateur: ${error.message}`
      );
    }
  };

  if (isEditing) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-purple-500/20">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-purple-300">
              Nom
            </label>
            <input
              type="text"
              name="nom"
              value={editForm.nom}
              onChange={handleChange}
              className="mt-1 block w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-300">
              Catégorie
            </label>
            <select
              name="categorie"
              value={editForm.categorie}
              onChange={handleChange}
              className="mt-1 block w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-gray-800">
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-300">
              Thème
            </label>
            <select
              name="theme"
              value={editForm.theme}
              onChange={handleChange}
              className="mt-1 block w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {themes.map((theme) => (
                <option key={theme} value={theme} className="bg-gray-800">
                  {theme.charAt(0).toUpperCase() + theme.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="submit"
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
            >
              Sauvegarder
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden relative border border-purple-500/20 hover:border-purple-500/40 transition-colors"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* En-tête avec les actions */}
      <div className="absolute top-2 right-2 z-10 flex gap-1 bg-gray-900/80 rounded-lg p-1">
        <button
          onClick={() => setIsEditing(true)}
          className="p-1.5 text-gray-300 hover:text-purple-500 rounded-lg hover:bg-gray-700/50 transition-colors"
          title="Modifier"
        >
          <PencilIcon className="w-4 h-4" />
        </button>
        <button
          onClick={ouvrirDansExplorateur}
          className="p-1.5 text-gray-300 hover:text-green-500 rounded-lg hover:bg-gray-700/50 transition-colors"
          title="Localiser le fichier"
        >
          <FolderOpenIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(model.id)}
          className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg hover:bg-gray-700/50 transition-colors"
          title="Supprimer"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Visualiseur STL */}
      <div className="aspect-w-16 aspect-h-9 bg-gray-900/50">
        <STLViewer
          url={`http://localhost:3001/models/${model.nom}${
            model.nom.toLowerCase().endsWith(".stl") ? "" : ".stl"
          }`}
          className="w-full h-full"
          isHovered={isHovered}
        />
      </div>

      {/* Informations du fichier */}
      <div className="p-3">
        <h3 className="text-lg font-semibold text-white mb-2 truncate">
          {model.nom}
        </h3>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
          <div>
            <span className="text-gray-400 text-xs">Format</span>
            <p className="text-purple-300">{model.format || "STL"}</p>
          </div>
          <div>
            <span className="text-gray-400 text-xs">Taille</span>
            <p className="text-purple-300">{formatBytes(model.taille)}</p>
          </div>
          <div>
            <span className="text-gray-400 text-xs">Catégorie</span>
            <p className="text-purple-300 capitalize">
              {model.categorie || "filament"}
            </p>
          </div>
          <div>
            <span className="text-gray-400 text-xs">Thème</span>
            <p className="text-purple-300 capitalize">
              {model.theme || "autre"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelCard;
