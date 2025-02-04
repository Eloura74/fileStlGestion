import React, { useState } from "react";
import ModelList from "../components/ModelList/ModelList";

const Models = ({ models, onEdit, onDelete, loading, error }) => {
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortBy, setSortBy] = useState("name");
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

  const handleEdit = async (modelId, editData) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/models/${encodeURIComponent(modelId)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editData),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du modèle");
      }

      const updatedModel = await response.json();

      // Mettre à jour la liste des modèles localement
      const updatedModels = models.map((model) =>
        model.id === modelId ? { ...model, ...updatedModel } : model
      );

      // Mettre à jour l'état avec les nouveaux modèles
      onEdit(modelId, updatedModels);
    } catch (error) {
      console.error("Erreur:", error);
      throw error;
    }
  };

  // Filtrer les modèles
  const filteredModels = models.filter((model) => {
    const themeMatch = filterTheme === "tous" || model.theme === filterTheme;
    const categoryMatch =
      filterCategory === "tous" || model.category === filterCategory;
    return themeMatch && categoryMatch;
  });

  // Trier les modèles
  const sortedModels = [...filteredModels].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "name":
        comparison = (a?.name || "").localeCompare(b?.name || "");
        break;
      case "date":
        comparison = new Date(a?.date || 0) - new Date(b?.date || 0);
        break;
      case "theme":
        comparison = (a?.theme || "").localeCompare(b?.theme || "");
        break;
      case "category":
        comparison = (a?.category || "").localeCompare(b?.category || "");
        break;
      default:
        comparison = 0;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900/90 via-purple-800 to-black w-full">
      <div className="px-8 py-8">
        <div className="flex flex-col space-y-6">
          <h1 className="text-2xl font-bold text-white">Mes Modèles 3D</h1>

          <div className="flex flex-wrap gap-4">
            {/* Filtres */}
            <div className="flex items-center space-x-4">
              <select
                value={filterTheme}
                onChange={(e) => setFilterTheme(e.target.value)}
                className="px-4 py-2 bg-white/10 text-white rounded-lg"
              >
                {themes.map((theme) => (
                  <option key={theme} value={theme} className="text-gray-900">
                    {theme === "tous"
                      ? "Tous les thèmes"
                      : theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </option>
                ))}
              </select>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 bg-white/10 text-white rounded-lg"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="text-gray-900">
                    {cat === "tous"
                      ? "Toutes les catégories"
                      : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Tri */}
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-white/10 text-white rounded-lg"
              >
                <option value="name" className="text-gray-900">
                  Trier par nom
                </option>
                <option value="date" className="text-gray-900">
                  Trier par date
                </option>
                <option value="theme" className="text-gray-900">
                  Trier par thème
                </option>
                <option value="category" className="text-gray-900">
                  Trier par catégorie
                </option>
              </select>

              <button
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>

          <div className="flex-1">
            <ModelList
              models={sortedModels}
              onEdit={handleEdit}
              onDelete={onDelete}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Models;
