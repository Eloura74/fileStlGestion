import React, { useState, useEffect } from "react";
import ModelCard from "./ModelCard";
import SearchBar from "../SearchBar/SearchBar";

const ModelList = ({ models = [], onEdit, onDelete }) => {
  const [localModels, setLocalModels] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const validModels = Array.isArray(models) ? models : [];
    setLocalModels(validModels);
  }, [models]);

  const handleModelUpdate = (updatedModel) => {
    if (!updatedModel || (!updatedModel.nom && !updatedModel.name)) {
      console.warn("Tentative de mise à jour avec un modèle invalide:", updatedModel);
      return;
    }

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

  const filteredModels = localModels.filter((model) => {
    if (!searchQuery) return true;
    return model.nom.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (!Array.isArray(localModels) || localModels.length === 0) {
    return (
      <div className="space-y-4">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Aucun modèle trouvé</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
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
  );
};

export default ModelList;
