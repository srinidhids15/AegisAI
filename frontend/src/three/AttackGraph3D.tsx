import React, { useMemo, useState } from 'react';
import * as THREE from 'three';
import { computeLayout, type GraphNodeData, type GraphEdgeData } from './layoutAlgorithm';
import { GraphNode } from './GraphNode';
import { GraphEdges } from './GraphEdges';
import { useCinematicCamera } from './useCinematicCamera';

interface AttackGraph3DProps {
  nodes: GraphNodeData[];
  edges: GraphEdgeData[];
}

/**
 * AttackGraph3D - Orchestrator for the 3D Graph visualization.
 */
export const AttackGraph3D: React.FC<AttackGraph3DProps> = ({ nodes, edges }) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const { focusOnNode, resetCamera } = useCinematicCamera();

  // 1. Compute stable 3D layout
  const layout = useMemo(() => computeLayout(nodes, edges, 200), [nodes, edges]);

  // 2. Create position map for edge rendering
  const nodePositionMap = useMemo(() => {
    const map = new Map<string, THREE.Vector3>();
    layout.nodes.forEach(n => map.set(n.id, n.position));
    return map;
  }, [layout]);

  const handleNodeClick = (id: string, pos: THREE.Vector3) => {
    if (selectedNode === id) {
      setSelectedNode(null);
      resetCamera();
    } else {
      setSelectedNode(id);
      focusOnNode([pos.x, pos.y, pos.z]);
    }
  };

  return (
    <group>
      {/* Background Ambience for the graph area */}
      <pointLight position={[0, 0, 0]} intensity={0.2} color="#4BB8FF" distance={15} />

      {layout.nodes.map((node) => (
        <GraphNode
          key={node.id}
          position={node.position}
          label={node.label}
          type={node.type}
          isSelected={selectedNode === node.id}
          onClick={() => handleNodeClick(node.id, node.position)}
        />
      ))}

      <GraphEdges 
        edges={layout.edges} 
        nodeMap={nodePositionMap} 
      />
    </group>
  );
};
