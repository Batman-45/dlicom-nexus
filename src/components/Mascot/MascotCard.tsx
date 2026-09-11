import React, { useState } from 'react';
import {
  Layers,
  Cpu,
  Crosshair,
  Sparkles,
  Eye,
  MapPin,
  Compass,
  Fingerprint,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from 'lucide-react';
import { MascotVisual } from './MascotVisual';
import { ExportActions } from './ExportActions';
import type { MascotVariant } from '../../types/mascot';
import './mascot.css';

interface MascotCardProps {
  mascot: MascotVariant;
  onReset?: () => void;
  className?: string;
}

export const MascotCard: React.FC<MascotCardProps> = ({ mascot, onReset, className = '' }) => {
  const [showProvenance, setShowProvenance] = useState(false);
  const { visual, personality, signals, cryptographicSeed, archetypeLabel, mascotId, title, username, displayName } = mascot;
  const { colorTheme, outfit, equipment, accessory, expression, environment, pose, auraEffect } = visual;

  return (
    <div
      className={`mascot-card-frame p-6 sm:p-8 max-w-5xl w-full mx-auto relative transition-all ${className}`}
      style={{
        borderColor: colorTheme.border,
        boxShadow: `0 24px 64px -12px ${colorTheme.glow}`,
      }}
    >
      {/* Ambient background glows */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none -mr-28 -mt-28 opacity-25"
        style={{ backgroundColor: colorTheme.primary }}
      />
      <div
        className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl pointer-events-none -ml-28 -mb-28 opacity-15"
        style={{ backgroundColor: colorTheme.secondary }}
      />

      {/* Main Grid: Left = Collectible Character Spotlight, Right = Attributes & Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 items-center">
        {/* Left Column: Premium Collectible Mascot Stage */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <MascotVisual mascot={mascot} size="hero" animate={true} />
        </div>

        {/* Right Column: Identity Dossier, Traits & Actions */}
        <div className="lg:col-span-7 space-y-5">
          {/* Header & Collectible Tag */}
          <div className="space-y-2 pb-4 border-b border-white/10">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="text-[11px] font-mono uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full border"
                style={{
                  backgroundColor: colorTheme.badgeBg,
                  borderColor: colorTheme.border,
                  color: colorTheme.text,
                }}
              >
                Dlicom Hero • {mascot.heroPillar ? mascot.heroPillar.replace('DLICOM_HERO_', '') : 'CORE'}
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                {mascotId}
              </span>
            </div>

            <div className="space-y-0.5">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {mascot.heroTitle || title}
              </h1>
              <p className="text-xs font-mono text-purple-300 font-semibold">
                Hero Variant: {mascot.variantName} ({mascot.familyName})
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-300">
              <span className="text-white font-semibold">{displayName}</span>
              <span className="text-slate-400 font-mono">(@{username})</span>
            </div>
          </div>

          {/* Personality & Motto Banner */}
          <div
            className="p-3.5 rounded-2xl border"
            style={{
              backgroundColor: colorTheme.badgeBg,
              borderColor: colorTheme.border,
            }}
          >
            <p className="text-xs sm:text-sm italic font-medium text-slate-200">
              &ldquo;{personality.motto}&rdquo;
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2.5 text-[11px] text-slate-300 font-mono">
              <span>Focus: <strong className="text-white">{personality.coreDiscipline}</strong></span>
              <span>•</span>
              <span>Temperament: <strong className="text-white">{personality.temperament}</strong></span>
            </div>
          </div>

          {/* Role-Appropriate Visual Attributes Grid */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-400 font-semibold tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" style={{ color: colorTheme.primary }} />
                Unique Character Attributes
              </span>
              <span
                className="text-xs font-mono px-2.5 py-0.5 rounded-full font-bold border"
                style={{
                  backgroundColor: colorTheme.badgeBg,
                  borderColor: colorTheme.border,
                  color: colorTheme.text,
                }}
              >
                {archetypeLabel}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {/* Attire / Outfit */}
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-0.5">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono uppercase">
                  <Cpu className="w-3 h-3" style={{ color: colorTheme.primary }} />
                  <span>Attire / Nanoweave</span>
                </div>
                <p className="text-slate-100 font-medium text-xs leading-snug">{outfit}</p>
              </div>

              {/* Role Equipment */}
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-0.5">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono uppercase">
                  <Crosshair className="w-3 h-3" style={{ color: colorTheme.primary }} />
                  <span>Role Equipment</span>
                </div>
                <p className="text-slate-100 font-medium text-xs leading-snug">{equipment}</p>
              </div>

              {/* Accessory & HUD */}
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-0.5">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono uppercase">
                  <Sparkles className="w-3 h-3" style={{ color: colorTheme.primary }} />
                  <span>Accessory & HUD</span>
                </div>
                <p className="text-slate-100 font-medium text-xs leading-snug">{accessory}</p>
              </div>

              {/* Expression */}
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-0.5">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono uppercase">
                  <Eye className="w-3 h-3" style={{ color: colorTheme.primary }} />
                  <span>Facial Expression</span>
                </div>
                <p className="text-slate-100 font-medium text-xs leading-snug">{expression}</p>
              </div>

              {/* Environment */}
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-0.5">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono uppercase">
                  <MapPin className="w-3 h-3" style={{ color: colorTheme.primary }} />
                  <span>Atmospheric Stage</span>
                </div>
                <p className="text-slate-100 font-medium text-xs leading-snug">{environment}</p>
              </div>

              {/* Signature Pose & Aura */}
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-0.5">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono uppercase">
                  <Compass className="w-3 h-3" style={{ color: colorTheme.primary }} />
                  <span>Signature Pose & Aura</span>
                </div>
                <p className="text-slate-100 font-medium text-xs leading-snug">
                  {pose} • <em className="text-slate-400 not-italic font-normal">{auraEffect}</em>
                </p>
              </div>
            </div>
          </div>

          {/* Cryptographic Derivation & Public Signals Drawer */}
          <div>
            <button
              onClick={() => setShowProvenance(!showProvenance)}
              className="w-full px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center justify-between text-xs text-slate-300 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Fingerprint className="w-3.5 h-3.5" style={{ color: colorTheme.primary }} />
                <span className="font-semibold text-white">Cryptographic Seed & Evidence Provenance</span>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 ml-1">
                  <ShieldCheck className="w-3 h-3" />
                  Verifiable
                </span>
              </div>
              {showProvenance ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showProvenance && (
              <div className="mt-2.5 p-3.5 rounded-xl bg-black/60 border border-white/10 space-y-2 text-xs animate-in fade-in">
                <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
                  {cryptographicSeed.derivationSummary}
                </p>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1.5 border-t border-white/10">
                  <div>
                    <span className="text-slate-500 block">SOURCE EVIDENCE TYPE:</span>
                    <span className="text-white font-semibold">{signals.sourceType}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">CRYPTOGRAPHIC SEED:</span>
                    <span className="font-semibold" style={{ color: colorTheme.text }}>
                      {cryptographicSeed.hexSeed}
                    </span>
                  </div>
                </div>

                {signals.detectedKeywords.length > 0 && (
                  <div className="text-[10px] font-mono pt-1">
                    <span className="text-slate-500 block">DETECTED PUBLIC SIGNALS:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {signals.detectedKeywords.map((kw, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 rounded bg-white/10 text-slate-200 text-[9px]"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions: Export, Share, and Generate Another */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <ExportActions mascot={mascot} />

            {onReset && (
              <button
                onClick={onReset}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-medium text-xs transition-colors cursor-pointer shrink-0"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Generate Another</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
