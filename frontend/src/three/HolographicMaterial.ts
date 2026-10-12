import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { extend, type ThreeElement } from '@react-three/fiber';

/**
 * Custom holographic shader material.
 * Muted cyan scanlines, subtle modulation, and cinematic flicker.
 */
export const HolographicMaterialImpl = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color('#FF9900'),
    uOpacity: 0.6
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uOpacity;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    
    // Pseudo-random for flicker
    float random(float x) {
      return fract(sin(x) * 43758.5453);
    }
    
    void main() {
      // Intensified scan-line effect
      float scanline = sin(vUv.y * 120.0 + uTime * 4.0) * 0.15 + 0.85;
      
      // Horizontal wave modulation
      float wave = sin(vPosition.y * 15.0 + uTime * 2.0) * 0.05 + 0.95;
      
      // Cinematic flicker
      float flicker = random(uTime) > 0.98 ? 0.3 : 1.0;
      
      // Edge fade
      float edge = 1.0 - pow(vUv.y - 0.5, 2.0) * 4.0;
      edge *= 1.0 - pow(vUv.x - 0.5, 2.0) * 4.0;
      
      vec3 finalColor = uColor * scanline * wave * flicker;
      gl_FragColor = vec4(finalColor, uOpacity * edge * scanline);
    }
  `
);

extend({ HolographicMaterialImpl });

declare module '@react-three/fiber' {
  interface ThreeElements {
    holographicMaterialImpl: ThreeElement<typeof HolographicMaterialImpl>;
  }
}
