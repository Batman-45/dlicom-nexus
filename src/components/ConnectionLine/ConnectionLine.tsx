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

  // Calculate mid-point control curve for organic constellation feel
  const midX = (x1 + x2) / 2 + (user.orbitAngle % 2 === 0 ? 12 : -12);
  const midY = (y1 + y2) / 2 + (user.orbitAngle % 2 === 0 ? -12 : 12);
  const pathData = `M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`;

  // Opacity & Stroke based on connection strength (0-100)
  const strengthNormalized = Math.max(0.15, user.connectionStrength / 100);
  const baseOpacity = isDimmed ? 0.05 : isSelected ? 0.9 : isHovered ? 0.8 : strengthNormalized * 0.45;
  const strokeWidth = isSelected ? 2.5 : isHovered ? 2 : Math.max(1, strengthNormalized * 2);

  // Connection color
  const strokeColor = isSelected
    ? '#38bdf8'
    : isHovered
    ? user.highlightColor || '#60a5fa'
    : user.connectionStrength > 80
    ? '#38bdf8'
    : user.connectionStrength > 50
    ? '#818cf8'
    : '#475569';

  return (
    <g className="transition-all duration-300 pointer-events-none">
      {/* Background glow line for strong/selected connections */}
      {(isSelected || isHovered || user.connectionStrength > 85) && !isDimmed && (
        <path
          d={pathData}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth + 4}
          strokeOpacity={baseOpacity * 0.4}
          strokeLinecap="round"
          className="filter blur-[3px]"
        />
      )}

      {/* Main Connection Path */}
      <path
        d={pathData}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeOpacity={baseOpacity}
        strokeLinecap="round"
        className={user.connectionStrength > 75 && !isDimmed ? 'connection-dash-animated' : ''}
      />

      {/* Small energy nodes along the line for top connections */}
      {user.connectionStrength >= 80 && !isDimmed && (
        <circle
          cx={midX}
          cy={midY}
          r={isSelected ? 3 : 2}
          fill={strokeColor}
          opacity={baseOpacity * 0.9}
        />
      )}
    </g>
  );
};
