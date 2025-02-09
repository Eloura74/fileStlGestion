import React, { useState } from "react";
import STLViewer from "../STLViewer/STLViewer";
import {
  InformationCircleIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  FolderOpenIcon,
  CalendarIcon,
  TagIcon,
  DocumentTextIcon,
  ArrowsRightLeftIcon,
} from "@heroicons/react/24/outline";
import "../../styles/card-flip.css";

const ModelCard = ({ model, onEdit, onDelete }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    nom: model.nom || "",
    description: model.description || "",
    categorie: model.categorie || "",
    theme: model.theme || "",
    tags: model.tags || [],
    auteur: model.auteur || "",
  });

  const categories = ["resine", "filament", "autre"];
  const themes = ["figurine", "jeux", "decoration", "fonctionnel", "autre"];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleDelete = () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce modèle ?")) {
      onDelete(model);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "tags") {
      setEditForm(prev => ({
        ...prev,
        tags: value.split(",").map(tag => tag.trim())
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onEdit(model.id, editForm);
      setIsEditing(false);
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      alert("Erreur lors de la modification du modèle: " + error.message);
    }
  };

  const ouvrirDansExplorateur = async () => {
    try {
      const nomFichier = model.nom;
      const nomFichierComplet = nomFichier.endsWith('.stl') ? nomFichier : `${nomFichier}.stl`;
      
      const response = await fetch(`http://localhost:3001/api/open-explorer/${encodeURIComponent(nomFichierComplet)}`);
      
      if (response.status === 404) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Fichier non trouvé");
      }
    } catch (error) {
      console.error("Erreur lors de l'ouverture du fichier:", error);
      alert("Erreur lors de l'ouverture du fichier: " + error.message);
    }
  };

  const formatDate = (date) => {
    if (!date || date === "Invalid Date") return "Non définie";
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatBytes = (bytes) => {
    if (!bytes) return "0 Ko";
    return (bytes / 1024).toFixed(2) + " Ko";
  };

  if (isEditing) {
    return (
      <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Nom
            </label>
            <input
              type="text"
              name="nom"
              value={editForm.nom}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={editForm.description}
              onChange={handleChange}
              rows="3"
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Catégorie
              </label>
              <select
                name="categorie"
                value={editForm.categorie}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Thème
              </label>
              <select
                name="theme"
                value={editForm.theme}
                onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              >
                <option value="">Sélectionner un thème</option>
                {themes.map((theme) => (
                  <option key={theme} value={theme}>
                    {theme}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Tags (séparés par des virgules)
            </label>
            <input
              type="text"
              name="tags"
              value={editForm.tags.join(", ")}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Auteur
            </label>
            <input
              type="text"
              name="auteur"
              value={editForm.auteur}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div 
      className={`card-flip h-[400px] ${isFlipped ? "flipped" : ""}`}
      onMouseLeave={() => isFlipped && setIsFlipped(false)}
    >
      <div className="card-flip-inner w-full h-full">
        {/* Face avant */}
        <div className="card-front bg-gray-800/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-purple-500/20 hover:border-purple-500/40 transition-colors">
          <div className="relative aspect-square bg-gray-900/80">
            <STLViewer
              url={`http://localhost:3001/models/${model.nom}${
                model.nom.toLowerCase().endsWith(".stl") ? "" : ".stl"
              }`}
              className="w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-lg text-white truncate flex-1">
                {model.nom}
              </h3>
              <button
                onClick={handleFlip}
                className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-colors"
                title="Voir plus d'informations"
              >
                <ArrowsRightLeftIcon className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-sm text-gray-400 line-clamp-2 min-h-[2.5rem]">
              {model.description || "Aucune description disponible"}
            </p>
          </div>
        </div>

        {/* Face arrière */}
        <div className="card-back bg-gray-800/80 backdrop-blur-sm rounded-xl overflow-hidden border border-purple-500/20">
          <div className="h-full flex flex-col">
            {/* En-tête */}
            <div className="bg-gray-900/50 p-4 border-b border-gray-700">
              <h3 className="text-lg font-medium text-white mb-1">{model.nom}</h3>
              <p className="text-sm text-gray-400">
                {model.description || "Aucune description disponible"}
              </p>
            </div>

            {/* Informations */}
            <div className="flex-grow p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-start space-x-2">
                  <TagIcon className="h-5 w-5 text-purple-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-400">Catégorie</p>
                    <p className="text-white">{model.categorie || "Non catégorisé"}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <DocumentTextIcon className="h-5 w-5 text-purple-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-400">Thème</p>
                    <p className="text-white">{model.theme || "Non défini"}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-start space-x-2">
                  <CalendarIcon className="h-5 w-5 text-purple-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-400">Modifié le</p>
                    <p className="text-white">{formatDate(model.dateModification)}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <DocumentTextIcon className="h-5 w-5 text-purple-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-400">Taille</p>
                    <p className="text-white">{formatBytes(model.taille)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-gray-900/50 p-4 border-t border-gray-700">
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={handleEdit}
                  className="flex flex-col items-center p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                  title="Modifier"
                >
                  <PencilIcon className="h-5 w-5 mb-1" />
                  <span className="text-xs">Modifier</span>
                </button>

                <button
                  onClick={handleFlip}
                  className="flex flex-col items-center p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-colors"
                  title="Retourner"
                >
                  <ArrowPathIcon className="h-5 w-5 mb-1" />
                  <span className="text-xs">Retourner</span>
                </button>

                <button
                  onClick={handleDelete}
                  className="flex flex-col items-center p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Supprimer"
                >
                  <TrashIcon className="h-5 w-5 mb-1" />
                  <span className="text-xs">Supprimer</span>
                </button>

                <button
                  onClick={ouvrirDansExplorateur}
                  className="flex flex-col items-center p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                  title="Ouvrir dans l'explorateur"
                >
                  <FolderOpenIcon className="h-5 w-5 mb-1" />
                  <span className="text-xs">Ouvrir</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelCard;
