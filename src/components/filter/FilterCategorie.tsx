import React from "react";

interface FilterCategorieProps {
  onFilterChange: (categorie: string) => void;
}

const FilterCategorie: React.FC<FilterCategorieProps> = ({
  onFilterChange,
}) => {
  return (
    <div className="filter-select-container">
      <select
        onChange={(e) => onFilterChange(e.target.value)}
        className="filter-select"
        defaultValue=""
      >
        <option value="">Catégorie</option>
        <option value="jeux">Jeux</option>
        <option value="decoration">Décoration</option>
        <option value="technique">Technique</option>
        <option value="figurine">Figurine</option>
        <option value="utilitaire">Utilitaire</option>
        <option value="autre">Autre</option>
      </select>
    </div>
  );
};

export default FilterCategorie;
