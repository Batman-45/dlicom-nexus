import React, { useState } from 'react';
import { Download, Copy, Check, Sparkles, ShieldCheck, AlertCircle } from 'lucide-react';
import type { MascotVariant } from '../../types/mascot';
import {
  exportHeroShareCardAsPng,
  getHeroShareUrl,
  getHeroXShareIntentUrl,
} from '../../services/mascot/heroCardExport';

interface HeroShareCardProps {
  mascot: MascotVariant;
  className?: string;
  showActions?: boolean;
}

export const HeroShareCard: React.FC<HeroShareCardProps> = ({
  mascot,
  className = '',
  showActions = true,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    username,
    heroTitle,
    title,
    heroPillar,
    mascotId,
    variantName,
    familyName,
    archetypeLabel,
    personality,
    visual,
  } = mascot;

  const primaryColor = visual?.colorTheme?.primary || '#a855f7';
  const secondaryColor = visual?.colorTheme?.secondary || '#6366f1';
  const borderColor = visual?.colorTheme?.border || 'rgba(168, 85, 247, 0.4)';
  const glowColor = visual?.colorTheme?.glow || 'rgba(168, 85, 247, 0.2)';
  const rawPillar = heroPillar || 'DLICOM_HERO_CORE';
  const pillarDisplay = rawPillar.replace('DLICOM_HERO_', '');
  const cleanUsername = username.replace(/^@/, '');
  const displayTitle = heroTitle || title || 'Dlicom Hero';

  // 1. Download Hero as Image (PNG)
  const handleDownload = async () => {
    try {
      setActionError(null);
      setDownloading(true);
      await exportHeroShareCardAsPng(mascot);
    } catch (err) {
      console.warn('Hero share card download error:', err);
      setActionError('Could not export share card directly. You can copy the link or share on X.');
    } finally {
      setDownloading(false);
    }
  };

  // 2. Share on X (Twitter Web Intent)
  const handleShareOnX = () => {
    try {
      setActionError(null);
      const url = getHeroXShareIntentUrl(mascot);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.warn('Share on X intent error:', err);
      setActionError('Could not open X intent automatically.');
    }
  };

  // 3. Copy Hero Link
  const handleCopyLink = async () => {
    try {
      setActionError(null);
      const shareUrl = getHeroShareUrl(cleanUsername);

      let copiedSuccess = false;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(shareUrl);
          copiedSuccess = true;
        } catch {
          // Fallback if document is unfocused or clipboard permission denied
        }
      }

      if (!copiedSuccess) {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Copy link error:', err);
      setActionError('Clipboard copy failed. Link: ' + getHeroShareUrl(cleanUsername));
    }
  };

  return (
    <div className={`flex flex-col items-center w-full max-w-xl mx-auto space-y-4 ${className}`}>
      {/* ========================================================================= */}
      {/* COLLECTIBLE HERO SHARE CARD                                               */}
      {/* ========================================================================= */}
      <div
        id="hero-share-card"
        data-testid="hero-share-card"
        className="hero-share-card relative w-full rounded-3xl overflow-hidden text-left transition-all duration-300"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, #100b26 0%, #080614 70%, #04030a 100%)',
          border: `1.5px solid ${borderColor}`,
          boxShadow: `0 24px 60px -12px ${glowColor}, 0 0 0 1px rgba(255, 255, 255, 0.06) inset`,
        }}
      >
        {/* Subtle Ambient Top Accent */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ background: primaryColor }}
        />

        {/* Framing Corner Brackets */}
        <div className="absolute top-3.5 left-3.5 w-3.5 h-3.5 border-t-2 border-l-2 pointer-events-none" style={{ borderColor: primaryColor }} />
        <div className="absolute top-3.5 right-3.5 w-3.5 h-3.5 border-t-2 border-r-2 pointer-events-none" style={{ borderColor: primaryColor }} />
        <div className="absolute bottom-3.5 left-3.5 w-3.5 h-3.5 border-b-2 border-l-2 pointer-events-none" style={{ borderColor: primaryColor }} />
        <div className="absolute bottom-3.5 right-3.5 w-3.5 h-3.5 border-b-2 border-r-2 pointer-events-none" style={{ borderColor: primaryColor }} />

        <div className="p-6 sm:p-7 relative z-10 space-y-5">
          {/* Card Header Bar */}
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3.5">
            <div className="flex items-center gap-2.5">
              <span className="font-black text-sm tracking-widest text-white uppercase">
                DLICOM
              </span>
              <span
                className="inline-flex items-center gap-1 text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full border shadow-sm"
                style={{
                  backgroundColor: `${primaryColor}22`,
                  borderColor: `${primaryColor}55`,
                  color: '#f3e8ff',
                }}
              >
                <Sparkles className="w-2.5 h-2.5" style={{ color: primaryColor }} />
                Dlicom Hero
              </span>
            </div>

            <span
              id="share-card-mascot-id"
              className="text-[11px] font-mono font-bold text-slate-400 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-md"
            >
              {mascotId}
            </span>
          </div>

          {/* Hero Artwork Spotlight Stage */}
          <div
            className="hero-share-card-stage relative w-full aspect-[4/3] rounded-2xl overflow-hidden flex items-center justify-center border border-white/10"
            style={{
              background: 'radial-gradient(circle at 50% 50%, #150f33 0%, #0a0718 100%)',
            }}
          >
            {/* Halo Glow */}
            <div
              className="absolute inset-0 rounded-full blur-2xl opacity-30 pointer-events-none scale-75"
              style={{
                background: `radial-gradient(circle, ${primaryColor} 0%, ${secondaryColor} 50%, transparent 80%)`,
              }}
            />

            {/* Official Dlicom Mascot Image */}
            <img
              src={visual.characterImage}
              alt={`${displayTitle} - Official Dlicom Hero artwork for @${cleanUsername}`}
              loading="eager"
              className="relative z-10 max-h-[90%] max-w-[90%] object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.7)] transition-transform duration-300 hover:scale-105"
            />

            {/* Stage bottom gradient rim */}
            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#0a0718] to-transparent pointer-events-none" />
          </div>

          {/* Dossier Information Hierarchy */}
          <div className="space-y-2.5">
            {/* Handle & Archetype Row */}
            <div className="flex items-center justify-between text-xs">
              <span
                id="share-card-handle"
                className="font-mono font-semibold"
                style={{ color: primaryColor }}
              >
                @{cleanUsername}
              </span>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-medium">
                {archetypeLabel}
              </span>
            </div>

            {/* Hero Title */}
            <div>
              <h3
                id="share-card-hero-title"
                className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight"
              >
                {displayTitle}
              </h3>
            </div>

            {/* Hero Pillar Pill & Family/Variant Line */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <span
                id="share-card-hero-pillar"
                className="inline-flex items-center gap-1 font-mono text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/35 text-cyan-300"
              >
                <ShieldCheck className="w-3 h-3 text-cyan-400 shrink-0" />
                Hero Pillar • {pillarDisplay}
              </span>

              <span className="text-xs font-mono text-slate-300">
                <strong className="text-white">{variantName}</strong>{' '}
                <span className="text-slate-500">({familyName})</span>
              </span>
            </div>

            {/* Personalized Motto */}
            {personality?.motto && (
              <p className="text-xs italic text-slate-300 pt-1 leading-relaxed border-t border-white/5 mt-2">
                &ldquo;{personality.motto}&rdquo;
              </p>
            )}
          </div>

          {/* Authentic Card Footer */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>Dlicom Protocol • Collectible Hero</span>
            <span className="text-purple-400/80">dlicom.io/mascot</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SHARING ACTION CONTROLS                                                   */}
      {/* ========================================================================= */}
      {showActions && (
        <div className="w-full space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full">
            {/* 1. Download Hero Button */}
            <button
              id="action-download-hero"
              data-testid="hero-download-btn"
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              aria-label={`Download high-resolution Hero Share Card for @${cleanUsername}`}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-bold text-xs tracking-wide shadow-md hover:shadow-purple-500/25 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-purple-400 focus:outline-none"
            >
              {downloading ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-purple-200" />
                  <span>Download Hero</span>
                </>
              )}
            </button>

            {/* 2. Share on X Button */}
            <button
              id="action-share-hero-x"
              data-testid="hero-share-x-btn"
              type="button"
              onClick={handleShareOnX}
              aria-label="Share your Dlicom Hero on X"
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#0c0f1d] hover:bg-[#15192e] border border-sky-400/30 hover:border-sky-400/60 text-sky-300 font-bold text-xs tracking-wide shadow-md transition-all duration-200 cursor-pointer focus:ring-2 focus:ring-sky-400 focus:outline-none"
            >
              <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>Share on X</span>
            </button>

            {/* 3. Copy Hero Link Button */}
            <button
              id="action-copy-hero-link"
              data-testid="hero-copy-link-btn"
              type="button"
              onClick={handleCopyLink}
              aria-label={`Copy shareable link for @${cleanUsername}`}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 hover:border-white/20 text-slate-200 font-semibold text-xs tracking-wide shadow-sm transition-all duration-200 cursor-pointer focus:ring-2 focus:ring-purple-400 focus:outline-none"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Hero link copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" />
                  <span>Copy Hero Link</span>
                </>
              )}
            </button>
          </div>

          {/* Action error banner (if any) */}
          {actionError && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs animate-in fade-in">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>{actionError}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
