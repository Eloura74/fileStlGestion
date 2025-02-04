import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRightIcon,
  NewspaperIcon,
  FireIcon,
  FolderOpenIcon,
} from "@heroicons/react/24/outline";
import STLViewer from "../components/STLViewer/STLViewer";
import Actualites from "../components/Actualites/Actualites";

const Accueil = () => {
  const [recentModels, setRecentModels] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/api/models")
      .then((response) => response.json())
      .then((data) => {
        // Trier les modèles par date de modification et prendre les 5 plus récents
        const sortedModels = data
          .sort((a, b) => new Date(b.dateModification) - new Date(a.dateModification))
          .slice(0, 5);
        setRecentModels(sortedModels);
      })
      .catch((error) =>
        console.error("Erreur lors du chargement des modèles:", error)
      );
  }, []);

  const formatBytes = (bytes) => {
    if (!bytes) return "0 Ko";
    return (bytes / 1024).toFixed(2) + " Ko";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900/90 via-purple-800 to-black">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-800/60 via-purple-700 to-gray-900 py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4 text-white">
            Plateforme de Gestion de Modèles 3D
          </h1>
          <p className="text-xl text-gray-200 mb-8">
            Gérez, visualisez et organisez vos fichiers 3D en toute simplicité
          </p>
          <Link
            to="/models"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Explorer les modèles
            <ArrowRightIcon className="h-5 w-5 ml-2" />
          </Link>
        </div>
      </div>

      {/* Recent Models Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="bg-white/10 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-white flex items-center">
              <FireIcon className="h-6 w-6 mr-2 text-orange-500" />
              Derniers Ajouts
            </h2>
            <Link
              to="/models"
              className="text-blue-400 hover:text-blue-500 flex items-center"
            >
              Voir tout
              <ArrowRightIcon className="h-4 w-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentModels.map((model) => (
              <div
                key={model.id}
                className="bg-gray-700/50 rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all"
              >
                {/* Visualiseur STL */}
                <div className="aspect-w-16 aspect-h-9 bg-gray-900/50">
                  <STLViewer
                    url={`http://localhost:3001/models/${model.nom}${
                      model.nom.toLowerCase().endsWith(".stl") ? "" : ".stl"
                    }`}
                    className="w-full h-full"
                  />
                </div>

                {/* Informations du modèle */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2 truncate">
                    {model.nom}
                  </h3>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                    <div>
                      <span className="text-gray-400 text-xs">Format</span>
                      <p className="text-purple-300">{model.format || "STL"}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-xs">Taille</span>
                      <p className="text-purple-300">{formatBytes(model.size)}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-xs">Catégorie</span>
                      <p className="text-purple-300 capitalize">
                        {model.categorie || "autre"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-xs">Thème</span>
                      <p className="text-purple-300 capitalize">
                        {model.theme || "autre"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => window.location.href = `/models/${model.nom}`}
                    className="mt-4 w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <FolderOpenIcon className="h-5 w-5 mr-2" />
                    Voir les détails
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* News Section */}
        <div className="mt-12">
          <Actualites />
        </div>
      </div>
    </div>
  );
};

export default Accueil;
