import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  AlertCircle,
  ShieldCheck,
  Info,
  Fingerprint,
} from 'lucide-react';
import { MascotNavbar } from '../components/Mascot/MascotNavbar';
import { MascotVisual } from '../components/Mascot/MascotVisual';
import { ExportActions } from '../components/Mascot/ExportActions';
import { HeroShareCard } from '../components/Mascot/HeroShareCard';
import { generateMascotVariant, getWhyThisMascotExplanation } from '../services/mascot/mascotEngine';
import { fetchPublicXSignals, validateUsername } from '../services/mascot/xProfileService';
import type { MascotVariant, GenerationStep } from '../types/mascot';
import '../components/Mascot/mascot.css';

interface MascotGeneratorPageProps {
  onNavigate: (path: string) => void;
  initialUsername?: string;
}

const SAMPLE_USERS = [
  { handle: 'mohammadqadriah', role: 'Security' },
  { handle: 'jimish_parekh', role: 'Engineering' },
  { handle: 'mohamedbelal', role: 'Community' },
  { handle: 'georgechahine', role: 'Architect' },
  { handle: 'vitalikbuterin', role: 'Research' },
];

const SYNTHESIS_STEPS = [
  { step: 1, label: 'Reading public signals' },
  { step: 2, label: 'Mapping your identity' },
  { step: 3, label: 'Selecting your mascot archetype' },
  { step: 4, label: 'Synthesizing your Dlicom identity' },
  { step: 5, label: 'Identity ready' },
];

export const MascotGeneratorPage: React.FC<MascotGeneratorPageProps> = ({
  onNavigate,
  initialUsername = '',
}) => {
  // Persistent username state
  const [username, setUsername] = useState(() => {
    if (initialUsername) {
      return initialUsername.startsWith('@') ? initialUsername : `@${initialUsername}`;
    }
    return '';
  });
  const [step, setStep] = useState<GenerationStep>('IDLE');
  const [synthesisStepNum, setSynthesisStepNum] = useState<number>(0);
  const [stepMessage, setStepMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [generatedMascot, setGeneratedMascot] = useState<MascotVariant | null>(null);

  const isSynthesizing = step !== 'IDLE' && step !== 'COMPLETE';

  const handleGenerate = useCallback(
    async (explicitUser?: string) => {
      const domVal =
        typeof document !== 'undefined'
          ? (document.getElementById('mascot-username-input') as HTMLInputElement)?.value
          : '';
      const inputVal = explicitUser !== undefined ? explicitUser : (domVal || username);
      const { isValid, cleanUsername, error: valError } = validateUsername(inputVal);

      if (!isValid) {
        setError(valError || 'Please enter a valid X username.');
        return;
      }

      const formatted = inputVal.startsWith('@') ? inputVal : `@${cleanUsername}`;
      setUsername(formatted);
      setError(null);
      setGeneratedMascot(null);
      setStep('FETCHING_PUBLIC_PROFILE');

      // Step 1: Reading public signals
      setSynthesisStepNum(1);
      setStepMessage('Reading public signals');
      const { success, signals, error: fetchErr } = await fetchPublicXSignals(cleanUsername);

      if (!success || !signals) {
        setError(fetchErr || "We couldn't retrieve this public X profile right now.");
        setStep('IDLE');
        setSynthesisStepNum(0);
        return;
      }

      // Step 2: Mapping your identity
      setSynthesisStepNum(2);
      setStepMessage('Mapping your identity');
      await new Promise((r) => setTimeout(r, 220));

      // Step 3: Selecting your mascot archetype
      setSynthesisStepNum(3);
      setStepMessage('Selecting your mascot archetype');
      await new Promise((r) => setTimeout(r, 220));

      // Step 4: Synthesizing your Dlicom identity
      setSynthesisStepNum(4);
      setStepMessage('Synthesizing your Dlicom identity');
      const mascot = generateMascotVariant(signals);
      await new Promise((r) => setTimeout(r, 240));

      // Step 5: Identity ready
      setSynthesisStepNum(5);
      setStepMessage('Identity ready');
      await new Promise((r) => setTimeout(r, 260));

      setGeneratedMascot(mascot);
      setStep('COMPLETE');
      setSynthesisStepNum(0);

      // Update browser URL to shareable route /mascot/:username
      if (typeof window !== 'undefined') {
        const targetPath = `/mascot/${cleanUsername}`;
        if (window.location.pathname !== targetPath) {
          window.history.replaceState({}, '', targetPath);
        }
      }
    },
    [username]
  );

  // If page loaded with initialUsername (e.g. via /mascot/:username)
  useEffect(() => {
    if (initialUsername) {
      const formatted = initialUsername.startsWith('@') ? initialUsername : `@${initialUsername}`;
      const timer = setTimeout(() => {
        handleGenerate(formatted);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [initialUsername, handleGenerate]);

  const handleReset = () => {
    setGeneratedMascot(null);
    setStep('IDLE');
    setSynthesisStepNum(0);
    setError(null);
    setUsername('');
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      window.history.replaceState({}, '', '/');
    }
  };

  return (
    <div className="min-h-screen bg-[#070510] text-slate-100 flex flex-col selection:bg-purple-500/30 relative overflow-x-hidden">
      {/* Background Atmosphere */}
      <div className="mascot-page-atmosphere">
        <div className="mascot-bg-glow-orb-1" />
        <div className="mascot-bg-glow-orb-2" />
      </div>

      <MascotNavbar onNavigate={onNavigate} currentPath="/" />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col justify-center relative z-10">
        {!generatedMascot ? (
          /* ========================================================================= */
          /* INITIAL STATE (HERO FORM & SYNTHESIS PROGRESS)                            */
          /* ========================================================================= */
          <div className="w-full my-auto py-6 sm:py-10 animate-in fade-in duration-300">
            <div className="mascot-hero-card">
              {/* Subtle top ambient accent */}
              <div className="absolute -top-px left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent pointer-events-none" />

              {/* Dlicom Mascot badge */}
              <div className="mascot-pill-badge">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Dlicom Mascot</span>
              </div>

              {/* Headline */}
              <div>
                <h1 className="mascot-hero-title">
                  Synthesize Your <br />
                  <span className="mascot-gradient-text">Dlicom Mascot</span>
                </h1>
                <p className="mascot-hero-subtitle">
                  Enter an X username to synthesize a unique Dlicom Mascot from verified public signals.
                </p>
              </div>

              {/* Input + Button Control Group */}
              <div className="space-y-4 max-w-lg w-full">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleGenerate();
                  }}
                  className="mascot-input-wrapper"
                  style={{
                    backgroundColor: '#0c081e',
                    background: '#0c081e',
                    borderColor: 'rgba(168, 85, 247, 0.35)',
                    color: '#ffffff',
                  }}
                >
                  <input
                    id="mascot-username-input"
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Enter X username (e.g. @Batman)"
                    autoComplete="off"
                    spellCheck={false}
                    className="mascot-input-field"
                    style={{
                      backgroundColor: 'transparent',
                      background: 'transparent',
                      color: '#ffffff',
                      WebkitTextFillColor: '#ffffff',
                    }}
                  />

                  <button
                    id="mascot-synthesize-btn"
                    type="submit"
                    disabled={isSynthesizing}
                    className="mascot-synthesize-btn"
                  >
                    {isSynthesizing ? (
                      <>
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        <span>Synthesizing...</span>
                      </>
                    ) : (
                      <span>Synthesize &rarr;</span>
                    )}
                  </button>
                </form>

                {/* Inline Error Badge */}
                {error && (
                  <div className="mascot-error-badge animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="text-xs text-rose-200 font-medium">{error}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleGenerate(username)}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/15 text-[11px] font-mono font-semibold transition-colors cursor-pointer shrink-0"
                    >
                      Try Again
                    </button>
                  </div>
                )}

                {/* 5-Step Synthesis Progress Stepper */}
                {isSynthesizing && (
                  <div
                    id="mascot-synthesis-stepper"
                    className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 backdrop-blur-md space-y-3 shadow-lg animate-in fade-in duration-200"
                  >
                    {/* Header with Step Counter */}
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span id="synthesis-step-index" className="text-purple-300 font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                        Step {synthesisStepNum} of 5
                      </span>
                      <span id="synthesis-step-message" className="text-slate-400 font-semibold">{stepMessage}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-300 rounded-full"
                        style={{ width: `${(synthesisStepNum / 5) * 100}%` }}
                      />
                    </div>

                    {/* Step Micro-Indicators */}
                    <div className="grid grid-cols-5 gap-1.5 pt-1">
                      {SYNTHESIS_STEPS.map((s) => {
                        const isDone = s.step < synthesisStepNum;
                        const isCurrent = s.step === synthesisStepNum;
                        return (
                          <div
                            key={s.step}
                            className={`flex flex-col items-center gap-1 text-center transition-all ${
                              isCurrent
                                ? 'text-purple-300'
                                : isDone
                                ? 'text-emerald-400'
                                : 'text-slate-600'
                            }`}
                          >
                            <div
                              className={`w-2.5 h-2.5 rounded-full transition-all ${
                                isDone
                                  ? 'bg-emerald-400'
                                  : isCurrent
                                  ? 'bg-purple-400 ring-4 ring-purple-500/30'
                                  : 'bg-white/15'
                              }`}
                            />
                            <span className="text-[9px] font-mono leading-tight hidden sm:block">
                              {s.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Sample Handles */}
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg w-full pt-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Examples:
                </span>
                {SAMPLE_USERS.map((u) => (
                  <button
                    key={u.handle}
                    type="button"
                    onClick={() => {
                      const h = `@${u.handle}`;
                      setUsername(h);
                      handleGenerate(h);
                    }}
                    className="mascot-chip group"
                    title={`Generate ${u.role} mascot for @${u.handle}`}
                  >
                    <span className="text-purple-300 group-hover:text-purple-200 font-mono">
                      @{u.handle}
                    </span>
                    <span className="text-[10px] text-slate-400 font-sans border-l border-white/10 pl-1.5 group-hover:text-slate-300">
                      {u.role}
                    </span>
                  </button>
                ))}
              </div>

              {/* Trust Signal */}
              <div className="mascot-trust-indicator pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400/80 shrink-0" />
                <span>Public X signals only • Deterministic synthesis</span>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* ========================================================================= */
          <div className="mascot-result-layout animate-in fade-in duration-400 flex flex-col items-center max-w-4xl mx-auto w-full space-y-8">
            {/* 1. Quick Re-Synthesis Search Bar (Clean & Compact at Top) */}
            <div className="w-full max-w-md space-y-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleGenerate();
                }}
                className="mascot-input-wrapper"
                style={{
                  backgroundColor: '#0c081e',
                  background: '#0c081e',
                  borderColor: 'rgba(168, 85, 247, 0.35)',
                  color: '#ffffff',
                }}
              >
                <input
                  id="mascot-username-input"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter X username (e.g. @Batman)"
                  autoComplete="off"
                  spellCheck={false}
                  className="mascot-input-field"
                  style={{
                    backgroundColor: 'transparent',
                    background: 'transparent',
                    color: '#ffffff',
                    WebkitTextFillColor: '#ffffff',
                  }}
                />

                <button
                  id="mascot-synthesize-btn"
                  type="submit"
                  disabled={isSynthesizing}
                  className="mascot-synthesize-btn"
                >
                  {isSynthesizing ? (
                    <>
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>Synthesizing...</span>
                    </>
                  ) : (
                    <span>Synthesize &rarr;</span>
                  )}
                </button>
              </form>

              {error && (
                <div className="mascot-error-badge animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-xs text-rose-200 font-medium">{error}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleGenerate(username)}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/15 text-[11px] font-mono font-semibold transition-colors cursor-pointer shrink-0"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {isSynthesizing && (
                <div className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs font-mono text-purple-300 animate-pulse">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>{stepMessage}...</span>
                </div>
              )}
            </div>

            {/* 2. The Hero: Visually Dominant Centered Collectible Mascot */}
            <div className="w-full flex flex-col items-center justify-center relative py-4">
              <div
                className="absolute inset-0 max-w-[640px] max-h-[640px] mx-auto rounded-full blur-3xl pointer-events-none -z-10 opacity-30"
                style={{
                  background: `radial-gradient(circle, ${generatedMascot.visual.colorTheme.primary}44 0%, ${generatedMascot.visual.colorTheme.secondary}15 50%, transparent 75%)`,
                }}
              />
              <MascotVisual
                key={generatedMascot.mascotId}
                mascot={generatedMascot}
                size="hero"
                showDetails={false}
                animate={true}
              />
            </div>

            {/* 3. Streamlined Clean Metadata & Information Hierarchy Underneath */}
            <div
              className="w-full max-w-2xl space-y-6 text-center px-4"
            >
              {/* Archetype & Mascot ID Pill Row */}
              <div className="flex items-center justify-center gap-3 flex-wrap">
                {/* Dlicom Superhero Badge */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/40 text-xs font-mono font-bold text-white shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span className="tracking-wider uppercase">Dlicom Hero</span>
                </div>

                <span
                  id="mascot-archetype-label"
                  className="tracking-wider uppercase font-mono text-xs font-extrabold px-3 py-1.5 rounded-full border shadow-sm"
                  style={{
                    color: generatedMascot.visual.colorTheme.text,
                    backgroundColor: generatedMascot.visual.colorTheme.badgeBg,
                    borderColor: generatedMascot.visual.colorTheme.border,
                  }}
                >
                  {generatedMascot.archetypeLabel}
                </span>

                <div className="flex items-center gap-1.5 font-mono text-xs text-cyan-300 bg-cyan-950/40 border border-cyan-500/25 px-3 py-1.5 rounded-full shadow-sm">
                  <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />
                  <span id="mascot-id-badge" className="font-bold tracking-wider">
                    {generatedMascot.mascotId}
                  </span>
                </div>

                {generatedMascot.signals.sourceType === 'USER_CONFIRMED_FALLBACK' ? (
                  <div
                    id="mascot-signal-provenance"
                    className="flex items-center gap-1.5 font-mono text-xs text-amber-300 bg-amber-950/40 border border-amber-500/25 px-3 py-1.5 rounded-full shadow-sm"
                    title="Synthesized deterministically from simulated fallback signals (zero invented data)"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-semibold">Simulated Fallback</span>
                  </div>
                ) : (
                  <div
                    id="mascot-signal-provenance"
                    className="flex items-center gap-1.5 font-mono text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-500/25 px-3 py-1.5 rounded-full shadow-sm"
                    title="Synthesized from verified public X profile signals"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-semibold">Verified Public Signals</span>
                  </div>
                )}
              </div>

              {/* Dlicom Hero Title & Variant */}
              <div className="space-y-2">
                <div className="text-xs font-mono uppercase tracking-widest text-purple-400 font-bold">
                  Official Dlicom Hero
                </div>
                <h2
                  id="mascot-hero-title"
                  className="text-4xl sm:text-5xl font-black text-white tracking-tight"
                >
                  {generatedMascot.heroTitle}
                </h2>
                <div className="flex items-center justify-center gap-2 flex-wrap text-sm">
                  <span className="text-slate-400 font-medium">Hero Variant:</span>
                  <span id="mascot-variant-name" className="text-white font-bold">
                    {generatedMascot.variantName}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span id="mascot-handle" className="font-mono font-semibold text-purple-300">
                    @{generatedMascot.username}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span id="mascot-family-name" className="font-mono text-slate-400 font-medium">
                    {generatedMascot.familyName}
                  </span>
                </div>
                {generatedMascot.heroConcept && (
                  <p className="text-xs text-slate-400 max-w-lg mx-auto italic">
                    {generatedMascot.heroConcept}
                  </p>
                )}
              </div>

              {/* Family-Variant hook for regression audit tests */}
              <div id="mascot-family-variant" className="hidden">
                {generatedMascot.familyName} • {generatedMascot.variantName}
              </div>

              {/* Visual Traits */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 max-w-xl mx-auto space-y-2 text-left">
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center justify-between">
                  <span>Visual Traits</span>
                  <span className="text-[10px] text-purple-400 font-normal">Authentic Dlicom Specs</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
                    <span className="text-slate-500 text-[10px] block">HERO ATTIRE</span>
                    <span className="text-slate-200 text-[11px] font-medium leading-snug">{generatedMascot.visual.outfit}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
                    <span className="text-slate-500 text-[10px] block">HERO EQUIPMENT</span>
                    <span className="text-slate-200 text-[11px] font-medium leading-snug">{generatedMascot.visual.equipment}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
                    <span className="text-slate-500 text-[10px] block">ACCESSORY & HUD</span>
                    <span className="text-slate-200 text-[11px] font-medium leading-snug">{generatedMascot.visual.accessory}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
                    <span className="text-slate-500 text-[10px] block">SIGNATURE POSE</span>
                    <span className="text-slate-200 text-[11px] font-medium leading-snug">{generatedMascot.visual.pose}</span>
                  </div>
                </div>
              </div>

              {/* Personalized Motto */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 max-w-xl mx-auto">
                <p
                  id="mascot-motto"
                  className="italic text-slate-200 text-sm sm:text-base font-medium leading-relaxed"
                >
                  &ldquo;{generatedMascot.personality.motto}&rdquo;
                </p>
              </div>

              {/* WHY THIS MASCOT? Explanation */}
              <div
                id="mascot-why-section"
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1.5 max-w-xl mx-auto text-left"
              >
                <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-purple-400" />
                  <span>WHY THIS MASCOT?</span>
                </div>
                <p
                  id="mascot-why-explanation"
                  className="text-xs sm:text-sm text-slate-300 leading-relaxed"
                >
                  {getWhyThisMascotExplanation(generatedMascot)}
                </p>
              </div>

              {/* Official Dlicom Hero Share Card */}
              <div className="w-full pt-4 space-y-3">
                <div className="text-center space-y-1">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-purple-400 font-bold">
                    Collectible Hero Share Card
                  </span>
                  <p className="text-xs text-slate-400">
                    Export your verified collectible card or share directly to X.
                  </p>
                </div>
                <HeroShareCard mascot={generatedMascot} />
              </div>

              {/* Actions Bar: Share to X, Copy Link, Download PNG, Export SVG, Generate Another */}
              <div className="pt-2">
                <ExportActions mascot={generatedMascot} onReset={handleReset} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
