import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface GraphEdgesProps {
  edges: { id: string; source: string; target: string }[];
  nodeMap: Map<string, THREE.Vector3>;
}

/**
 * GraphEdges - Animated data flow connections
 * Renders lines with a pulse/flow effect to simulate attack paths.
 */
export const GraphEdges: React.FC<GraphEdgesProps> = ({ edges, nodeMap }) => {
  const linesRef = useRef<THREE.Group>(null);

  const edgePaths = useMemo(() => {
    return edges.map(edge => {
      const start = nodeMap.get(edge.source);
      const end = nodeMap.get(edge.target);
      if (!start || !end) return null;
      
      // Creating a curve for visual depth
      const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      mid.y += 1.0; // Arch effect
      
      return new THREE.QuadraticBezierCurve3(start, mid, end);
    }).filter(path => path !== null);
  }, [edges, nodeMap]);

  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.children.forEach((child, i) => {
        const material = (child as THREE.Mesh).material as THREE.LineBasicMaterial;
        // Subtle rhythmic pulse
        material.opacity = 0.2 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.1;
      });
    }
  });

  return (
    <group ref={linesRef}>
      {edgePaths.map((curve, i) => (
        <mesh key={i}>
          <tubeGeometry args={[curve as THREE.QuadraticBezierCurve3, 20, 0.02, 8, false]} />
          <meshBasicMaterial 
            color="#4BB8FF" 
            transparent 
            opacity={0.3} 
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* Flowing Particles along edges */}
      {edgePaths.map((curve, i) => (
        <EdgeFlow key={`flow-${i}`} curve={curve as THREE.QuadraticBezierCurve3} index={i} />
      ))}
    </group>
  );
};

const EdgeFlow = ({ curve, index }: { curve: THREE.QuadraticBezierCurve3, index: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Move along the curve
      const t = (state.clock.elapsedTime * 0.2 + index * 0.3) % 1;
      const pos = curve.getPoint(t);
      meshRef.current.position.copy(pos);
      
      // Flash intensity
      meshRef.current.scale.setScalar(0.1 + Math.sin(state.clock.elapsedTime * 10) * 0.05);
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#FF9900" transparent opacity={0.8} />
    </mesh>
  );
};
