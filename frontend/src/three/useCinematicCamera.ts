import { useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import gsap from 'gsap';
import * as THREE from 'three';

/**
 * useCinematicCamera - Custom hook for executive-level camera control.
 * Provides methods for smooth panning, zooming, and focus-reset.
 */
export const useCinematicCamera = () => {
  const { camera } = useThree();

  const moveTo = useCallback((
    position: [number, number, number], 
    target: [number, number, number] = [0, 0, 0],
    duration: number = 2
  ) => {
    gsap.to(camera.position, {
      x: position[0],
      y: position[1],
      z: position[2],
      duration,
      ease: "power2.inOut"
    });
    
    // If using OrbitControls or similar, we might need a target ref
    // For now, we manually lookAt
    const targetObj = new THREE.Vector3(...target);
    gsap.to(camera, {
      duration,
      onUpdate: () => {
        camera.lookAt(targetObj);
      }
    });
  }, [camera]);

  const resetCamera = useCallback(() => {
    moveTo([0, 0, 8], [0, 0, 0], 1.5);
  }, [moveTo]);

  const focusOnNode = useCallback((nodePos: [number, number, number]) => {
    // Zoom in and slightly offset for cinematic composition
    moveTo(
      [nodePos[0] + 1, nodePos[1] + 1, nodePos[2] + 3],
      nodePos,
      1.8
    );
  }, [moveTo]);

  return { moveTo, resetCamera, focusOnNode };
};
