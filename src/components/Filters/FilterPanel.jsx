import React from "react";

const FilterPanel = ({ filters, onFilterChange }) => {
  const handleChange = (name, value) => {
    onFilterChange({ ...filters, [name]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Filtres</h2>

      {/* Format */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Format
        </label>
        <select
          value={filters.format}
          onChange={(e) => handleChange("format", e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Tous</option>
          <option value="STL">STL</option>
          <option value="OBJ">OBJ</option>
          <option value="FBX">FBX</option>
          <option value="3DS">3DS</option>
        </select>
      </div>

      {/* Catégorie */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Catégorie
        </label>
        <select
          value={filters.categorie}
          onChange={(e) => handleChange("categorie", e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Toutes</option>
          <option value="Architecture">Architecture</option>
          <option value="Personnages">Personnages</option>
          <option value="Véhicules">Véhicules</option>
          <option value="Mobilier">Mobilier</option>
          <option value="Autres">Autres</option>
        </select>
      </div>

      {/* Taille */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Taille
        </label>
        <select
          value={filters.taille}
          onChange={(e) => handleChange("taille", e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Toutes</option>
          <option value="petit">Petit (&lt; 10 Mo)</option>
          <option value="moyen">Moyen (10-50 Mo)</option>
          <option value="grand">Grand (&gt; 50 Mo)</option>
        </select>
      </div>

      {/* Date de création */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date minimum
          </label>
          <input
            type="date"
            value={filters.dateMin}
            onChange={(e) => handleChange("dateMin", e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date maximum
          </label>
          <input
            type="date"
            value={filters.dateMax}
            onChange={(e) => handleChange("dateMax", e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Bouton de réinitialisation */}
      <button
        onClick={() =>
          onFilterChange({
            format: "",
            categorie: "",
            taille: "",
            dateMin: "",
            dateMax: "",
          })
        }
        className="w-full mt-6 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
      >
        Réinitialiser les filtres
      </button>
    </div>
  );
};

export default FilterPanel;
