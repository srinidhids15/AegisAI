import * as THREE from 'three';

export interface GraphNodeData {
  id: string;
  label: string;
  type?: 'input' | 'output' | 'default';
  metadata?: any;
}

export interface GraphEdgeData {
  id: string;
  source: string;
  target: string;
}

export interface ForceNode extends GraphNodeData {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
}

/**
 * layoutAlgorithm - Deterministic Force-Directed Layout
 * Uses spring-embedder logic to position nodes in 3D space.
 */
export const computeLayout = (
  nodes: GraphNodeData[], 
  edges: GraphEdgeData[], 
  iterations: number = 100
): { nodes: ForceNode[]; edges: GraphEdgeData[] } => {
  const forceNodes: ForceNode[] = nodes.map((node) => ({
    ...node,
    position: new THREE.Vector3(
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 5
    ),
    velocity: new THREE.Vector3(0, 0, 0)
  }));

  const nodeMap = new Map(forceNodes.map(n => [n.id, n]));

  // Constants for force calculation
  const repulseStrength = 1.0;
  const springStrength = 0.05;
  const springLength = 4.0;
  const dampening = 0.9;

  for (let step = 0; step < iterations; step++) {
    // 1. Repulsive forces (Coulomb's Law style)
    for (let i = 0; i < forceNodes.length; i++) {
      for (let j = i + 1; j < forceNodes.length; j++) {
        const n1 = forceNodes[i];
        const n2 = forceNodes[j];
        const dir = new THREE.Vector3().subVectors(n1.position, n2.position);
        const dist = dir.length() || 0.1;
        const force = repulseStrength / (dist * dist);
        dir.normalize().multiplyScalar(force);
        n1.velocity.add(dir);
        n2.velocity.sub(dir);
      }
    }

    // 2. Spring forces (Hooke's Law style)
    edges.forEach(edge => {
      const source = nodeMap.get(edge.source);
      const target = nodeMap.get(edge.target);
      if (source && target) {
        const dir = new THREE.Vector3().subVectors(target.position, source.position);
        const dist = dir.length() || 0.1;
        const force = (dist - springLength) * springStrength;
        dir.normalize().multiplyScalar(force);
        source.velocity.add(dir);
        target.velocity.sub(dir);
      }
    });

    // 3. Central gravity (Keep it clustered)
    forceNodes.forEach(node => {
      const gravity = node.position.clone().multiplyScalar(-0.01);
      node.velocity.add(gravity);
    });

    // 4. Update positions
    forceNodes.forEach(node => {
      node.position.add(node.velocity);
      node.velocity.multiplyScalar(dampening);
    });
  }

  return { nodes: forceNodes, edges };
};
