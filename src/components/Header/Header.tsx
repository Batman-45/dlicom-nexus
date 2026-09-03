import React from 'react';
import { Search, X, Sparkles, Users, Wrench, Palette, Globe, Radio, UserCheck } from 'lucide-react';
import type { CircleFilter } from '../../types/circle';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: CircleFilter;
  onFilterChange: (filter: CircleFilter) => void;
  counts: Record<CircleFilter, number>;
  totalVisible: number;
  onChangeCircle?: () => void;
  isMockData?: boolean;
  isStaleData?: boolean;
  dataStatus?: string;
  dataReason?: string;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  counts,
  totalVisible,
  onChangeCircle,
  isMockData,
  isStaleData,
  dataStatus,
  dataReason,
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
    <header className="fixed top-0 left-0 right-0 sm:left-16 md:left-20 z-30 pointer-events-none px-4 pt-3.5 pb-2">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pointer-events-auto">
        {/* Title & Subtitle */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="font-display font-extrabold text-xl sm:text-2xl tracking-tight text-white flex items-center gap-2">
              <span>Dlicom</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                Circle
              </span>
            </h1>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Constellation
            </span>
            {isMockData && (
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                DEMO / MOCK GRAPH
              </span>
            )}
            {isStaleData && !isMockData && (
              <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
                Showing recently cached X activity
              </span>
            )}
            {dataStatus === 'NO_PUBLIC_INTERACTIONS' && !isMockData && (
              <span
                className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30"
                title={dataReason || 'No usable public X interactions were available from the syndication source.'}
              >
                No public X interactions available
              </span>
            )}

            {onChangeCircle && (
              <button
                onClick={onChangeCircle}
                className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/15 hover:border-cyan-500/40 transition-all flex items-center gap-1 cursor-pointer"
                title="Search a different X username"
              >
                <UserCheck className="w-3 h-3" />
                <span>Change Circle</span>
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">
            Your people. Your community. Your circle.
          </p>
        </div>

        {/* Search Bar & Filter Capsule Row */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Compact Search Input */}
          <div className="relative flex-1 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search interactions, tags, handles..."
              className="w-full pl-9 pr-14 py-1.5 rounded-full text-xs bg-slate-950/80 hover:bg-slate-900/90 border border-white/10 focus:border-cyan-400/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 backdrop-blur-xl transition-all shadow-inner"
            />
            {searchQuery ? (
              <button
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
                <span className="text-[9px] font-mono text-slate-400 bg-white/5 border border-white/10 px-1 py-0.2 rounded">
                  {totalVisible}
                </span>
              </div>
            )}
          </div>

          {/* Filter Pills Capsule */}
          <div className="flex items-center gap-1 p-1 rounded-full bg-slate-950/85 border border-white/10 backdrop-blur-2xl shadow-xl overflow-x-auto">
            {filters.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeFilter === tab.id;
              const isLive = tab.id === 'active';

              return (
                <button
                  key={tab.id}
                  onClick={() => onFilterChange(tab.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-200 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/25 to-purple-500/25 text-cyan-300 border border-cyan-400/40 shadow-sm shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {isLive ? (
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                  ) : (
                    <Icon className={`w-3 h-3 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  )}
                  <span>{tab.label}</span>
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-cyan-400/20 text-cyan-200' : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    {counts[tab.id]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
