import { useRef, useState } from 'react';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import './HolographicMaterial'; // Ensure material is registered
import { useShaderTime } from './useShaderTime';

export const FloatingNodes = () => {
  console.log("FloatingNodes rendering...");
  const holoMaterialRef = useRef<THREE.ShaderMaterial>(null);
  useShaderTime(holoMaterialRef);

  const [pulseIndex, setPulseIndex] = useState<number | null>(null);

  const handlePulse = (index: number) => {
    setPulseIndex(index);
    setTimeout(() => setPulseIndex(null), 600);
  };

  return (
    <group>
      {/* Central Glass Node */}
      <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.5}>
        <mesh 
          position={[0, 0, 0]}
          onClick={() => handlePulse(-1)}
          scale={pulseIndex === -1 ? 1.1 : 1}
        >
          <boxGeometry args={[1.2, 1.2, 1.2]} />
          <meshPhysicalMaterial
            color="#1E2733"
            transmission={0.9}
            thickness={1}
            roughness={0.2}
            envMapIntensity={0.5}
            clearcoat={0.5}
          />
        </mesh>
      </Float>

      {/* Satellite Holographic Nodes */}
      {[
        [2, 1, -2],
        [-2.5, -0.5, -1],
        [1, -1.8, -1.5],
        [-1, 2, -3]
      ].map((pos, i) => (
        <Float key={i} speed={2} rotationIntensity={0.4} floatIntensity={0.6}>
          <mesh 
            position={pos as [number, number, number]}
            onClick={() => handlePulse(i)}
            scale={pulseIndex === i ? 1.1 : 1}
          >
            <sphereGeometry args={[0.4, 32, 32]} />
            <holographicMaterialImpl
              ref={i === 0 ? holoMaterialRef : null}
              transparent
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
};
