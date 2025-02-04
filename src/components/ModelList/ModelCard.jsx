import React, { useState } from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import STLViewer from "../STLViewer/STLViewer";

const ModelCard = ({ model, onEdit, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: model.name,
    category: model.category || "filament",
    theme: model.theme || "autre"
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
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nom
            </label>
            <input
              type="text"
              name="name"
              value={editForm.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Catégorie
            </label>
            <select
              name="category"
              value={editForm.category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Thème
            </label>
            <select
              name="theme"
              value={editForm.theme}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {themes.map(theme => (
                <option key={theme} value={theme}>
                  {theme.charAt(0).toUpperCase() + theme.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Sauvegarder
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
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
      className={`relative bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 ${
        isHovered ? "transform scale-105" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square bg-gray-100">
        {model.fileUrl ? (
          <>
            {console.log("Rendering STL with URL:", model.fileUrl)}
            <STLViewer
              url={model.fileUrl}
              modelColor="#0080ff"
              backgroundColor="#ffffff"
              rotate={true}
              orbitControls={true}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <p className="text-gray-400">Aperçu non disponible</p>
          </div>
        )}

        {isHovered && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center space-x-4">
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 bg-blue-500 rounded-full hover:bg-blue-600 transition-colors"
              title="Modifier"
            >
              <PencilIcon className="h-5 w-5 text-white" />
            </button>
            <button
              onClick={() => onDelete(model)}
              className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
              title="Supprimer"
            >
              <TrashIcon className="h-5 w-5 text-white" />
            </button>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex flex-col space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">
            {model.name}
          </h3>

          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium mr-2">Format:</span>
            <span>{model.format}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium mr-2">Taille:</span>
            <span>{formatSize(model.size)}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium mr-2">Date:</span>
            <span>{new Date(model.date || Date.now()).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium mr-2">Catégorie:</span>
            <span className="capitalize">{model.category || "filament"}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium mr-2">Thème:</span>
            <span className="capitalize">{model.theme || "autre"}</span>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Éditer
            </button>
            <button
              onClick={() => onDelete(model)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelCard;
