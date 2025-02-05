import React, { useState } from "react";
import {
  FolderIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useBasePath } from "../contexts/BasePathContext";

const Parametres = () => {
  const { basePath, updateBasePath } = useBasePath();
  const [newPath, setNewPath] = useState(basePath);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setStatus({ type: "", message: "" });

    try {
      await updateBasePath(newPath);
      setStatus({
        type: "success",
        message: "Le chemin de base a été mis à jour avec succès",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Erreur lors de la mise à jour du chemin",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSelectFolder = async () => {
    try {
      const response = await fetch(
        "http://localhost:3001/api/dialog/select-folder",
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la sélection du dossier");
      }

      const data = await response.json();
      if (data.path) {
        setNewPath(data.path);
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: "Erreur lors de la sélection du dossier",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-white mb-8">Paramètres</h1>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              Répertoire source des fichiers STL
            </h2>
            <p className="text-gray-300 mb-4">
              Définissez le répertoire où se trouvent vos fichiers STL.
              L'application surveillera ce répertoire pour détecter
              automatiquement les nouveaux fichiers.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    value={newPath}
                    onChange={(e) => setNewPath(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="Chemin du répertoire"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSelectFolder}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <FolderIcon className="h-5 w-5" />
                </button>
              </div>

              <button
                type="submit"
                disabled={isUpdating || newPath === basePath}
                className={`w-full px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                  isUpdating || newPath === basePath
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                }`}
              >
                {isUpdating ? "Mise à jour..." : "Mettre à jour le répertoire"}
              </button>
            </form>

            {status.message && (
              <div
                className={`mt-4 p-4 rounded-lg flex items-center gap-2 ${
                  status.type === "success"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {status.type === "success" ? (
                  <CheckCircleIcon className="h-5 w-5" />
                ) : (
                  <XCircleIcon className="h-5 w-5" />
                )}
                {status.message}
              </div>
            )}
          </div>

          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-white mb-2">
              Chemin actuel
            </h3>
            <p className="text-gray-300 bg-gray-700/50 p-3 rounded">
              {basePath}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Parametres;
