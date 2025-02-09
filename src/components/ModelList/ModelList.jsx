import React, { useState, useEffect } from "react";
import ModelCard from "./ModelCard";
import SearchBar from "../SearchBar/SearchBar";
import FilterPanel from "../Filters/FilterPanel";

const ModelList = ({ models = [], onEdit, onDelete }) => {
  const [localModels, setLocalModels] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategorie, setSelectedCategorie] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const validModels = Array.isArray(models) ? models : [];
    setLocalModels(validModels);
  }, [models]);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3001/api/models");
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des modèles");
      }
      const data = await response.json();
      setLocalModels(data);
    } catch (error) {
      console.error("Erreur:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleModelUpdate = async (modelId, updatedData) => {
    try {
      console.log("Mise à jour du modèle:", { modelId, updatedData });

      const response = await fetch(
        `http://localhost:3001/api/models/${modelId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la modification du modèle");
      }

      const result = await response.json();
      console.log("Modèle mis à jour:", result);

      if (result.success && result.data) {
        // Mise à jour de l'état local avec les nouvelles données
        setLocalModels((prevModels) =>
          prevModels.map((model) =>
            model.nom === updatedData.nom ? { ...model, ...result.data } : model
          )
        );
      }

      return result.data;
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      throw error;
    }
  };

  const handleDelete = async (model) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/models/${model.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du modèle");
      }

      setLocalModels((prevModels) =>
        prevModels.filter((m) => m.id !== model.id)
      );
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression du modèle: " + error.message);
    }
  };

  const filteredModels = localModels.filter((model) => {
    const matchesSearch =
      model.nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategorie =
      !selectedCategorie || model.categorie === selectedCategorie;
    const matchesTheme = !selectedTheme || model.theme === selectedTheme;

    return matchesSearch && matchesCategorie && matchesTheme;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>Erreur: {error}</p>
        <button
          onClick={fetchModels}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!Array.isArray(localModels) || localModels.length === 0) {
    return (
      <div className="bg-gray-900 min-h-[calc(100vh-4rem)] p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">Mes Modèles 3D</h1>
          </div>
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <div className="bg-gray-800 rounded-xl p-8 text-center shadow-lg">
            <p className="text-gray-400 text-lg">Aucun modèle trouvé</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="container mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-6">Mes Modèles 3D</h1>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>
            <FilterPanel
              selectedCategorie={selectedCategorie}
              selectedTheme={selectedTheme}
              onCategorieChange={setSelectedCategorie}
              onThemeChange={setSelectedTheme}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredModels.map((model) => {
            if (!model || (!model.nom && !model.name)) {
              console.warn("Modèle invalide détecté:", model);
              return null;
            }

            return (
              <ModelCard
                key={model.id || model.nom || model.name}
                model={model}
                onEdit={(updatedData) =>
                  handleModelUpdate(model.id, updatedData)
                }
                onDelete={handleDelete}
              />
            );
          })}
        </div>

        {filteredModels.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            <p className="text-xl">Aucun modèle trouvé</p>
            <p className="mt-2">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelList;
