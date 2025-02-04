import React, { useRef, useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { OrbitControls, Stage, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

function Model({ url }) {
  const [geometry, setGeometry] = useState(null);
  const [error, setError] = useState(null);
  const meshRef = useRef();

  React.useEffect(() => {
    const loader = new STLLoader();
    loader.load(
      url,
      (geometry) => {
        geometry.computeVertexNormals();
        // Centrer et ajuster l'échelle du modèle
        geometry.center();
        const box = new THREE.Box3().setFromObject(new THREE.Mesh(geometry));
        const size = box.getSize(new THREE.Vector3());
        const maxSize = Math.max(size.x, size.y, size.z);
        const scale = 1 / maxSize;
        geometry.scale(scale, scale, scale);
        setGeometry(geometry);
      },
      undefined,
      (error) => {
        console.error("Erreur de chargement STL:", error);
        setError(error);
      }
    );
  }, [url]);

  if (error || !geometry) {
    return null;
  }

  return (
    <mesh ref={meshRef} geometry={geometry} rotation={[0, Math.PI / 4, 0]}>
      <meshStandardMaterial
        color="#6366f1"
        roughness={0.5}
        metalness={0.6}
        envMapIntensity={0.5}
      />
    </mesh>
  );
}

const STLViewer = ({ url, className = "" }) => {
  const canvasRef = useRef();

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const handleContextLost = (event) => {
      event.preventDefault();
      console.warn('WebGL context lost.');
      // Vous pouvez ajouter ici des actions pour informer l'utilisateur ou tenter de récupérer le contexte
    };

    const handleContextRestored = () => {
      console.log('WebGL context restored.');
      // Recharger le modèle ou effectuer d'autres actions nécessaires
    };

    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, []);

  return (
    <div
      className={`${className} w-full h-full bg-gray-800 rounded-lg overflow-hidden`}
    >
      <Canvas ref={canvasRef}>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[1.5, 1.5, 1.5]} />
          <Stage
            environment="city"
            intensity={0.5}
            adjustCamera={false}
            shadows={false}
          >
            <Model url={url} />
          </Stage>
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            autoRotate
            autoRotateSpeed={2}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.5}
          />
        </Suspense>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
      </Canvas>
    </div>
  );
};

export default STLViewer;
