import React from 'react';
import { Sparkles, Network, ExternalLink, GitFork } from 'lucide-react';
import { DlicomLogo } from '../DlicomLogo/DlicomLogo';

interface MascotNavbarProps {
  onNavigate: (path: string) => void;
  currentPath?: string;
}

export const MascotNavbar: React.FC<MascotNavbarProps> = ({ onNavigate, currentPath = '/' }) => {
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
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                MASCOT
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
              Identity Synthesis Engine
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-2">
          <button
            id="nav-mascot-generator"
            onClick={() => onNavigate('/')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              currentPath === '/' || (currentPath.startsWith('/mascot') && currentPath !== '/mascots')
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mascot Generator</span>
          </button>

          <button
            id="nav-mascot-gallery"
            onClick={() => onNavigate('/mascots')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              currentPath === '/mascots'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Gallery</span>
          </button>

          <button
            id="nav-x-circle"
            onClick={() => onNavigate('/circle')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              currentPath === '/circle'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>X Circle</span>
          </button>

          <button
            id="nav-pipelines"
            onClick={() => onNavigate('/pipelines')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              currentPath.startsWith('/pipeline') || currentPath === '/connectors' || currentPath === '/executions'
                ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <GitFork className="w-3.5 h-3.5 text-cyan-400" />
            <span>Pipelines</span>
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
