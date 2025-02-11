import React, { useState, useEffect } from "react";
import SearchBar from "../filter/SearchBar";
import FilterType from "../filter/FilterType";
import FilterCategorie from "../filter/FilterCategorie";
import ModeleCard from "./ModeleCard";
import ModifyFiles from "./ModifyFiles";
import { listFiles } from "../../api/apiStl";
import "./ModelePage.css";

interface Modele {
  id: string;
  type: string;
  categorie: string;
}

const ModelePage: React.FC = () => {
  const [typeFiltre, setTypeFiltre] = useState<string>("");
  const [categorieFiltre, setCategorieFiltre] = useState<string>("");
  const [modeleEnModification, setModeleEnModification] = useState<Modele | null>(null);
  const [modeles, setModeles] = useState<Modele[]>([]);
  const [recherche, setRecherche] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFiles = async () => {
      try {
        const files = await listFiles();
        setModeles(
          files.map((file) => ({
            id: file,
            type: "", // Type d'impression (filament/résine)
            categorie: "", // Catégorie (jeux, déco, etc.)
          }))
        );
      } catch (error) {
        console.error("Erreur lors du chargement des fichiers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFiles();
  }, []);

  const handleFilterType = (selectedType: string) => {
    setTypeFiltre(selectedType);
  };

  const handleFilterCategorie = (selectedCategorie: string) => {
    setCategorieFiltre(selectedCategorie);
  };

  const handleSearchChange = (value: string) => {
    setRecherche(value);
  };

  const handleEditModele = (modele: Modele) => {
    setModeleEnModification(modele);
  };

  const handleSaveModele = (modele: Modele) => {
    setModeles((prevModeles) =>
      prevModeles.map((m) => (m.id === modele.id ? modele : m))
    );
    setModeleEnModification(null);
  };

  const handleCancelEdit = () => {
    setModeleEnModification(null);
  };

  const modelesFiltres = modeles.filter(
    (modele) =>
      (typeFiltre === "" || modele.type === typeFiltre) &&
      (categorieFiltre === "" || modele.categorie === categorieFiltre) &&
      modele.id.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 space-y-6">
        {/* Barre de recherche */}
        <div className="max-w-2xl mx-auto">
          <SearchBar onSearch={handleSearchChange} />
        </div>

        {/* Filtres */}
        <div className="flex justify-center gap-4">
          <FilterCategorie onFilterChange={handleFilterCategorie} />
          <FilterType onFilterChange={handleFilterType} />
        </div>
      </div>

      {/* Contenu principal */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-slate-500">Chargement des modèles...</div>
        </div>
      ) : modeleEnModification ? (
        <div className="max-w-2xl mx-auto">
          <ModifyFiles
            modele={modeleEnModification}
            onSave={handleSaveModele}
            onCancel={handleCancelEdit}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {modelesFiltres.length === 0 ? (
            <div className="col-span-full text-center text-slate-500 py-12">
              Aucun modèle trouvé
            </div>
          ) : (
            modelesFiltres.map((modele) => (
              <ModeleCard
                key={modele.id}
                modele={modele}
                onEdit={() => handleEditModele(modele)}
                onViewMore={() => {}}
                onDelete={() => {}}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ModelePage;
