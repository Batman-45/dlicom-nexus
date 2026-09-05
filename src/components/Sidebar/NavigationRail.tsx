import { Orbit, Compass, Users, Zap, SlidersHorizontal, Sparkles, ShieldCheck } from 'lucide-react';
import { DlicomLogo } from '../DlicomLogo/DlicomLogo';
import type { DlicomUser } from '../../types/circle';

interface NavigationRailProps {
  currentUser: DlicomUser;
  onSelectUser: (user: DlicomUser) => void;
  activeNavTab: string;
  onNavTabChange: (tab: string) => void;
  onNavigate?: (route: string) => void;
}

export const NavigationRail: React.FC<NavigationRailProps> = ({
  currentUser,
  onSelectUser,
  activeNavTab,
  onNavTabChange,
  onNavigate,
}) => {
  const navItems = [
    { id: 'circle', label: 'My Circle', icon: Orbit },
    { id: 'registry', label: 'Public Registry', icon: ShieldCheck, badge: '11' },
    { id: 'explore', label: 'Explore Constellations', icon: Compass },
    { id: 'guilds', label: 'Guilds & Communities', icon: Users },
    { id: 'sparks', label: 'Sparks Received', icon: Zap, badge: '2.8k' },
    { id: 'settings', label: 'Circle Settings', icon: SlidersHorizontal },
  ];

  return (
    <aside className="fixed left-3 sm:left-4 top-1/2 -translate-y-1/2 z-30 hidden sm:flex flex-col items-center gap-2 p-1.5 rounded-2xl glass-panel border border-white/10 shadow-2xl backdrop-blur-2xl">
      {/* Top Dlicom Mini Mark */}
      <div
        className="w-9 h-9 rounded-xl transition-transform duration-200 hover:scale-105 flex items-center justify-center overflow-hidden cursor-pointer bg-white/5 hover:bg-white/10"
        onClick={() => onNavTabChange('circle')}
        title="Dlicom Circle"
      >
        <DlicomLogo size={32} />
      </div>

      <div className="w-5 h-[1px] bg-white/10 my-0.5" />

      {/* Navigation Icon Buttons */}
      <nav className="flex flex-col items-center gap-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNavTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'registry' && onNavigate) {
                  onNavigate('/registry');
                } else {
                  onNavTabChange(item.id);
                }
              }}
              title={item.label}
              className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 group cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/25 to-purple-500/25 text-cyan-300 border border-cyan-400/40 shadow-md shadow-cyan-500/20 scale-105'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />

              {/* Spark badge */}
              {item.badge && (
                <span className="absolute -top-1 -right-1 px-1 py-0.1 rounded-full bg-gradient-to-r from-amber-500 to-pink-500 text-[7px] font-mono font-bold text-slate-950 shadow">
                  {item.badge}
                </span>
              )}

              {/* Tooltip on hover */}
              <span className="absolute left-full ml-3 px-2 py-1 rounded-xl glass-panel text-[10px] font-medium text-slate-200 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 -translate-x-1 transition-all duration-200 shadow-xl border border-white/10 z-50">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="w-5 h-[1px] bg-white/10 my-0.5" />

      {/* Bottom Profile Anchor Button */}
      <button
        onClick={() => onSelectUser(currentUser)}
        title={`YOU (@${currentUser.username})`}
        className="relative group p-[1.5px] rounded-full bg-gradient-to-tr from-cyan-400 to-purple-500 hover:scale-110 transition-all duration-200 shadow-md cursor-pointer"
      >
        <img
          src={currentUser.avatar}
          alt={currentUser.displayName}
          className="w-7 h-7 rounded-full object-cover ring-1 ring-[#07050f]"
        />
        <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-[#07050f]" />

        {/* User tooltip */}
        <span className="absolute left-full ml-3 px-2 py-1 rounded-xl glass-panel text-[10px] font-medium text-slate-200 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 -translate-x-1 transition-all duration-200 shadow-xl border border-white/10 z-50 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>YOU ({currentUser.displayName})</span>
        </span>
      </button>
    </aside>
  );
};
