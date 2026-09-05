import React from 'react';
import type { NetworkStatsData } from '../../types/circle';
import { Users, Globe, Sparkles } from 'lucide-react';

interface NetworkStatsProps {
  stats: NetworkStatsData;
}

export const NetworkStats: React.FC<NetworkStatsProps> = ({ stats }) => {
  return (
    <div className="fixed bottom-4 left-4 z-20 pointer-events-none hidden md:block">
      <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full glass-panel pointer-events-auto border border-white/10 shadow-2xl backdrop-blur-2xl text-[11px]">
        {/* Total Interactions */}
        <div className="flex items-center gap-1.5 pr-2.5 border-r border-white/10">
          <Users className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-mono font-bold text-white">
            {stats.totalFriends}
          </span>
          <span className="text-slate-400 text-[10px]">
            Connections
          </span>
        </div>

        {/* Dlicom Verified Pill */}
        {stats.dlicomVerifiedCount !== undefined && stats.dlicomVerifiedCount > 0 && (
          <div className="flex items-center gap-1.5 pr-2.5 border-r border-white/10 text-amber-300">
            <span className="font-mono font-bold">{stats.dlicomVerifiedCount}</span>
            <span className="text-[10px] text-amber-300/80">Verified</span>
          </div>
        )}

        {/* Activity Score */}
        <div className="flex items-center gap-1.5 pr-2.5 border-r border-white/10">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span className="font-mono font-bold text-white">
            {stats.mutualConnections}
          </span>
          <span className="text-slate-400 text-[10px]">
            Events
          </span>
        </div>

        {/* Guilds */}
        {stats.communitiesCount > 0 && (
          <div className="flex items-center gap-1.5 pr-2.5 border-r border-white/10">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono font-bold text-white">
              {stats.communitiesCount}
            </span>
            <span className="text-slate-400 text-[10px]">
              Guilds
            </span>
          </div>
        )}

        {/* Active Now */}
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-mono font-bold text-emerald-400">
            {stats.activeToday}
          </span>
          <span className="text-slate-400 text-[10px]">
            Live
          </span>
        </div>
      </div>
    </div>
  );
};
