import React from "react";

interface FilterTypeProps {
  onFilterChange: (type: string) => void;
}

const FilterType: React.FC<FilterTypeProps> = ({ onFilterChange }) => {
  return (
    <div className="filter-select-container">
      <select
        onChange={(e) => onFilterChange(e.target.value)}
        className="text-center appearance-none px-4 py-2 pr-8 bg-gray-800/40 text-gray-200 
                   border border-gray-700 rounded-lg cursor-pointer w-50
                   transition-all duration-300 ease-in-out
                   hover:bg-gray-700/60 hover:border-gray-500
                   focus:outline-none focus:ring-2 focus:ring-gray-500
                   font-medium"
        defaultValue=""
      >
        <option value="" className="text-center bg-gray-800">
          Type d'impression
        </option>
        <option value="filament" className="text-center bg-gray-800">
          Filament
        </option>
        <option value="resine" className="text-center bg-gray-800">
          Résine
        </option>
      </select>
    </div>
  );
};

export default FilterType;
