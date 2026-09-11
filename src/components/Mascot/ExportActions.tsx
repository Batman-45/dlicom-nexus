import React, { useState } from 'react';
import { Download, Copy, Check, Image as ImageIcon, RefreshCw } from 'lucide-react';
import type { MascotVariant } from '../../types/mascot';

import {
  exportHeroShareCardAsPng,
  getHeroShareUrl,
  getHeroXShareIntentUrl,
} from '../../services/mascot/heroCardExport';

interface ExportActionsProps {
  mascot: MascotVariant;
  className?: string;
  onReset?: () => void;
}

export const ExportActions: React.FC<ExportActionsProps> = ({
  mascot,
  className = '',
  onReset,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloadingPng, setDownloadingPng] = useState(false);
  const { username, mascotId } = mascot;

  const handleCopy = async () => {
    try {
      const shareUrl = getHeroShareUrl(username);
      let copiedSuccess = false;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(shareUrl);
          copiedSuccess = true;
        } catch {
          // Fallback if document is unfocused
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
    } catch {
      // Fallback
    }
  };

  const handleShareTwitter = () => {
    const tweetUrl = getHeroXShareIntentUrl(mascot);
    window.open(tweetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadPng = async () => {
    try {
      setDownloadingPng(true);
      await exportHeroShareCardAsPng(mascot);
    } catch {
      // Fallback to direct character image download
      try {
        const res = await fetch(mascot.visual.characterImage);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dlicom-hero-${username}-${mascot.mascotId.toLowerCase()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch {
        const a = document.createElement('a');
        a.href = mascot.visual.characterImage;
        a.download = `dlicom-hero-${username}-${mascot.mascotId.toLowerCase()}.png`;
        a.target = '_blank';
        a.click();
      }
    } finally {
      setDownloadingPng(false);
    }
  };

  const handleDownloadSvg = () => {
    const svgData = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="800" height="1000">
  <defs>
    <radialGradient id="bg" cx="50%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#1b1435" />
      <stop offset="100%" stop-color="#07050f" />
    </radialGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)" rx="32" stroke="${mascot.visual.colorTheme.primary}" stroke-width="2" />
  <text x="200" y="60" text-anchor="middle" fill="${mascot.visual.colorTheme.primary}" font-family="sans-serif" font-size="14" font-weight="bold" letter-spacing="2">DLICOM MASCOT</text>
  <text x="200" y="90" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="22" font-weight="900">${mascot.title}</text>
  <text x="200" y="115" text-anchor="middle" fill="#94a3b8" font-family="monospace" font-size="13">@${username} • ${mascotId}</text>

  <!-- Mascot Character Reference -->
  <g transform="translate(140, 150) scale(2.5)" filter="url(#glow)">
    <path d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z" fill="${mascot.visual.colorTheme.secondary}"/>
    <path d="M24.5 40.5V33.9a3.5 3.5 0 0 0-3.5-3.5H12.2l6.5-9.1c.8-1.1.2-2.7-1.1-2.7H5.5L11.8 3h24.4l-6.5 9.1c-.8 1.1-.2 2.7 1.1 2.7h8.8L24.5 40.5z" fill="${mascot.visual.colorTheme.primary}" fill-opacity="0.88"/>
    <ellipse cx="24" cy="16" rx="10" ry="4.5" fill="#ffffff" fill-opacity="0.5" transform="rotate(-5 24 16)"/>
  </g>

  <!-- Details -->
  <g transform="translate(40, 310)" font-family="sans-serif" font-size="12" fill="#cbd5e1">
    <text x="0" y="20" font-weight="bold" fill="${mascot.visual.colorTheme.text}">ROLE:</text>
    <text x="80" y="20">${mascot.archetypeLabel}</text>
    <text x="0" y="45" font-weight="bold" fill="${mascot.visual.colorTheme.text}">EQUIPMENT:</text>
    <text x="80" y="45">${mascot.visual.equipment}</text>
    <text x="0" y="70" font-weight="bold" fill="${mascot.visual.colorTheme.text}">ATTIRE:</text>
    <text x="80" y="70">${mascot.visual.outfit}</text>
    <text x="0" y="95" font-weight="bold" fill="${mascot.visual.colorTheme.text}">DISCIPLINE:</text>
    <text x="80" y="95">${mascot.personality.coreDiscipline}</text>
    <text x="0" y="120" font-weight="bold" fill="${mascot.visual.colorTheme.text}">SEED:</text>
    <text x="80" y="120" font-family="monospace">${mascot.cryptographicSeed.hexSeed}</text>
  </g>
  <text x="200" y="475" text-anchor="middle" fill="#64748b" font-family="sans-serif" font-size="10">Dlicom Protocol • Immutable Mascot Identity</text>
</svg>
    `.trim();

    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dlicom-mascot-${username}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`flex flex-wrap items-center gap-2.5 ${className}`}>
      {/* 1. Share on X */}
      <button
        id="action-share-x"
        data-testid="mascot-share-x-btn"
        type="button"
        onClick={handleShareTwitter}
        className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/30 text-sky-300 font-medium text-xs transition-colors cursor-pointer"
        title="Share your Dlicom Mascot on X"
      >
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        <span>Share to X</span>
      </button>

      {/* 2. Copy Link */}
      <button
        id="action-copy-link"
        data-testid="mascot-copy-link-btn"
        type="button"
        onClick={handleCopy}
        className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-medium text-xs transition-colors cursor-pointer"
        title="Copy direct shareable mascot profile link"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400 font-semibold">Link Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-slate-400" />
            <span>Copy Link</span>
          </>
        )}
      </button>

      {/* 3. Download PNG */}
      <button
        id="action-download-png"
        data-testid="mascot-download-png-btn"
        type="button"
        onClick={handleDownloadPng}
        disabled={downloadingPng}
        className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-medium text-xs transition-colors cursor-pointer"
        title="Download mascot character PNG image"
      >
        {downloadingPng ? (
          <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
        ) : (
          <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
        )}
        <span>Download PNG</span>
      </button>

      {/* 4. Export SVG */}
      <button
        id="action-export-svg"
        data-testid="mascot-export-svg-btn"
        type="button"
        onClick={handleDownloadSvg}
        className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-medium text-xs transition-colors cursor-pointer"
        title="Download high-resolution mascot SVG card"
      >
        <Download className="w-3.5 h-3.5 text-slate-400" />
        <span>Export SVG</span>
      </button>

      {/* 5. Generate Another */}
      {onReset && (
        <button
          id="action-generate-another"
          data-testid="mascot-reset-btn"
          type="button"
          onClick={onReset}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 font-medium text-xs transition-colors cursor-pointer ml-auto"
          title="Synthesize another Dlicom Mascot"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Generate Another</span>
        </button>
      )}
    </div>
  );
};
