import React, { useState } from "react";
import ModelList from "../components/ModelList/ModelList";

const Models = ({ models, onEdit, onDelete, loading, error }) => {
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortBy, setSortBy] = useState("nom");
  const [filterTheme, setFilterTheme] = useState("tous");
  const [filterCategory, setFilterCategory] = useState("tous");

  const themes = [
    "tous",
    "figurine",
    "jeux",
    "decoration",
    "fonctionnel",
    "autre",
  ];
  const categories = ["tous", "resine", "filament"];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-red-500 bg-red-100/10 p-4 rounded-lg">
          <p className="text-lg font-semibold">Erreur</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Filtrer les modèles
  let filteredModels = [...models];
  
  if (filterTheme !== "tous") {
    filteredModels = filteredModels.filter(model => model.theme === filterTheme);
  }
  
  if (filterCategory !== "tous") {
    filteredModels = filteredModels.filter(model => model.categorie === filterCategory);
  }

  // Trier les modèles
  filteredModels.sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Mes Modèles 3D</h1>
        
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtres */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-purple-300">
                Thème
              </label>
              <select
                value={filterTheme}
                onChange={(e) => setFilterTheme(e.target.value)}
                className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {themes.map((theme) => (
                  <option key={theme} value={theme} className="bg-gray-800">
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-purple-300">
                Catégorie
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-gray-800">
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Tri */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-purple-300">
                Trier par
              </label>
              <div className="flex space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 bg-gray-700/50 border border-gray-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="nom" className="bg-gray-800">Nom</option>
                  <option value="dateCreation" className="bg-gray-800">Date</option>
                  <option value="taille" className="bg-gray-800">Taille</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  {sortOrder === "asc" ? "↑" : "↓"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6">
          <ModelList models={filteredModels} onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>
    </div>
  );
};

export default Models;
