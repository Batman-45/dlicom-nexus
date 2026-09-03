import React from 'react';
import { Search, Sparkles, X, Orbit } from 'lucide-react';
import type { DlicomUser } from '../../types/circle';

interface NavbarProps {
  currentUser: DlicomUser;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectUser: (user: DlicomUser) => void;
  totalVisible: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  searchQuery,
  onSearchChange,
  onSelectUser,
  totalVisible,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-4 py-3 sm:px-6 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 pointer-events-auto">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-500 p-[1.5px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-[#080c18] rounded-[10px] flex items-center justify-center">
                <Orbit className="w-5 h-5 text-cyan-400 group-hover:rotate-45 transition-transform duration-500" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-lg tracking-tight text-white">
                  Dlicom
                </span>
                <span className="font-display font-medium text-xs tracking-wider uppercase px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  Circle
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Social Constellation Network
              </p>
            </div>
          </div>
        </div>

        {/* Center Search Bar */}
        <div className="flex-1 max-w-md mx-2 sm:mx-6">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-cyan-400 transition-colors">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search friends, builders, roles, tags..."
              className="w-full pl-10 pr-16 py-2 rounded-full text-sm bg-slate-900/80 hover:bg-slate-900 border border-white/10 focus:border-cyan-500/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 backdrop-blur-xl transition-all shadow-inner"
            />
            {searchQuery ? (
              <button
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-[10px] font-mono text-slate-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">
                  {totalVisible} nodes
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right User Profile Chip */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectUser(currentUser)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 hover:border-cyan-500/40 backdrop-blur-xl transition-all shadow-lg hover:shadow-cyan-500/10 cursor-pointer group"
          >
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.displayName}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-cyan-400/60 group-hover:ring-cyan-400 transition-all"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
            </div>
            <div className="text-left hidden md:block">
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">
                  {currentUser.displayName}
                </span>
                <span className="text-[10px] font-medium text-cyan-400 bg-cyan-950/60 px-1 rounded border border-cyan-800/40">
                  YOU
                </span>
              </div>
              <p className="text-[10px] text-slate-400">@{currentUser.username}</p>
            </div>
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 opacity-60 group-hover:opacity-100 group-hover:rotate-12 transition-all ml-0.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
