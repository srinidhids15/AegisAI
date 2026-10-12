import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface GraphNodeProps {
  position: THREE.Vector3;
  label: string;
  type?: string;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * GraphNode - Cinematic 3D node
 * Features: Glass material, subtle glow, and hover interaction.
 */
export const GraphNode: React.FC<GraphNodeProps> = ({ 
  position, 
  label, 
  type, 
  isSelected, 
  onClick 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Color logic based on node status/type
  const getColor = () => {
    if (type === 'output' || label.toLowerCase().includes('database')) return '#FF9900'; // Amber
    if (label.toLowerCase().includes('vulnerability')) return '#EF4444'; // Red
    return '#4BB8FF'; // Cyan
  };

  const baseColor = getColor();

  useFrame((state) => {
    if (meshRef.current) {
      // Subtle pulse and float
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.02;
      meshRef.current.scale.setScalar(
        THREE.MathUtils.lerp(meshRef.current.scale.x, (hovered ? 1.2 : 1) + pulse, 0.1)
      );
      meshRef.current.position.y = position.y + Math.sin(state.clock.elapsedTime + position.x) * 0.1;
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshPhysicalMaterial
          color={baseColor}
          transmission={0.9}
          thickness={0.5}
          roughness={0.1}
          metalness={0.1}
          clearcoat={1}
          emissive={baseColor}
          emissiveIntensity={hovered || isSelected ? 2 : 0.5}
        />
      </mesh>

      {/* Point light for node glow */}
      <pointLight 
        color={baseColor} 
        intensity={hovered || isSelected ? 2 : 0.5} 
        distance={3} 
      />

      {/* Label - Visible when close or hovered */}
      <Html distanceFactor={10} position={[0, 0.8, 0]}>
        <div className={`
          px-3 py-1.5 rounded-lg border backdrop-blur-md transition-all duration-300
          ${hovered || isSelected ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95 pointer-events-none'}
        `}
        style={{ 
          backgroundColor: `${baseColor}22`,
          borderColor: `${baseColor}44`,
          color: 'white',
          fontSize: '12px',
          whiteSpace: 'nowrap',
          fontFamily: 'monospace'
        }}>
          {label}
        </div>
      </Html>

      {/* Core "Gem" */}
      <mesh scale={0.4}>
        <octahedronGeometry />
        <meshBasicMaterial color="white" transparent opacity={0.8} />
      </mesh>
    </group>
  );
};
