import React from 'react';
import { AppMode } from '../types';
import { Sparkles, Image, Network, Banana } from 'lucide-react';

interface NavbarProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentMode, onModeChange }) => {
  const navItems = [
    { mode: AppMode.TEXT_TO_IMAGE, icon: Sparkles, label: '文生图' },
    { mode: AppMode.IMAGE_TO_IMAGE, icon: Image, label: '图生图' },
    { mode: AppMode.WORKFLOW, icon: Network, label: '工作流' },
  ];

  return (
    <nav className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-banana-400 rounded-full p-1.5 shadow-[0_0_15px_rgba(250,204,21,0.6)]">
            <Banana className="w-5 h-5 text-black fill-black" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-banana-200 to-banana-500">
            Nano Banana
          </span>
          <span className="text-xs font-mono text-zinc-500 px-2 py-0.5 border border-zinc-800 rounded bg-zinc-900/50">v2.5-flash</span>
        </div>

        <div className="flex items-center gap-1 bg-surface/50 p-1 rounded-lg border border-white/5">
          {navItems.map((item) => (
            <button
              key={item.mode}
              onClick={() => onModeChange(item.mode)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300
                ${currentMode === item.mode 
                  ? 'bg-zinc-800 text-banana-400 shadow-sm' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'}
              `}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-zinc-500 font-mono">系统就绪</span>
        </div>
      </div>
    </nav>
  );
};