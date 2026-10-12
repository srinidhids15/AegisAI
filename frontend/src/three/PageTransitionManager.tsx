import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useCinematicCamera } from './useCinematicCamera';

/**
 * PageTransitionManager - Listens to route changes and pans the 3D camera.
 * Must be placed inside the <Canvas> component.
 */
export const PageTransitionManager = () => {
  const location = useLocation();
  const { moveTo } = useCinematicCamera();

  useEffect(() => {
    // Subtle pan based on page
    const getCamConfig = () => {
      switch (location.pathname) {
        case '/': 
          return { pos: [0, 0, 8], target: [0, 0, 0] };
        case '/vulnerabilities': 
          return { pos: [-2, 1, 7], target: [0, 0, 0] };
        case '/mitre': 
          return { pos: [2, -1, 7], target: [0, 0, 0] };
        default: 
          return { pos: [0, 0, 8], target: [0, 0, 0] };
      }
    };

    const config = getCamConfig();
    moveTo(config.pos as [number, number, number], config.target as [number, number, number], 1.2);
  }, [location.pathname, moveTo]);

  useEffect(() => {
    const handleReset = () => {
      moveTo([0, 0, 8], [0, 0, 0], 1.5);
    };
    window.addEventListener('reset-camera', handleReset);
    return () => window.removeEventListener('reset-camera', handleReset);
  }, [moveTo]);

  return null;
};
