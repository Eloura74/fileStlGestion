import React from "react";
import { Link } from "react-router-dom";
import { PrinterIcon } from "@heroicons/react/24/outline";

interface HeaderProps {
  onTogglePrinterStatus: () => void;
}

const Header: React.FC<HeaderProps> = ({ onTogglePrinterStatus }) => {
  return (
    <header className="bg-gradient-to-b from-[#1E293B] to-[#374151] bg-opacity-90 backdrop-blur-lg shadow-md shadow-black/40 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo + Navigation */}
        <div className="flex items-center space-x-8">
          {/* Titre */}
          <h1 className="text-3xl font-bold text-gray-200 tracking-wide">
            GestionSTL
          </h1>

          {/* Navigation */}
          <nav className="flex space-x-4">
            <Link
              to="/"
              className="px-4 py-2 text-gray-300 bg-gray-800 rounded-md transition duration-200 hover:bg-gray-600 hover:text-white shadow-sm shadow-black/50"
            >
              Accueil
            </Link>
            <Link
              to="/models"
              className="px-4 py-2 text-gray-300 bg-gray-800 rounded-md transition duration-200 hover:bg-gray-600 hover:text-white shadow-sm shadow-black/50"
            >
              Modèles
            </Link>
            <Link
              to="/recent"
              className="px-4 py-2 text-gray-300 bg-gray-800 rounded-md transition duration-200 hover:bg-gray-600 hover:text-white shadow-sm shadow-black/50"
            >
              Récents
            </Link>
          </nav>
        </div>

        {/* Boutons d'action */}
        <div className="flex items-center space-x-4">
          {/* Bouton État Imprimante */}
          <button
            onClick={onTogglePrinterStatus}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-md transition duration-200 hover:bg-gray-600 hover:text-white shadow-sm shadow-black/50"
          >
            <PrinterIcon className="w-5 h-5" />
            <span className="hidden sm:inline">État Imprimante</span>
          </button>

          {/* Bouton "Nouveau modèle" */}
          <button className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-gray-700 to-gray-600 text-gray-200 font-medium rounded-lg shadow-md shadow-black/40 hover:bg-gray-500 hover:shadow-lg transition-all duration-300 hover:scale-105">
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span className="hidden sm:inline">Nouveau modèle</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
