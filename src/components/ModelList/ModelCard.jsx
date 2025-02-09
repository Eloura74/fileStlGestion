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
  // fonction pour modifier les données
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "tags") {
      setEditForm((prev) => ({
        ...prev,
        tags: value.split(",").map((tag) => tag.trim()),
      }));
    } else {
      setEditForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  // fonction pour soumettre la modification
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
  // fonction pour ouvrir le fichier dans l'explorateur
  const ouvrirDansExplorateur = async () => {
    try {
      const nomFichier = model.nom;
      const nomFichierComplet = nomFichier.endsWith(".stl")
        ? nomFichier
        : `${nomFichier}.stl`;

      const response = await fetch(
        `http://localhost:3001/api/open-explorer/${encodeURIComponent(
          nomFichierComplet
        )}`
      );

      if (response.status === 404) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Fichier non trouvé");
      }
    } catch (error) {
      console.error("Erreur lors de l'ouverture du fichier:", error);
      alert("Erreur lors de l'ouverture du fichier: " + error.message);
    }
  };
  // formattage de la date
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

  return (
    <div className="group relative h-[450px] w-full perspective-1000">
      <div
        className={`card relative w-full h-full transition-transform duration-500 transform-style-3d ${
          isFlipped ? "rotate-y-180" : ""
        }`}
      >
        {/* Face avant */}
        <div className="absolute w-full h-full backface-hidden">
          <div className="h-full bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
            {/* Prévisualisation STL */}
            <div className="relative h-64 w-full bg-gray-100">
              <STLViewer
                url={`http://localhost:3001/models/${model.nom}${
                  model.nom.toLowerCase().endsWith(".stl") ? "" : ".stl"
                }`}
                className="w-full h-full"
                modelColor="#9333ea"
              />
            </div>

            {/* Contenu */}
            <div className="p-4">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-white truncate flex-1">
                  {model.nom}
                </h3>
                <div className="flex space-x-2 ml-2">
                  <button
                    onClick={() => setIsFlipped(true)}
                    className="p-1.5 text-gray-400 hover:text-purple-400 transition-colors"
                    title="Plus d'informations"
                  >
                    <InformationCircleIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleEdit}
                    className="p-1.5 text-gray-400 hover:text-purple-400 transition-colors"
                    title="Modifier"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                    title="Supprimer"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-400">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  <span>Modifié le {formatDate(model.dateModification)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-400">
                  <TagIcon className="h-4 w-4 mr-2" />
                  <span>{model.categorie || "Non catégorisé"}</span>
                </div>
                <div className="flex items-center text-sm text-gray-400">
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                  <span className="truncate">
                    {model.description || "Aucune description"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Face arrière */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180">
          <div className="h-full bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-lg font-semibold text-white">{model.nom}</h3>
              <button
                onClick={() => setIsFlipped(false)}
                className="p-1.5 text-gray-400 hover:text-purple-400 transition-colors"
                title="Retourner"
              >
                <ArrowsRightLeftIcon className="h-5 w-5" />
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={editForm.description}
                    onChange={handleChange}
                    className="mt-1 w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Catégorie
                  </label>
                  <select
                    name="categorie"
                    value={editForm.categorie}
                    onChange={handleChange}
                    className="mt-1 w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
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
                  <label className="block text-sm font-medium text-gray-300">
                    Thème
                  </label>
                  <select
                    name="theme"
                    value={editForm.theme}
                    onChange={handleChange}
                    className="mt-1 w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  >
                    <option value="">Sélectionner un thème</option>
                    {themes.map((theme) => (
                      <option key={theme} value={theme}>
                        {theme}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">
                    Tags
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={editForm.tags.join(", ")}
                    onChange={handleChange}
                    placeholder="tag1, tag2, tag3"
                    className="mt-1 w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-300">Description</h4>
                  <p className="mt-1 text-sm text-gray-400">
                    {model.description || "Aucune description"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-300">Catégorie</h4>
                  <p className="mt-1 text-sm text-gray-400">
                    {model.categorie || "Non catégorisé"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-300">Thème</h4>
                  <p className="mt-1 text-sm text-gray-400">
                    {model.theme || "Non défini"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-300">Tags</h4>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {model.tags && model.tags.length > 0 ? (
                      model.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded-full"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-400">Aucun tag</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={ouvrirDansExplorateur}
                  className="mt-4 w-full flex items-center justify-center px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
                >
                  <FolderOpenIcon className="h-5 w-5 mr-2" />
                  Ouvrir dans l'explorateur
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelCard;
