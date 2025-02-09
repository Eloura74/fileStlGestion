import React, { useState, useEffect } from "react";
import ModelCard from "./ModelCard";
import SearchBar from "../SearchBar/SearchBar";

// declaration des types de données
const ModelList = ({ models = [], onEdit, onDelete }) => {
  const [localModels, setLocalModels] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // mise à jour des models locaux
  useEffect(() => {
    const validModels = Array.isArray(models) ? models : [];
    setLocalModels(validModels);
  }, [models]);

  // gestion des modifications
  const handleModelUpdate = (updatedModel) => {
    if (!updatedModel || (!updatedModel.nom && !updatedModel.name)) {
      console.warn(
        "Tentative de mise à jour avec un modèle invalide:",
        updatedModel
      );
      return;
    }
    // mise à jour des models locaux
    setLocalModels((prevModels) => {
      const currentModels = Array.isArray(prevModels) ? prevModels : [];
      return currentModels.map((model) => {
        if (!model || (!model.nom && !model.name)) return model;
        const modelId = model.nom || model.name;
        const updatedId = updatedModel.nom || updatedModel.name;
        return modelId === updatedId ? updatedModel : model;
      });
    });
  };

  // gestion des filtres
  const filteredModels = localModels.filter((model) => {
    if (!searchQuery) return true;
    return model.nom.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // affichage
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
    <div className="bg-gray-900 min-h-[calc(100vh-4rem)] p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Mes Modèles 3D</h1>
        </div>
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredModels.map((model) => {
            if (!model || (!model.nom && !model.name)) {
              console.warn("Modèle invalide détecté:", model);
              return null;
            }

            return (
              <ModelCard
                key={model.id || model.nom || model.name}
                model={model}
                onEdit={onEdit}
                onDelete={onDelete}
                setModel={handleModelUpdate}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ModelList;
