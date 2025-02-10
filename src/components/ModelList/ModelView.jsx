// ModelView.jsx
import React, { useState } from "react";
import {
  PencilIcon,
  TrashIcon,
  FolderOpenIcon,
} from "@heroicons/react/24/outline";
import STLViewer from "../STLViewer/STLViewer";

const formatBytes = (bytes) => {
  if (!bytes) return "0 Mo";
  const mb = bytes / (1024 * 1024);
  return mb.toFixed(2) + " Mo";
};

const formatDate = (dateString) => {
  if (!dateString) return "Non définie";
  return new Date(dateString).toLocaleString("fr-FR");
};

const ModelView = ({ model, onEdit, onDelete, ouvrirDansExplorateur }) => {
  const [isHovered, setIsHovered] = useState(false);

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
            onClick={onEdit}
            className="p-2 text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-all duration-200 flex items-center focus:ring-2 focus:ring-purple-400 focus:outline-none"
            title="Modifier le modèle"
            aria-label="Modifier le modèle"
          >
            <PencilIcon className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Modifier</span>
          </button>
          <button
            onClick={onDelete}
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

export default ModelView;
