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
    <nav className="bg-gray-800/50 backdrop-blur-sm shadow-lg mb-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/")
                  ? "bg-purple-600 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              <HomeIcon className="h-5 w-5 mr-1.5" />
              Accueil
            </Link>

            <Link
              to="/models"
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/models")
                  ? "bg-purple-600 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              <CubeIcon className="h-5 w-5 mr-1.5" />
              Modèles
            </Link>
          </div>

          <Link
            to="/parametres"
            className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive("/parametres")
                ? "bg-purple-600 text-white"
                : "text-gray-300 hover:bg-gray-700 hover:text-white"
            }`}
          >
            <Cog6ToothIcon className="h-5 w-5 mr-1.5" />
            Paramètres
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
