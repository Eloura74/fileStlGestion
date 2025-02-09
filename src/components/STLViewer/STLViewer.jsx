import React, { useRef, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { OrbitControls, Stage, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

// Composant pour le rendu du modèle 3D
function Model({ url, modelColor = "#9333ea" }) {
  const meshRef = useRef();
  const [geometry, setGeometry] = React.useState(null);

  React.useEffect(() => {
    if (!url) return;

    const loader = new STLLoader();
    // Nettoyer l'URL en supprimant les doublons potentiels de "http://localhost:3001/models/"
    const cleanUrl = url.replace(/^(http:\/\/localhost:3001\/models\/)+/, "");
    const fullUrl = `http://localhost:3001/models/${cleanUrl}`;

    console.log("Chargement du modèle STL:", fullUrl);

    loader.load(
      fullUrl,
      (geometry) => {
        try {
          // Calcul des normales pour un meilleur rendu
          geometry.computeVertexNormals();

          // Centrer le modèle dans la scène
          geometry.center();

          // Ajuster l'échelle du modèle
          const box = new THREE.Box3().setFromObject(new THREE.Mesh(geometry));
          const size = box.getSize(new THREE.Vector3());
          const maxSize = Math.max(size.x, size.y, size.z);
          const scale = 1.3 / maxSize;
          geometry.scale(scale, scale, scale);

          setGeometry(geometry);
        } catch (err) {
          console.error("Erreur lors du traitement du modèle:", err);
        }
      },
      // Fonction de progression (non utilisée pour l'instant)
      undefined,
      // Gestionnaire d'erreur
      (error) => {
        console.error("Erreur de chargement STL:", error);
      }
    );
  }, [url]);

  if (!geometry) {
    return null;
  }

  // Rendu du modèle avec les matériaux et la rotation
  return (
    <mesh ref={meshRef} geometry={geometry} rotation={[0, Math.PI / 4, 0]}>
      <meshStandardMaterial
        color={modelColor}
        roughness={0.5}
        metalness={0.6}
      />
    </mesh>
  );
}

// Composant principal du visualiseur STL
function STLViewer({ url, className = "", modelColor }) {
  if (!url) return null;

  return (
    <div
      className={`w-full h-64 bg-gray-800 rounded-lg overflow-hidden ${className}`}
    >
      <Canvas>
        <Suspense fallback={null}>
          <Stage
            environment="city"
            intensity={0.6}
            shadows={{ type: "accumulative", color: "black", opacity: 0.3 }}
          >
            <Model url={url} modelColor={modelColor} />
          </Stage>
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={10}
          />
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default STLViewer;
