import React from 'react';
import { Home, Sparkles, ExternalLink } from 'lucide-react';
import { DlicomLogo } from '../DlicomLogo/DlicomLogo';

interface MascotNavbarProps {
  onNavigate: (path: string) => void;
  currentPath?: string;
}

export const MascotNavbar: React.FC<MascotNavbarProps> = ({ onNavigate, currentPath = '/' }) => {
  const isGallery = currentPath === '/mascots';
  const isStudio = currentPath === '/' || (currentPath.startsWith('/mascot') && !isGallery);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#07050f]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => onNavigate('/')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center bg-black/40 group-hover:border-purple-500/50 transition-colors">
            <DlicomLogo className="w-8 h-8 object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-white tracking-tight">DLICOM</span>
              <span className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 tracking-tight">
                NEXUS
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                HERO MASCOT
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
              Official Superhero Mascot System
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-2">
          <button
            id="nav-home"
            onClick={() => onNavigate('/')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              currentPath === '/'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>

          <button
            id="nav-mascot-generator"
            onClick={() => onNavigate('/')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              isStudio
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mascot Studio</span>
          </button>

          <button
            id="nav-mascot-gallery"
            onClick={() => onNavigate('/mascots')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              isGallery
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Mascot Gallery</span>
          </button>

          <a
            href="https://dlicom.io"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
          >
            <span>dlicom.io</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </nav>
      </div>
    </header>
  );
};
