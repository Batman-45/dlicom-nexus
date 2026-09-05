import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  FolderGit2,
  Award,
  Activity,
  Briefcase,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { PulseNavbar } from '../components/Pulse/PulseNavbar';
import { ClaimBadge } from '../components/Pulse/ClaimBadge';
import { PulseService } from '../services/pulse/pulseService';
import type { PulseDashboardData } from '../types/pulse';

interface PulseDashboardPageProps {
  onNavigate: (route: string) => void;
}

export const PulseDashboardPage: React.FC<PulseDashboardPageProps> = ({ onNavigate }) => {
  const [data, setData] = useState<PulseDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    PulseService.getInstance()
      .getDashboardData()
      .then((res) => {
        if (mounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load pulse dashboard data', err);
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-[#07050f] text-slate-100 flex flex-col">
        <PulseNavbar currentPath="/" onNavigate={onNavigate} />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-mono text-slate-400">Loading Dlicom Pulse Intelligence...</p>
          </div>
        </div>
      </div>
    );
  }

  const { stats, activeContributors, recentContributions, projects, achievements, communityActivity, opportunities } = data;

  return (
    <div className="min-h-screen bg-[#07050f] text-slate-100 font-sans selection:bg-purple-500/30 selection:text-white flex flex-col">
      <PulseNavbar
        currentPath="/"
        onNavigate={onNavigate}
        verifiedCount={stats.verifiedMemberCount}
        totalCount={stats.communityMemberCount}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl p-6 sm:p-10 border border-white/10 bg-gradient-to-br from-purple-950/40 via-[#0c091d] to-[#080613] shadow-2xl backdrop-blur-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Evidence-Backed Community & Ecosystem Intelligence</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Discover verified people, projects, and opportunities in{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
                Dlicom
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Public intelligence hub for the Dlicom SocialFi ecosystem on Base. Real contributions, audited
              smart contracts, and verified community identities backed strictly by observable public evidence.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('/members')}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-500/25 flex items-center gap-2 cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>Explore Members ({stats.communityMemberCount})</span>
              </button>
              <button
                onClick={() => onNavigate('/projects')}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
              >
                <FolderGit2 className="w-4 h-4 text-cyan-400" />
                <span>View Projects ({stats.projectsCount})</span>
              </button>
              <button
                onClick={() => onNavigate('/registry/audit')}
                className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Audit Log</span>
              </button>
            </div>
          </div>
        </section>

        {/* Metric Overview Cards */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div
            onClick={() => onNavigate('/members')}
            className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-medium uppercase tracking-wider">Members</span>
              <Users className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-white">{stats.communityMemberCount}</div>
            <div className="text-[10px] font-mono text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{stats.verifiedMemberCount} Verified</span>
            </div>
          </div>

          <div
            onClick={() => onNavigate('/members')}
            className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-medium uppercase tracking-wider">Active Contributors</span>
              <Activity className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-white">{stats.activeContributorsCount}</div>
            <div className="text-[10px] font-mono text-slate-400 mt-1">
              Across Core & Guilds
            </div>
          </div>

          <div
            onClick={() => onNavigate('/projects')}
            className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-medium uppercase tracking-wider">Projects</span>
              <FolderGit2 className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-white">{stats.projectsCount}</div>
            <div className="text-[10px] font-mono text-cyan-400 mt-1">
              Base L2 & SocialFi
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-medium uppercase tracking-wider">Contributions</span>
              <Award className="w-4 h-4 text-pink-400" />
            </div>
            <div className="text-2xl font-black text-white">{stats.contributionsCount}</div>
            <div className="text-[10px] font-mono text-purple-300 mt-1">
              Audited & Public
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-medium uppercase tracking-wider">Achievements</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white">{achievements.length}</div>
            <div className="text-[10px] font-mono text-amber-300 mt-1">
              Hacken Certified
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-medium uppercase tracking-wider">Opportunities</span>
              <Briefcase className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white">{stats.openOpportunitiesCount}</div>
            <div className="text-[10px] font-mono text-emerald-400 mt-1">
              Bounties & Roles
            </div>
          </div>
        </section>

        {/* Two-Column Grid: Active Contributors & Live Community Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Contributors (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <h2 className="text-lg font-bold text-white">Active Community Contributors</h2>
              </div>
              <button
                onClick={() => onNavigate('/members')}
                className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>View all members</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeContributors.map((c) => (
                <div
                  key={c.dliId}
                  onClick={() => onNavigate(`/member/${c.handle}`)}
                  className="p-3.5 rounded-2xl bg-[#0e0c1f] border border-white/10 hover:border-purple-500/40 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={c.avatarUrl}
                      alt={c.displayName}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-white/10 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                          {c.displayName}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          @{c.handle}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {c.role}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <ClaimBadge status={c.claimStatus} size="sm" />
                    <span className="text-[9px] font-mono text-slate-500">
                      {c.dliId}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Activity Stream (1 col) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <h2 className="text-lg font-bold text-white">Community Activity</h2>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Verified Stream
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0e0c1f] border border-white/10 space-y-3.5">
              {communityActivity.map((act) => (
                <div key={act.id} className="text-xs border-b border-white/5 pb-3 last:border-0 last:pb-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => onNavigate(`/member/${act.actorHandle}`)}
                      className="font-bold text-cyan-300 hover:underline cursor-pointer"
                    >
                      {act.actorDisplayName}
                    </button>
                    <ClaimBadge status={act.claimStatus} size="sm" showLabel={false} />
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    {act.action} <strong className="text-white">{act.targetName}</strong>
                  </p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-0.5">
                    <span>{new Date(act.timestamp).toLocaleDateString()}</span>
                    <a
                      href={act.evidenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 flex items-center gap-0.5"
                    >
                      <span>evidence</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Projects Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">Active Projects & Smart Contracts</h2>
            </div>
            <button
              onClick={() => onNavigate('/projects')}
              className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>Explore all projects</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.slice(0, 3).map((p) => (
              <div
                key={p.id}
                className="p-5 rounded-2xl bg-[#0e0c1f] border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between gap-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-cyan-300">
                      {p.category.replace('_', ' ')}
                    </span>
                    <ClaimBadge status={p.claimStatus} size="sm" />
                  </div>

                  <h3 className="text-sm font-bold text-white leading-snug">
                    {p.name}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {p.tagline}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                  <div className="text-[10px] font-mono text-slate-400">
                    <span className="text-white font-bold">{p.metrics.contributorsCount}</span> contributors ·{' '}
                    <span className="text-white font-bold">{p.metrics.verifiedContributionsCount}</span> tasks
                  </div>
                  <div className="flex items-center gap-2">
                    {p.auditUrl && (
                      <a
                        href={p.auditUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-mono text-emerald-300 hover:underline flex items-center gap-1"
                        title="Hacken Audit Report"
                      >
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span>Audit</span>
                      </a>
                    )}
                    <a
                      href={p.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-mono text-cyan-300 hover:underline flex items-center gap-1"
                    >
                      <span>Source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Contributions Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-pink-400" />
              <h2 className="text-lg font-bold text-white">Recent Evidence-Backed Contributions</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              3-tier claim taxonomy applied
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentContributions.slice(0, 4).map((contrib) => (
              <div
                key={contrib.id}
                className="p-4 rounded-2xl bg-[#0e0c1f] border border-white/10 hover:border-purple-500/30 transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase">
                      {contrib.category.replace('_', ' ')} · {contrib.projectName}
                    </span>
                    <h4 className="text-xs font-bold text-white leading-snug">
                      {contrib.title}
                    </h4>
                  </div>
                  <ClaimBadge status={contrib.claimStatus} evidenceUrl={contrib.evidenceUrl} size="sm" />
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2">
                  {contrib.description}
                </p>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onNavigate(`/member/${contrib.memberHandle}`)}
                      className="text-purple-300 hover:underline cursor-pointer"
                    >
                      {contrib.memberDisplayName}
                    </button>
                    <span>({contrib.memberDliId})</span>
                  </div>
                  <span>{new Date(contrib.observedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Achievements & Open Opportunities Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Achievements */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <h2 className="text-lg font-bold text-white">Community Achievements & Milestones</h2>
            </div>

            <div className="space-y-3">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className="p-3.5 rounded-2xl bg-[#0e0c1f] border border-white/10 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                      <Award className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{ach.title}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{ach.description}</p>
                      <button
                        onClick={() => onNavigate(`/member/${ach.recipientHandle}`)}
                        className="text-[10px] font-mono text-purple-300 hover:underline cursor-pointer"
                      >
                        Recipient: {ach.recipientDisplayName} ({ach.recipientDliId})
                      </button>
                    </div>
                  </div>

                  <ClaimBadge status={ach.claimStatus} evidenceUrl={ach.evidenceUrl} size="sm" />
                </div>
              ))}
            </div>
          </div>

          {/* Opportunities */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                <h2 className="text-lg font-bold text-white">Open Opportunities & Bounties</h2>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                {opportunities.length} Open
              </span>
            </div>

            <div className="space-y-3">
              {opportunities.map((opp) => (
                <div
                  key={opp.id}
                  className="p-3.5 rounded-2xl bg-[#0e0c1f] border border-white/10 hover:border-emerald-500/30 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">
                          {opp.type}
                        </span>
                        {opp.reward && (
                          <span className="text-[10px] font-mono font-bold text-amber-300">
                            {opp.reward}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-white mt-1">{opp.title}</h4>
                    </div>

                    <a
                      href={opp.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold transition-colors shrink-0 flex items-center gap-1"
                    >
                      <span>Apply</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {opp.description}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {opp.skillsRequired.map((skill) => (
                      <span
                        key={skill}
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-white/5 text-slate-400"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
