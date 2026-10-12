import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

/**
 * CameraController - Managed camera component for 3D scenes.
 * Handles: Entry animation, Mouse Parallax, and easing constraints.
 */
export const CameraController = () => {
  const { camera, mouse } = useThree();
  const currentPos = useRef(new THREE.Vector3(0, 0, 15)); // Start further back for entry zoom

  // Entry Animation
  useEffect(() => {
    gsap.to(currentPos.current, {
      z: 8,
      duration: 2,
      ease: "power2.out"
    });
  }, []);

  useFrame(() => {
    // Subtle Mouse Parallax (Executive level: max 0.5 unit)
    const parallaxX = mouse.x * 0.5;
    const parallaxY = mouse.y * 0.5;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, parallaxX, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, parallaxY, 0.05);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, currentPos.current.z, 0.05);
    
    camera.lookAt(0, 0, 0);
  });

  return null;
};
