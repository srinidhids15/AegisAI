import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authService } from '../../services/auth';
import { 
  Menu,
  X,
  LayoutDashboard, 
  ShieldAlert, 
  Binary, 
  Network, 
  BookOpen, 
  Settings,
  ShieldCheck,
  LogOut,
  FlaskConical,
  Archive
} from 'lucide-react';
import { slideIn } from '../../animations/motionPresets';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: FlaskConical, label: 'Analyze Source', path: '/ingest' },
  { icon: Archive, label: 'Scan History', path: '/projects' },
  { icon: ShieldAlert, label: 'Vulnerabilities', path: '/vulnerabilities' },
  { icon: Network, label: 'Attack Graph', path: '/graph' },
  { icon: Binary, label: 'MITRE Matrix', path: '/mitre' },
  { icon: BookOpen, label: 'AI Insights', path: '/insights' },
];

export const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-surface border border-border-custom rounded-lg text-primary-custom"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <motion.aside 
        initial="initial"
        animate="animate"
        variants={slideIn}
        className={`
          fixed inset-y-0 left-0 z-50 w-64 border-r border-border-custom bg-background/50 backdrop-blur-xl flex flex-col h-screen 
          lg:translate-x-0 lg:sticky lg:top-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-6 flex items-center gap-3">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-8 h-8 bg-primary-custom/20 rounded-lg flex items-center justify-center border border-primary-custom/40"
          >
            <ShieldCheck className="w-5 h-5 text-primary-custom" />
          </motion.div>
          <span className="text-xl font-bold tracking-tight text-white line-clamp-1">AegisAI</span>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300
                ${isActive 
                  ? 'text-primary-custom bg-primary-custom/10 border border-primary-custom/20' 
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface'}
              `}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110`} />
                  <span className="font-medium">{item.label}</span>
                  <NavLinkActiveIndicator isActive={isActive} />
                </>
              )}
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 border-t border-border-custom space-y-2">
          <button className="group flex items-center gap-3 px-3 py-2 text-text-secondary hover:text-text-primary w-full transition-all duration-300 hover:bg-surface rounded-lg">
            <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform duration-500" />
            <span className="font-medium">Settings</span>
          </button>
          <button 
            onClick={() => authService.logout()}
            className="group flex items-center gap-3 px-3 py-2 text-text-secondary hover:text-red-400 w-full transition-all duration-300 hover:bg-red-500/5 rounded-lg"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Logout Terminal</span>
          </button>
        </div>
      </motion.aside>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-background/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
};

const NavLinkActiveIndicator = ({ isActive }: { isActive: boolean }) => (
  isActive ? (
    <motion.div 
      layoutId="sidebar-active"
      className="absolute left-0 w-1 h-6 bg-primary-custom rounded-r-full"
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    />
  ) : null
);
