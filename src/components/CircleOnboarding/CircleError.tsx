import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft, Clock } from 'lucide-react';
import type { SocialGraphError } from '../../services/socialGraph';

interface CircleErrorProps {
  username: string;
  error: Error | SocialGraphError | null;
  onRetry: () => void;
  onBackToInput: () => void;
}

export const CircleError: React.FC<CircleErrorProps> = ({
  username,
  error,
  onRetry,
  onBackToInput,
}) => {
  const errorMessage = error?.message || 'Unable to build your Circle right now.';
  const isNotFound =
    errorMessage.includes("Couldn't find that X account") ||
    (error && 'code' in error && error.code === 'NOT_FOUND');

  const isRateLimited =
    (error && 'code' in error && error.code === 'RATE_LIMITED') ||
    errorMessage.toLowerCase().includes('rate-limited') ||
    errorMessage.toLowerCase().includes('rate limit');

  // Cooldown countdown for rate limiting (default 60 seconds)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initialRetryAfter = (error as any)?.retryAfter || 60;
  const [cooldown, setCooldown] = useState<number>(() => (isRateLimited ? initialRetryAfter : 0));

  useEffect(() => {
    if (!isRateLimited || cooldown <= 0) return;

    const interval = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isRateLimited, cooldown]);

  return (
    <div className="relative w-screen h-screen overflow-hidden cosmic-canvas-bg flex flex-col items-center justify-center p-4 select-none">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <div className="w-[600px] h-[600px] rounded-full border border-rose-500/10 animate-pulse-outer-ring" />
        <div
          className="absolute w-80 h-80 rounded-full bg-gradient-to-tr from-rose-500/10 to-purple-600/10"
          style={{ filter: 'blur(70px)' }}
        />
      </div>

      {/* Main Error Box */}
      <div className="relative z-10 w-full max-w-md mx-auto p-6 rounded-3xl glass-panel border border-rose-500/20 text-center shadow-2xl backdrop-blur-2xl">
        {/* Warning / Clock Icon */}
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border ${
            isRateLimited
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          {isRateLimited ? <Clock className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
        </div>

        {/* Target Username */}
        <span className="text-xs font-mono text-slate-400 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-3 inline-block">
          @{username}
        </span>

        {/* Primary Error Headline */}
        <h2 className="font-display font-bold text-xl sm:text-2xl text-white tracking-tight mb-2">
          {isNotFound
            ? "Couldn't find that X account."
            : isRateLimited
            ? 'X data is temporarily rate-limited.'
            : 'Unable to build your Circle right now.'}
        </h2>

        {/* Detailed Explanation */}
        <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
          {isNotFound
            ? `Please check the spelling of @${username} or verify that the account is active on X.`
            : isRateLimited
            ? 'Your Circle data will be available again shortly. Please try again later.'
            : 'There was an issue querying social graph connections. Please check your connection and try again.'}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => {
              if (cooldown === 0) onRetry();
            }}
            disabled={cooldown > 0}
            className={`w-full sm:flex-1 py-3 px-4 rounded-xl font-display font-bold text-xs transition-all flex items-center justify-center gap-2 ${
              cooldown > 0
                ? 'bg-slate-800/80 text-slate-500 border border-white/5 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20 cursor-pointer'
            }`}
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                cooldown > 0 ? 'text-slate-500 animate-spin-slow' : 'text-slate-950'
              }`}
            />
            <span>{cooldown > 0 ? `Retry in ${cooldown}s` : 'Retry'}</span>
          </button>

          <button
            onClick={onBackToInput}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/15 text-slate-200 font-display font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Try Another Username</span>
          </button>
        </div>
      </div>
    </div>
  );
};
