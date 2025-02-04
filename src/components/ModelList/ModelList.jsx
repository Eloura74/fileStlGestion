import React from "react";
import ModelCard from "./ModelCard";

const ModelList = ({ models, onEdit, onDelete }) => {
  if (!models.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Aucun modèle trouvé</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {models.map((model) => (
        <ModelCard
          key={model.id}
          model={model}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default ModelList;
