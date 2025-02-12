// MoonrakerSensor.tsx
import React, { useState, useEffect } from "react";

type EtatImprimante = {
  heater_bed?: {
    temperature?: number;
    target?: number;
    power?: number;
  };
  extruder?: {
    temperature?: number;
    target?: number;
    power?: number;
    can_extrude?: boolean;
    pressure_advance?: number;
  };
  print_stats?: {
    state?: string;
    filename?: string;
    total_duration?: number;
    print_duration?: number;
    filament_used?: number;
  };
  display_status?: {
    progress?: number;
    message?: string | null;
  };
  toolhead?: any;
  virtual_sdcard?: any;
  gcode_move?: any;
};

const MoonrakerSensor: React.FC = () => {
  // État pour stocker le statut de l'imprimante et les erreurs éventuelles
  const [etatImprimante, setEtatImprimante] = useState<EtatImprimante | null>(
    null
  );
  const [erreur, setErreur] = useState<string | null>(null);

  // Fonction asynchrone pour récupérer les données de l'API Moonraker
  const recupererDonneesCapteur = async () => {
    try {
      const reponse = await fetch(
        "http://192.168.1.130:7125/printer/objects/query?heater_bed&extruder&print_stats&toolhead&display_status&virtual_sdcard&gcode_move"
      );
      const donnees = await reponse.json();
      //   console.log(donnees);
      if (donnees?.result?.status) {
        setEtatImprimante(donnees.result.status);
        setErreur(null);
      } else {
        setErreur("Format des données incorrect");
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des données:", err);
      setErreur("Erreur lors de la récupération des données");
    }
  };

  // Utilisation du hook useEffect pour interroger l'API une première fois puis régulièrement
  useEffect(() => {
    recupererDonneesCapteur();
    const identifiantIntervalle = setInterval(recupererDonneesCapteur, 1000); // Interrogation toutes les 1 seconde
    return () => clearInterval(identifiantIntervalle);
  }, []);

  // Gestion de l'affichage en fonction du chargement ou des erreurs
  if (erreur) {
    return <div className="text-red-600">Erreur: {erreur}</div>;
  }

  if (!etatImprimante) {
    return <div>Chargement...</div>;
  }
  console.log(etatImprimante);
  // Affichage des différentes données de l'imprimante
  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded shadow border border-red-500 text-black">
      <h2 className="text-xl font-bold mb-2">Statut de l'imprimante (SW)</h2>
      {/* Élement de debug temporaire */}
      <p className="text-sm text-gray-500">Debug: Composant MoonrakerSensor rendu</p>
      <p>
        <strong>État :</strong> {etatImprimante.print_stats?.state || "Inconnu"}
      </p>
      <p>
        <strong>Fichier en cours :</strong>{" "}
        {etatImprimante.print_stats?.filename || "Aucun"}
      </p>
      <p>
        <strong>Progression :</strong>{" "}
        {etatImprimante.display_status?.progress !== undefined
          ? Math.round(etatImprimante.display_status.progress * 100) + "%"
          : "N/A"}
      </p>
      <p>
        <strong>Température Extruder :</strong>{" "}
        {etatImprimante.extruder?.temperature ?? "N/A"} °C
      </p>
      <p>
        <strong>Température du Lit :</strong>{" "}
        {etatImprimante.heater_bed?.temperature ?? "N/A"} °C
      </p>
      <p>
        <strong>Message :</strong>{" "}
        {etatImprimante.display_status?.message || "Aucun message"}
      </p>
    </div>
  );
};

export default MoonrakerSensor;
