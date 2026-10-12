import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Procedural "Digital Rain" style particle field.
 * Uses line segments instead of simple points for a data-stream feel.
 */
export const ParticleField = ({ count = 200 }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  const lineData = useMemo(() => {
    const data = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 15;
      const y = (Math.random() - 0.5) * 15;
      const z = (Math.random() - 0.5) * 15;
      const length = 0.5 + Math.random() * 1.5;
      data.push({
        position: [x, y, z] as [number, number, number],
        points: [
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0, -length, 0)
        ]
      });
    }
    return data;
  }, [count]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y -= 0.02; // Slow downward fall
      if (groupRef.current.position.y < -5) groupRef.current.position.y = 5;
      
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      {lineData.map((line, i) => (
        <group key={i} position={line.position}>
          <line>
            <bufferGeometry attach="geometry" setFromPoints={line.points} />
            <lineBasicMaterial 
              attach="material" 
              color="#FF9900" 
              transparent 
              opacity={0.2} 
            />
          </line>
        </group>
      ))}
    </group>
  );
};
