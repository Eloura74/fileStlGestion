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
import "../styles/animations.css";

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/90 to-black">
      {/* Hero Section avec animation */}
      <div className="relative overflow-hidden bg-gradient-to-r from-gray-900/80 via-purple-800/70 to-gray-900/80">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="container mx-auto px-4 py-24 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6 text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400 animate-gradient">
              Plateforme de Gestion de Modèles 3D
            </h1>
            <p className="text-xl text-gray-300 mb-10 leading-relaxed">
              Gérez, visualisez et organisez vos fichiers 3D en toute simplicité avec notre interface intuitive et moderne
            </p>
            <Link
              to="/models"
              className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
            >
              Explorer les modèles
              <ArrowRightIcon className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Models Section avec effet de carte amélioré */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-gray-800/30 backdrop-blur-md rounded-2xl p-8 shadow-xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white flex items-center">
              <FireIcon className="h-8 w-8 mr-3 text-orange-500 animate-pulse" />
              Derniers Ajouts
            </h2>
            <Link
              to="/models"
              className="group flex items-center px-4 py-2 text-blue-400 hover:text-blue-300 transition-colors rounded-lg hover:bg-blue-500/10"
            >
              Voir tout
              <ArrowRightIcon className="h-4 w-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {recentModels && recentModels.map((model) => model && (
              <div
                key={model.id || 'default-key'}
                className="group bg-gray-800/50 rounded-xl overflow-hidden hover:ring-2 hover:ring-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1"
              >
                {/* Visualiseur STL avec overlay amélioré */}
                <div className="relative aspect-w-16 aspect-h-9 bg-gray-900/70">
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  {model.nom && (
                    <STLViewer
                      url={`http://localhost:3001/models/${model.nom}${
                        model.nom.toLowerCase().endsWith(".stl") ? "" : ".stl"
                      }`}
                      className="w-full h-full"
                    />
                  )}
                </div>

                {/* Informations du modèle avec mise en page améliorée */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 truncate group-hover:text-purple-400 transition-colors">
                    {model.nom}
                  </h3>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    <div className="space-y-1">
                      <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Format</span>
                      <p className="text-purple-300 font-medium">{model.format || "STL"}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Taille</span>
                      <p className="text-purple-300 font-medium">{formatBytes(model.taille)}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Catégorie</span>
                      <p className="text-purple-300 font-medium capitalize">{model.categorie}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Thème</span>
                      <p className="text-purple-300 font-medium capitalize">{model.theme}</p>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button className="px-4 py-2 text-sm text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-colors">
                      Voir les détails
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* News Section */}
      <div className="mt-12">
        <Actualites />
      </div>
    </div>
  );
};

export default Accueil;
