import React from 'react';
import type { CircleFilter } from '../../types/circle';
import { Sparkles, Users, Wrench, Palette, Globe, Radio } from 'lucide-react';

interface FilterBarProps {
  activeFilter: CircleFilter;
  onFilterChange: (filter: CircleFilter) => void;
  counts: Record<CircleFilter, number>;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  activeFilter,
  onFilterChange,
  counts,
}) => {
  const filters: { id: CircleFilter; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'all', label: 'All', icon: Sparkles },
    { id: 'friends', label: 'Friends', icon: Users },
    { id: 'creators', label: 'Creators', icon: Palette },
    { id: 'builders', label: 'Builders', icon: Wrench },
    { id: 'communities', label: 'Communities', icon: Globe },
    { id: 'active', label: 'Active', icon: Radio },
  ];

  return (
    <div className="fixed top-18 sm:top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none max-w-full px-4">
      <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-slate-950/80 border border-white/10 backdrop-blur-2xl shadow-2xl pointer-events-auto overflow-x-auto max-w-[92vw] sm:max-w-none">
        {filters.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeFilter === tab.id;
          const isLive = tab.id === 'active';

          return (
            <button
              key={tab.id}
              onClick={() => onFilterChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              {isLive ? (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              ) : (
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              )}
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive
                    ? 'bg-cyan-400/20 text-cyan-200'
                    : 'bg-white/5 text-slate-400'
                }`}
              >
                {counts[tab.id]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
