import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ParticleField } from './ParticleField';
import { EcosystemNodes } from './EcosystemNodes';
import { CameraController } from './CameraController';
import { PageTransitionManager } from './PageTransitionManager';

/**
 * Final HeroScene for AegisAI.
 * Restored 3D Ecosystem with Cinematic Camera Control.
 */
export const HeroScene = () => {
  // Phase 10: Performance Safeguards
  const isLowEnd = typeof window !== 'undefined' && 
    (window.navigator.hardwareConcurrency <= 4 || /Mobi|Android/i.test(window.navigator.userAgent));
  
  const particleCount = isLowEnd ? 50 : 150;
  const dprLimit = isLowEnd ? 1 : [1, 1.5];

  return (
    <Suspense fallback={null}>
      <Canvas 
        camera={{ position: [0, 0, 15], fov: 45 }}
        shadows={!isLowEnd} // Disable shadows on low-end
        dpr={dprLimit as any}
        gl={{ 
          alpha: true, 
          antialias: !isLowEnd,
          powerPreference: "high-performance",
          stencil: false,
          depth: true
        }}
      >
        <fog attach="fog" args={['#0A0A0B', 5, 20]} />
        
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#FF9900" />
        <directionalLight position={[-10, 5, 5]} intensity={0.5} color="#FF5500" />

        {/* Cinematic Camera Control */}
        <CameraController />
        <PageTransitionManager />

        {/* Procedural 3D Elements */}
        <ParticleField count={particleCount} />
        <EcosystemNodes />
      </Canvas>
    </Suspense>
  );
};
