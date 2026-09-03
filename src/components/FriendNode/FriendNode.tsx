import React, { useState } from 'react';
import type { DlicomUser } from '../../types/circle';
import { Sparkles, Users, ShieldCheck } from 'lucide-react';

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

  // Node sizing: center is 86px, close circle 56px, collaborators 48px, extended 42px
  const nodeSize = isCenter
    ? 86
    : user.connectionStrength >= 80
    ? 56
    : user.connectionStrength >= 50
    ? 48
    : 42;

  const halfSize = nodeSize / 2;

  const initials = user.displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const categoryColor =
    user.category === 'creators'
      ? '#f43f5e'
      : user.category === 'builders'
      ? '#38bdf8'
      : user.category === 'communities'
      ? '#10b981'
      : '#a855f7';

  return (
    <div
      style={{
        transform: `translate(${user.x - halfSize}px, ${user.y - halfSize}px)`,
        width: `${nodeSize}px`,
        height: `${nodeSize}px`,
      }}
      className={`absolute top-0 left-0 transition-opacity duration-300 ${
        isDimmed ? 'opacity-20 pointer-events-none' : 'opacity-100'
      }`}
      onMouseEnter={() => onHoverStart(user)}
      onMouseLeave={onHoverEnd}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(user);
      }}
    >
      {/* Central "YOU" Pulsing Soft Aura */}
      {isCenter && (
        <>
          <div
            className="absolute -inset-8 rounded-full bg-gradient-to-r from-cyan-500/25 to-purple-500/25 animate-pulse-outer-ring pointer-events-none"
            style={{ filter: 'blur(14px)' }}
          />
          <div
            className="absolute -inset-3 rounded-full border border-cyan-400/40 animate-pulse-ring pointer-events-none"
          />
        </>
      )}

      {/* Friend Node Glow on Hover or Selection */}
      {(isHovered || isSelected) && !isCenter && (
        <div
          className="absolute -inset-3.5 rounded-full pointer-events-none transition-all duration-300 filter blur-[10px]"
          style={{
            backgroundColor: `${user.highlightColor || categoryColor}55`,
          }}
        />
      )}

      {/* Main Avatar Container */}
      <div
        className={`relative w-full h-full rounded-full cursor-pointer transition-all duration-300 flex items-center justify-center ${
          isCenter
            ? 'p-1 bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-500 shadow-2xl shadow-cyan-500/30'
            : isSelected
            ? 'p-[2.5px] bg-cyan-400 scale-115 shadow-xl shadow-cyan-400/50'
            : isHovered
            ? 'p-[2px] bg-white scale-110 shadow-lg shadow-white/30'
            : 'p-[1.5px] hover:scale-105'
        }`}
        style={
          !isCenter && !isSelected && !isHovered
            ? {
                backgroundColor: `${user.highlightColor || categoryColor}90`,
                boxShadow: `0 0 12px ${user.highlightColor || categoryColor}30`,
              }
            : {}
        }
      >
        <div className="w-full h-full rounded-full overflow-hidden bg-[#070a14] flex items-center justify-center">
          {!imgError && user.avatar ? (
            <img
              src={user.avatar}
              alt={user.displayName}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover select-none pointer-events-none"
              loading="lazy"
            />
          ) : (
            <span className="font-display font-bold text-xs text-white">
              {initials}
            </span>
          )}
        </div>

        {/* Online Status Indicator */}
        {user.isOnline && (
          <span
            className={`absolute bottom-0 right-0 rounded-full bg-emerald-400 ring-2 ring-[#070a14] ${
              isCenter ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5'
            }`}
          >
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
          </span>
        )}

        {/* Central "YOU" Crown Badge */}
        {isCenter && (
          <div className="absolute -bottom-2 px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-display font-extrabold text-[9px] tracking-wider shadow-md uppercase border border-cyan-200">
            YOU
          </div>
        )}
      </div>

      {/* Label under node (Name & Handle) */}
      <div
        className={`absolute top-full left-1/2 -translate-x-1/2 pt-1 pointer-events-none transition-all duration-200 whitespace-nowrap text-center ${
          isCenter
            ? 'opacity-100 pt-2'
            : isHovered || isSelected
            ? 'opacity-100 scale-105'
            : 'opacity-85'
        }`}
      >
        <p className={`font-semibold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] ${isCenter ? 'text-xs text-cyan-300 font-display font-bold' : 'text-[11px]'}`}>
          {user.displayName}
        </p>
        <p className="text-[9px] text-slate-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] font-mono">
          @{user.username}
        </p>
      </div>

      {/* Hover Micro-Card / Popover Tooltip */}
      {isHovered && !isSelected && (
        <div
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 p-3 rounded-2xl glass-panel pointer-events-none shadow-2xl animate-in fade-in zoom-in-95 duration-200"
          style={{
            borderColor: `${user.highlightColor || categoryColor}50`,
          }}
        >
          <div className="flex items-center gap-2.5 mb-2">
            <img
              src={user.avatar}
              alt={user.displayName}
              className="w-9 h-9 rounded-full object-cover ring-1 ring-white/20"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-xs text-white truncate">
                  {user.displayName}
                </span>
                {user.tags?.some((t) => t.toLowerCase().includes('demo') || t.toLowerCase().includes('simulated')) ? (
                  <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0">
                    Demo
                  </span>
                ) : (
                  <ShieldCheck className="w-3 h-3 text-cyan-400 shrink-0" />
                )}
              </div>
              <p className="text-[10px] text-cyan-400 font-mono truncate">
                @{user.username}
              </p>
            </div>
          </div>

          <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed mb-2">
            {user.bio}
          </p>

          <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-white/10 text-slate-400">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-slate-400" />
              {user.mutualFriendsCount} interactions
            </span>
            <span
              className="flex items-center gap-1 font-semibold font-mono"
              style={{ color: user.highlightColor || categoryColor }}
            >
              <Sparkles className="w-3 h-3" />
              Score {user.interactionScore ?? user.connectionStrength}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
