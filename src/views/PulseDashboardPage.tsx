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
  ArrowRight,
  Flame,
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

  const scrollToOpportunities = () => {
    const el = document.getElementById('opportunities');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#07050f] text-slate-100 font-sans selection:bg-purple-500/30 selection:text-white flex flex-col">
      <PulseNavbar
        currentPath="/"
        onNavigate={onNavigate}
        verifiedCount={stats.verifiedMemberCount}
        totalCount={stats.communityMemberCount}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-7">
        {/* Compact Hero Section (≤ 220px) */}
        <section className="relative overflow-hidden rounded-2xl p-5 sm:p-6 border border-white/10 bg-gradient-to-r from-purple-950/40 via-[#0c091d] to-[#080613] shadow-xl backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -ml-16 -mb-16" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-mono">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>Evidence-Backed Ecosystem Intelligence</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Community Intelligence for{' '}
                <span
                  className="font-extrabold"
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #22d3ee 0%, #c084fc 50%, #f472b6 100%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    color: 'transparent',
                  }}
                >
                  Dlicom
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                Discover verified members, real contributions, audited projects and opportunities.
              </p>
            </div>

            {/* Exactly 2 Primary CTAs */}
            <div className="flex items-center gap-3 shrink-0 pt-1 md:pt-0">
              <button
                onClick={() => onNavigate('/members')}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-500/25 flex items-center gap-2 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Explore Members</span>
              </button>
              <button
                onClick={scrollToOpportunities}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/40 text-slate-200 hover:text-white text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
              >
                <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                <span>Explore Opportunities</span>
              </button>
            </div>
          </div>
        </section>

        {/* 6 Metric Overview Cards (Compact & Dense) */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          {/* 1. Members */}
          <div
            onClick={() => onNavigate('/members')}
            className="p-3.5 rounded-xl bg-[#0e0c1f] border border-white/10 hover:border-purple-500/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[10px] font-medium uppercase tracking-wider">Members</span>
              <Users className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-xl font-black text-white leading-none">{stats.communityMemberCount}</div>
            <div className="text-[10px] font-mono text-purple-300 mt-1 truncate">
              Public Profiles
            </div>
          </div>

          {/* 2. Verified */}
          <div
            onClick={() => onNavigate('/registry')}
            className="p-3.5 rounded-xl bg-[#0e0c1f] border border-white/10 hover:border-emerald-500/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[10px] font-medium uppercase tracking-wider">Verified</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-xl font-black text-emerald-400 leading-none">{stats.verifiedMemberCount}</div>
            <div className="text-[10px] font-mono text-emerald-300/80 mt-1 truncate">
              Hacken & Registry
            </div>
          </div>

          {/* 3. Contributors */}
          <div
            onClick={() => onNavigate('/members')}
            className="p-3.5 rounded-xl bg-[#0e0c1f] border border-white/10 hover:border-cyan-500/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[10px] font-medium uppercase tracking-wider">Contributors</span>
              <Activity className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-xl font-black text-white leading-none">{stats.activeContributorsCount}</div>
            <div className="text-[10px] font-mono text-slate-400 mt-1 truncate">
              Core & Guilds
            </div>
          </div>

          {/* 4. Projects */}
          <div
            onClick={() => onNavigate('/projects')}
            className="p-3.5 rounded-xl bg-[#0e0c1f] border border-white/10 hover:border-cyan-500/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[10px] font-medium uppercase tracking-wider">Projects</span>
              <FolderGit2 className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-xl font-black text-white leading-none">{stats.projectsCount}</div>
            <div className="text-[10px] font-mono text-cyan-300 mt-1 truncate">
              Base L2 & Contracts
            </div>
          </div>

          {/* 5. Contributions */}
          <div className="p-3.5 rounded-xl bg-[#0e0c1f] border border-white/10">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[10px] font-medium uppercase tracking-wider">Contributions</span>
              <Award className="w-3.5 h-3.5 text-pink-400" />
            </div>
            <div className="text-xl font-black text-white leading-none">{stats.contributionsCount}</div>
            <div className="text-[10px] font-mono text-pink-300 mt-1 truncate">
              Audited & Public
            </div>
          </div>

          {/* 6. Opportunities */}
          <div
            onClick={scrollToOpportunities}
            className="p-3.5 rounded-xl bg-[#0e0c1f] border border-white/10 hover:border-emerald-500/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[10px] font-medium uppercase tracking-wider">Opportunities</span>
              <Briefcase className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-xl font-black text-white leading-none">{stats.openOpportunitiesCount}</div>
            <div className="text-[10px] font-mono text-emerald-400 mt-1 truncate">
              Open Bounties
            </div>
          </div>
        </section>

        {/* ACTIVE CONTRIBUTORS (3-column grid, compact, high density, avatar ≤ 64px) */}
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">Active Community Contributors</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                {activeContributors.length} Verified Active
              </span>
            </div>
            <button
              onClick={() => onNavigate('/members')}
              className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>View all members</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {activeContributors.map((c) => (
              <div
                key={c.dliId}
                onClick={() => onNavigate(`/member/${c.handle}`)}
                style={{ minHeight: '168px' }}
                className="p-4 rounded-xl bg-[#0e0c1f] border border-white/10 hover:border-purple-500/40 hover:bg-[#120f26] transition-all cursor-pointer flex flex-col justify-between group shadow-sm"
              >
                {/* Top Row: Avatar (52px) + Name + @handle + Role */}
                <div className="flex items-start gap-3 min-w-0">
                  <img
                    src={c.avatarUrl}
                    alt={c.displayName}
                    style={{ width: '52px', height: '52px', minWidth: '52px', minHeight: '52px', maxWidth: '52px', maxHeight: '52px' }}
                    className="rounded-xl object-cover ring-1 ring-white/15 shrink-0 group-hover:ring-cyan-400/50 transition-all"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                      {c.displayName}
                    </h3>
                    <p className="text-[10px] font-mono text-slate-400 truncate">
                      @{c.handle}
                    </p>
                    <p className="text-[11px] font-medium text-purple-300 truncate mt-0.5">
                      {c.role}
                    </p>
                  </div>
                </div>

                {/* Middle Row: Claim Status + DLI-ID */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <ClaimBadge status={c.claimStatus} size="sm" />
                  <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                    {c.dliId}
                  </span>
                </div>

                {/* Bottom Row: Contributions & Projects Count + View Profile */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-slate-300 font-medium">
                    <strong className="text-white">{c.recentContributionCount}</strong> Contributions ·{' '}
                    <strong className="text-white">{c.projectsCount || 1}</strong> Projects
                  </span>
                  <span className="text-cyan-400 group-hover:text-cyan-300 font-semibold flex items-center gap-0.5 text-[11px] group-hover:translate-x-0.5 transition-transform">
                    <span>View Profile</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TWO-COLUMN: Evidence-Backed Contributions & Recent Community Activity Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left (7 cols): Evidence-Backed Contributions */}
          <section className="lg:col-span-7 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-pink-500/10 border border-pink-500/20">
                  <Award className="w-3.5 h-3.5 text-pink-400" />
                </div>
                <h2 className="text-base font-bold text-white tracking-tight">Evidence-Backed Contributions</h2>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                3-tier claim taxonomy
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recentContributions.slice(0, 4).map((contrib) => (
                <div
                  key={contrib.id}
                  className="p-3.5 rounded-xl bg-[#0e0c1f] border border-white/10 hover:border-purple-500/30 transition-all flex flex-col justify-between gap-2.5"
                >
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-1.5">
                      <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-wide truncate">
                        {contrib.category.replace('_', ' ')} · {contrib.projectName}
                      </span>
                      <ClaimBadge status={contrib.claimStatus} evidenceUrl={contrib.evidenceUrl} size="sm" showLabel={false} />
                    </div>
                    <h4 className="text-xs font-bold text-white leading-snug line-clamp-1">
                      {contrib.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {contrib.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <button
                      onClick={() => onNavigate(`/member/${contrib.memberHandle}`)}
                      className="text-purple-300 hover:underline cursor-pointer truncate max-w-[140px]"
                    >
                      {contrib.memberDisplayName}
                    </button>
                    <span>{new Date(contrib.observedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Right (5 cols): Live Community Activity Timeline */}
          <section className="lg:col-span-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <Activity className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <h2 className="text-base font-bold text-white tracking-tight">Community Activity</h2>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Verified Timeline
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0e0c1f] border border-white/10 space-y-3">
              {communityActivity.map((act) => {
                const isVerification = act.activityType === 'VERIFICATION';
                const isOpportunity = act.activityType === 'OPPORTUNITY';

                return (
                  <div
                    key={act.id}
                    className="text-xs border-b border-white/5 pb-2.5 last:border-0 last:pb-0 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {isVerification && (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-0.5">
                            ✓ Verification
                          </span>
                        )}
                        {!isVerification && !isOpportunity && (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-0.5">
                            ◆ Contribution
                          </span>
                        )}
                        {isOpportunity && (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-0.5">
                            🚀 Opportunity
                          </span>
                        )}
                        <button
                          onClick={() => onNavigate(`/member/${act.actorHandle}`)}
                          className="font-bold text-slate-200 hover:text-cyan-300 transition-colors cursor-pointer text-xs"
                        >
                          @{act.actorHandle}
                        </button>
                      </div>

                      <ClaimBadge status={act.claimStatus} size="sm" showLabel={false} />
                    </div>

                    <p className="text-slate-300 text-[11px] leading-snug">
                      {act.action} <strong className="text-white">{act.targetName}</strong>
                    </p>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-0.5">
                      <span>{new Date(act.timestamp).toLocaleDateString()}</span>
                      {act.evidenceUrl && (
                        <a
                          href={act.evidenceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5"
                        >
                          <span>source</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* ACTIVE PROJECTS & SMART CONTRACTS */}
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <FolderGit2 className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">Active Projects & Smart Contracts</h2>
            </div>
            <button
              onClick={() => onNavigate('/projects')}
              className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Explore all projects</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {projects.slice(0, 3).map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-xl bg-[#0e0c1f] border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between gap-3 shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-cyan-300">
                      {p.category.replace('_', ' ')}
                    </span>
                    <ClaimBadge status={p.claimStatus} size="sm" />
                  </div>

                  <h3 className="text-xs font-bold text-white leading-snug">
                    {p.name}
                  </h3>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
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
                      className="text-[10px] font-mono text-cyan-300 hover:underline flex items-center gap-0.5"
                    >
                      <span>Source</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* OPEN OPPORTUNITIES & BOUNTIES */}
        <section id="opportunities" className="space-y-3.5 scroll-mt-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">Open Opportunities & Bounties</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                {opportunities.length} Open
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Verified Ecosystem Bounties
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {opportunities.map((opp) => (
              <div
                key={opp.id}
                className="p-4 rounded-xl bg-[#0e0c1f] border border-white/10 hover:border-emerald-500/30 transition-all flex flex-col justify-between gap-3 shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                        {opp.type}
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                        {opp.status}
                      </span>
                    </div>
                    {opp.reward && (
                      <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-amber-400" />
                        {opp.reward}
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-white leading-snug">{opp.title}</h4>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {opp.description}
                  </p>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-white/5">
                  <div className="flex flex-wrap gap-1">
                    {opp.skillsRequired.map((skill) => (
                      <span
                        key={skill}
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[9px] font-mono text-slate-500">
                      Target: {opp.projectName}
                    </span>
                    <a
                      href={opp.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold transition-colors flex items-center gap-1"
                    >
                      <span>Apply Now</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* COMMUNITY ACHIEVEMENTS & MILESTONES */}
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Award className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">Community Achievements & Milestones</h2>
            </div>
            <span className="text-[10px] font-mono text-amber-300/80">
              Hacken & On-Chain Milestones
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className="p-3.5 rounded-xl bg-[#0e0c1f] border border-white/10 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{ach.title}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{ach.description}</p>
                    <button
                      onClick={() => onNavigate(`/member/${ach.recipientHandle}`)}
                      className="text-[10px] font-mono text-purple-300 hover:underline cursor-pointer truncate block mt-0.5"
                    >
                      Recipient: {ach.recipientDisplayName}
                    </button>
                  </div>
                </div>

                <ClaimBadge status={ach.claimStatus} evidenceUrl={ach.evidenceUrl} size="sm" showLabel={false} />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
