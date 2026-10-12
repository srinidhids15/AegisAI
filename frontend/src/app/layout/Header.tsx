import React from 'react';
import { Bell, User, Search, Terminal } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="h-16 border-b border-border-custom bg-background/30 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-4 bg-surface px-4 py-1.5 rounded-lg border border-border-custom w-96">
        <Search className="w-4 h-4 text-text-secondary" />
        <input 
          type="text" 
          placeholder="Search project, vulnerability, or path..." 
          className="bg-transparent border-none outline-none text-sm text-text-primary w-full"
        />
        <div className="flex items-center gap-1 text-[10px] text-text-secondary border border-border-custom px-1.5 py-0.5 rounded bg-background/50">
          <Terminal className="w-2.5 h-2.5" />
          <span>CMD + K</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative text-text-secondary hover:text-text-primary transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-primary-custom rounded-full border-2 border-background" />
        </button>
        
        <div className="h-8 w-px bg-border-custom" />
        
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right">
            <p className="text-sm font-semibold text-text-primary">Admin User</p>
            <p className="text-[10px] text-text-secondary">Enterprise Access</p>
          </div>
          <div className="w-9 h-9 bg-surface border border-border-custom rounded-full flex items-center justify-center group-hover:border-primary-custom/50 transition-colors">
            <User className="w-5 h-5 text-text-secondary group-hover:text-primary-custom transition-colors" />
          </div>
        </div>
      </div>
    </header>
  );
};
