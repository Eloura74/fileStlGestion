import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  CubeIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

const Navigation = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-gray-900/40 backdrop-blur-md border-b border-purple-500/10 mb-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive("/")
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25"
                  : "text-gray-300 hover:bg-purple-500/10 hover:text-white"
              }`}
            >
              <HomeIcon className="h-5 w-5 mr-2" />
              Accueil
            </Link>

            <Link
              to="/models"
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive("/models")
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25"
                  : "text-gray-300 hover:bg-purple-500/10 hover:text-white"
              }`}
            >
              <CubeIcon className="h-5 w-5 mr-2" />
              Modèles
            </Link>
          </div>

          <Link
            to="/parametres"
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive("/parametres")
                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25"
                : "text-gray-300 hover:bg-purple-500/10 hover:text-white"
            }`}
          >
            <Cog6ToothIcon className="h-5 w-5 mr-2" />
            Paramètres
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
