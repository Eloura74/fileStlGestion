import React, { useState, useEffect } from "react";
import ModelCard from "./ModelCard";

const ModelList = ({ models = [], onEdit, onDelete }) => {
  const [localModels, setLocalModels] = useState([]);

  useEffect(() => {
    // S'assurer que models est un tableau valide
    const validModels = Array.isArray(models) ? models : [];
    setLocalModels(validModels);
  }, [models]);

  const handleModelUpdate = (updatedModel) => {
    if (!updatedModel || !updatedModel.nom) {
      console.warn('Tentative de mise à jour avec un modèle invalide:', updatedModel);
      return;
    }

    setLocalModels(prevModels => {
      // S'assurer que prevModels est un tableau
      const currentModels = Array.isArray(prevModels) ? prevModels : [];
      
      return currentModels.map(model => {
        if (!model || !model.nom) return model;
        return model.nom === updatedModel.nom ? updatedModel : model;
      });
    });
  };

  // Vérifier si localModels est undefined ou vide
  if (!Array.isArray(localModels) || localModels.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Aucun modèle trouvé</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {localModels.map((model) => {
        // Vérifier que le modèle est valide avant de le rendre
        if (!model || !model.nom) {
          console.warn('Modèle invalide détecté:', model);
          return null;
        }

        return (
          <ModelCard
            key={model.nom}
            model={model}
            onEdit={onEdit}
            onDelete={onDelete}
            setModel={handleModelUpdate}
          />
        );
      })}
    </div>
  );
};

export default ModelList;
