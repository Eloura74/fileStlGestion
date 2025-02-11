import React from "react";
import PreviewSTL from "../previewSTL/PreviewSTL";

interface Modele {
  id: string;
  type: string;
}

interface ModeleCardProps {
  modele: Modele;
  onEdit: () => void;
  onViewMore: () => void;
  onDelete: () => void;
}

const ModeleCard: React.FC<ModeleCardProps> = ({
  modele,
  onEdit,
  onViewMore,
  onDelete,
}) => {
  return (
    <div
      className="bg-gradient-to-r from-[#1E293B] to-[#374151] 
    shadow-lg shadow-black/40 border border-slate-700 
    overflow-hidden cursor-pointer rounded-2xl 
    transition-all duration-300  
    hover:shadow-[0px_0px_20px_4px_rgba(0,0,0,0.4)]"
    >
      {/* En-tête */}
      <div className="p-3 border-b border-gray-700">
        <h3
          className="text-xl font-semibold text-gray-200 truncate text-center"
          title={modele.id}
        >
          {modele.id}
        </h3>
        {modele.type && (
          <span
            className="inline-flex items-center px-3 py-1 rounded-full 
            text-xs font-medium bg-gray-800 text-gray-300 mt-2 shadow-inner"
          >
            {modele.type}
          </span>
        )}
      </div>

      {/* Prévisualisation */}
      <div className="relative aspect-square bg-gray-900/50">
        <PreviewSTL
          fileUrl={`http://localhost:5000/stl-files/${encodeURIComponent(
            modele.id
          )}`}
        />
      </div>

      {/* Actions */}
      <div className="p-4 bg-gray-900/50 border-t border-gray-700">
        <div className="flex gap-2">
          {/* Modifier */}
          <button
            onClick={onEdit}
            className="flex-1 inline-flex items-center justify-center px-3 py-2 
              bg-gray-700 text-gray-200 shadow-md shadow-gray-900/50 
              text-sm font-medium rounded-lg hover:bg-gray-600 hover:shadow-none 
              transition-all duration-200"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            <span>Modifier</span>
          </button>
          {/* Voir plus */}
          <button
            onClick={onViewMore}
            className="inline-flex items-center justify-center p-2 
              text-gray-400 hover:text-gray-100 hover:bg-gray-700 
              rounded-full transition-all duration-200"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>
          {/* Suppression */}
          <button
            onClick={onDelete}
            className="inline-flex items-center justify-center p-2 
              text-red-500 hover:text-white hover:bg-red-700 
              rounded-full transition-all duration-200 hover:scale-110"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModeleCard;
