import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage } from "@react-three/drei";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { useEffect, useState } from "react";
import React from "react";

// 🔹 Déclarer les éléments JSX inconnus pour éviter les erreurs TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      primitive: any;
      meshStandardMaterial: any;
      ambientLight: any;
      pointLight: any;
    }
  }
}

interface PreviewSTLProps {
  fileUrl: string;
}

const PreviewSTL = ({ fileUrl }: PreviewSTLProps) => {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    if (!fileUrl) return;

    console.log("📡 URL demandée :", fileUrl); // ✅ Debug frontend

    const loader = new STLLoader();
    loader.load(
      fileUrl,
      (geo: THREE.BufferGeometry) => {
        setGeometry(geo);
      },
      undefined,
      (error: unknown) => console.error("❌ Erreur de chargement STL :", error)
    );
  }, [fileUrl]);

  return (
    <div className="w-full h-64">
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Stage>
          {geometry && (
            <mesh>
              <primitive object={geometry} />
              <meshStandardMaterial color="gray" />
            </mesh>
          )}
        </Stage>
        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default PreviewSTL;
