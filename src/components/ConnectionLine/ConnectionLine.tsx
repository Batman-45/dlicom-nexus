import React from 'react';
import type { DlicomUser } from '../../types/circle';

interface ConnectionLineProps {
  user: DlicomUser;
  isSelected: boolean;
  isHovered: boolean;
  isDimmed: boolean;
}

export const ConnectionLine: React.FC<ConnectionLineProps> = ({
  user,
  isSelected,
  isHovered,
  isDimmed,
}) => {
  // Center is at 0, 0
  const x1 = 0;
  const y1 = 0;
  const x2 = user.x;
  const y2 = user.y;

  // Organic curved path: slight orthogonal bend based on angle
  const angleRad = (user.orbitAngle * Math.PI) / 180;
  const curveBend = (user.orbitAngle % 2 === 0 ? 1 : -1) * 22;
  const midX = (x1 + x2) / 2 - Math.sin(angleRad) * curveBend;
  const midY = (y1 + y2) / 2 + Math.cos(angleRad) * curveBend;
  const pathData = `M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`;

  // Normalized score 0 - 1
  const score = user.interactionScore ?? user.connectionStrength ?? 50;
  const scoreNorm = Math.max(0.15, Math.min(1, score / 100));

  // Dynamic stroke styling based on interaction affinity
  const isHighAffinity = score >= 75;
  const isMidAffinity = score >= 50;

  const baseOpacity = isDimmed
    ? 0.04
    : isSelected
    ? 0.95
    : isHovered
    ? 0.85
    : isHighAffinity
    ? 0.55 + scoreNorm * 0.2
    : isMidAffinity
    ? 0.35 + scoreNorm * 0.15
    : 0.22;

  const strokeWidth = isSelected
    ? 3
    : isHovered
    ? 2.5
    : isHighAffinity
    ? 2.2
    : isMidAffinity
    ? 1.6
    : 1.2;

  // Color mapping
  const category = user.category;
  const strokeColor = isSelected
    ? '#ffffff'
    : isHovered
    ? user.highlightColor || '#38bdf8'
    : category === 'creators'
    ? '#ec4899'
    : category === 'builders'
    ? '#38bdf8'
    : category === 'communities'
    ? '#10b981'
    : '#a855f7';

  // Unique ID for SVG motion path
  const pathId = `conn-path-${user.id}`;
  const isAnimated = isHighAffinity && !isDimmed;

  return (
    <g className="transition-all duration-300 pointer-events-none">
      {/* 1. Underlying Soft Blurred Glow Line */}
      {!isDimmed && (
        <path
          d={pathData}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth + 4}
          strokeOpacity={baseOpacity * 0.4}
          strokeLinecap="round"
          className="filter blur-[4px]"
        />
      )}

      {/* 2. Main Curved Connection Stroke */}
      <path
        id={pathId}
        d={pathData}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeOpacity={baseOpacity}
        strokeLinecap="round"
        className={isSelected || isHovered ? 'connection-dash-animated' : ''}
      />

      {/* 3. Subtle Animated Cosmic Particle along top connection lines */}
      {isAnimated && (
        <circle r={isSelected || isHovered ? 3.5 : 2} fill="#ffffff" opacity={baseOpacity * 0.95}>
          <animateMotion
            dur={`${Math.max(2, 5 - scoreNorm * 2.5)}s`}
            repeatCount="indefinite"
            path={pathData}
          />
        </circle>
      )}

      {/* 4. Mid-point energy pulse marker for top interactions */}
      {isHighAffinity && !isDimmed && (
        <circle
          cx={midX}
          cy={midY}
          r={isSelected ? 3.5 : 2.2}
          fill={strokeColor}
          opacity={baseOpacity * 0.8}
        />
      )}
    </g>
  );
};
