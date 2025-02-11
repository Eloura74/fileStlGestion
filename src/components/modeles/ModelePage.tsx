import React, { useState, useEffect } from "react";
import SearchBar from "../filter/SearchBar";
import FilterType from "../filter/FilterType";
import FilterCategorie from "../filter/FilterCategorie";
import FilterDate from "../filter/FilterDate";
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
  const [modeles, setModeles] = useState<Modele[]>([]);
  const [modeleEnModification, setModeleEnModification] =
    useState<Modele | null>(null);
  const [recherche, setRecherche] = useState<string>("");
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
      const response = await fetch("http://localhost:5000/api/stl-files");

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
        `http://localhost:5000/api/stl-files/${encodeURIComponent(
          modele.fileName
        )}/metadata`,
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

  // Gestion des filtres avec logs
  const handleFilterType = (selectedType: string) => {
    console.log("Filtre type sélectionné:", selectedType);
    setTypeFiltre(selectedType);
  };

  const handleFilterCategorie = (selectedCategorie: string) => {
    console.log("Filtre catégorie sélectionné:", selectedCategorie);
    setCategorieFiltre(selectedCategorie);
  };

  const handleFilterDate = (selectedDate: string) =>
    setDateFiltre(selectedDate);

  const handleSearch = (searchTerm: string) => setRecherche(searchTerm);

  // Fonction pour annuler la modification
  const handleCancelEdit = () => setModeleEnModification(null);

  // Fonction pour commencer la modification
  const handleEdit = (modele: Modele) => setModeleEnModification(modele);

  // Filtrage des modèles
  const modelesFiltres = modeles.filter((modele) => {
    console.log("Filtrage du modèle:", {
      fileName: modele.fileName,
      type: modele.type,
      categorie: modele.categorie,
      typeFiltre: typeFiltre,
      categorieFiltre: categorieFiltre,
      typeMatch: !typeFiltre || (modele.type && modele.type.toLowerCase() === typeFiltre.toLowerCase()),
      categorieMatch: !categorieFiltre || (modele.categorie && modele.categorie.toLowerCase() === categorieFiltre.toLowerCase())
    });

    // Filtre par type
    if (typeFiltre) {
      if (!modele.type || modele.type.toLowerCase() !== typeFiltre.toLowerCase()) {
        console.log(`Rejeté par filtre type: attendu="${typeFiltre}", reçu="${modele.type}"`);
        return false;
      }
    }

    // Filtre par catégorie
    if (categorieFiltre) {
      if (!modele.categorie || modele.categorie.toLowerCase() !== categorieFiltre.toLowerCase()) {
        console.log(`Rejeté par filtre catégorie: attendu="${categorieFiltre}", reçu="${modele.categorie}"`);
        return false;
      }
    }

    // Filtre par date
    if (dateFiltre) {
      const dateModele = new Date(modele.dateAjout).toLocaleDateString();
      const dateFiltrage = new Date(dateFiltre).toLocaleDateString();
      if (dateModele !== dateFiltrage) {
        console.log("Rejeté par filtre date");
        return false;
      }
    }

    // Filtre par recherche
    if (recherche) {
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
        console.log("Rejeté par filtre recherche");
        return false;
      }
    }

    console.log("Modèle accepté");
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Barre de filtres */}
      <div className="flex flex-wrap gap-4 mb-8">
        <SearchBar onSearch={handleSearch} />
        <FilterType onFilterChange={handleFilterType} />
        <FilterCategorie onFilterChange={handleFilterCategorie} />
        <FilterDate onFilterChange={handleFilterDate} />
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

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
              {error ? "Une erreur est survenue" : "Aucun modèle trouvé"}
            </div>
          ) : (
            modelesFiltres.map((modele) => (
              <ModeleCard
                key={modele.id}
                modele={modele}
                onEdit={() => handleEdit(modele)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ModelePage;
