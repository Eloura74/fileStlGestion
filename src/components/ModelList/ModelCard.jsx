import React, { useState } from "react";
import {
  PencilIcon,
  TrashIcon,
  FolderOpenIcon,
} from "@heroicons/react/24/outline";
import STLViewer from "../STLViewer/STLViewer";

const WATCH_DIR = import.meta.env.VITE_BASE_WATCH_DIRS;
console.log("Répertoire surveillé :", WATCH_DIR);

const ModelCard = ({ model, onEdit, onDelete, setModel }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    nom: model.nom || model.name || "",
    description: model.description || "",
    categorie: model.categorie || "",
    theme: model.theme || "",
    tags: model.tags || [],
    auteur: model.auteur || "",
    parametres_impression: model.parametres_impression || {
      materiau: "",
      epaisseur_couche: "",
      remplissage: "",
      support: false,
    },
  });

  const categories = ["resine", "filament", "autre"];
  const themes = ["figurine", "jeux", "decoration", "fonctionnel", "autre"];
  const materiaux = [
    "PLA",
    "ABS",
    "PETG",
    "TPU",
    "Résine standard",
    "Résine flexible",
    "Autre",
  ];

  const formatBytes = (bytes) => {
    if (!bytes) return "0 Mo";
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(2) + " Mo";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Non définie";
    return new Date(dateString).toLocaleString("fr-FR");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const modelId = model.id || model.nom || model.name;
      const updatedModel = await onEdit(modelId, editForm);
      if (updatedModel) {
        setIsEditing(false);
        setModel(updatedModel);
      }
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      alert(`Erreur lors de la modification du modèle: ${error.message}`);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("parametres_impression.")) {
      const paramName = name.split(".")[1];
      setEditForm((prev) => ({
        ...prev,
        parametres_impression: {
          ...prev.parametres_impression,
          [paramName]:
            value === "true" ? true : value === "false" ? false : value,
        },
      }));
    } else if (name === "tags") {
      setEditForm((prev) => ({
        ...prev,
        tags: value.split(",").map((tag) => tag.trim()),
      }));
    } else {
      setEditForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const ouvrirDansExplorateur = async () => {
    try {
      // S'assurer d'avoir le nom complet du fichier avec l'extension
      const nomFichier = (model.nom || model.name);
      const nomFichierComplet = nomFichier.endsWith('.stl') ? nomFichier : `${nomFichier}.stl`;
      console.log("Ouverture du fichier:", nomFichierComplet);
      
      const response = await fetch(`http://localhost:3001/api/open-explorer/${encodeURIComponent(nomFichierComplet)}`);
      
      if (response.status === 404) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Fichier non trouvé");
      }

      // On ne vérifie pas les autres erreurs car l'explorateur s'ouvre quand même
      const data = await response.json().catch(() => ({
        success: true,
        message: "Explorateur ouvert"
      }));
      
      if (data.path) {
        console.log("Fichier localisé:", data.path);
      }
    } catch (error) {
      if (error.message.includes("non trouvé")) {
        console.error("Erreur:", error.message);
        alert(error.message);
      }
      // On ignore les autres erreurs car l'explorateur s'ouvre quand même
    }
  };

  if (isEditing) {
    return (
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 p-6 rounded-xl shadow-xl border border-purple-500/30 transform transition-transform duration-300 hover:scale-105">
        <form onSubmit={handleSubmit} className="space-y-4">
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
              Description
            </label>
            <textarea
              name="description"
              value={editForm.description}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              rows="3"
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
              <option value="">Sélectionner une catégorie</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
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
              <option value="">Sélectionner un thème</option>
              {themes.map((theme) => (
                <option key={theme} value={theme}>
                  {theme}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-1.5">
              Tags (séparés par des virgules)
            </label>
            <input
              type="text"
              name="tags"
              value={editForm.tags.join(", ")}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-1.5">
              Auteur
            </label>
            <input
              type="text"
              name="auteur"
              value={editForm.auteur}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
          </div>
          <div className="space-y-3">
            <h3 className="text-white font-medium">Paramètres d'impression</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1.5">
                  Matériau
                </label>
                <select
                  name="parametres_impression.materiau"
                  value={editForm.parametres_impression.materiau}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                >
                  <option value="">Sélectionner un matériau</option>
                  {materiaux.map((mat) => (
                    <option key={mat} value={mat}>
                      {mat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1.5">
                  Épaisseur de couche
                </label>
                <input
                  type="text"
                  name="parametres_impression.epaisseur_couche"
                  value={editForm.parametres_impression.epaisseur_couche}
                  onChange={handleChange}
                  placeholder="ex: 0.2mm"
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1.5">
                  Remplissage
                </label>
                <input
                  type="text"
                  name="parametres_impression.remplissage"
                  value={editForm.parametres_impression.remplissage}
                  onChange={handleChange}
                  placeholder="ex: 20%"
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1.5">
                  Support nécessaire
                </label>
                <select
                  name="parametres_impression.support"
                  value={editForm.parametres_impression.support}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                >
                  <option value={false}>Non</option>
                  <option value={true}>Oui</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <article
      className="bg-gradient-to-r from-purple-700/50 via-indigo-700/50 to-blue-700 p-6 rounded-xl shadow-xl border border-purple-500/30 transform transition-transform duration-300 hover:scale-105 focus-within:ring-2 focus-within:ring-purple-400"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="article"
      aria-label={`Modèle 3D : ${model.nom || model.name}`}
    >
      <div className="relative">
        <div
          className="absolute top-0 right-0 flex space-x-2 bg-gray-900/50 backdrop-blur-sm rounded-lg p-1 z-10"
          role="toolbar"
          aria-label="Actions sur le modèle"
        >
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-all duration-200 flex items-center focus:ring-2 focus:ring-purple-400 focus:outline-none"
            title="Modifier le modèle"
            aria-label="Modifier le modèle"
          >
            <PencilIcon className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Modifier</span>
          </button>
          <button
            onClick={() => {
              if (
                window.confirm("Êtes-vous sûr de vouloir supprimer ce modèle ?")
              ) {
                onDelete(model.id);
              }
            }}
            className="p-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200 flex items-center focus:ring-2 focus:ring-red-400 focus:outline-none"
            title="Supprimer le modèle"
            aria-label="Supprimer le modèle"
          >
            <TrashIcon className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Supprimer</span>
          </button>
          <button
            onClick={ouvrirDansExplorateur}
            className="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 flex items-center focus:ring-2 focus:ring-blue-400 focus:outline-none"
            title="Ouvrir dans l'explorateur"
            aria-label="Ouvrir dans l'explorateur Windows"
          >
            <FolderOpenIcon className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Ouvrir dans l'explorateur</span>
          </button>
        </div>

        <div className="mb-4 h-64 relative rounded-lg overflow-hidden border border-purple-500/20">
          <STLViewer
            url={`http://localhost:3001/models/${model.nom}${
              model.nom.toLowerCase().endsWith(".stl") ? "" : ".stl"
            }`}
            className="w-full h-full"
            modelColor="#9333ea"
            aria-label={`Visualisation 3D du modèle ${model.nom || model.name}`}
          />
        </div>

        <div className="space-y-4">
          <header>
            <h2 className="text-xl font-semibold text-white tracking-tight hover:text-purple-300 transition-colors">
              {model.nom || model.name}
            </h2>
            <p className="text-gray-300 mt-2 line-clamp-2 hover:line-clamp-none transition-all duration-200">
              {model.description || "Aucune description disponible"}
            </p>
          </header>

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-black/20 p-2 rounded-lg">
              <dt className="text-purple-300 font-medium">Taille</dt>
              <dd className="text-white">
                {formatBytes(model.taille || model.size)}
              </dd>
            </div>
            <div className="bg-black/20 p-2 rounded-lg">
              <dt className="text-purple-300 font-medium">Catégorie</dt>
              <dd className="text-white capitalize">
                {model.categorie || "Non définie"}
              </dd>
            </div>
            <div className="bg-black/20 p-2 rounded-lg">
              <dt className="text-purple-300 font-medium">Thème</dt>
              <dd className="text-white capitalize">
                {model.theme || "Non défini"}
              </dd>
            </div>
            <div className="bg-black/20 p-2 rounded-lg">
              <dt className="text-purple-300 font-medium">Auteur</dt>
              <dd className="text-white">{model.auteur || "Non défini"}</dd>
            </div>
          </dl>

          <footer className="mt-4 border-t border-purple-500/20 pt-4">
            <div className="flex justify-between items-center text-sm text-gray-300">
              <time dateTime={model.date_modification || model.modified_date}>
                Modifié le:{" "}
                {formatDate(model.date_modification || model.modified_date)}
              </time>
              {model.parametres_impression && (
                <span className="inline-flex items-center bg-purple-600/30 px-2.5 py-1 rounded-full text-purple-200">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M13 7H7v6h6V7z" />
                    <path
                      fillRule="evenodd"
                      d="M7 2a1 1 0 00-1 1v1H5a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 00-1-1H7zm4 0v2H9V2h2zm-6 6v8h10V8H5z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Paramètres d'impression disponibles
                </span>
              )}
            </div>
          </footer>
        </div>
      </div>
    </article>
  );
};

export default ModelCard;
