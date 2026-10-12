import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Hook to update 'uTime' uniform in a shader material ref on every frame.
 */
export const useShaderTime = (materialRef: React.RefObject<THREE.ShaderMaterial | null>) => {
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });
};
