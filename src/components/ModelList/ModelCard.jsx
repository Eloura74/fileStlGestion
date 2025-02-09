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

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
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
                  onClick={() => onEdit(model)}
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
                  onClick={() => onDelete(model)}
                  className="flex flex-col items-center p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Supprimer"
                >
                  <TrashIcon className="h-5 w-5 mb-1" />
                  <span className="text-xs">Supprimer</span>
                </button>

                <button
                  onClick={() => window.open(`file://${model.path}`, '_blank')}
                  className="flex flex-col items-center p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                  title="Ouvrir"
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
