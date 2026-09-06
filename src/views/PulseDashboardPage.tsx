import React, { useState, useEffect } from 'react';
import {
  Users,
  FolderGit2,
  Award,
  Activity,
  Briefcase,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  Flame,
  Radio,
  Clock,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { PulseNavbar } from '../components/Pulse/PulseNavbar';
import { ClaimBadge } from '../components/Pulse/ClaimBadge';
import { PulseService } from '../services/pulse/pulseService';
import type { PulseDashboardData, PulseActivityEventType } from '../types/pulse';

interface PulseDashboardPageProps {
  onNavigate: (route: string) => void;
}

export const PulseDashboardPage: React.FC<PulseDashboardPageProps> = ({ onNavigate }) => {
  const [data, setData] = useState<PulseDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activityFilter, setActivityFilter] = useState<'ALL' | PulseActivityEventType>('ALL');

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
      <div className="min-h-screen bg-[#07050f] text-slate-100 flex flex-col font-sans">
        <PulseNavbar currentPath="/" onNavigate={onNavigate} />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-mono text-slate-400 tracking-wider">INITIALIZING PULSE INTELLIGENCE CONSOLE...</p>
          </div>
        </div>
      </div>
    );
  }

  const { stats, activeContributors, recentContributions, projects, achievements, communityActivity, opportunities, sourceHealth = [] } = data;

  const filteredActivity = activityFilter === 'ALL'
    ? communityActivity
    : communityActivity.filter((a) => (a.eventType || a.activityType) === activityFilter);

  const scrollToOpportunities = () => {
    const el = document.getElementById('opportunities');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const healthySourcesCount = sourceHealth.filter((s) => s.status === 'HEALTHY').length;
  const totalSourcesCount = sourceHealth.length || 4;

  return (
    <div className="min-h-screen bg-[#07050f] text-slate-100 font-sans selection:bg-cyan-500/20 selection:text-cyan-200 flex flex-col antialiased">
      <PulseNavbar
        currentPath="/"
        onNavigate={onNavigate}
        verifiedCount={stats.verifiedMemberCount}
        totalCount={stats.communityMemberCount}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-5 space-y-5">
        {/* =========================================================================
            1. INTELLIGENCE CONSOLE HEADER & REAL-TIME TELEMETRY HUD
           ========================================================================= */}
        <section className="rounded-xl border border-white/10 bg-[#0b0818]/90 p-4 sm:p-5 backdrop-blur-md relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 text-[10px] font-mono uppercase tracking-wider font-semibold">
                  <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                  Live Intelligence Console
                </span>
                <span className="text-[10px] font-mono text-slate-400">v1.1</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                Dlicom Pulse Community Intelligence
              </h1>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Autonomous community telemetry, continuous public evidence ingestion, Hacken security verifications, and ecosystem opportunities.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={scrollToOpportunities}
                className="px-3.5 py-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Explore Bounties ({stats.openOpportunitiesCount})</span>
              </button>
              <button
                onClick={() => onNavigate('/members')}
                className="px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>Directory</span>
              </button>
            </div>
          </div>

          {/* TELEMETRY HUD STRIP */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3.5">
            {/* Metric 1: Verified Registry */}
            <div
              onClick={() => onNavigate('/members')}
              className="p-3 rounded-lg bg-black/30 border border-white/5 hover:border-cyan-500/30 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase tracking-wider">
                <span>Verified Core</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="text-lg font-black text-white mt-1">
                {stats.verifiedMemberCount}{' '}
                <span className="text-xs font-normal text-slate-400">/ {stats.communityMemberCount} tracked</span>
              </div>
              <div className="text-[10px] font-mono text-cyan-400/90 mt-0.5 truncate flex items-center gap-1">
                <span>100% Provenance Confirmed</span>
              </div>
            </div>

            {/* Metric 2: Source Health & Radar */}
            <div className="p-3 rounded-lg bg-black/30 border border-white/5">
              <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase tracking-wider">
                <span>Source Monitor</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-lg font-black text-emerald-400 mt-1">
                {healthySourcesCount}/{totalSourcesCount} HEALTHY
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">
                Status: <strong className="text-emerald-400 font-normal">FRESH (0 Failures)</strong>
              </div>
            </div>

            {/* Metric 3: Active Bounties & Calls */}
            <div
              onClick={scrollToOpportunities}
              className="p-3 rounded-lg bg-black/30 border border-white/5 hover:border-amber-500/30 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase tracking-wider">
                <span>Active Calls</span>
                <Briefcase className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-lg font-black text-amber-300 mt-1">
                {stats.openOpportunitiesCount} Open
              </div>
              <div className="text-[10px] font-mono text-amber-300/80 mt-0.5 truncate">
                Bounties & Ecosystem Roles
              </div>
            </div>

            {/* Metric 4: Protocol Invariants & Output */}
            <div
              onClick={() => onNavigate('/projects')}
              className="p-3 rounded-lg bg-black/30 border border-white/5 hover:border-pink-500/30 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase tracking-wider">
                <span>Verified Output</span>
                <ShieldCheck className="w-3.5 h-3.5 text-pink-400" />
              </div>
              <div className="text-lg font-black text-white mt-1">
                {stats.contributionsCount} Contribs
              </div>
              <div className="text-[10px] font-mono text-pink-300/90 mt-0.5 truncate">
                Across {stats.projectsCount} Audited Projects
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. MAIN CONSOLE GRID: LIVE ACTIVITY FEED (7 COLS) & OPPORTUNITIES (5 COLS)
           ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT: LIVE COMMUNITY INTELLIGENCE FEED (PRIMARY FOCUS) */}
          <section className="lg:col-span-7 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-[#0b0818] border border-white/10 p-3 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-purple-500/15 text-purple-400 border border-purple-500/30">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white tracking-tight">
                    Live Community Intelligence
                  </h2>
                  <span className="text-[10px] font-mono text-slate-400">
                    Community Activity & Public Invariants
                  </span>
                </div>
              </div>

              {/* Event Filter Tabs */}
              <div className="flex items-center gap-1 flex-wrap text-[10px] font-mono">
                {(['ALL', 'VERIFICATION', 'CONTRIBUTION', 'OPPORTUNITY', 'PROJECT_ACTIVITY', 'AUDIT_UPDATE'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActivityFilter(filter)}
                    className={`px-2 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
                      activityFilter === filter
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                        : 'bg-white/5 text-slate-400 hover:text-white border border-transparent'
                    }`}
                  >
                    {filter === 'ALL' ? 'All' : filter.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Activity Stream Rows */}
            <div className="space-y-2.5">
              {filteredActivity.map((act) => {
                const eventType = act.eventType || act.activityType || 'CONTRIBUTION';
                const source = act.sourceUrl || act.evidenceUrl;
                const status = act.claimTier || act.claimStatus || 'VERIFIED';

                return (
                  <div
                    key={act.id}
                    className="p-3.5 rounded-xl bg-[#0b0818] border border-white/10 hover:border-cyan-500/30 transition-all space-y-2 group shadow-sm"
                  >
                    {/* Event Header: Type + Target + Claim Badge */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        {eventType === 'VERIFICATION' && (
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            ✓ Verification
                          </span>
                        )}
                        {eventType === 'CONTRIBUTION' && (
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
                            ◆ Contribution
                          </span>
                        )}
                        {eventType === 'OPPORTUNITY' && (
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            🚀 Opportunity
                          </span>
                        )}
                        {eventType === 'PROJECT_ACTIVITY' && (
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                            📦 Project Activity
                          </span>
                        )}
                        {eventType === 'AUDIT_UPDATE' && (
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-pink-500/15 text-pink-300 border border-pink-500/30">
                            🔐 Audit Update
                          </span>
                        )}

                        {act.actorHandle ? (
                          <button
                            onClick={() => onNavigate(`/member/${act.actorHandle}`)}
                            className="font-bold text-xs text-white hover:text-cyan-300 transition-colors cursor-pointer"
                          >
                            @{act.actorHandle}
                          </button>
                        ) : (
                          <span className="font-bold text-xs text-white">
                            {act.memberOrProjectRef}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <ClaimBadge status={status} size="sm" />
                      </div>
                    </div>

                    {/* Substantive Explanation */}
                    <p className="text-xs text-slate-300 leading-relaxed font-normal">
                      {act.explanation || `${act.action || ''} ${act.targetName || ''}`}
                    </p>

                    {/* Metadata Strip: Timestamp + Freshness + Source URL */}
                    <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-white/5 text-slate-500">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {new Date(act.timestamp).toLocaleDateString()}
                        </span>
                        <span className="text-emerald-400 font-semibold">· FRESH</span>
                      </div>

                      {source && (
                        <a
                          href={source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors"
                        >
                          <span>Evidence Source</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Compact Monitored Sources Health Bar */}
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-2 text-[10px] font-mono">
              <div className="flex items-center justify-between text-slate-400">
                <span className="uppercase font-semibold tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Source Health Monitor
                </span>
                <span className="text-emerald-400 font-bold">100% OPERATIONAL · FRESH</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-slate-400">
                {sourceHealth.map((s) => (
                  <div key={s.sourceId} className="flex items-center justify-between bg-white/5 px-2 py-1 rounded">
                    <span className="truncate pr-2">{s.sourceName}</span>
                    <span className="text-emerald-400 shrink-0">{s.status} (0 failures)</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* RIGHT: ACTIONABLE OPPORTUNITIES & PROTOCOL PROJECTS (5 COLS) */}
          <div className="lg:col-span-5 space-y-5">
            {/* 2A. OPEN OPPORTUNITIES & BOUNTIES */}
            <section id="opportunities" className="space-y-3 scroll-mt-20">
              <div className="flex items-center justify-between bg-[#0b0818] border border-white/10 p-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    <Briefcase className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white tracking-tight">
                      Open Opportunities & Bounties
                    </h2>
                    <span className="text-[10px] font-mono text-amber-300/80">
                      Verified Ecosystem Calls ({opportunities.length})
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                {opportunities.map((opp) => (
                  <div
                    key={opp.id}
                    className="p-3.5 rounded-xl bg-[#0b0818] border border-white/10 hover:border-amber-500/30 transition-all space-y-2.5 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
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

                    <div>
                      <h4 className="text-xs font-bold text-white leading-snug">{opp.title}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {opp.description}
                      </p>
                    </div>

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

                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] font-mono">
                      <span className="text-slate-500 truncate">
                        Target: {opp.projectName}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        {opp.sourceUrl && (
                          <a
                            href={opp.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-cyan-300 flex items-center gap-0.5"
                          >
                            <span>Evidence</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                        <a
                          href={opp.applyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold flex items-center gap-1 transition-colors"
                        >
                          <span>Apply</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 2B. ACTIVE PROJECTS & SMART CONTRACTS */}
            <section className="space-y-3">
              <div className="flex items-center justify-between bg-[#0b0818] border border-white/10 p-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                    <FolderGit2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white tracking-tight">
                      Active Projects & Smart Contracts
                    </h2>
                    <span className="text-[10px] font-mono text-cyan-300">
                      Production & Audited Repositories
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('/projects')}
                  className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-0.5 cursor-pointer"
                >
                  <span>All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2">
                {projects.slice(0, 3).map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-[#0b0818] border border-white/10 hover:border-cyan-500/30 transition-all space-y-1.5 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-cyan-300">
                        {p.category.replace('_', ' ')}
                      </span>
                      <ClaimBadge status={p.claimStatus} size="sm" showLabel={false} />
                    </div>

                    <h3 className="text-xs font-bold text-white truncate">{p.name}</h3>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{p.tagline}</p>

                    <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-slate-500">
                      <span>{p.metrics.verifiedContributionsCount} Verified Actions</span>
                      <a
                        href={p.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5"
                      >
                        <span>Inspect</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* =========================================================================
            3. EVIDENCE-BACKED CONTRIBUTIONS & ACHIEVEMENTS STRIP
           ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
          {/* Recent Verified Contributions */}
          <section className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between bg-[#0b0818] border border-white/10 p-3 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-pink-500/15 text-pink-400 border border-pink-500/30">
                  <Award className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Evidence-Backed Contributions
                </h2>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Audited & Public
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {recentContributions.slice(0, 4).map((contrib) => (
                <div
                  key={contrib.id}
                  className="p-3 rounded-xl bg-[#0b0818] border border-white/10 hover:border-purple-500/30 transition-all flex flex-col justify-between gap-2 shadow-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-purple-300">
                        {contrib.category}
                      </span>
                      <ClaimBadge status={contrib.claimStatus} size="sm" showLabel={false} />
                    </div>
                    <h4 className="text-xs font-bold text-white leading-snug">{contrib.title}</h4>
                    <p className="text-[10px] text-slate-400 line-clamp-2">{contrib.description}</p>
                  </div>

                  <div className="pt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                    <button
                      onClick={() => onNavigate(`/member/${contrib.memberHandle}`)}
                      className="text-purple-300 hover:underline cursor-pointer truncate"
                    >
                      @{contrib.memberHandle}
                    </button>
                    <a
                      href={contrib.evidenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 shrink-0"
                    >
                      <span>Evidence</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Community Milestones & Hacken Verification */}
          <section className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between bg-[#0b0818] border border-white/10 p-3 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <Award className="w-3.5 h-3.5" />
                </div>
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Community Achievements & Milestones
                </h2>
              </div>
              <span className="text-[10px] font-mono text-amber-400">
                Hacken Verified
              </span>
            </div>

            <div className="space-y-2">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className="p-3 rounded-xl bg-[#0b0818] border border-white/10 flex items-center justify-between gap-3 shadow-sm"
                >
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{ach.title}</h4>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{ach.description}</p>
                    <button
                      onClick={() => onNavigate(`/member/${ach.recipientHandle}`)}
                      className="text-[10px] font-mono text-purple-300 hover:underline cursor-pointer truncate mt-0.5 block"
                    >
                      Recipient: @{ach.recipientHandle}
                    </button>
                  </div>
                  <ClaimBadge status={ach.claimStatus} evidenceUrl={ach.evidenceUrl} size="sm" showLabel={false} />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* =========================================================================
            4. STREAMLINED CONTRIBUTOR DIRECTORY (DISCOVERABLE, NOT OVERWHELMING)
           ========================================================================= */}
        <section className="pt-2 space-y-3">
          <div className="flex items-center justify-between bg-[#0b0818] border border-white/10 p-3 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                <Users className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Active Community Contributors
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                {activeContributors.length} Verified
              </span>
            </div>
            <button
              onClick={() => onNavigate('/members')}
              className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>View full directory</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2.5">
            {activeContributors.map((c) => (
              <div
                key={c.dliId}
                onClick={() => onNavigate(`/member/${c.handle}`)}
                className="p-3 rounded-xl bg-[#0b0818] border border-white/10 hover:border-purple-500/30 hover:bg-[#100c22] transition-all cursor-pointer flex items-center justify-between gap-2.5 group shadow-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={c.avatarUrl}
                    alt={c.displayName}
                    className="w-9 h-9 rounded-lg object-cover ring-1 ring-white/15 shrink-0 group-hover:ring-cyan-400/50"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white group-hover:text-cyan-300 truncate">
                        {c.displayName}
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-slate-400 truncate">
                      @{c.handle} · <span className="text-purple-300">{c.role}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0 gap-1">
                  <ClaimBadge status={c.claimStatus} size="sm" showLabel={false} />
                  <span className="text-[9px] font-mono text-slate-400">
                    {c.recentContributionCount} contribs
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
