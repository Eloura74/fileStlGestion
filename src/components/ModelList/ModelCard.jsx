import React, { useState } from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import STLViewer from "../STLViewer/STLViewer";

const ModelCard = ({ model, onEdit, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    nom: model.nom,
    categorie: model.categorie || "filament",
    theme: model.theme || "autre",
  });

  const themes = ["figurine", "jeux", "decoration", "fonctionnel", "autre"];
  const categories = ["resine", "filament"];

  const formatSize = (bytes) => {
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(2) + " Mo";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onEdit(model.id, editForm);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (isEditing) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-purple-500/20">
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
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Sauvegarder
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
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
      className={`group relative bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden transition-all duration-300 border border-purple-500/20 hover:border-purple-500/40 ${
        isHovered ? "transform scale-[1.02]" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square bg-gray-900/50">
        {model.fileUrl ? (
          <STLViewer
            url={model.fileUrl}
            modelColor="#8b5cf6"
            backgroundColor="#1a1a1a"
            rotate={true}
            orbitControls={true}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-400">Aperçu non disponible</p>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white group-hover:text-purple-300 transition-colors">
            {model.nom}
          </h3>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-purple-300 font-medium">Format</p>
              <p className="text-gray-300">{model.format}</p>
            </div>

            <div>
              <p className="text-purple-300 font-medium">Taille</p>
              <p className="text-gray-300">{formatSize(model.taille)}</p>
            </div>

            <div>
              <p className="text-purple-300 font-medium">Catégorie</p>
              <p className="text-gray-300 capitalize">
                {model.categorie || "filament"}
              </p>
            </div>

            <div>
              <p className="text-purple-300 font-medium">Thème</p>
              <p className="text-gray-300 capitalize">{model.theme || "autre"}</p>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-md flex items-center space-x-2"
            >
              <PencilIcon className="h-4 w-4" />
              <span>Éditer</span>
            </button>
            <button
              onClick={() => onDelete(model)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors shadow-md flex items-center space-x-2"
            >
              <TrashIcon className="h-4 w-4" />
              <span>Supprimer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelCard;
