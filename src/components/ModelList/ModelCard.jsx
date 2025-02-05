import React, { useState } from "react";
import {
  PencilIcon,
  TrashIcon,
  FolderOpenIcon,
} from "@heroicons/react/24/outline";
import STLViewer from "../STLViewer/STLViewer";

const WATCH_DIR = "C:\\Users\\faber\\Documents\\fichier3d";

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
      const nomFichier = model.nom || model.name;
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
    <div
      className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 p-6 rounded-xl shadow-xl border border-purple-500/30 transform transition-transform duration-300 hover:scale-105"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <div className="absolute top-0 right-0 flex space-x-2 bg-gray-900/50 rounded-lg p-1 z-10">
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-all duration-200 flex items-center"
            title="Modifier"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(model.id)}
            className="p-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200 flex items-center"
            title="Supprimer"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
          <button
            onClick={ouvrirDansExplorateur}
            className="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 flex items-center"
            title="Ouvrir dans l'explorateur"
          >
            <FolderOpenIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="mb-4 h-64 relative">
          <STLViewer
            url={`http://localhost:3001/stl-files/${encodeURIComponent(
              model.nom || model.name
            )}`}
            className="w-full h-full"
            modelColor="#9333ea"
          />
        </div>
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-white">
            {model.nom || model.name}
          </h3>
          <p className="text-gray-300">
            {model.description || "Aucune description"}
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
            <div>
              <span className="font-medium">Taille:</span>{" "}
              {formatBytes(model.taille || model.size)}
            </div>
            <div>
              <span className="font-medium">Catégorie:</span>{" "}
              {model.categorie || "Non définie"}
            </div>
            <div>
              <span className="font-medium">Thème:</span>{" "}
              {model.theme || "Non défini"}
            </div>
            <div>
              <span className="font-medium">Auteur:</span>{" "}
              {model.auteur || "Non défini"}
            </div>
            <div>
              <span className="font-medium">Modifié le:</span>{" "}
              {formatDate(model.dateModification || model.lastModified)}
            </div>
          </div>
          {model.tags && model.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {model.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-purple-600/30 text-purple-200 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {model.parametres_impression && (
            <div className="mt-4 p-3 bg-purple-600/20 rounded-lg">
              <h4 className="text-white font-medium mb-2">
                Paramètres d'impression
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                <div>
                  <span className="font-medium">Matériau:</span>{" "}
                  {model.parametres_impression.materiau || "Non défini"}
                </div>
                <div>
                  <span className="font-medium">Épaisseur:</span>{" "}
                  {model.parametres_impression.epaisseur_couche ||
                    "Non définie"}
                </div>
                <div>
                  <span className="font-medium">Remplissage:</span>{" "}
                  {model.parametres_impression.remplissage || "Non défini"}
                </div>
                <div>
                  <span className="font-medium">Support:</span>{" "}
                  {model.parametres_impression.support ? "Oui" : "Non"}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModelCard;
