import React, { useState } from 'react';
import { Fingerprint } from 'lucide-react';
import type { MascotVariant } from '../../types/mascot';
import './mascot.css';

interface MascotVisualProps {
  mascot: MascotVariant;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showDetails?: boolean;
  className?: string;
  animate?: boolean;
}

export const MascotVisual: React.FC<MascotVisualProps> = ({
  mascot,
  size = 'hero',
  showDetails = true,
  className = '',
  animate = true,
}) => {
  const { visual, archetypeLabel, badgeName, mascotId, username } = mascot;
  const { colorTheme, characterImage, equipment, pose } = visual;
  const [loadedImage, setLoadedImage] = useState<string | null>(null);
  const imageLoaded = loadedImage === characterImage;

  // Responsive container sizing calibrated to character proportions
  const isHero = size === 'hero';
  const containerClasses = {
    sm: 'w-28 h-36 rounded-2xl border border-white/10 overflow-hidden',
    md: 'w-52 h-[300px] rounded-2xl border border-white/10 overflow-hidden',
    lg: 'w-72 h-[440px] rounded-3xl border border-white/10 overflow-hidden',
    hero: 'w-full max-w-[600px] aspect-square rounded-[2.5rem]',
  }[size];

  return (
    <div
      className={`mascot-collectible-stage relative select-none flex flex-col items-center justify-center transition-all ${containerClasses} ${className}`}
      style={
        isHero
          ? {
              background: 'transparent',
              border: 'none',
              boxShadow: 'none',
            }
          : {
              background: `radial-gradient(circle at 50% 30%, ${colorTheme.badgeBg} 0%, rgba(8, 6, 18, 0.98) 100%)`,
              borderColor: colorTheme.border,
              boxShadow: `0 24px 64px -16px ${colorTheme.glow}, inset 0 0 50px rgba(0, 0, 0, 0.85)`,
              borderWidth: '1.5px',
            }
      }
    >
      {/* 1. Atmospheric Sci-Fi Stage Lighting & Volumetric Depth */}
      <div
        className="mascot-ambient-cone pointer-events-none absolute inset-0 opacity-50 blur-3xl"
        style={{
          background: `radial-gradient(circle at 50% 45%, ${colorTheme.primary}28 0%, ${colorTheme.secondary}12 40%, transparent 70%)`,
        }}
      />
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ backgroundColor: colorTheme.secondary }}
      />

      {/* 2. Top Header HUD Bar (Authenticity Tag & Mascot ID) */}
      {showDetails && size !== 'sm' && (
        <div className="relative z-20 w-full px-4 pt-3.5 pb-1 flex items-center justify-between pointer-events-none shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono font-bold text-white shadow-lg">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: colorTheme.primary }}
            />
            <span className="tracking-wider uppercase">{archetypeLabel}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-cyan-300 shadow-lg">
            <Fingerprint className="w-3 h-3 text-slate-400" />
            <span>{mascotId}</span>
          </div>
        </div>
      )}

      {/* 3. The Full Dlicom Mascot Collectible Character Figure */}
      <div className={`relative z-10 w-full flex-1 min-h-0 flex items-center justify-center ${isHero ? 'p-0' : 'px-4 py-2'}`}>
        {/* Soft Backing Halo matching role aura */}
        <div
          className="absolute inset-4 rounded-full blur-3xl opacity-30 pointer-events-none transition-opacity"
          style={{ backgroundColor: colorTheme.primary }}
        />

        {/* Stage Pedestal Floor Light under character base */}
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 w-56 sm:w-72 h-8 rounded-[100%] blur-xl pointer-events-none opacity-60"
          style={{ background: colorTheme.primary }}
        />

        <div
          className={`relative w-full h-full flex items-center justify-center ${
            animate ? 'animate-[floatMascot_5s_ease-in-out_infinite]' : ''
          }`}
        >
          <img
            key={characterImage}
            src={characterImage}
            alt={`${badgeName} for @${username}`}
            onLoad={() => setLoadedImage(characterImage)}
            className={`w-full h-full max-w-full max-h-full aspect-square object-contain drop-shadow-[0_24px_50px_rgba(0,0,0,0.92)] filter transition-all duration-500 ${
              imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          />

          {/* Loading Shimmer while asset loads */}
          {!imageLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div
                className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: colorTheme.border, borderTopColor: colorTheme.primary }}
              />
              <span className="text-xs font-mono text-slate-400">Loading Dlicom Character...</span>
            </div>
          )}
        </div>
      </div>

      {/* 4. Clean Character Nameplate Engraved on Pedestal Base (non-hero only) */}
      {showDetails && size !== 'sm' && !isHero && (
        <div className="relative z-20 w-full shrink-0 px-4 py-3 bg-gradient-to-t from-[#080516] via-[#09061a]/95 to-transparent border-t border-white/10 backdrop-blur-md flex flex-col items-center text-center">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-black text-white tracking-wide">
              {badgeName}
            </span>
            <span className="text-[11px] font-mono text-purple-300">
              @{username}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono text-slate-400">
            <span style={{ color: colorTheme.accent }}>{pose}</span>
            <span className="text-white/20">•</span>
            <span className="text-slate-300 truncate max-w-[200px]">{equipment}</span>
          </div>
        </div>
      )}

      {/* 5. Subtle Holographic Perimeter Shimmer */}
      {!isHero && <div className="mascot-holo-border pointer-events-none" />}
    </div>
  );
};
