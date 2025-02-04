import { useState, useCallback } from 'react';

const useModelFilters = (initialModels = []) => {
  const [filters, setFilters] = useState({
    format: '',
    categorie: '',
    taille: '',
    dateMin: '',
    dateMax: ''
  });

  const [searchQuery, setSearchQuery] = useState('');

  const filteredModels = useCallback(() => {
    return initialModels.filter(model => {
      // Recherche textuelle
      if (searchQuery && !model.nom.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Filtres
      if (filters.format && model.format !== filters.format) return false;
      if (filters.categorie && model.categorie !== filters.categorie) return false;
      if (filters.taille) {
        const taille = parseInt(model.taille);
        switch (filters.taille) {
          case 'petit': if (taille > 10) return false; break;
          case 'moyen': if (taille <= 10 || taille > 50) return false; break;
          case 'grand': if (taille <= 50) return false; break;
        }
      }
      
      // Filtres de date
      if (filters.dateMin && new Date(model.dateCreation) < new Date(filters.dateMin)) return false;
      if (filters.dateMax && new Date(model.dateCreation) > new Date(filters.dateMax)) return false;

      return true;
    });
  }, [initialModels, filters, searchQuery]);

  return {
    filters,
    setFilters,
    searchQuery,
    setSearchQuery,
    filteredModels
  };
};

export default useModelFilters;
