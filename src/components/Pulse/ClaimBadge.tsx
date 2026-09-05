import React from 'react';
import { ShieldCheck, Eye, AlertCircle, ExternalLink } from 'lucide-react';
import type { ClaimStatus } from '../../types/pulse';

interface ClaimBadgeProps {
  status: ClaimStatus;
  evidenceUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ClaimBadge: React.FC<ClaimBadgeProps> = ({
  status,
  evidenceUrl,
  size = 'md',
  showLabel = true,
}) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'VERIFIED':
        return {
          label: 'VERIFIED',
          icon: ShieldCheck,
          bgClass: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
          dotClass: 'bg-emerald-400',
          title: 'Formally confirmed by official Dlicom properties (dlicom.io, Hacken audit, whitepaper, Base contracts)',
        };
      case 'OBSERVED_PUBLIC_EVIDENCE':
        return {
          label: 'OBSERVED PUBLIC EVIDENCE',
          icon: Eye,
          bgClass: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300',
          dotClass: 'bg-cyan-400',
          title: 'Corroborated via observable public X activity, public GitHub commits, or community bounties',
        };
      case 'UNVERIFIED':
      default:
        return {
          label: 'UNVERIFIED',
          icon: AlertCircle,
          bgClass: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
          dotClass: 'bg-amber-400',
          title: 'Self-reported or bio claim pending official verification',
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-[9px] px-1.5 py-0.5 gap-1',
    md: 'text-[10px] px-2 py-0.5 gap-1.5',
    lg: 'text-xs px-2.5 py-1 gap-2',
  };

  const badgeContent = (
    <span
      className={`inline-flex items-center font-mono font-semibold tracking-wider rounded-full border transition-all ${config.bgClass} ${sizeClasses[size]}`}
      title={config.title}
    >
      <Icon className={size === 'sm' ? 'w-2.5 h-2.5' : size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} />
      {showLabel && <span>{config.label}</span>}
      {evidenceUrl && (
        <ExternalLink className={size === 'sm' ? 'w-2 h-2 ml-0.5 opacity-60' : 'w-2.5 h-2.5 ml-0.5 opacity-60'} />
      )}
    </span>
  );

  if (evidenceUrl) {
    return (
      <a
        href={evidenceUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="inline-block hover:scale-105 transition-transform"
        title={`${config.title} — Click to inspect source`}
      >
        {badgeContent}
      </a>
    );
  }

  return badgeContent;
};
