import React from 'react';
import type { NetworkStatsData } from '../../types/circle';
import { Users, Globe, Radio, Sparkles } from 'lucide-react';

interface NetworkStatsProps {
  stats: NetworkStatsData;
}

export const NetworkStats: React.FC<NetworkStatsProps> = ({ stats }) => {
  return (
    <div className="fixed bottom-4 left-4 z-30 pointer-events-none hidden sm:block">
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl glass-panel pointer-events-auto border border-white/10 shadow-2xl">
        {/* Friends */}
        <div className="flex items-center gap-2 pr-3 border-r border-white/10">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
            <Users className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="block font-display font-bold text-sm text-white leading-tight">
              {stats.totalFriends}
            </span>
            <span className="text-[9px] uppercase tracking-wider text-slate-400">
              Circle Connections
            </span>
          </div>
        </div>

        {/* Mutuals */}
        <div className="flex items-center gap-2 pr-3 border-r border-white/10">
          <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="block font-display font-bold text-sm text-white leading-tight">
              {stats.mutualConnections}
            </span>
            <span className="text-[9px] uppercase tracking-wider text-slate-400">
              Mutuals in Circle
            </span>
          </div>
        </div>

        {/* Communities */}
        <div className="flex items-center gap-2 pr-3 border-r border-white/10">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Globe className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="block font-display font-bold text-sm text-white leading-tight">
              {stats.communitiesCount}
            </span>
            <span className="text-[9px] uppercase tracking-wider text-slate-400">
              Guilds
            </span>
          </div>
        </div>

        {/* Active Today */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 relative">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div>
            <span className="block font-display font-bold text-sm text-emerald-400 leading-tight">
              {stats.activeToday}
            </span>
            <span className="text-[9px] uppercase tracking-wider text-slate-400">
              Active Now
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
