import React from "react";
import {
  MagnifyingGlassIcon,
  FolderIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";

const Header = ({
  onSearchChange,
  onPathChange,
  currentPath,
  onToggleFilters,
}) => {
  return (
    <header className="bg-gradient-to-r from-gray-800/40 via-purple-700 to-gray-900s text-white p-4 shadow-lg">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Gestionnaire de Modèles 3D</h1>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0">
              <input
                type="text"
                placeholder="Rechercher..."
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            <div className="relative flex-grow md:flex-grow-0">
              <input
                type="text"
                value={currentPath}
                onChange={(e) => onPathChange(e.target.value)}
                placeholder="Chemin du dossier..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FolderIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            <button
              onClick={onToggleFilters}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              title="Afficher/Masquer les filtres"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
