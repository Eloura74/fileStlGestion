import React, { useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OrbitControls, Stage, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

function Model({ url, modelColor = '#9333ea' }) {
  const meshRef = useRef();
  const [geometry, setGeometry] = React.useState(null);

  React.useEffect(() => {
    const loader = new STLLoader();
    loader.load(
      url,
      (geometry) => {
        geometry.computeVertexNormals();
        setGeometry(geometry);
      },
      undefined,
      (error) => {
        console.error('Erreur de chargement STL:', error);
      }
    );
  }, [url]);

  if (!geometry) {
    return null;
  }

  return (
    <mesh ref={meshRef} geometry={geometry} rotation={[0, Math.PI / 4, 0]}>
      <meshStandardMaterial color={modelColor} roughness={0.5} metalness={0.6} />
    </mesh>
  );
}

const STLViewer = ({ url, className = '', modelColor }) => {
  return (
    <div className={`${className} w-full h-full bg-gray-800 rounded-lg overflow-hidden`}>
      <Canvas>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[1.5, 1.5, 1.5]} />
          <Stage
            environment="sunset"
            intensity={0.5}
            adjustCamera={false}
            shadows={{ type: 'accumulative', color: 'black', opacity: 0.5 }}
            contactShadow
          >
            <Model url={url} modelColor={modelColor} />
          </Stage>
          <OrbitControls
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            autoRotate
            autoRotateSpeed={2}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.5}
          />
        </Suspense>
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
      </Canvas>
    </div>
  );
};

export default STLViewer;
