import type { Variants } from 'framer-motion';

/**
 * Premium SaaS Motion Design Tokens
 * Easing: Custom cubic-bezier for "Executive Smoothness"
 * Duration: Standardized 0.2s - 0.4s
 */

// We cast the cubic-bezier array to 'any' to satisfy the picky Easing type while maintaining functionality
const executiveEasing: any = [0.4, 0, 0.2, 1];

export const transitionPremium = {
  duration: 0.4,
  ease: executiveEasing,
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: transitionPremium },
  exit: { opacity: 0, y: 10, transition: { ...transitionPremium, duration: 0.2 } }
};

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: transitionPremium },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

export const slideIn: Variants = {
  initial: { x: -20, opacity: 0 },
  animate: { x: 0, opacity: 1, transition: transitionPremium },
  exit: { x: -10, opacity: 0, transition: { duration: 0.2 } }
};

export const scaleHover: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.05, transition: { duration: 0.2, ease: "easeOut" } }
};

export const pageTransition: Variants = {
  initial: { opacity: 0, scale: 0.99 },
  animate: { opacity: 1, scale: 1, transition: { ...transitionPremium, duration: 0.5 } },
  exit: { opacity: 0, scale: 1.01, transition: { duration: 0.3 } }
};

export const cardHover: any = {
  whileHover: { 
    y: -4, 
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)",
    transition: { duration: 0.3, ease: "easeOut" }
  }
};

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};
