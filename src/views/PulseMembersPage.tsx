import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  ShieldCheck,
  ChevronRight,
  Filter,
  FileBadge,
} from 'lucide-react';
import { PulseNavbar } from '../components/Pulse/PulseNavbar';
import { ClaimBadge } from '../components/Pulse/ClaimBadge';
import { PulseService } from '../services/pulse/pulseService';
import type { ClaimStatus, MemberSkill } from '../types/pulse';

interface PulseMembersPageProps {
  onNavigate: (route: string) => void;
}

interface MemberListItem {
  dliId: string;
  handle: string;
  normalizedHandle: string;
  displayName: string;
  role: string;
  claimStatus: ClaimStatus;
  avatarUrl: string;
  bio: string;
  region?: string;
  skills: MemberSkill[];
  contributionsCount: number;
  evidenceSummary: string;
  officialSourceUrl: string;
}

export const PulseMembersPage: React.FC<PulseMembersPageProps> = ({ onNavigate }) => {
  const [members, setMembers] = useState<MemberListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [claimFilter, setClaimFilter] = useState<string>('ALL');

  useEffect(() => {
    let mounted = true;
    PulseService.getInstance()
      .getMembers()
      .then((res) => {
        if (mounted) {
          setMembers(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load pulse members', err);
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const roles = useMemo(() => {
    const set = new Set<string>();
    members.forEach((m) => {
      if (m.role) set.add(m.role);
    });
    return Array.from(set);
  }, [members]);

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        m.displayName.toLowerCase().includes(q) ||
        m.handle.toLowerCase().includes(q) ||
        m.dliId.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.skills.some((s) => s.name.toLowerCase().includes(q));

      const matchesRole = roleFilter === 'ALL' || m.role === roleFilter;
      const matchesClaim = claimFilter === 'ALL' || m.claimStatus === claimFilter;

      return matchesSearch && matchesRole && matchesClaim;
    });
  }, [members, searchQuery, roleFilter, claimFilter]);

  const verifiedCount = members.filter((m) => m.claimStatus === 'VERIFIED').length;

  return (
    <div className="min-h-screen bg-[#07050f] text-slate-100 font-sans selection:bg-purple-500/30 selection:text-white flex flex-col">
      <PulseNavbar
        currentPath="/members"
        onNavigate={onNavigate}
        verifiedCount={verifiedCount}
        totalCount={members.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
              <Users className="w-3.5 h-3.5" />
              <span>Dlicom Member Directory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Community Members & Contributors
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Publicly observable leaders, contributors, and candidates across the Dlicom SocialFi ecosystem.
              Zero synthetic users. Every identity anchored to cryptographic public sources.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('/registry')}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full Evidence Registry</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl bg-[#0e0c1f] border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, @handle, role, skill, or DLI-ID..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Filter Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-slate-300">
              <Filter className="w-3 h-3 text-slate-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-[#0e0c1f]">All Roles</option>
                {roles.map((r) => (
                  <option key={r} value={r} className="bg-[#0e0c1f]">{r}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-slate-300">
              <span className="text-[10px] font-mono text-slate-400">Claim:</span>
              <select
                value={claimFilter}
                onChange={(e) => setClaimFilter(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-[#0e0c1f]">All Claims</option>
                <option value="VERIFIED" className="bg-[#0e0c1f]">VERIFIED</option>
                <option value="OBSERVED_PUBLIC_EVIDENCE" className="bg-[#0e0c1f]">OBSERVED EVIDENCE</option>
                <option value="UNVERIFIED" className="bg-[#0e0c1f]">UNVERIFIED</option>
              </select>
            </div>
          </div>
        </div>

        {/* Member Cards Grid */}
        {loading ? (
          <div className="py-20 text-center text-xs font-mono text-slate-400">
            Loading member directory...
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="py-16 text-center space-y-2 border border-white/10 rounded-2xl bg-[#0e0c1f]">
            <p className="text-sm font-bold text-white">No members matched your search criteria</p>
            <p className="text-xs text-slate-400">Try clearing filters or search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((member) => (
              <div
                key={member.dliId}
                onClick={() => onNavigate(`/member/${member.handle}`)}
                className="p-5 rounded-2xl bg-[#0e0c1f] border border-white/10 hover:border-purple-500/40 transition-all cursor-pointer flex flex-col justify-between gap-4 group"
              >
                {/* Member Top Identity */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={member.avatarUrl}
                        alt={member.displayName}
                        className="w-12 h-12 rounded-full object-cover ring-1 ring-white/10 shrink-0"
                      />
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug">
                          {member.displayName}
                        </h3>
                        <div className="text-xs font-mono text-purple-300">
                          @{member.handle}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          {member.role}
                        </div>
                      </div>
                    </div>

                    <ClaimBadge status={member.claimStatus} size="sm" />
                  </div>

                  {member.bio && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {member.bio}
                    </p>
                  )}

                  {/* Skills Pills */}
                  {member.skills && member.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {member.skills.slice(0, 3).map((s) => (
                        <span
                          key={s.name}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Footer: DLI-ID, Contributions, Passport Link */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-cyan-400">
                      {member.dliId}
                    </span>
                    {member.contributionsCount > 0 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
                        {member.contributionsCount} tasks
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate(`/passport/${member.dliId}`);
                      }}
                      className="text-[10px] font-mono text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                      title="View verifiable DLI-ID passport"
                    >
                      <FileBadge className="w-3 h-3 text-purple-400" />
                      <span>Passport</span>
                    </button>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
