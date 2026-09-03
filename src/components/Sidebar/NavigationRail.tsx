import React from 'react';
import { Orbit, Compass, Users, Zap, SlidersHorizontal, Sparkles } from 'lucide-react';
import { DlicomLogo } from '../DlicomLogo/DlicomLogo';
import type { DlicomUser } from '../../types/circle';

interface NavigationRailProps {
  currentUser: DlicomUser;
  onSelectUser: (user: DlicomUser) => void;
  activeNavTab: string;
  onNavTabChange: (tab: string) => void;
}

export const NavigationRail: React.FC<NavigationRailProps> = ({
  currentUser,
  onSelectUser,
  activeNavTab,
  onNavTabChange,
}) => {
  const navItems = [
    { id: 'circle', label: 'My Circle', icon: Orbit },
    { id: 'explore', label: 'Explore Constellation', icon: Compass },
    { id: 'guilds', label: 'Guilds & Communities', icon: Users },
    { id: 'sparks', label: 'Sparks Received', icon: Zap, badge: '2.8k' },
    { id: 'settings', label: 'Circle Settings', icon: SlidersHorizontal },
  ];

  return (
    <aside className="fixed top-0 left-0 bottom-0 z-40 w-16 md:w-20 glass-panel border-r border-white/10 hidden sm:flex flex-col items-center justify-between py-5 backdrop-blur-2xl shadow-2xl">
      {/* Top Logo — Official Dlicom mark */}
      <div className="flex flex-col items-center gap-1 group cursor-pointer" onClick={() => onNavTabChange('circle')}>
        <div className="w-11 h-11 rounded-2xl transition-transform duration-300 group-hover:scale-105 flex items-center justify-center overflow-hidden">
          <DlicomLogo size={44} />
        </div>
        <span className="font-display font-bold text-[10px] tracking-wider text-cyan-400 uppercase mt-0.5">
          Dlicom
        </span>
      </div>

      {/* Center Navigation Icons */}
      <nav className="flex flex-col items-center gap-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNavTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavTabChange(item.id)}
              title={item.label}
              className={`relative w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 group cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-lg shadow-cyan-500/20 scale-105'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />

              {/* Spark badge */}
              {item.badge && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-gradient-to-r from-amber-500 to-pink-500 text-[8px] font-mono font-bold text-slate-950 shadow">
                  {item.badge}
                </span>
              )}

              {/* Tooltip on hover */}
              <span className="absolute left-full ml-3.5 px-2.5 py-1 rounded-xl glass-panel text-[11px] font-medium text-slate-200 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-200 shadow-xl border border-white/10 z-50">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Current User Avatar */}
      <div className="flex flex-col items-center">
        <button
          onClick={() => onSelectUser(currentUser)}
          title={`My Profile (@${currentUser.username})`}
          className="relative group p-[2px] rounded-full bg-gradient-to-tr from-cyan-400 to-purple-500 hover:scale-110 transition-all duration-300 shadow-lg shadow-cyan-500/20 cursor-pointer"
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.displayName}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-[#070a14]"
          />
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-[#070a14] flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />
          </span>

          {/* User tooltip */}
          <span className="absolute left-full ml-3.5 px-2.5 py-1 rounded-xl glass-panel text-[11px] font-medium text-slate-200 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-200 shadow-xl border border-white/10 z-50 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>YOU ({currentUser.displayName})</span>
          </span>
        </button>
      </div>
    </aside>
  );
};
