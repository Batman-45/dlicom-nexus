import React, { useEffect, useState } from 'react';
import { Orbit, Radio } from 'lucide-react';

interface CircleLoadingProps {
  username: string;
}

export const CircleLoading: React.FC<CircleLoadingProps> = ({ username }) => {
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    'Connecting to social graph provider...',
    `Fetching profile metadata for @${username}...`,
    'Discovering close collaborators & mutuals...',
    'Synthesizing constellation orbit tiers...',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 450);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="relative w-screen h-screen overflow-hidden cosmic-canvas-bg flex flex-col items-center justify-center p-4 select-none">
      {/* Background Animated Constellation Rings */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        {/* Outer Pulsing Ring */}
        <div className="w-[650px] h-[650px] rounded-full border border-cyan-500/15 animate-pulse-outer-ring" />
        
        {/* Middle Rotating Dash Ring */}
        <div className="w-[440px] h-[440px] rounded-full border border-dashed border-purple-500/25 animate-spin-slow" />
        
        {/* Inner Ring with Orbiting Satellite Node */}
        <div className="relative w-[260px] h-[260px] rounded-full border border-cyan-400/30 animate-pulse-ring flex items-center justify-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/80 animate-ping" />
        </div>

        {/* Soft Center Glow */}
        <div
          className="absolute w-80 h-80 rounded-full bg-gradient-to-tr from-cyan-500/20 via-blue-600/15 to-purple-600/20"
          style={{ filter: 'blur(70px)' }}
        />
      </div>

      {/* Main Centered Loading Unit */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
        {/* Central Core Glowing Orb */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 p-[2px] shadow-2xl shadow-cyan-500/40 animate-pulse">
            <div className="w-full h-full rounded-full bg-[#070a14] flex items-center justify-center">
              <Orbit className="w-9 h-9 text-cyan-400 animate-spin-slow" />
            </div>
          </div>
          <div className="absolute -inset-2 rounded-full border border-cyan-400/40 animate-pulse-ring pointer-events-none" />
        </div>

        {/* Primary Prompt Message */}
        <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight mb-2 flex items-center gap-2">
          <span>Finding your circle...</span>
        </h2>

        {/* Username target indicator */}
        <p className="text-sm font-mono text-cyan-400 mb-6 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-1.5">
          <Radio className="w-3 h-3 animate-pulse text-cyan-400" />
          <span>@{username}</span>
        </p>

        {/* Step telemetry ticker */}
        <div className="h-6 flex items-center justify-center">
          <p className="text-xs text-slate-400 font-mono transition-opacity duration-300 animate-in fade-in">
            {steps[stepIndex]}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-56 h-1 rounded-full bg-slate-800 overflow-hidden mt-4">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 transition-all duration-500 rounded-full"
            style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
