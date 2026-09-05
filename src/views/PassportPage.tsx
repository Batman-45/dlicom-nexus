import React, { useState } from 'react';
import { 
  ShieldCheck,
  ExternalLink, 
  Share2, 
  ArrowLeft, 
  Check, 
  Globe, 
  CheckCircle2,
  Sparkles,
  Database
} from 'lucide-react';
import { getMemberByDliId } from '../services/community/registry';
import { VerificationLevel } from '../services/community/types';

interface PassportPageProps {
  dliId: string;
  onNavigate: (route: string) => void;
}

export const PassportPage: React.FC<PassportPageProps> = ({ dliId, onNavigate }) => {
  const member = getMemberByDliId(dliId);
  const [copied, setCopied] = useState(false);

  if (!member) {
    return (
      <div className="min-h-screen bg-[#07050f] text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full p-6 rounded-2xl bg-[#0e0c1f] border border-white/10 text-center">
          <h2 className="text-lg font-bold text-white mb-2">Identity Passport Not Found</h2>
          <p className="text-xs text-slate-400 mb-6">
            No public-evidence identity matches identifier <span className="font-mono text-cyan-300">"{dliId}"</span>.
          </p>
          <button
            onClick={() => onNavigate('/registry')}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors"
          >
            Return to Public Registry
          </button>
        </div>
      </div>
    );
  }

  const isOfficiallyVerified = member.verificationLevel === VerificationLevel.OFFICIALLY_VERIFIED;
  const isCommunityRole = member.verificationLevel === VerificationLevel.OFFICIAL_COMMUNITY_ROLE;
  const isCommunityFriend = member.verificationLevel === VerificationLevel.COMMUNITY_FRIEND;
  const isCandidate = member.verificationLevel === VerificationLevel.COMMUNITY_CANDIDATE;

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: `${member.displayName} — Dlicom Verified Passport`,
      text: `Publicly verified Dlicom ${member.role} identity (${member.dliId}). Verified via official Dlicom public sources.`,
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User cancelled
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-[#07050f] text-slate-100 font-sans selection:bg-purple-500/30 selection:text-white flex flex-col">
      {/* Top Header */}
      <header className="border-b border-white/10 bg-[#0a0816]/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => onNavigate('/registry')}
            className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Registry</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('/registry/audit')}
              className="px-3 py-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-xs font-medium text-purple-200 transition-colors flex items-center gap-1.5"
            >
              <Database className="w-3.5 h-3.5 text-purple-400" />
              <span>Audit Log</span>
            </button>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Public Evidence
            </span>
          </div>
        </div>
      </header>

      {/* Main Passport Card */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl rounded-3xl bg-[#0e0c1f] border border-white/15 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle Top Bar */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-purple-300" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider">
                  Dlicom Public Identity Passport
                </span>
                <span className="text-xs font-bold text-white tracking-tight">
                  Cryptographic & Web Provenance
                </span>
              </div>
            </div>

            <span className="font-mono text-xs font-bold text-cyan-300 px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
              {member.dliId}
            </span>
          </div>

          {/* Profile Hero */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-8">
            <img
              src={member.avatarUrl || `https://unavatar.io/x/${member.normalizedHandle}`}
              alt={member.displayName}
              className="w-20 h-20 rounded-3xl bg-white/5 border-2 border-purple-500/30 object-cover shadow-lg"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />

            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {member.displayName}
                </h2>
                <div className="flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-slate-200 border border-white/10">
                    {member.role}
                  </span>
                  {isOfficiallyVerified && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Officially Verified
                    </span>
                  )}
                  {isCommunityRole && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Community Role
                    </span>
                  )}
                  {isCommunityFriend && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Community Friend
                    </span>
                  )}
                  {isCandidate && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Candidate
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                <a
                  href={`https://x.com/${member.normalizedHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-300 hover:text-purple-200 font-mono flex items-center gap-1"
                >
                  @{member.xHandle}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {member.bio && (
                <p className="text-xs text-slate-300 pt-2 leading-relaxed">
                  {member.bio}
                </p>
              )}
            </div>
          </div>

          {/* Confidence Meter */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 mb-6 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-slate-400 uppercase text-[10px]">Evidence Confidence Score</span>
              <span className="font-mono font-bold text-white text-sm">{member.confidenceScore}%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  member.confidenceScore >= 95
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : member.confidenceScore >= 80
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                    : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                }`}
                style={{ width: `${member.confidenceScore}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 flex items-center justify-between font-mono">
              <span>Zero Synthetic Data</span>
              <span>Source Authority Weight: High</span>
            </div>
          </div>

          {/* Provenance and Evidence Details */}
          <div className="space-y-4 text-xs">
            {/* Why is this identity verified? */}
            <div className="p-4 sm:p-5 rounded-2xl bg-purple-500/10 border border-purple-500/25 space-y-2">
              <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5 uppercase tracking-wide">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                Why is this identity verified?
              </span>
              <p className="text-slate-100 leading-relaxed text-xs sm:text-sm font-sans">
                {member.evidenceSummary || member.evidence}
              </p>
              <div className="pt-2 border-t border-purple-500/20 flex items-center justify-between text-[11px] font-mono text-purple-300">
                <span>Authority Level: <strong className="text-white">{member.sourceAuthority || (isCommunityFriend ? 'LEVEL 3: PUBLIC_COMMUNITY_EVIDENCE' : 'LEVEL 5: OFFICIAL_WEBSITE')}</strong></span>
                <span>Provenance: <strong className="text-white">{isCommunityFriend ? 'Community Verified' : 'Authoritative'}</strong></span>
              </div>
            </div>

            {/* Community Friend Classification Distinction Notice */}
            {isCommunityFriend && (
              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-purple-200 text-xs space-y-1">
                <span className="text-[10px] font-mono uppercase text-purple-300 tracking-wider font-bold block">
                  Classification Notice: Community Friend — not official team
                </span>
                <p className="text-slate-200 leading-relaxed">
                  This identity is verified for genuine, independent public Dlicom community participation and contribution. They are NOT classified as official Dlicom staff, core engineering, or executive leadership.
                </p>
              </div>
            )}

            {/* Provenance & Observation Timeline */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-wider block font-bold">
                Provenance & Observation Timeline
              </span>
              <p className="text-slate-300 leading-relaxed font-mono text-[11px]">
                {member.provenance}
              </p>
              {member.provenanceTrail && member.provenanceTrail.length > 0 && (
                <div className="pt-2 border-t border-white/5 space-y-1">
                  {member.provenanceTrail.map((p, idx) => (
                    <div key={idx} className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Public Evidence URLs */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Publicly Observable Evidence URLs
              </span>
              <ul className="space-y-1.5">
                {member.evidenceUrls.map((url, i) => (
                  <li key={i}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:underline flex items-center gap-1.5 font-mono text-xs break-all"
                    >
                      <Globe className="w-3.5 h-3.5 shrink-0" />
                      <span>{url}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Circle Invariant Notice */}
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/25 text-purple-200 text-xs">
              <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider block mb-1">
                Circle Eligibility Invariant
              </span>
              <p className="text-slate-200 font-medium">
                "Circle eligibility is based on verified Dlicom membership plus observable public X interaction."
              </p>
            </div>

            {/* Timestamps and Freshness */}
            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase block">Source Freshness</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {member.sourceFreshness}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase block">Last Verified</span>
                <span className="text-slate-200 text-[11px]">
                  {new Date(member.lastVerifiedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Conflicts History if any */}
            {member.conflictHistory && member.conflictHistory.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <span className="text-[10px] font-mono text-amber-300 uppercase tracking-wider block">
                  Deterministic Conflict Resolution Log
                </span>
                {member.conflictHistory.map((c, idx) => (
                  <div key={idx} className="text-[11px] text-slate-300 font-mono">
                    • {c.field}: Resolved to "{c.resolvedVal || c.newValue}" via {c.resolutionRationale || c.reason}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card Footer Actions */}
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
            <button
              onClick={handleShare}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 transition-colors flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Link Copied!' : 'Share Passport'}</span>
            </button>

            <button
              onClick={() => onNavigate('/registry')}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white transition-colors"
            >
              All Community Members
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
