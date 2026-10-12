import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { AttackGraph3D } from '../../three/AttackGraph3D';

const initialNodes = [
  { id: '1', label: 'Public Endpoint: /api/login', type: 'input' as const },
  { id: '2', label: 'Vulnerability: SQL Injection', type: 'default' as const },
  { id: '3', label: 'Sensitive Asset: database.py', type: 'output' as const },
  { id: '4', label: 'Admin Panel', type: 'default' as const },
  { id: '5', label: 'Backup Server', type: 'output' as const },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
  { id: 'e2-4', source: '2', target: '4' },
  { id: 'e4-5', source: '4', target: '5' },
];

export const GraphCanvas: React.FC = () => {
  return (
    <div className="w-full h-[400px] lg:h-[600px] bg-black/40 rounded-3xl border border-white/5 overflow-hidden backdrop-blur-xl relative group">
      <Suspense fallback={
        <div className="absolute inset-0 flex items-center justify-center text-text-secondary animate-pulse font-mono text-sm">
          Initializing 3D Neural Engine...
        </div>
      }>
        <Canvas shadows gl={{ antialias: true, alpha: true }}>
          <PerspectiveCamera makeDefault position={[0, 0, 12]} />
          
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
          
          <AttackGraph3D nodes={initialNodes} edges={initialEdges} />
          
          <OrbitControls 
            enableDamping 
            dampingFactor={0.05}
            rotateSpeed={0.5}
            zoomSpeed={0.5}
            maxDistance={25}
            minDistance={5}
          />
          
          {/* subtle grid for space reference */}
          <gridHelper args={[50, 50, 0x222222, 0x111111]} rotation={[Math.PI/2, 0, 0]} position={[0, 0, -5]} />
          
          <Environment preset="city" />
        </Canvas>
      </Suspense>

      <div className="absolute bottom-6 left-6 pointer-events-none">
        <div className="glass px-3 py-1.5 rounded-full border border-white/10 text-[10px] uppercase tracking-widest font-bold text-text-secondary flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary-custom animate-pulse" />
          WebGL Active
        </div>
      </div>
    </div>
  );
};
