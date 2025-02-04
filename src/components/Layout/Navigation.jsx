import React from "react";
import { Link, useLocation } from "react-router-dom";
import { HomeIcon, CubeIcon, CogIcon } from "@heroicons/react/24/outline";

const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="bg-gradient-to-r from-gray-800/40 via-purple-700 to-gray-900 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex space-x-8">
              <Link
                to="/"
                className={`flex items-center space-x-2 ${
                  location.pathname === "/"
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                } transition-colors`}
              >
                <HomeIcon className="h-5 w-5" />
                <span>Accueil</span>
              </Link>

              <Link
                to="/models"
                className={`flex items-center space-x-2 ${
                  location.pathname === "/models"
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                } transition-colors`}
              >
                <CubeIcon className="h-5 w-5" />
                <span>Modèles</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            <Link
              to="/parametres"
              className={`flex items-center space-x-2 ${
                location.pathname === "/parametres"
                  ? "text-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              } transition-colors`}
            >
              <CogIcon className="h-5 w-5" />
              <span>Paramètres</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
