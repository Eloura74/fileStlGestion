import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Accueil from "./pages/Accueil";
import ModelList from "./components/ModelList/ModelList";
import FilterPanel from "./components/Filters/FilterPanel";
import useModelFilters from "./hooks/useModelFilters";
import Models from "./pages/Models";
import Navigation from "./components/Layout/Navigation";

function App() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { filteredModels, ...filterProps } = useModelFilters(models);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/models");
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des modèles");
        }
        const data = await response.json();
        setModels(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  const handleEdit = (model) => {
    console.log("Édition du modèle:", model);
  };

  const handleDelete = (model) => {
    console.log("Suppression du modèle:", model);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">
          <p className="text-xl font-semibold">Erreur</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Trier les modèles par date de création (les plus récents en premier)
  const sortedModels = [...models].sort(
    (a, b) => new Date(b.dateCreation) - new Date(a.dateCreation)
  );

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        <Routes>
          <Route path="/" element={<Accueil models={models} />} />
          <Route
            path="/models"
            element={
              <Models
                models={models}
                onEdit={handleEdit}
                onDelete={handleDelete}
                loading={loading}
                error={error}
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
