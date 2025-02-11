import React from "react";

interface FilterTypeProps {
  onFilterChange: (type: string) => void;
}

const FilterType: React.FC<FilterTypeProps> = ({ onFilterChange }) => {
  return (
    <div className="filter-select-container">
      <select
        onChange={(e) => onFilterChange(e.target.value)}
        className="filter-select"
        defaultValue=""
      >
        <option value="">Type d'impression</option>
        <option value="filament">Filament</option>
        <option value="resine">Résine</option>
        <option value="autre">Autre</option>
      </select>
    </div>
  );
};

export default FilterType;
