import React from 'react';
import { Search, X, Sparkles, Users, Wrench, Palette, Globe, Radio, UserCheck, Target, ShieldCheck } from 'lucide-react';
import type { CircleFilter } from '../../types/circle';
import { DlicomLogo } from '../DlicomLogo/DlicomLogo';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: CircleFilter;
  onFilterChange: (filter: CircleFilter) => void;
  counts: Record<CircleFilter, number>;
  totalVisible: number;
  onChangeCircle?: () => void;
  onCenterOnYou?: () => void;
  targetUsername?: string;
  isMockData?: boolean;
  isStaleData?: boolean;
  dataStatus?: string;
  dataReason?: string;
  onNavigate?: (route: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  counts,
  totalVisible,
  onChangeCircle,
  onCenterOnYou,
  targetUsername,
  isMockData,
  isStaleData,
  dataStatus,
  dataReason,
  onNavigate,
}) => {
  const filters: { id: CircleFilter; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'all', label: 'All', icon: Sparkles },
    { id: 'friends', label: 'Interactions', icon: Users },
    { id: 'creators', label: 'Creators', icon: Palette },
    { id: 'builders', label: 'Builders', icon: Wrench },
    { id: 'communities', label: 'Guilds', icon: Globe },
    { id: 'active', label: 'Active', icon: Radio },
  ];

  return (
    <header className="fixed top-3 sm:top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none w-[96%] max-w-6xl">
      <div className="glass-panel rounded-2xl sm:rounded-full px-3 sm:px-4 py-2 pointer-events-auto border border-white/10 shadow-2xl backdrop-blur-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Left: Dlicom Branding & Target Circle Badge */}
        <div className="flex items-center justify-between sm:justify-start gap-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
              <DlicomLogo size={28} />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-extrabold text-sm tracking-tight text-white">
                Dlicom
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 font-display font-extrabold text-sm">
                Circle
              </span>
            </div>
          </div>

          {targetUsername && (
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-200 font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              <span>@{targetUsername}'s Universe</span>
            </div>
          )}

          {isMockData && (
            <span className="text-[8px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              DEMO
            </span>
          )}

          {isStaleData && !isMockData && (
            <span className="hidden md:inline-flex text-[9px] font-mono px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
              Cached
            </span>
          )}

          {dataStatus === 'NO_COMMUNITY_MATCHES' && !isMockData && (
            <span
              className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30"
              title={dataReason || 'No verified Dlicom community members matched recent X interactions.'}
            >
              0 Dlicom matches
            </span>
          )}
          {dataStatus === 'NO_PUBLIC_INTERACTIONS' && !isMockData && (
            <span
              className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30"
              title={dataReason || 'No usable public X interactions were available.'}
            >
              No public interactions
            </span>
          )}
        </div>

        {/* Center & Right: Compact Floating Search & Filters & Quick Actions */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Search pill */}
          <div className="relative w-36 sm:w-48 md:w-56 shrink-0">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search community..."
              className="w-full pl-8 pr-8 py-1 rounded-full text-[11px] bg-white/5 hover:bg-white/10 border border-white/10 focus:border-cyan-400/50 text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all font-sans"
            />
            {searchQuery ? (
              <button
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            ) : (
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                <span className="text-[9px] font-mono text-slate-400">
                  {totalVisible}
                </span>
              </div>
            )}
          </div>

          {/* Filter Pills Capsule */}
          <div className="flex items-center gap-1 p-0.5 rounded-full bg-black/40 border border-white/10 shrink-0">
            {filters.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeFilter === tab.id;
              const isLive = tab.id === 'active';

              return (
                <button
                  key={tab.id}
                  onClick={() => onFilterChange(tab.id)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/30 to-purple-500/30 text-cyan-200 border border-cyan-400/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {isLive ? (
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                  ) : (
                    <Icon className={`w-2.5 h-2.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  )}
                  <span>{tab.label}</span>
                  <span className="text-[8px] font-mono opacity-80">
                    {counts[tab.id]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Center YOU Action */}
          {onCenterOnYou && (
            <button
              onClick={onCenterOnYou}
              title="Center on YOU"
              className="p-1.5 rounded-full bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/10 hover:border-cyan-500/40 transition-all cursor-pointer shrink-0"
            >
              <Target className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Change Circle Action */}
          {onChangeCircle && (
            <button
              onClick={onChangeCircle}
              className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-purple-500/20 text-slate-200 hover:text-purple-200 border border-white/15 hover:border-purple-500/40 text-[10px] font-mono font-medium transition-all flex items-center gap-1 cursor-pointer shrink-0"
              title="Search a different X username"
            >
              <UserCheck className="w-3 h-3" />
              <span>Change</span>
            </button>
          )}

          {/* View Public Registry Action */}
          {onNavigate && (
            <button
              onClick={() => onNavigate('/registry')}
              className="px-2.5 py-1 rounded-full bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-500/30 text-[10px] font-mono font-medium transition-all flex items-center gap-1 cursor-pointer shrink-0"
              title="View Publicly Verified Dlicom Registry"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Registry</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
