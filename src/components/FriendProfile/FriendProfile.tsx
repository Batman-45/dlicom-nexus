import React, { useState } from 'react';
import type { DlicomUser } from '../../types/circle';
import {
  X,
  Sparkles,
  Users,
  Send,
  ExternalLink,
  ShieldCheck,
  MapPin,
  Calendar,
  Heart,
  Globe,
  Share2,
  Zap,
  Activity,
  Code,
  Palette,
} from 'lucide-react';

interface FriendProfileProps {
  user: DlicomUser | null;
  onClose: () => void;
  onSelectMutual?: (userId: string) => void;
  isMockData?: boolean;
}

export const FriendProfile: React.FC<FriendProfileProps> = ({
  user,
  onClose,
  onSelectMutual,
  isMockData = false,
}) => {
  const [sparkCount, setSparkCount] = useState<number>(0);
  const [hasSparked, setHasSparked] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  if (!user) return null;

  const isCenter = !!user.isCurrentUser;

  const handleSendSpark = () => {
    if (!hasSparked) {
      setSparkCount((prev) => prev + 1);
      setHasSparked(true);
    }
  };

  const getTierLabel = (strength: number) => {
    if (strength >= 85) return 'High Interaction';
    if (strength >= 60) return 'Frequent Interaction';
    return 'Public Mention';
  };

  const categoryColor =
    user.category === 'creators'
      ? '#f43f5e'
      : user.category === 'builders'
      ? '#38bdf8'
      : user.category === 'communities'
      ? '#10b981'
      : '#a855f7';

  return (
    <>
      {/* Backdrop for mobile bottom sheet */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
      />

      {/* Slide-in Profile Panel (Right on desktop, Bottom Sheet on mobile) */}
      <div
        className="fixed z-50 transition-all duration-300
          bottom-0 left-0 right-0 max-h-[85vh] rounded-t-3xl border-t border-white/10 overflow-y-auto
          md:bottom-4 md:right-4 md:top-20 md:left-auto md:w-96 md:max-h-[calc(100vh-6rem)] md:rounded-3xl md:border md:border-white/10
          glass-panel shadow-2xl animate-in slide-in-from-bottom md:slide-in-from-right duration-300"
      >
        {/* Banner Image */}
        <div className="relative h-28 w-full overflow-hidden rounded-t-3xl bg-slate-950">
          {user.banner ? (
            <img
              src={user.banner}
              alt="Profile Cover"
              className="w-full h-full object-cover opacity-60"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-cyan-950 via-slate-900 to-purple-950" />
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-950/70 hover:bg-slate-900 border border-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer backdrop-blur-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="px-5 pb-6 pt-0 relative">
          {/* Avatar and Action row */}
          <div className="flex items-end justify-between -mt-12 mb-3">
            <div className="relative">
              <div
                className="w-20 h-20 rounded-2xl p-1 bg-slate-950 border-2 overflow-hidden shadow-2xl"
                style={{ borderColor: user.highlightColor || categoryColor }}
              >
                <img
                  src={user.avatar}
                  alt={user.displayName}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              {user.isOnline && (
                <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-emerald-500 text-[9px] font-semibold text-slate-950 flex items-center gap-1 border-2 border-slate-950 shadow">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse" />
                  Live
                </div>
              )}
            </div>

            {/* Spark & Share actions */}
            <div className="flex items-center gap-1.5 pb-1">
              {!isCenter && (
                <button
                  onClick={handleSendSpark}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    hasSparked
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-white/10 hover:bg-white/15 text-white border border-white/15 hover:border-amber-400/50'
                  }`}
                >
                  <Zap
                    className={`w-3.5 h-3.5 ${
                      hasSparked ? 'text-amber-400 fill-amber-400' : 'text-amber-300'
                    }`}
                  />
                  <span>{(user.sparksReceived || 0) + sparkCount}</span>
                </button>
              )}
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                title={isFavorite ? 'Favorited' : 'Favorite friend'}
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                  isFavorite
                    ? 'bg-pink-500/20 text-pink-400 border-pink-500/40'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-pink-400' : ''}`} />
              </button>
              <button
                title="Share link"
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Name & Handle */}
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-lg text-white tracking-tight">
                {user.displayName}
              </h2>
              {isMockData ? (
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Demo Identity
                </span>
              ) : user.verified ? (
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-cyan-400" />
                  Verified on X
                </span>
              ) : null}
            </div>
            <p className="text-xs font-mono text-cyan-400">@{user.username}</p>
          </div>

          {/* Bio statement */}
          {user.bio && (
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/5 mb-3.5">
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "{user.bio}"
              </p>
            </div>
          )}

          {/* Role and Meta pills */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
            <span
              className="px-2.5 py-0.8 rounded-full text-[11px] font-semibold border"
              style={{
                backgroundColor: `${user.highlightColor || categoryColor}15`,
                color: user.highlightColor || categoryColor,
                borderColor: `${user.highlightColor || categoryColor}40`,
              }}
            >
              {user.role}
            </span>
            {user.location && (
              <span className="flex items-center gap-1 text-[10px] text-slate-400 px-2 py-0.5 rounded-full bg-white/5">
                <MapPin className="w-3 h-3 text-slate-400" />
                {user.location}
              </span>
            )}
            <span className="flex items-center gap-1 text-[10px] text-slate-400 px-2 py-0.5 rounded-full bg-white/5">
              <Calendar className="w-3 h-3 text-slate-400" />
              Joined {user.joinedDate}
            </span>
          </div>

          {/* Interaction Score Meter */}
          {!isCenter && (
            <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-cyan-500/20 mb-3.5">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Interaction Score
                </span>
                <span className="font-mono font-bold text-cyan-300">
                  {user.interactionScore ?? user.connectionStrength}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mb-1.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-500"
                  style={{ width: `${user.interactionScore ?? user.connectionStrength}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Observed Level: <strong className="text-white">{getTierLabel(user.interactionScore ?? user.connectionStrength)}</strong></span>
                <span>Orbit Distance: <strong className="text-cyan-400 font-mono">{user.orbitRadius}px</strong></span>
              </div>
            </div>
          )}

          {/* Network Stats Grid */}
          <div className="grid grid-cols-2 gap-2 mb-3.5">
            <div className="p-2.5 rounded-2xl bg-slate-900/40 border border-white/5 text-center">
              <span className="block font-display font-bold text-base text-white">
                {isCenter && user.followersCount !== undefined
                  ? user.followersCount.toLocaleString()
                  : user.friendsCount}
              </span>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider">
                {isCenter && user.followersCount !== undefined ? 'Followers' : 'X Interactions'}
              </span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-900/40 border border-white/5 text-center">
              <span className="block font-display font-bold text-base text-cyan-400">
                {isCenter && user.followingCount !== undefined
                  ? user.followingCount.toLocaleString()
                  : (user.interactionScore ?? user.connectionStrength)}
              </span>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider">
                {isCenter && user.followingCount !== undefined ? 'Following' : 'Interaction Score'}
              </span>
            </div>
          </div>

          {/* Mutual Friends Stack */}
          {user.mutualFriendsList && user.mutualFriendsList.length > 0 && (
            <div className="mb-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  Shared Interactions
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {user.mutualFriendsList.length} shown
                </span>
              </div>
              <div className="flex items-center gap-2">
                {user.mutualFriendsList.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => onSelectMutual?.(m.id)}
                    className="group relative cursor-pointer"
                    title={m.name}
                  >
                    <img
                      src={m.avatar}
                      alt={m.name}
                      className="w-7 h-7 rounded-full object-cover ring-2 ring-slate-800 hover:ring-cyan-400 transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity Section */}
          {user.recentActivity && user.recentActivity.length > 0 && (
            <div className="mb-3.5">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-cyan-400" />
                {isMockData ? 'Demo Activity' : 'Recent Activity'}
              </p>
              <div className="flex flex-col gap-1.5">
                {user.recentActivity.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-900/50 border border-white/5 text-[11px]"
                  >
                    <div className="flex items-center gap-2 text-slate-300">
                      {act.iconType === 'art' ? (
                        <Palette className="w-3 h-3 text-pink-400 shrink-0" />
                      ) : act.iconType === 'code' ? (
                        <Code className="w-3 h-3 text-cyan-400 shrink-0" />
                      ) : (
                        <Zap className="w-3 h-3 text-amber-400 shrink-0" />
                      )}
                      <span className="truncate max-w-[200px]">{act.action}</span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono shrink-0">
                      {act.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags & Interests */}
          {user.tags && user.tags.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1.5">
                {user.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/5 text-[10px] text-slate-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Social Links */}
          {user.socials && (
            <div className="flex items-center gap-2 mb-4">
              {user.socials.twitter && (
                <a
                  href={`https://twitter.com/${user.socials.twitter}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-[10px] text-slate-300 hover:text-cyan-300 border border-white/5 transition-all"
                >
                  <Globe className="w-3 h-3" />
                  @{user.socials.twitter}
                </a>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
            {!isCenter ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() =>
                    isMockData
                      ? alert(`[Demo Preview] Direct messaging with @${user.username} is simulated.`)
                      : alert(`Opening encrypted Dlicom direct chat with @${user.username}`)
                  }
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-display font-semibold text-xs transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Message</span>
                </button>
                <button
                  onClick={() =>
                    isMockData
                      ? alert(`[Demo Mode] Pinned @${user.username} (local preview).`)
                      : alert(`Pinned @${user.username} to your local workspace`)
                  }
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/15 text-white font-display font-semibold text-xs transition-all cursor-pointer"
                >
                  <Heart className="w-3.5 h-3.5 text-pink-400" />
                  <span>Pin Contact</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() =>
                  isMockData
                    ? alert('[Demo Mode] Profile customizer preview.')
                    : alert('Opening Circle & Profile Customizer')
                }
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-display font-semibold text-xs transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
              >
                <span>Edit Dlicom Profile & Circle</span>
              </button>
            )}

            <button
              onClick={() =>
                isMockData
                  ? alert(`[Demo Preview] @${user.username}'s on-chain profile is simulated in offline mock mode. No blockchain record exists.`)
                  : alert(`Exploring @${user.username}'s on-chain Dlicom profile & social graph`)
              }
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <span>{isMockData ? 'View On-Chain Profile (Demo Preview)' : 'View On-Chain Profile'}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
