import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ExternalLink,
  Share2,
  ArrowLeft,
  Check,
  FolderGit2,
  Award,
  Activity,
  Code,
  FileBadge,
  Database,
  Copy,
  MapPin,
  Calendar,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { PulseNavbar } from '../components/Pulse/PulseNavbar';
import { ClaimBadge } from '../components/Pulse/ClaimBadge';
import { PulseService } from '../services/pulse/pulseService';
import type { MemberProfileData } from '../types/pulse';

interface PulseMemberProfilePageProps {
  username: string;
  onNavigate: (route: string) => void;
}

export const PulseMemberProfilePage: React.FC<PulseMemberProfilePageProps> = ({
  username,
  onNavigate,
}) => {
  const [profile, setProfile] = useState<MemberProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [copiedDli, setCopiedDli] = useState(false);

  useEffect(() => {
    let mounted = true;
    PulseService.getInstance()
      .getMemberProfile(username)
      .then((res) => {
        if (mounted) {
          setProfile(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load member profile', err);
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [username]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${profile?.identity.displayName} (@${profile?.identity.handle}) — Dlicom Pulse Profile`,
          text: `Publicly evidence-backed Dlicom community profile for ${profile?.identity.displayName} (${profile?.dliId}).`,
          url,
        });
        return;
      }
    } catch {
      // User cancelled
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleCopyDliId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedDli(true);
      setTimeout(() => setCopiedDli(false), 2000);
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07050f] text-slate-100 flex flex-col">
        <PulseNavbar currentPath={`/member/${username}`} onNavigate={onNavigate} />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-mono text-slate-400">Loading member profile @{username}...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#07050f] text-slate-100 flex flex-col">
        <PulseNavbar currentPath={`/member/${username}`} onNavigate={onNavigate} />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-[#0e0c1f] border border-white/10 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white">Community Member Not Found</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              No evidence-backed community record found matching <span className="font-mono text-cyan-300">"@{username}"</span>.
            </p>
            <div className="pt-2 flex justify-center gap-2.5">
              <button
                onClick={() => onNavigate('/members')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-purple-500/20"
              >
                Back to Directory
              </button>
              <button
                onClick={() => onNavigate('/registry')}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Public Registry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { identity, roles, skills, projects, contributions, achievements, communityParticipation, evidenceSummary, dliId } = profile;
  const primaryRole = roles[0];

  return (
    <div className="min-h-screen bg-[#07050f] text-slate-100 font-sans selection:bg-purple-500/30 selection:text-white flex flex-col">
      <PulseNavbar currentPath={`/member/${identity.normalizedHandle}`} onNavigate={onNavigate} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Navigation Breadcrumb Bar */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => onNavigate('/members')}
            className="text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Member Directory</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-300 font-mono">@{identity.normalizedHandle}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate(`/passport/${dliId}`)}
              className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:shadow-purple-500/10"
              title="Inspect cryptographic identity passport"
            >
              <FileBadge className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Verifiable</span>
              <span>Passport</span>
            </button>
            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* 2-Column Responsive Dossier Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ================= LEFT COLUMN: Identity, Confidence & Metadata (4 cols) ================= */}
          <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-20">
            {/* Identity Card */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#0e0c1f] border border-white/10 shadow-xl space-y-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

              <div className="flex flex-col items-center text-center space-y-3 relative z-10">
                <div className="relative">
                  <img
                    src={identity.avatarUrl}
                    alt={identity.displayName}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-2 ring-purple-500/30 shadow-2xl"
                  />
                  <div className="absolute -bottom-1.5 -right-1.5">
                    <ClaimBadge status={primaryRole?.claimStatus || 'VERIFIED'} size="sm" showLabel={false} />
                  </div>
                </div>

                <div className="space-y-1 w-full">
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                    {identity.displayName}
                  </h1>
                  <div className="flex items-center justify-center gap-2 text-xs font-mono">
                    <a
                      href={`https://x.com/${identity.handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-300 hover:underline flex items-center gap-1"
                    >
                      <span>@{identity.handle}</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                    </a>
                    {identity.region && (
                      <span className="inline-flex items-center gap-0.5 text-slate-400">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{identity.region}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Primary Role Pill */}
                <div className="w-full pt-1 flex justify-center">
                  <ClaimBadge status={primaryRole?.claimStatus || 'VERIFIED'} size="md" />
                </div>
              </div>

              {/* DLI-ID copy badge */}
              <div
                onClick={() => handleCopyDliId(dliId)}
                className="p-2.5 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-colors flex items-center justify-between gap-2 cursor-pointer group"
                title="Click to copy DLI-ID"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-mono text-purple-300 uppercase tracking-wider font-semibold">DLI-ID:</span>
                  <span className="text-xs font-mono text-white font-bold truncate">{dliId}</span>
                </div>
                <button className="text-slate-400 group-hover:text-purple-300 transition-colors shrink-0">
                  {copiedDli ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Bio */}
              {identity.bio && (
                <div className="pt-2 border-t border-white/5">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {identity.bio}
                  </p>
                </div>
              )}
            </div>

            {/* Verification Confidence & Authority Card */}
            <div className="p-5 rounded-3xl bg-[#0e0c1f] border border-white/10 shadow-lg space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Authority & Confidence</span>
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {evidenceSummary.confidenceScore}/100
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${evidenceSummary.confidenceScore}%` }}
                />
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">Authority Level:</span>
                <span className="font-mono text-[10px] text-cyan-300 font-semibold px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                  {evidenceSummary.authorityLevel}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                {evidenceSummary.whyVerified}
              </p>
            </div>

            {/* Community Participation Record Card */}
            <div className="p-5 rounded-3xl bg-[#0e0c1f] border border-white/10 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Community Participation</span>
                </span>
                <ClaimBadge status={communityParticipation.claimStatus} size="sm" showLabel={false} />
              </div>

              <div className="space-y-2 text-xs divide-y divide-white/5">
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-400 text-[11px]">Activity Type:</span>
                  <span className="font-semibold text-white text-[11px] text-right truncate max-w-[180px]">
                    {communityParticipation.activityType}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>First Observed:</span>
                  </span>
                  <span className="font-mono text-slate-300 text-[11px]">
                    {new Date(communityParticipation.firstObservedActivity).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span>Last Verified:</span>
                  </span>
                  <span className="font-mono text-slate-300 text-[11px]">
                    {new Date(communityParticipation.lastActiveDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5">
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {communityParticipation.summary}
                </p>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: Roles, Skills, Contributions, Projects & Evidence (8 cols) ================= */}
          <div className="lg:col-span-8 space-y-6">
            {/* Roles & Designations */}
            <section className="p-5 sm:p-6 rounded-3xl bg-[#0e0c1f] border border-white/10 shadow-lg space-y-3.5">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>Verified Roles & Designations ({roles.length})</span>
                </h2>
                <span className="text-[10px] font-mono text-slate-500">Official Roster</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {roles.map((r, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-purple-500/20 transition-all flex flex-col justify-between gap-2"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-white">{r.role}</span>
                        <ClaimBadge status={r.claimStatus} evidenceUrl={r.evidenceUrl} size="sm" />
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{r.summary}</p>
                    </div>
                    {r.evidenceUrl && (
                      <div className="pt-1 flex justify-end">
                        <a
                          href={r.evidenceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-mono text-purple-300 hover:underline flex items-center gap-1"
                        >
                          <span>Source</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Skills & Expertise */}
            <section className="p-5 sm:p-6 rounded-3xl bg-[#0e0c1f] border border-white/10 shadow-lg space-y-3.5">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Code className="w-4 h-4 text-pink-400" />
                  <span>Skills & Core Competencies ({skills.length})</span>
                </h2>
                <span className="text-[10px] font-mono text-slate-500">Categorized</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {skills.map((skill) => (
                  <div
                    key={skill.name}
                    className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-pink-500/20 transition-all flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{skill.name}</div>
                      <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{skill.category}</div>
                    </div>
                    <ClaimBadge status={skill.claimStatus} evidenceUrl={skill.evidenceUrl} size="sm" />
                  </div>
                ))}
              </div>
            </section>

            {/* Evidence-Backed Contributions */}
            <section className="p-5 sm:p-6 rounded-3xl bg-[#0e0c1f] border border-white/10 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-sm font-bold text-white">
                    Evidence-Backed Contributions ({contributions.length})
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase">Public Milestones</span>
              </div>

              {contributions.length === 0 ? (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3 text-xs text-slate-400">
                  <Info className="w-4 h-4 text-slate-500 shrink-0" />
                  <p className="text-[11px]">
                    No individual task tickets cataloged yet for this identity. Verified leadership designations and community standing are documented in the official roster above.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {contributions.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-cyan-500/30 transition-all space-y-2.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 uppercase font-semibold">
                              {c.category.replace('_', ' ')}
                            </span>
                            {c.projectName && (
                              <span className="text-[10px] font-mono text-slate-400">
                                · {c.projectName}
                              </span>
                            )}
                          </div>
                          <h3 className="text-xs sm:text-sm font-bold text-white mt-1 leading-snug">
                            {c.title}
                          </h3>
                        </div>
                        <ClaimBadge status={c.claimStatus} evidenceUrl={c.evidenceUrl} size="sm" />
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {c.description}
                      </p>

                      {c.impactNote && (
                        <div className="text-[11px] text-emerald-300 font-mono bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Impact: {c.impactNote}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1.5 border-t border-white/5">
                        <span className="truncate max-w-sm">Proof: {c.evidenceSummary}</span>
                        <span>{new Date(c.observedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Projects Contributed To */}
            {projects.length > 0 && (
              <section className="p-5 sm:p-6 rounded-3xl bg-[#0e0c1f] border border-white/10 shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderGit2 className="w-4 h-4 text-purple-400" />
                    <h2 className="text-sm font-bold text-white">
                      Projects & Smart Contracts Contributed To ({projects.length})
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono text-purple-400 uppercase">Base L2 Subsystems</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {projects.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-purple-500/30 transition-all flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-cyan-300 border border-white/10">
                            {p.category.replace('_', ' ')}
                          </span>
                          <ClaimBadge status={p.claimStatus} size="sm" />
                        </div>
                        <h3 className="text-xs sm:text-sm font-bold text-white leading-snug">{p.name}</h3>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{p.tagline}</p>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                        <span className="text-[10px] font-mono text-slate-500">Status: {p.status}</span>
                        <a
                          href={p.officialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-mono text-cyan-300 hover:underline flex items-center gap-1"
                        >
                          <span>Inspect</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Achievements & Honors (if awarded) */}
            {achievements.length > 0 && (
              <section className="p-5 sm:p-6 rounded-3xl bg-[#0e0c1f] border border-white/10 shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    <h2 className="text-sm font-bold text-white">
                      Achievements & Milestones ({achievements.length})
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400 uppercase">Hacken Certified</span>
                </div>

                <div className="space-y-2.5">
                  {achievements.map((ach) => (
                    <div
                      key={ach.id}
                      className="p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-amber-500/20 transition-all flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0">
                          <Award className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-white">{ach.title}</h4>
                          <p className="text-[11px] text-slate-400 leading-snug">{ach.description}</p>
                          <span className="text-[9px] font-mono text-slate-500">
                            Awarded: {new Date(ach.awardedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <ClaimBadge status={ach.claimStatus} evidenceUrl={ach.evidenceUrl} size="sm" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Cryptographic Evidence & Provenance Trail */}
            <section className="p-5 sm:p-6 rounded-3xl bg-[#0a0818] border border-purple-500/20 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-400" />
                  <h3 className="text-xs sm:text-sm font-bold text-white">
                    Public Evidence & Provenance Trail
                  </h3>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 font-semibold uppercase">
                  Audit Grade
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                  <div className="text-[10px] font-mono text-purple-300 font-bold uppercase">
                    Verification Rationale:
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {evidenceSummary.whyVerified}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                    Independent Evidence URLs:
                  </div>
                  <div className="flex flex-col gap-1">
                    {evidenceSummary.evidenceUrls.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 truncate p-1.5 rounded-xl hover:bg-white/5 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span className="truncate">{url}</span>
                      </a>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-white/5">
                  <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                    Provenance Audit Log:
                  </div>
                  <ul className="space-y-1 text-[11px] text-slate-400">
                    {evidenceSummary.provenanceTrail.map((p, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 font-mono">
                        <span className="text-purple-400">›</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};
