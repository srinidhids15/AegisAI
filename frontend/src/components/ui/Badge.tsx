import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'critical' | 'high' | 'medium' | 'low' | 'info';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'info' }) => {
  const colors = {
    critical: 'bg-[#FF5500]/10 text-[#FF5500] border-[#FF5500]/30',
    high: 'bg-primary-custom/10 text-primary-custom border-primary-custom/30',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    low: 'bg-white/5 text-text-secondary border-white/10',
    info: 'bg-primary-custom/5 text-primary-custom/80 border-primary-custom/20',
  };
  
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${colors[variant]}`}>
      {children}
    </span>
  );
};
