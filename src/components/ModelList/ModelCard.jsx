import React, { useState } from "react";
import {
  PencilIcon,
  TrashIcon,
  FolderOpenIcon,
} from "@heroicons/react/24/outline";
import STLViewer from "../STLViewer/STLViewer";

const WATCH_DIR = "C:\\Users\\Quentin\\Documents\\fichier3d";

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
      // S'assurer que l'ID est correct
      const modelId = model.id || model.nom;
      const updatedModel = await onEdit(modelId, editForm);
      if (updatedModel) {
        setIsEditing(false);
        // Mettre à jour le modèle local avec les nouvelles données
        setModel(updatedModel.model);
      }
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      alert(`Erreur lors de la modification du modèle: ${error.message}`);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const ouvrirDansExplorateur = async () => {
    try {
      const nomFichier = model.nom.toLowerCase().endsWith(".stl")
        ? model.nom
        : `${model.nom}.stl`;
      const cheminComplet = `${WATCH_DIR}\\${nomFichier}`;
      const commande = `explorer.exe /select,\"${cheminComplet}\"`;

      const response = await fetch("http://localhost:3001/api/open-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: commande }),
      });

      if (!response.ok)
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);

      const data = await response.json();
      if (!data.success)
        throw new Error(data.error || "Échec de la localisation du fichier");
    } catch (error) {
      console.error("Erreur:", error);
      alert(
        `Impossible de localiser le fichier dans l'explorateur: ${error.message}`
      );
    }
  };

  if (isEditing) {
    return (
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 p-6 rounded-xl shadow-xl border border-purple-500/30 transform transition-transform duration-300 hover:scale-105">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-white mb-1.5">
              Nom
            </label>
            <input
              type="text"
              name="nom"
              value={editForm.nom}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-1.5">
              Catégorie
            </label>
            <select
              name="categorie"
              value={editForm.categorie}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-gray-900">
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-1.5">
              Thème
            </label>
            <select
              name="theme"
              value={editForm.theme}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            >
              {themes.map((theme) => (
                <option key={theme} value={theme} className="bg-gray-900">
                  {theme.charAt(0).toUpperCase() + theme.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition duration-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition duration-200"
            >
              Sauvegarder
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div
      className="group bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-xl shadow-2xl overflow-hidden border border-purple-500/30 hover:border-purple-500/60 transition-transform duration-300 transform hover:scale-105"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute top-3 right-3 z-10 flex gap-2 bg-gray-900/90 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={() => setIsEditing(true)}
          className="p-2 text-gray-300 hover:text-purple-400 rounded-lg hover:bg-purple-500/20 transition"
          title="Modifier"
        >
          <PencilIcon className="w-5 h-5" />
        </button>
        <button
          onClick={ouvrirDansExplorateur}
          className="p-2 text-gray-300 hover:text-green-400 rounded-lg hover:bg-green-500/20 transition"
          title="Localiser le fichier"
        >
          <FolderOpenIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => onDelete(model.id)}
          className="p-2 text-gray-300 hover:text-red-400 rounded-lg hover:bg-red-500/20 transition"
          title="Supprimer"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="relative aspect-w-16 aspect-h-9 bg-gray-900">
        <STLViewer
          url={`http://localhost:3001/models/${model.nom}${
            model.nom.toLowerCase().endsWith(".stl") ? "" : ".stl"
          }`}
          className="w-full h-full"
          isHovered={isHovered}
        />
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-white mb-4 truncate group-hover:text-purple-400 transition-colors duration-200">
          {model.nom}
        </h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <div className="space-y-1">
            <span className="text-gray-400 text-xs font-medium uppercase">
              Format
            </span>
            <p className="text-purple-300 font-medium">
              {model.format || "STL"}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-gray-400 text-xs font-medium uppercase">
              Taille
            </span>
            <p className="text-purple-300 font-medium">
              {formatBytes(model.taille)}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-gray-400 text-xs font-medium uppercase">
              Catégorie
            </span>
            <p className="text-purple-300 font-medium capitalize">
              {model.categorie || "filament"}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-gray-400 text-xs font-medium uppercase">
              Thème
            </span>
            <p className="text-purple-300 font-medium capitalize">
              {model.theme || "autre"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelCard;
