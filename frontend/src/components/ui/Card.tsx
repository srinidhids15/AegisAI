import { motion } from 'framer-motion';
import { cardHover } from '../../animations/motionPresets';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => (
  <motion.div 
    onClick={onClick}
    {...cardHover}
    className={`card-premium ${onClick ? 'cursor-pointer' : ''} ${className}`}
  >
    {children}
  </motion.div>
);
