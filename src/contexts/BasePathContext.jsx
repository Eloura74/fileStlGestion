import React, { createContext, useState, useContext, useEffect } from 'react';

const BasePathContext = createContext();

export const useBasePath = () => {
  const context = useContext(BasePathContext);
  if (!context) {
    throw new Error('useBasePath doit être utilisé à l\'intérieur d\'un BasePathProvider');
  }
  return context;
};

export const BasePathProvider = ({ children }) => {
  const [basePath, setBasePath] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Récupérer le chemin de base depuis le serveur au démarrage
    fetch('http://localhost:3001/api/config/base-path')
      .then(response => response.json())
      .then(data => {
        setBasePath(data.basePath);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Erreur lors de la récupération du chemin de base:', error);
        setIsLoading(false);
      });
  }, []);

  const updateBasePath = async (newPath) => {
    try {
      const response = await fetch('http://localhost:3001/api/config/base-path', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ basePath: newPath }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la mise à jour du chemin');
      }

      const data = await response.json();
      setBasePath(data.basePath);
      return data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du chemin:', error);
      throw error;
    }
  };

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <BasePathContext.Provider value={{ basePath, updateBasePath }}>
      {children}
    </BasePathContext.Provider>
  );
};
