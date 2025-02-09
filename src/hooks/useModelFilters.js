import { useState, useCallback } from "react";

const useModelFilters = (initialModels = []) => {
  const [filters, setFilters] = useState({
    theme: "tous",
    categorie: "tous",
  });

  const [searchQuery, setSearchQuery] = useState("");

  const filteredModels = useCallback(() => {
    return initialModels.filter((model) => {
      // Recherche textuelle
      if (
        searchQuery &&
        !model.nom.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Filtres
      if (filters.theme !== "tous" && model.theme !== filters.theme) {
        return false;
      }
      if (
        filters.categorie !== "tous" &&
        model.categorie !== filters.categorie
      ) {
        return false;
      }

      return true;
    });
  }, [initialModels, filters, searchQuery]);

  return {
    filters,
    setFilters,
    searchQuery,
    setSearchQuery,
    filteredModels,
  };
};

export default useModelFilters;
