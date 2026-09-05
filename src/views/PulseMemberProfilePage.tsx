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
          <div className="max-w-md w-full p-6 rounded-2xl bg-[#0e0c1f] border border-white/10 text-center space-y-4">
            <h2 className="text-lg font-bold text-white">Community Member Not Found</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              No evidence-backed community record found matching <span className="font-mono text-cyan-300">"@{username}"</span>.
            </p>
            <div className="pt-2 flex justify-center gap-2">
              <button
                onClick={() => onNavigate('/members')}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors cursor-pointer"
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

  return (
    <div className="min-h-screen bg-[#07050f] text-slate-100 font-sans selection:bg-purple-500/30 selection:text-white flex flex-col">
      <PulseNavbar currentPath={`/member/${identity.normalizedHandle}`} onNavigate={onNavigate} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('/members')}
            className="text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Members</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate(`/passport/${dliId}`)}
              className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileBadge className="w-3.5 h-3.5 text-purple-400" />
              <span>Verifiable Passport</span>
            </button>
            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'Link Copied' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* Identity Profile Header Banner */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#0e0c1f] border border-white/10 shadow-2xl relative overflow-hidden space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <img
                src={identity.avatarUrl}
                alt={identity.displayName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-2 ring-purple-500/30 shrink-0"
              />
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {identity.displayName}
                  </h1>
                  <ClaimBadge status={roles[0]?.claimStatus || 'VERIFIED'} size="md" />
                </div>
                <div className="flex items-center gap-2 text-xs font-mono">
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
                    <span className="text-slate-400">· {identity.region}</span>
                  )}
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] font-mono">
                  <span>DLI-ID:</span>
                  <strong className="text-white">{dliId}</strong>
                </div>
              </div>
            </div>

            {/* Quick Evidence Score Pill */}
            <div className="flex sm:flex-col items-end gap-1.5 p-3 rounded-2xl bg-white/5 border border-white/10 shrink-0">
              <div className="text-[10px] font-mono uppercase text-slate-400">Confidence Score</div>
              <div className="text-xl font-black text-emerald-400">{evidenceSummary.confidenceScore}/100</div>
              <div className="text-[9px] font-mono text-cyan-300">{evidenceSummary.authorityLevel}</div>
            </div>
          </div>

          {identity.bio && (
            <p className="text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-4">
              {identity.bio}
            </p>
          )}
        </section>

        {/* Roles & Community Participation */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Roles */}
          <div className="p-5 rounded-2xl bg-[#0e0c1f] border border-white/10 space-y-3">
            <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Verified Roles & Designations</span>
            </h2>

            <div className="space-y-2.5">
              {roles.map((r, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-white">{r.role}</span>
                    <ClaimBadge status={r.claimStatus} evidenceUrl={r.evidenceUrl} size="sm" />
                  </div>
                  <p className="text-xs text-slate-400">{r.summary}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Community Participation Record */}
          <div className="p-5 rounded-2xl bg-[#0e0c1f] border border-white/10 space-y-3">
            <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Community Participation Record</span>
            </h2>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Activity Type:</span>
                <span className="font-semibold text-white">{communityParticipation.activityType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Observation Status:</span>
                <ClaimBadge status={communityParticipation.claimStatus} size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">First Observed:</span>
                <span className="font-mono text-slate-300">
                  {new Date(communityParticipation.firstObservedActivity).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Last Verified:</span>
                <span className="font-mono text-slate-300">
                  {new Date(communityParticipation.lastActiveDate).toLocaleDateString()}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 pt-1 border-t border-white/5">
                {communityParticipation.summary}
              </p>
            </div>
          </div>
        </section>

        {/* Verified Skills */}
        <section className="p-5 rounded-2xl bg-[#0e0c1f] border border-white/10 space-y-3">
          <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Code className="w-3.5 h-3.5 text-pink-400" />
            <span>Skills & Expertise</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {skills.map((skill) => (
              <div
                key={skill.name}
                className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between gap-2"
              >
                <div>
                  <div className="text-xs font-bold text-white">{skill.name}</div>
                  <div className="text-[10px] font-mono text-slate-400">{skill.category}</div>
                </div>
                <ClaimBadge status={skill.claimStatus} evidenceUrl={skill.evidenceUrl} size="sm" />
              </div>
            ))}
          </div>
        </section>

        {/* Contributions */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-pink-400" />
              <span>Evidence-Backed Contributions ({contributions.length})</span>
            </h2>
            <span className="text-xs text-slate-500 font-mono">Public & Verifiable</span>
          </div>

          {contributions.length === 0 ? (
            <div className="p-6 rounded-2xl bg-[#0e0c1f] border border-white/10 text-center text-xs text-slate-400">
              No individual contribution tasks cataloged yet for this profile.
            </div>
          ) : (
            <div className="space-y-3">
              {contributions.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl bg-[#0e0c1f] border border-white/10 space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-cyan-400 uppercase">
                        {c.category.replace('_', ' ')} · {c.projectName}
                      </span>
                      <h3 className="text-sm font-bold text-white">{c.title}</h3>
                    </div>
                    <ClaimBadge status={c.claimStatus} evidenceUrl={c.evidenceUrl} size="sm" />
                  </div>

                  <p className="text-xs text-slate-300">{c.description}</p>

                  {c.impactNote && (
                    <div className="text-[11px] text-emerald-300 font-mono bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                      Impact: {c.impactNote}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-white/5">
                    <span>Evidence: {c.evidenceSummary}</span>
                    <span>{new Date(c.observedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Projects Contributed To */}
        {projects.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-cyan-400" />
              <span>Projects Contributed To ({projects.length})</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl bg-[#0e0c1f] border border-white/10 space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-cyan-300">{p.category.replace('_', ' ')}</span>
                      <ClaimBadge status={p.claimStatus} size="sm" />
                    </div>
                    <h3 className="text-sm font-bold text-white">{p.name}</h3>
                    <p className="text-xs text-slate-400">{p.tagline}</p>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="text-[10px] font-mono text-slate-500">Status: {p.status}</span>
                    <a
                      href={p.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-mono text-cyan-300 hover:underline flex items-center gap-1"
                    >
                      <span>Project Details</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Achievements */}
        {achievements.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Achievements & Honors</span>
            </h2>

            <div className="space-y-3">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className="p-4 rounded-2xl bg-[#0e0c1f] border border-white/10 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0">
                      <Award className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{ach.title}</h4>
                      <p className="text-[11px] text-slate-400">{ach.description}</p>
                      <span className="text-[10px] font-mono text-slate-500">
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
        <section className="p-6 rounded-3xl bg-[#0a0818] border border-purple-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white">Public Evidence & Provenance Trail</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
              Audit Grade
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
              <div className="text-[10px] font-mono text-purple-300 font-bold uppercase">Verification Rationale:</div>
              <p className="text-slate-300 leading-relaxed">{evidenceSummary.whyVerified}</p>
            </div>

            <div className="space-y-1.5">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Independent Evidence URLs:</div>
              <div className="flex flex-col gap-1">
                {evidenceSummary.evidenceUrls.map((url, idx) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 truncate"
                  >
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    <span className="truncate">{url}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Provenance Audit Log:</div>
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
      </main>
    </div>
  );
};
