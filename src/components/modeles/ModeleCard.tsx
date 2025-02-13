import React from "react";
import PreviewSTL from "../previewSTL/PreviewSTL";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Modele {
  fileName: string;
  id: string;
  type: string;
  categorie: string;
  dateAjout: string;
  lastModified: string;
  description: string;
  tags: string[];
}

interface ModeleCardProps {
  modele: Modele;
  onEdit: () => void;
}

const ModeleCard: React.FC<ModeleCardProps> = ({ modele, onEdit }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "d MMMM yyyy", { locale: fr });
  };

  return (
    <div
      className="bg-gradient-to-r from-[#1E293B] to-[#374151] 
      shadow-lg shadow-black/40 border border-slate-700 
      overflow-hidden rounded-2xl 
      transition-all duration-300 
      hover:shadow-[0px_0px_20px_4px_rgba(0,0,0,0.4)]"
    >
      {/* En-tête */}
      <div className="p-4 border-b border-gray-700">
        <h3
          className="text-xl font-semibold text-gray-200 truncate"
          title={modele.fileName}
        >
          {modele.fileName}
        </h3>

        <div className="flex flex-wrap gap-2 mt-2">
          {modele.type && (
            <span
              className="inline-flex items-center px-3 py-1 rounded-full 
              text-xs font-medium bg-blue-900/50 text-blue-200"
            >
              {modele.type}
            </span>
          )}
          {modele.categorie && (
            <span
              className="inline-flex items-center px-3 py-1 rounded-full 
              text-xs font-medium bg-purple-900/50 text-purple-200"
            >
              {modele.categorie}
            </span>
          )}
        </div>
      </div>

      {/* Prévisualisation */}
      <div className="relative aspect-square bg-gray-900/50">
        <PreviewSTL
          fileUrl={`/api/stl-files/${encodeURIComponent(
            modele.fileName
          )}`}
        />
      </div>

      {/* Informations supplémentaires */}
      <div className="p-4 border-t border-gray-700">
        {modele.description && (
          <p
            className="text-gray-300 text-sm mb-3 line-clamp-2"
            title={modele.description}
          >
            {modele.description}
          </p>
        )}

        <div className="space-y-2 text-xs text-gray-400">
          <div className="flex justify-between">
            <span>Ajouté le :</span>
            <span>{formatDate(modele.dateAjout)}</span>
          </div>
          <div className="flex justify-between">
            <span>Dernière modification :</span>
            <span>{formatDate(modele.lastModified)}</span>
          </div>
        </div>

        {/* Tags */}
        {modele.tags && modele.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {modele.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs rounded-md bg-gray-800 text-gray-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Bouton de modification */}
        <div className="mt-4">
          <button
            onClick={onEdit}
            className="w-full px-4 py-2 text-sm font-medium text-gray-200 
            bg-gradient-to-r from-slate-800 to-slate-700
            hover:from-slate-700 hover:to-slate-600
            border border-slate-600
            shadow-lg shadow-black/20
            rounded-lg transition-all duration-300 
            hover:shadow-[0px_0px_15px_2px_rgba(0,0,0,0.3)]
            flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Modifier
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModeleCard;
