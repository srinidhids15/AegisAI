import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Line } from '@react-three/drei';
import * as THREE from 'three';
import './HolographicMaterial';
import { useShaderTime } from './useShaderTime';

export const EcosystemNodes = () => {
  const holoMaterialRef = useRef<THREE.ShaderMaterial>(null);
  useShaderTime(holoMaterialRef);

  // Generate procedural nodes and their connections
  const { nodes, connections } = useMemo(() => {
    const nodeCount = 12;
    const nodesData = [];
    const connectionData = [];

    // Create random nodes
    for (let i = 0; i < nodeCount; i++) {
      nodesData.push({
        position: [
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 4
        ] as [number, number, number],
        size: 0.15 + Math.random() * 0.25,
        speed: 0.5 + Math.random() * 1.5,
        type: Math.random() > 0.7 ? 'cube' : 'sphere'
      });
    }

    // Create connections between nearby nodes
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dist = new THREE.Vector3(...nodesData[i].position)
          .distanceTo(new THREE.Vector3(...nodesData[j].position));
        
        if (dist < 4) {
          connectionData.push({
            start: nodesData[i].position,
            end: nodesData[j].position
          });
        }
      }
    }

    return { nodes: nodesData, connections: connectionData };
  }, []);

  const flowRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (flowRef.current) {
      flowRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <group ref={flowRef}>
      {/* Connected Lines */}
      {connections.map((conn, i) => (
        <Line 
          key={`line-${i}`}
          points={[conn.start, conn.end]}
          color="#FF9900"
          lineWidth={0.5}
          transparent
          opacity={0.25}
        />
      ))}

      {/* Nodes */}
      {nodes.map((node, i) => (
        <Float 
          key={`node-${i}`} 
          speed={node.speed} 
          rotationIntensity={0.5} 
          floatIntensity={0.5}
          position={node.position}
        >
          <mesh>
            {node.type === 'cube' ? (
              <boxGeometry args={[node.size, node.size, node.size]} />
            ) : (
              <sphereGeometry args={[node.size, 16, 16]} />
            )}
            <holographicMaterialImpl 
              ref={i === 0 ? holoMaterialRef : null}
              transparent
              uOpacity={0.4}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
};
