import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  CubeIcon,
  Cog6ToothIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import Connection from "../Connection/Connection";
import Inscription from "../Connection/Inscription";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/connection");
  };

  return (
    <nav className="bg-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-white text-xl font-bold">STL Gestion</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  to="/"
                  className={`${
                    location.pathname === "/"
                      ? "bg-purple-600 text-white"
                      : "text-gray-300 hover:bg-purple-500/10 hover:text-white"
                  } px-3 py-2 rounded-md text-sm font-medium flex items-center`}
                >
                  <HomeIcon className="h-5 w-5 mr-2" />
                  Accueil
                </Link>

                <Link
                  to="/models"
                  className={`${
                    location.pathname === "/models"
                      ? "bg-purple-600 text-white"
                      : "text-gray-300 hover:bg-purple-500/10 hover:text-white"
                  } px-3 py-2 rounded-md text-sm font-medium flex items-center`}
                >
                  <CubeIcon className="h-5 w-5 mr-2" />
                  Modèles
                </Link>

                <Link
                  to="/parametres"
                  className={`${
                    location.pathname === "/parametres"
                      ? "bg-purple-600 text-white"
                      : "text-gray-300 hover:bg-purple-500/10 hover:text-white"
                  } px-3 py-2 rounded-md text-sm font-medium flex items-center`}
                >
                  <Cog6ToothIcon className="h-5 w-5 mr-2" />
                  Paramètres
                </Link>
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {token ? (
                <button
                  onClick={handleLogout}
                  className="text-gray-300 hover:bg-purple-500/10 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <UserIcon className="h-5 w-5 mr-2" />
                  Déconnexion
                </button>
              ) : (
                <div className="flex space-x-4">
                  <button
                    onClick={() => navigate("/connection")}
                    className={`${
                      location.pathname === "/connection"
                        ? "bg-purple-600 text-white"
                        : "text-gray-300 hover:bg-purple-500/10 hover:text-white"
                    } px-3 py-2 rounded-md text-sm font-medium flex items-center`}
                  >
                    <UserIcon className="h-5 w-5 mr-2" />
                    Connexion
                  </button>
                  <Link
                    to="/inscription"
                    className="text-gray-300 hover:bg-purple-500/10 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    S'inscrire
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
