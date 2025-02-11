import React from "react";

interface FilterTypeProps {
  onFilterChange: (type: string) => void;
  selectedValue: string;
}

// Liste des types d'impression disponibles avec les valeurs exactes du JSON
const TYPES = [
  { value: "", label: "Type d'impression" },
  { value: "filament", label: "Filament" },
  { value: "resine", label: "Résine" },
  { value: "technique", label: "Technique" },
];

const FilterType: React.FC<FilterTypeProps> = ({
  onFilterChange,
  selectedValue,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange(e.target.value);
  };

  return (
    <div className="filter-select-container">
      <select
        onChange={handleChange}
        value={selectedValue}
        className="text-center appearance-none px-4 py-2 pr-8 bg-gray-800/40 text-gray-200 
                   border border-gray-700 rounded-lg cursor-pointer w-50
                   transition-all duration-300 ease-in-out
                   hover:bg-gray-700/60 hover:border-gray-500
                   focus:outline-none focus:ring-2 focus:ring-gray-500
                   font-medium shadow-lg shadow-slate-950"
        data-filter="type"
      >
        {TYPES.map(({ value, label }) => (
          <option key={value} value={value} className="text-center bg-gray-800">
            {label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterType;
