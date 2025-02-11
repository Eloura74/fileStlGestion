import React, { useState } from "react";
import { Modele } from "../../types/Modele";
import { motion } from "framer-motion";
import { FaTimes } from "react-icons/fa";

interface ModifyFilesProps {
  modele: Modele;
  onSave: (updatedModele: Modele) => void;
  onCancel: () => void;
}

const ModifyFiles: React.FC<ModifyFilesProps> = ({
  modele,
  onSave,
  onCancel,
}) => {
  const [type, setType] = useState<string>(modele.type || "");
  const [categorie, setCategorie] = useState<string>(modele.categorie || "");

  const handleSave = () => {
    onSave({ ...modele, type, categorie });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-slate-900 p-8 rounded-2xl shadow-2xl text-white w-full max-w-lg mx-auto relative border border-slate-700"
    >
      <div className="flex justify-between items-center border-b border-slate-600 pb-4 mb-4">
        <h3 className="text-2xl font-bold text-gray-200">
          Modifier le fichier
        </h3>
        <button
          onClick={onCancel}
          className="text-slate-400 hover:text-red-400 transition"
        >
          <FaTimes size={22} />
        </button>
      </div>

      <div className="space-y-6">
        <div className="form-group">
          <label className="text-gray-300 block mb-2">Nom du fichier</label>
          <div className="bg-slate-800 text-gray-200 rounded-lg p-3 border border-slate-700 text-sm">
            {modele.id}
          </div>
        </div>

        <div className="form-group">
          <label className="text-gray-300 block mb-2">Type d'impression</label>
          <select
            className="bg-slate-800 text-white rounded-lg p-3 border border-slate-700 w-full"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">Sélectionner un type</option>
            <option value="filament">Filament</option>
            <option value="resine">Résine</option>
            <option value="technique">Technique</option>
          </select>
        </div>

        <div className="form-group">
          <label className="text-gray-300 block mb-2">Catégorie</label>
          <select
            className="bg-slate-800 text-white rounded-lg p-3 border border-slate-700 w-full"
            value={categorie}
            onChange={(e) => setCategorie(e.target.value)}
          >
            <option value="">Sélectionner une catégorie</option>
            <option value="jeux">Jeux</option>
            <option value="decoration">Décoration</option>
            <option value="technique">Technique</option>
            <option value="autre">Autre</option>
          </select>
        </div>
      </div>

      <div className="flex space-x-4 pt-6 border-t border-slate-600 mt-6">
        <button
          className="bg-blue-500 hover:bg-blue-600 transition text-white font-semibold py-3 px-6 rounded-lg flex-1 shadow-md"
          onClick={handleSave}
        >
          Sauvegarder
        </button>
        <button
          className="bg-gray-700 hover:bg-gray-800 transition text-white font-semibold py-3 px-6 rounded-lg flex-1 shadow-md"
          onClick={onCancel}
        >
          Annuler
        </button>
      </div>
    </motion.div>
  );
};

export default ModifyFiles;
