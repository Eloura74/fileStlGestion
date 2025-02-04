import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRightIcon,
  NewspaperIcon,
  FireIcon,
} from "@heroicons/react/24/outline";
import STLViewer from '../components/STLViewer/STLViewer';
import Actualites from "../components/Actualites/Actualites";

const Accueil = () => {
  const [recentModels, setRecentModels] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/models')
      .then(response => response.json())
      .then(data => {
        console.log('Données reçues dans Accueil:', data);
        // Vérifier la structure d'un modèle
        if (data.length > 0) {
          console.log('Premier modèle:', data[0]);
          console.log('URL du fichier STL:', data[0].fileUrl);
        }
        setRecentModels(data);
      })
      .catch(error => console.error('Erreur lors du chargement des modèles:', error));
  }, []);

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
                className="flex items-center space-x-4 bg-white/5 p-4 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="flex-shrink-0 w-32 h-32">
                  <STLViewer url={model.fileUrl} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-white truncate">
                    {model.name}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {(model.size / 1024).toFixed(2)} Ko
                  </p>
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
