import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BackgroundOverlay } from './BackgroundOverlay';
import { HeroScene } from '../../three/HeroScene';

/**
 * DashboardBackground - Executive Cinematic System
 * Features: Video + 3D Composite, Parallax tracking, auto-pause on visibility.
 */
export const DashboardBackground: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Parallax logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Very subtle move (max 10px)
      const x = (e.clientX / window.innerWidth - 0.5) * 10;
      const y = (e.clientY / window.innerHeight - 0.5) * 10;
      setMousePos({ x, y });
    };

    if (window.innerWidth > 1024) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Performance Logic: Pause video when not visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (videoRef.current) {
          if (entry.isIntersecting) videoRef.current.play().catch(() => {});
          else videoRef.current.pause();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    
    const handleVisibility = () => {
      if (document.hidden) videoRef.current?.pause();
      else videoRef.current?.play().catch(() => {});
    };
    
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <motion.div 
      ref={containerRef}
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className="fixed inset-0 -z-50 bg-background overflow-hidden"
    >
      {/* Layer 1: Cinematic Video Background */}
      <motion.div 
        animate={{ x: mousePos.x, y: mousePos.y }}
        transition={{ type: "spring", damping: 50, stiffness: 100 }}
        className="absolute inset-[-20px]" 
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-60 grayscale-[0.2] brightness-[0.7]"
        >
          <source src="/videos/dashboard-bg.mp4" type="video/mp4" />
        </video>
      </motion.div>

      {/* Layer 2: Interactive 3D Ecosystem (Transparent) */}
      <div className="absolute inset-0 z-10">
        <HeroScene />
      </div>

      {/* Layer 3: Cinematic Overlays */}
      <BackgroundOverlay />
    </motion.div>
  );
};
