import React from 'react';
import { Plus, Minus, RotateCcw, Target, Eye, EyeOff } from 'lucide-react';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onCenterOnYou: () => void;
  showOrbits: boolean;
  onToggleOrbits: () => void;
  scale: number;
}

export const MapControls: React.FC<MapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onReset,
  onCenterOnYou,
  showOrbits,
  onToggleOrbits,
  scale,
}) => {
  return (
    <div className="fixed bottom-4 right-4 md:right-auto md:left-1/2 md:-translate-x-1/2 z-30 pointer-events-none">
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl glass-panel pointer-events-auto shadow-2xl border border-white/10">
        {/* Zoom In */}
        <button
          onClick={onZoomIn}
          title="Zoom In"
          className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* Zoom Scale Display */}
        <span className="text-[11px] font-mono text-slate-400 px-1 min-w-[42px] text-center select-none">
          {Math.round(scale * 100)}%
        </span>

        {/* Zoom Out */}
        <button
          onClick={onZoomOut}
          title="Zoom Out"
          className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer"
        >
          <Minus className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-4 bg-white/10 mx-0.5" />

        {/* Center on You */}
        <button
          onClick={onCenterOnYou}
          title="Center on You"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-medium border border-cyan-500/20 transition-all cursor-pointer"
        >
          <Target className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Center YOU</span>
        </button>

        {/* Reset View */}
        <button
          onClick={onReset}
          title="Reset View"
          className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Toggle Orbit Rings */}
        <button
          onClick={onToggleOrbits}
          title={showOrbits ? 'Hide Orbit Rings' : 'Show Orbit Rings'}
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            showOrbits
              ? 'bg-cyan-500/20 text-cyan-300'
              : 'bg-white/5 text-slate-400 hover:text-slate-200'
          }`}
        >
          {showOrbits ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
