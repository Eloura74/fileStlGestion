import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRightIcon,
  NewspaperIcon,
  FireIcon,
  FolderOpenIcon,
  ClockIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import STLViewer from "../components/STLViewer/STLViewer";
import SearchBar from "../components/SearchBar/SearchBar";
import Actualites from "../components/Actualites/Actualites";
import "../styles/animations.css";

const Accueil = () => {
  const [recentModels, setRecentModels] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("http://localhost:3001/api/models")
      .then((response) => response.json())
      .then((data) => {
        const sortedModels = data
          .sort((a, b) => new Date(b.dateModification) - new Date(a.dateModification))
          .slice(0, 4);
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Section Hero */}
      <div className="relative overflow-hidden bg-gradient-to-b from-purple-900/50 to-gray-900">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 animate-gradient">
              Gestionnaire de Modèles 3D
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Organisez et visualisez vos fichiers STL en toute simplicité
            </p>
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
            <div className="flex justify-center gap-4 pt-4">
              <Link
                to="/models"
                className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors"
              >
                Explorer les modèles
                <ArrowRightIcon className="h-5 w-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Section Modèles Récents */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <FireIcon className="h-7 w-7 mr-3 text-orange-500" />
              Ajouts Récents
            </h2>
            <Link
              to="/models"
              className="flex items-center text-purple-400 hover:text-purple-300 transition-colors"
            >
              Voir tout
              <ArrowRightIcon className="h-4 w-4 ml-2" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentModels.map((model) => (
              <div
                key={model.nom}
                className="group bg-gray-800 rounded-xl overflow-hidden hover:ring-2 hover:ring-purple-500/50 transition-all duration-300"
              >
                <div className="relative aspect-square bg-gray-900">
                  <STLViewer
                    url={`http://localhost:3001/models/${model.nom}${
                      model.nom.toLowerCase().endsWith(".stl") ? "" : ".stl"
                    }`}
                    className="w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="p-4 space-y-3">
                  <h3 className="font-medium text-white truncate group-hover:text-purple-400 transition-colors">
                    {model.nom}
                  </h3>
                  
                  <div className="flex items-center text-sm text-gray-400">
                    <ClockIcon className="h-4 w-4 mr-1.5" />
                    {formatDate(model.dateModification)}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-400">
                    <TagIcon className="h-4 w-4 mr-1.5" />
                    {model.categorie || "Non catégorisé"}
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
