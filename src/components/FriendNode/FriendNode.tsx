import React, { useState } from 'react';
import type { DlicomUser } from '../../types/circle';
import { Sparkles, Users, ShieldCheck, MessageCircle, Repeat, Quote, AtSign } from 'lucide-react';

interface FriendNodeProps {
  user: DlicomUser;
  isSelected: boolean;
  isHovered: boolean;
  isDimmed: boolean;
  onSelect: (user: DlicomUser) => void;
  onHoverStart: (user: DlicomUser) => void;
  onHoverEnd: () => void;
}

export const FriendNode: React.FC<FriendNodeProps> = ({
  user,
  isSelected,
  isHovered,
  isDimmed,
  onSelect,
  onHoverStart,
  onHoverEnd,
}) => {
  const [imgError, setImgError] = useState(false);

  const isCenter = !!user.isCurrentUser;
  const nodeSize = user.nodeSize || (isCenter ? 168 : 88);
  const halfSize = nodeSize / 2;

  const initials = (user.displayName || user.username || 'X')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const categoryColor =
    user.highlightColor ||
    (user.category === 'creators'
      ? '#ec4899'
      : user.category === 'builders'
      ? '#38bdf8'
      : user.category === 'communities'
      ? '#10b981'
      : '#a855f7');

  const interactionTypes = user.interactionTypes || [];

  return (
    <div
      style={{
        transform: `translate(${user.x - halfSize}px, ${user.y - halfSize}px)`,
        width: `${nodeSize}px`,
        height: `${nodeSize}px`,
        zIndex: isCenter ? 25 : isSelected ? 30 : isHovered ? 35 : 15,
      }}
      className={`absolute top-0 left-0 transition-opacity duration-300 ${
        isDimmed ? 'opacity-15 pointer-events-none' : 'opacity-100'
      }`}
      onMouseEnter={() => onHoverStart(user)}
      onMouseLeave={onHoverEnd}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(user);
      }}
    >
      {/* ======================================================== */}
      {/* 1. CENTRAL HERO "YOU" NODE GLOW & PULSE RINGS */}
      {/* ======================================================== */}
      {isCenter && (
        <>
          {/* Deep atmospheric cosmic nebula aura behind YOU */}
          <div
            className="absolute -inset-16 rounded-full pointer-events-none animate-pulse-outer-ring"
            style={{
              background: 'radial-gradient(circle, rgba(168, 85, 247, 0.45) 0%, rgba(56, 189, 248, 0.25) 40%, transparent 75%)',
              filter: 'blur(20px)',
            }}
          />
          {/* Luminous breathing halo */}
          <div
            className="absolute -inset-4 rounded-full pointer-events-none animate-pulse-ring"
            style={{
              background: 'radial-gradient(circle, rgba(192, 132, 252, 0.3) 0%, transparent 70%)',
              filter: 'blur(8px)',
            }}
          />
          {/* Thin cosmic orbit boundary */}
          <div className="absolute -inset-2 rounded-full border border-cyan-400/30 pointer-events-none" />
        </>
      )}

      {/* ======================================================== */}
      {/* 2. SURROUNDING NODE GLOW (Luminous colored halo) */}
      {/* ======================================================== */}
      {!isCenter && (
        <div
          className={`absolute rounded-full pointer-events-none transition-all duration-300 ${
            isHovered || isSelected ? '-inset-4 opacity-90 blur-[14px]' : '-inset-2 opacity-50 blur-[8px]'
          }`}
          style={{
            backgroundColor: `${categoryColor}${isHovered || isSelected ? '80' : '45'}`,
          }}
        />
      )}

      {/* ======================================================== */}
      {/* 3. MAIN AVATAR CONTAINER */}
      {/* ======================================================== */}
      <div
        className={`relative w-full h-full rounded-full cursor-pointer transition-transform duration-200 flex items-center justify-center ${
          isCenter
            ? 'p-[4px] shadow-2xl hover:scale-[1.03]'
            : isSelected
            ? 'p-[3.5px] scale-110 shadow-2xl'
            : isHovered
            ? 'p-[3px] scale-108 shadow-xl'
            : 'p-[2.5px] hover:scale-105'
        }`}
        style={
          isCenter
            ? {
                background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 35%, #c084fc 70%, #ec4899 100%)',
                boxShadow: '0 0 45px rgba(168, 85, 247, 0.5), 0 0 80px rgba(56, 189, 248, 0.3)',
              }
            : isSelected
            ? {
                background: '#ffffff',
                boxShadow: `0 0 35px ${categoryColor}, 0 0 60px ${categoryColor}60`,
              }
            : isHovered
            ? {
                background: `linear-gradient(135deg, #ffffff 0%, ${categoryColor} 100%)`,
                boxShadow: `0 0 30px ${categoryColor}, 0 0 50px ${categoryColor}40`,
              }
            : {
                background: `linear-gradient(135deg, ${categoryColor} 0%, ${categoryColor}aa 100%)`,
                boxShadow: `0 0 18px ${categoryColor}50`,
              }
        }
      >
        {/* Avatar Inner Mask */}
        <div className="w-full h-full rounded-full overflow-hidden bg-[#090715] flex items-center justify-center relative shadow-inner">
          {!imgError && user.avatar ? (
            <img
              src={user.avatar}
              alt={user.displayName || user.username}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover select-none pointer-events-none"
              loading="eager"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, #090715 0%, ${categoryColor}40 100%)`,
              }}
            >
              <span
                className={`font-display font-extrabold text-white tracking-wider ${
                  isCenter ? 'text-3xl' : nodeSize >= 100 ? 'text-xl' : nodeSize >= 85 ? 'text-lg' : 'text-sm'
                }`}
              >
                {initials}
              </span>
            </div>
          )}

          {/* Inner subtle rim highlight */}
          <div className="absolute inset-0 rounded-full pointer-events-none border border-white/20" />
        </div>

        {/* Official Dlicom Pill Badge */}
        {!isCenter && user.communityClassification === 'official' && (
          <div
            className="absolute -top-2.5 px-2 py-0.5 rounded-full text-slate-950 font-display font-extrabold text-[8px] tracking-wider uppercase shadow-xl flex items-center gap-1 border border-amber-300/60 z-30"
            style={{
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            }}
          >
            <ShieldCheck className="w-2.5 h-2.5 text-slate-950" />
            <span>OFFICIAL</span>
          </div>
        )}

        {/* Online Status Live Dot */}
        {user.isOnline && (
          <span
            className={`absolute bottom-1 right-1 rounded-full bg-emerald-400 ring-2 ring-[#07050f] ${
              isCenter ? 'w-4 h-4' : 'w-3 h-3'
            }`}
            title="Active"
          >
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
          </span>
        )}

        {/* Central "YOU" Radiant Pill Badge */}
        {isCenter && (
          <div
            className="absolute -bottom-3 px-3 py-0.5 rounded-full text-slate-950 font-display font-extrabold text-[10px] tracking-wider uppercase shadow-xl flex items-center gap-1 border border-white/40"
            style={{
              background: 'linear-gradient(135deg, #38bdf8 0%, #c084fc 100%)',
            }}
          >
            <Sparkles className="w-2.5 h-2.5 text-slate-950" />
            <span>YOU</span>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 4. PROMINENT READABLE LABELS DIRECTLY BELOW AVATAR */}
      {/* ======================================================== */}
      <div
        className={`absolute top-full left-1/2 -translate-x-1/2 pointer-events-none transition-all duration-200 text-center whitespace-nowrap ${
          isCenter ? 'pt-3.5' : 'pt-2'
        }`}
      >
        {/* Username: @username with strong contrast and readable 13-14px font */}
        <p
          className={`font-mono font-bold tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,1)] ${
            isCenter
              ? 'text-[14px] text-cyan-300 font-display'
              : isHovered || isSelected
              ? 'text-[13px] text-cyan-200'
              : 'text-[12px] text-white'
          }`}
        >
          @{user.username}
        </p>

        {/* Display Name: Secondary clean text (11-12px) */}
        <p
          className={`font-sans tracking-normal truncate drop-shadow-[0_1px_4px_rgba(0,0,0,1)] ${
            isCenter
              ? 'text-[12px] text-slate-300 font-medium max-w-[200px]'
              : 'text-[11px] text-slate-300/90 max-w-[130px]'
          }`}
        >
          {user.displayName}
        </p>
      </div>

      {/* ======================================================== */}
      {/* 5. HOVER EXPERIENCE: FLOATING RICH PROFILE CARD */}
      {/* ======================================================== */}
      {isHovered && !isSelected && (
        <div
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-3.5 w-64 p-3.5 rounded-2xl pointer-events-none shadow-2xl animate-in fade-in zoom-in-95 duration-200"
          style={{
            background: 'rgba(10, 8, 22, 0.94)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            border: `1.5px solid ${categoryColor}70`,
            boxShadow: `0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px ${categoryColor}30`,
          }}
        >
          {/* Card Header: Avatar, Name, Handle, Verified */}
          <div className="flex items-center gap-2.5 mb-2.5">
            <img
              src={user.avatar}
              alt={user.displayName}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-white/20 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-xs text-white truncate">
                  {user.displayName}
                </span>
                {user.verified && (
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="text-[11px] text-cyan-300 font-mono truncate">
                  @{user.username}
                </p>
                {user.communityClassification && !isCenter && (
                  <span className={`text-[8px] font-mono font-semibold px-1.5 py-0.2 rounded-full border shrink-0 ${
                    user.communityClassification === 'official'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : user.communityClassification === 'community_role'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                      : user.communityClassification === 'community_friend'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : user.communityClassification === 'candidate'
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                  }`}>
                    {user.communityClassification === 'official' ? 'Official' :
                     user.communityClassification === 'community_role' ? 'Role' :
                     user.communityClassification === 'community_friend' ? 'Community' :
                     user.communityClassification === 'candidate' ? 'Candidate' : 'External'}
                  </span>
                )}
                {user.role && !isCenter && (
                  <span className="text-[8px] font-mono px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0 truncate max-w-[120px]">
                    {user.role}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Short Bio */}
          {user.bio && (
            <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed mb-2.5 font-sans">
              {user.bio}
            </p>
          )}

          {/* Interaction Breakdown Chips */}
          {interactionTypes.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2.5">
              {interactionTypes.map((type) => (
                <span
                  key={type}
                  className="inline-flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded-full capitalize"
                  style={{
                    background: `${categoryColor}25`,
                    color: '#ffffff',
                    border: `1px solid ${categoryColor}50`,
                  }}
                >
                  {type === 'reply' && <MessageCircle className="w-2.5 h-2.5" />}
                  {type === 'repost' && <Repeat className="w-2.5 h-2.5" />}
                  {type === 'quote' && <Quote className="w-2.5 h-2.5" />}
                  {type === 'mention' && <AtSign className="w-2.5 h-2.5" />}
                  <span>{type}</span>
                </span>
              ))}
            </div>
          )}

          {/* Card Footer: Total interactions & Score */}
          <div className="flex items-center justify-between text-[10px] pt-2 border-t border-white/10 text-slate-400">
            <span className="flex items-center gap-1 font-mono">
              <Users className="w-3 h-3 text-slate-400" />
              <span>{user.mutualFriendsCount} public events</span>
            </span>
            <span
              className="flex items-center gap-1 font-semibold font-mono px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${categoryColor}25`,
                color: categoryColor,
              }}
            >
              <Sparkles className="w-2.5 h-2.5" />
              <span>Score {user.interactionScore ?? user.connectionStrength}</span>
            </span>
          </div>

          {/* Click cue */}
          <div className="text-center mt-1.5 pt-1 border-t border-white/5">
            <span className="text-[9px] text-slate-400 font-mono">Click to view profile & timeline</span>
          </div>
        </div>
      )}
    </div>
  );
};
