import React from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const SearchBar = ({ value, onChange }) => {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Rechercher un modèle..."
        className="w-full pl-12 pr-4 py-3 bg-gray-800 text-white placeholder-gray-400 rounded-xl border border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all duration-200"
      />
      <MagnifyingGlassIcon className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
    </div>
  );
};

export default SearchBar;
