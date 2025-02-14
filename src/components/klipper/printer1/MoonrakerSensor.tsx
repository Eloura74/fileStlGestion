import React, { useState, useEffect } from "react";
import {
  DocumentIcon,
  ChartBarIcon,
  FireIcon,
  Squares2X2Icon,
  ExclamationCircleIcon,
  HomeIcon,
  PowerIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";

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
  };
  print_stats?: { 
    state?: string;
    filename?: string;
    message?: string;
  };
  display_status?: { 
    progress?: number;
    message?: string | null;
  };
  gcode_move?: {
    speed_factor?: number;
    speed?: number;
    extrude_factor?: number;
    homing_origin?: number[];
    position?: number[];
  };
  toolhead?: {
    homed_axes?: string;
    axis_minimum?: number[];
    axis_maximum?: number[];
    position?: number[];
    max_velocity?: number;
    max_accel?: number;
    max_accel_to_decel?: number;
    square_corner_velocity?: number;
  };
  motion_report?: {
    live_position?: number[];
    live_velocity?: number;
    live_extruder_velocity?: number;
  };
  fan?: {
    speed?: number;
    rpm?: number | null;
  };
  idle_timeout?: {
    state?: string;
    printing_time?: number;
  };
  virtual_sdcard?: {
    progress?: number;
    is_active?: boolean;
    file_position?: number;
  };
};

type Thumbnail = {
  width: number;
  height: number;
  size: number;
  relative_path: string;
};

interface MoonrakerSensorProps {
  printerUrl: string;
}

const MoonrakerSensor: React.FC<MoonrakerSensorProps> = ({ printerUrl }) => {
  const [etatImprimante, setEtatImprimante] = useState<EtatImprimante | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
  const [currentFile, setCurrentFile] = useState<string | null>(null);

  const recupererMetadonnees = async (filename: string) => {
    try {
      console.log("Récupération des métadonnées pour:", filename);
      const reponse = await fetch(
        `${printerUrl}/server/files/metadata?filename=${encodeURIComponent(
          filename
        )}`
      );
      const donnees = await reponse.json();
      console.log(
        "Réponse métadonnées complète:",
        JSON.stringify(donnees, null, 2)
      );

      if (donnees.result?.thumbnails) {
        console.log(
          "Structure des thumbnails:",
          JSON.stringify(donnees.result.thumbnails, null, 2)
        );
        setThumbnails(donnees.result.thumbnails);
      } else {
        console.log("Pas de thumbnails dans les métadonnées");
        setThumbnails([]);
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des métadonnées:", err);
      setThumbnails([]);
    }
  };

  const recupererDonneesCapteur = async () => {
    try {
      const reponse = await fetch(
        `${printerUrl}/printer/objects/query?heater_bed&extruder&print_stats&display_status&gcode_move&toolhead&motion_report&fan&idle_timeout&virtual_sdcard`
      );
      const donnees = await reponse.json();
      if (donnees?.result?.status) {
        setEtatImprimante(donnees.result.status);
        
        const filename = donnees.result.status.print_stats?.filename;
        if (filename && (!thumbnails.length || filename !== currentFile)) {
          setCurrentFile(filename);
          recupererMetadonnees(filename);
        } else if (!filename) {
          setCurrentFile(null);
          setThumbnails([]);
        }
        setErreur(null);
      } else {
        setErreur("Format des données incorrect");
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des données:", err);
      setErreur("Erreur lors de la récupération des données");
    }
  };

  const obtenirMessageEtat = () => {
    const message = etatImprimante?.display_status?.message?.toLowerCase() || "";
    const etat = etatImprimante?.print_stats?.state;
    
    // Analyse des messages de macros et commandes
    if (message.includes("g28") || message.includes("home")) {
      return "Retour à l'origine";
    } else if (message.includes("bed mesh")) {
      return "Calibration du plateau";
    } else if (message.includes("homing")) {
      return "Calibration des axes";
    } else if (message.includes("clean")) {
      return "Nettoyage de la buse";
    } else if (message.includes("m140") || message.includes("chauffe")) {
      if (message.includes("bed")) {
        const temp = message.match(/\d+/);
        return temp ? `Chauffe du plateau à ${temp[0]}°C` : "Chauffe du plateau";
      } else if (message.includes("buse") || message.includes("m104")) {
        const temp = message.match(/\d+/);
        return temp ? `Chauffe de la buse à ${temp[0]}°C` : "Chauffe de la buse";
      }
      return "Chauffe en cours";
    } else if (message.includes("m84") || (message.includes("stepper") && message.includes("off"))) {
      return "Moteurs désactivés";
    } else if (message.includes("fan")) {
      if (message.includes("hotend")) {
        return message.includes("off") ? "Ventilateur buse désactivé" : "Ventilateur buse activé";
      } else if (message.includes("rccs")) {
        return message.includes("off") ? "Ventilateur RCCS désactivé" : "Ventilateur RCCS activé";
      } else if (message.includes("stepper")) {
        return message.includes("off") ? "Ventilateur moteurs désactivé" : "Ventilateur moteurs activé";
      }
    } else if (message.includes("offset")) {
      const offset = message.match(/[+-]?\d+\.?\d*/);
      return offset ? `Ajustement Z: ${offset[0]}mm` : "Ajustement Z";
    } else if (message.includes("pause")) {
      return "Impression en pause";
    } else if (message.includes("cancel")) {
      return "Annulation demandée";
    } else if (message.includes("preheat") || message.includes("prechauffe")) {
      return "Préchauffage en cours";
    }

    // États par défaut de l'imprimante
    switch (etat) {
      case "printing":
        return "Impression en cours";
      case "standby":
        const chauffageExtrudeur = etatImprimante.extruder?.target && 
          etatImprimante.extruder.target > 0;
        const chauffagePlateau = etatImprimante.heater_bed?.target && 
          etatImprimante.heater_bed.target > 0;
        
        if (chauffageExtrudeur && chauffagePlateau) {
          return "Maintien température (buse et plateau)";
        } else if (chauffageExtrudeur) {
          return "Maintien température buse";
        } else if (chauffagePlateau) {
          return "Maintien température plateau";
        }
        return "En attente";
      default:
        return message || "État inconnu";
    }
  };

  const obtenirCouleurEtat = () => {
    const message = obtenirMessageEtat().toLowerCase();

    if (message.includes("calibration")) {
      return "bg-blue-500/20 text-blue-400 border border-blue-500/50";
    } else if (message.includes("chauffe")) {
      return "bg-orange-500/20 text-orange-400 border border-orange-500/50";
    } else if (message.includes("impression")) {
      if (message.includes("pause")) {
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/50";
      }
      return "bg-green-500/20 text-green-400 border border-green-500/50";
    } else if (message.includes("moteurs désactivés")) {
      return "bg-purple-500/20 text-purple-400 border border-purple-500/50";
    } else if (message.includes("nettoyage")) {
      return "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50";
    } else if (message.includes("ventilateur")) {
      return "bg-indigo-500/20 text-indigo-400 border border-indigo-500/50";
    }

    return "bg-gray-500/20 text-gray-400 border border-gray-500/50";
  };

  const obtenirIconeEtat = () => {
    const message = obtenirMessageEtat().toLowerCase();

    if (message.includes("calibration")) {
      return <HomeIcon className="w-4 h-4 text-gray-400 mr-1" />;
    } else if (message.includes("chauffe")) {
      return <FireIcon className="w-4 h-4 text-gray-400 mr-1" />;
    } else if (message.includes("moteurs")) {
      return <PowerIcon className="w-4 h-4 text-gray-400 mr-1" />;
    } else if (message.includes("ventilateur")) {
      return <AdjustmentsHorizontalIcon className="w-4 h-4 text-gray-400 mr-1" />;
    }

    return <Squares2X2Icon className="w-4 h-4 text-gray-400 mr-1" />;
  };

  const obtenirDetailsSupplementaires = () => {
    const position = etatImprimante?.toolhead?.position || [0, 0, 0, 0];
    const vitesse = etatImprimante?.motion_report?.live_velocity || 0;
    const axes = etatImprimante?.toolhead?.homed_axes || "";
    const axesNonHomes = ["x", "y", "z"].filter(axe => !axes.includes(axe));
    
    // Position actuelle formatée comme dans l'image
    if (position[0] !== undefined) {
      return `X:${position[0].toFixed(1)} Y:${position[1].toFixed(1)} Z:${position[2].toFixed(2)}`;
    }
    
    return null;
  };

  useEffect(() => {
    recupererDonneesCapteur();
    const intervalId = setInterval(recupererDonneesCapteur, 1000);
    return () => clearInterval(intervalId);
  }, [printerUrl]);

  if (erreur) {
    return <div className="text-red-600 text-center">Erreur: {erreur}</div>;
  }

  if (!etatImprimante) {
    return <div className="text-white text-center">Chargement...</div>;
  }

  // Sélectionner le plus grand thumbnail disponible
  const bestThumbnail = thumbnails.reduce((prev, current) => {
    return !prev || current.width > prev.width ? current : prev;
  }, thumbnails[0]);

  return (
    <div className="p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700 text-white backdrop-blur-sm">
      <h2 className="text-lg font-medium text-center mb-4 border-b border-gray-700 pb-2 uppercase tracking-wide flex items-center justify-center">
        <Squares2X2Icon className="w-5 h-5 text-gray-400 mr-2" />
        État de l'imprimante
      </h2>

      <div className="space-y-4">
        {/* Thumbnail */}
        {bestThumbnail && (
          <div className="flex justify-center mb-4">
            <div className="relative">
              <img
                src={`${printerUrl}/server/files/gcodes/${bestThumbnail.relative_path}`}
                alt="Aperçu de l'impression"
                className="rounded-lg border border-gray-600 max-w-full h-auto"
                style={{ maxHeight: "200px" }}
                onError={(e) => {
                  console.error("Erreur de chargement de l'image:", e);
                  const img = e.target as HTMLImageElement;
                  img.style.display = "none";
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                {/* {console.log("Thumbnail sélectionné:", bestThumbnail)} */}
              </div>
            </div>
          </div>
        )}

        {/* État de l'impression */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center text-sm">
            <p className="text-gray-400 flex items-center shrink-0">
              {obtenirIconeEtat()}
              État
            </p>
            <span className={`px-2 py-1 rounded-md text-xs font-semibold ${obtenirCouleurEtat()}`}>
              {obtenirMessageEtat()}
            </span>
          </div>
          
          {/* Position actuelle */}
          {obtenirDetailsSupplementaires() && (
            <div className="text-xs text-gray-400 text-right">
              {obtenirDetailsSupplementaires()}
            </div>
          )}
        </div>

        {/* Fichier en cours */}
        <div className="flex justify-between items-center text-sm">
          <p className="text-gray-400 flex items-center shrink-0">
            <DocumentIcon className="w-4 h-4 text-gray-400 mr-1" />
            Fichier
          </p>
          <p className="text-gray-300 truncate max-w-[200px] text-right">
            {etatImprimante.print_stats?.filename || "Aucun"}
          </p>
        </div>

        {/* Températures */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-sm">
            <p className="text-gray-400 flex items-center mb-1">
              <FireIcon className="w-4 h-4 text-gray-400 mr-1" />
              Extrudeur
            </p>
            <span className="text-gray-300">
              {etatImprimante.extruder?.temperature?.toFixed(1)}°C
            </span>
          </div>
          <div className="text-sm">
            <p className="text-gray-400 flex items-center mb-1">
              <FireIcon className="w-4 h-4 text-gray-400 mr-1" />
              Plateau
            </p>
            <span className="text-gray-300">
              {etatImprimante.heater_bed?.temperature?.toFixed(1)}°C
            </span>
          </div>
        </div>

        {/* Barre de progression */}
        <div>
          <p className="text-gray-400 text-sm flex items-center mb-1">
            <ChartBarIcon className="w-4 h-4 text-gray-400 mr-1" />
            Progression
          </p>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  (etatImprimante.display_status?.progress || 0) * 100
                }%`,
              }}
            />
          </div>
        </div>

        {/* Message */}
        {etatImprimante.display_status?.message && (
          <div className="text-sm">
            <p className="text-gray-400 flex items-center">
              <ExclamationCircleIcon className="w-4 h-4 text-gray-400 mr-1" />
              Message
            </p>
            <p className="text-gray-300 mt-1">
              {etatImprimante.display_status.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoonrakerSensor;
