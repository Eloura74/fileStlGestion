import React, { useState } from "react";
import { Modele } from '../../types/Modele'; // Assuming the Modele type is defined in this file

interface ModifyFilesProps {
  modele: Modele;
  onSave: (updatedModele: Modele) => void;
  onCancel: () => void;
}

const ModifyFiles: React.FC<ModifyFilesProps> = ({ modele, onSave, onCancel }) => {
  const [type, setType] = useState<string>(modele.type);

  const handleSave = () => {
    onSave({ ...modele, type });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <h3 className="text-xl font-semibold text-slate-900">
          Modifier le fichier
        </h3>
        <button
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-500 transition-colors"
          aria-label="Fermer"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        <div className="form-group">
          <label className="form-label">Nom du fichier</label>
          <div className="form-input bg-slate-50">{modele.id}</div>
        </div>

        <div className="form-group">
          <label className="form-label">Type</label>
          <select
            className="form-input"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">Sélectionner un type</option>
            <option value="jeux">Jeux</option>
            <option value="decoration">Décoration</option>
            <option value="technique">Technique</option>
          </select>
        </div>
      </div>

      <div className="flex space-x-4 pt-4 border-t border-slate-200">
        <button className="btn-primary flex-1" onClick={handleSave}>
          Sauvegarder
        </button>
        <button className="btn-secondary flex-1" onClick={onCancel}>
          Annuler
        </button>
      </div>
    </div>
  );
};

export default ModifyFiles;