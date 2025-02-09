import React from "react";
import { FunnelIcon } from "@heroicons/react/24/outline";

const FilterPanel = ({
  selectedCategorie,
  selectedTheme,
  onCategorieChange,
  onThemeChange,
}) => {
  const categories = ["resine", "filament", "autre"];
  const themes = ["figurine", "jeux", "decoration", "fonctionnel", "autre"];

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative">
        <select
          value={selectedCategorie}
          onChange={(e) => onCategorieChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="">Toutes les catégories</option>
          {categories.map((categorie) => (
            <option key={categorie} value={categorie}>
              {categorie.charAt(0).toUpperCase() + categorie.slice(1)}
            </option>
          ))}
        </select>
        <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      </div>

      <div className="relative">
        <select
          value={selectedTheme}
          onChange={(e) => onThemeChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="">Tous les thèmes</option>
          {themes.map((theme) => (
            <option key={theme} value={theme}>
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </option>
          ))}
        </select>
        <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      </div>
    </div>
  );
};

export default FilterPanel;
