import React, { useState, useEffect } from "react";
import SearchBar from "../filter/SearchBar";
import FilterType from "../filter/FilterType";
import FilterCategorie from "../filter/FilterCategorie";
import FilterDate from "../filter/FilterDate";
import FilterReset from "../filter/FilterReset";
import ModeleCard from "./ModeleCard";
import ModifyFiles from "./ModifyFiles";
import "./ModelePage.css";

interface Modele {
  fileName: string;
  id: string;
  type: string;
  categorie: string;
  dateAjout: string;
  lastModified: string;
  description: string;
  tags: string[];
}

const ModelePage: React.FC = () => {
  const [typeFiltre, setTypeFiltre] = useState<string>("");
  const [categorieFiltre, setCategorieFiltre] = useState<string>("");
  const [dateFiltre, setDateFiltre] = useState<string>("");
  const [recherche, setRecherche] = useState<string>("");
  const [modeles, setModeles] = useState<Modele[]>([]);
  const [modeleEnModification, setModeleEnModification] =
    useState<Modele | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Chargement initial des modèles
  useEffect(() => {
    loadModeles();
  }, []);

  // Fonction pour charger les modèles depuis l'API
  const loadModeles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/stl-files");

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log("Données brutes reçues de l'API:", data);

      if (!Array.isArray(data)) {
        throw new Error("Format de données invalide");
      }

      setModeles(data);
    } catch (error) {
      console.error("Erreur lors du chargement des modèles:", error);
      setError("Impossible de charger les modèles. Veuillez réessayer plus tard.");
      setModeles([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de mise à jour d'un modèle
  const handleSaveModele = async (modele: Modele) => {
    try {
      setError(null);
      const response = await fetch(
        `/api/stl-files/${encodeURIComponent(modele.fileName)}/metadata`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(modele),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du modèle");
      }

      const updatedModele = await response.json();
      setModeles((prevModeles) =>
        prevModeles.map((m) =>
          m.fileName === modele.fileName ? updatedModele : m
        )
      );
      setModeleEnModification(null);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du modèle:", error);
      setError(
        "Impossible de sauvegarder les modifications. Veuillez réessayer."
      );
    }
  };

  // Gestionnaires d'événements pour les filtres
  const handleFilterType = (type: string) => {
    setTypeFiltre(type);
  };

  const handleFilterCategorie = (categorie: string) => {
    setCategorieFiltre(categorie);
  };

  const handleFilterDate = (date: string) => {
    setDateFiltre(date);
  };

  const handleSearch = (searchTerm: string) => {
    setRecherche(searchTerm);
  };

  // Réinitialisation des filtres avec retour aux valeurs par défaut
  const handleResetFilters = () => {
    setTypeFiltre("");
    setCategorieFiltre("");
    setDateFiltre("");
    setRecherche("");
    
    // Réinitialiser les sélecteurs à leur valeur par défaut
    const typeSelect = document.querySelector('select[data-filter="type"]') as HTMLSelectElement;
    const categorieSelect = document.querySelector('select[data-filter="categorie"]') as HTMLSelectElement;
    const dateSelect = document.querySelector('select[data-filter="date"]') as HTMLSelectElement;
    
    if (typeSelect) typeSelect.value = "";
    if (categorieSelect) categorieSelect.value = "";
    if (dateSelect) dateSelect.value = "";
  };

  // Fonction pour annuler la modification
  const handleCancelEdit = () => setModeleEnModification(null);

  // Fonction pour commencer la modification
  const handleEdit = (modele: Modele) => setModeleEnModification(modele);

  return (
    <div className="page-container">
      <div className="header-section">
        <h1 className="page-title">Modèles STL</h1>
        
        {/* Section des filtres */}
        <div className="filters-container">
          {/* Barre de recherche */}
          <div className="search-bar-container">
            <SearchBar onSearch={handleSearch} />
          </div>
          
          {/* Zone des filtres */}
          <div className="filters-controls">
            <div className="filters-group">
              <FilterType 
                onFilterChange={handleFilterType} 
                selectedValue={typeFiltre}
                data-filter="type"
              />
              <FilterCategorie
                onFilterChange={handleFilterCategorie}
                selectedValue={categorieFiltre}
                data-filter="categorie"
              />
              <FilterDate 
                onFilterChange={handleFilterDate}
                selectedValue={dateFiltre}
                data-filter="date"
              />
            </div>
            <div className="reset-button">
              <FilterReset onReset={handleResetFilters} />
            </div>
          </div>
        </div>
      </div>

      {/* Messages d'erreur */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* État de chargement */}
      {isLoading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <span>Chargement des modèles...</span>
        </div>
      ) : (
        <>
          <div className="models-grid">
            {modeles
              .filter((modele) => {
                // Filtre par type
                if (typeFiltre && typeFiltre !== "") {
                  if (!modele.type || modele.type.toLowerCase() !== typeFiltre.toLowerCase()) {
                    return false;
                  }
                }

                // Filtre par catégorie
                if (categorieFiltre && categorieFiltre !== "") {
                  if (!modele.categorie || modele.categorie.toLowerCase() !== categorieFiltre.toLowerCase()) {
                    return false;
                  }
                }

                // Filtre par date
                if (dateFiltre && dateFiltre !== "") {
                  const dateModele = new Date(modele.dateAjout).toLocaleDateString();
                  const dateFiltrage = new Date(dateFiltre).toLocaleDateString();
                  if (dateModele !== dateFiltrage) {
                    return false;
                  }
                }

                // Filtre par recherche
                if (recherche && recherche !== "") {
                  const searchTerm = recherche.toLowerCase();
                  const matches =
                    modele.fileName.toLowerCase().includes(searchTerm) ||
                    (modele.description &&
                      modele.description.toLowerCase().includes(searchTerm)) ||
                    (modele.type && modele.type.toLowerCase().includes(searchTerm)) ||
                    (modele.categorie &&
                      modele.categorie.toLowerCase().includes(searchTerm)) ||
                    (modele.tags &&
                      modele.tags.some((tag) => tag.toLowerCase().includes(searchTerm)));

                  if (!matches) {
                    return false;
                  }
                }

                return true;
              })
              .map((modele) => (
                <ModeleCard
                  key={modele.id}
                  modele={modele}
                  onEdit={() => handleEdit(modele)}
                />
              ))}
              {modeles.length === 0 && (
                <div className="no-results">
                  Aucun modèle trouvé
                </div>
              )}
          </div>

          {/* Modal de modification */}
          {modeleEnModification && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen px-4">
                <div className="fixed inset-0 bg-black/50 transition-opacity"></div>
                <div className="relative bg-slate-800 rounded-xl shadow-xl max-w-lg w-full p-6">
                  <ModifyFiles
                    modele={modeleEnModification}
                    onSave={handleSaveModele}
                    onCancel={handleCancelEdit}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ModelePage;
