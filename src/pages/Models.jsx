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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900/90 via-purple-800 to-black w-full">
      <div className="px-8 py-8">
        <div className="flex flex-col space-y-6">
          <h1 className="text-2xl font-bold text-white">Mes Modèles 3D</h1>

          <div className="flex flex-wrap gap-4">
            {/* Filtres */}
            <div className="flex items-center space-x-4">
              <label className="text-gray-700">Thème:</label>
              <select
                value={filterTheme}
                onChange={(e) => setFilterTheme(e.target.value)}
                className="px-4 py-2 bg-white/10 text-white rounded-lg"
              >
                {themes.map((theme) => (
                  <option key={theme} value={theme}>
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-4">
              <label className="text-gray-700">Catégorie:</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 bg-white/10 text-white rounded-lg"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Tri */}
            <div className="flex items-center space-x-4">
              <label className="text-gray-700">Trier par:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-white/10 text-white rounded-lg"
              >
                <option value="nom">Nom</option>
                <option value="dateCreation">Date</option>
                <option value="taille">Taille</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>

          <div className="flex-1">
            <ModelList models={filteredModels} onEdit={onEdit} onDelete={onDelete} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Models;
