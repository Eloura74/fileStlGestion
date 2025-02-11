import { Canvas } from "@react-three/fiber";
import { OrbitControls, Center, Environment } from "@react-three/drei";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { useEffect, useState } from "react";
import React from "react";

interface PreviewSTLProps {
  fileUrl: string;
}

const PreviewSTL = ({ fileUrl }: PreviewSTLProps) => {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!fileUrl) return;

    console.log("📡 URL demandée :", fileUrl);

    const loader = new STLLoader();
    loader.load(
      fileUrl,
      (geo: THREE.BufferGeometry) => {
        geo.computeBoundingBox();
        const box = new THREE.Box3().setFromObject(new THREE.Mesh(geo));

        // Centrer la géométrie
        const center = new THREE.Vector3();
        box.getCenter(center);
        geo.translate(-center.x, -center.y, -center.z);

        // Mise à l'échelle uniforme
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDim;
        geo.scale(scale, scale, scale);

        setGeometry(geo);
      },
      undefined,
      (error: unknown) => console.error("❌ Erreur de chargement STL :", error)
    );
  }, [fileUrl]);

  return (
    <div
      className="w-full aspect-square bg-gradient-to-br from-[#1E293B] to-[#374151] shadow-lg shadow-black/50 rounded-sm overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Canvas
        camera={{ position: [3, 3, 3], fov: 50 }}
        style={{ width: "100%", height: "100%" }}
      >
        {/* Lumières et environnement */}
        <Environment preset="studio" />
        <ambientLight intensity={0.5} />
        <spotLight
          position={[10, 50, 10]}
          angle={0.3}
          penumbra={1}
          intensity={1.8}
          castShadow
        />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        {/* Grille Fixe au Sol */}
        <gridHelper
          args={[10, 10, "#4B5563", "#1F2937"]}
          position={[0, -0.8, 0]}
          rotation={[Math.PI / 40, 0, 0]} // Fixe parfaitement à l'horizontale
        />

        {/* Modèle STL avec Correction d'Orientation */}
        <Center>
          {geometry && (
            <mesh
              geometry={geometry}
              castShadow
              receiveShadow
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <meshPhysicalMaterial
                color="#94A3B8"
                metalness={0.9}
                roughness={0.2}
                clearcoat={0.7}
                clearcoatRoughness={0.2}
                envMapIntensity={1.2}
              />
            </mesh>
          )}
        </Center>

        {/* Contrôles de caméra */}
        <OrbitControls
          autoRotate={!isHovered}
          autoRotateSpeed={2}
          enableZoom={true}
          enablePan={true}
          minDistance={2}
          maxDistance={10}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.5}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
};

export default PreviewSTL;
