import React from "react";

interface FilterDateProps {
  onFilterChange: (date: string) => void;
  selectedValue: string;
}

const FilterDate: React.FC<FilterDateProps> = ({
  onFilterChange,
  selectedValue,
}) => {
  return (
    <div className="filter-select-container">
      <select
        onChange={(e) => onFilterChange(e.target.value)}
        value={selectedValue}
        className="text-center appearance-none px-4 py-2 pr-8 bg-gray-800/40 text-gray-200 
                   border border-gray-700 rounded-lg cursor-pointer w-50
                   transition-all duration-300 ease-in-out
                   hover:bg-gray-700/60 hover:border-gray-500
                   focus:outline-none focus:ring-2 focus:ring-gray-500
                   font-medium shadow-lg shadow-slate-950"
        data-filter="date"
      >
        <option value="" className="text-center bg-gray-800">
          Date d'impression
        </option>
        <option value="recent" className="text-center bg-gray-800">
          Plus récent
        </option>
        <option value="ancien" className="text-center bg-gray-800">
          Plus ancien
        </option>
      </select>
    </div>
  );
};

export default FilterDate;
