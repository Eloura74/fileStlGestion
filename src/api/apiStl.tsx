import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/stl-files"; // L'URL du backend

// 🔹 Fonction qui récupère la liste des fichiers STL
export const listFiles = async (): Promise<string[]> => {
  try {
    // 🔹 Appel de l'API pour obtenir la liste des fichiers
    const response = await axios.get<string[]>(API_URL);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des fichiers STL :", error);
    return [];
  }
};

// 🔹 Composant React qui affiche la liste des fichiers
const ApiStl = () => {
  const [stlFiles, setStlFiles] = useState<string[]>([]);

  //   🔹 Effect qui récupère la liste des fichiers au chargement du composant
  useEffect(() => {
    listFiles().then(setStlFiles);
  }, []);

  return (
    <div>
      <h2>Liste des fichiers STL</h2>
      <ul>
        {stlFiles.map((file, index) => (
          <li key={index}>{file}</li>
        ))}
      </ul>
    </div>
  );
};

export default ApiStl;
