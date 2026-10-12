import React from 'react';

/**
 * BackgroundOverlay - Premium Cinematic Layer
 * Adds depth through vignettes and gradients to ensure content readability.
 */
export const BackgroundOverlay: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      {/* Primary Vertical Gradient: Dark bottom to transparent top */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]" />
      
      {/* Side Vignette: Ensures focused content area */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80" />
      
      {/* Top Gradient: Subtle darkening for header readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-transparent h-32" />

      {/* Subtle Noise Texture Overlay (Low opacity) */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
};
