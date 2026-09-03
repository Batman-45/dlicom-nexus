import React from 'react';

/**
 * Official Dlicom brand mark.
 * Source: /public/dlicom-logo.jpg — 400×400 official Dlicom logo.
 * Do NOT alter colors, proportions, or apply any CSS filters.
 */
interface DlicomLogoProps {
  /** Rendered size in pixels (applied to both width and height). Default: 48 */
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const DlicomLogo: React.FC<DlicomLogoProps> = ({
  size = 48,
  className,
  style,
}) => (
  <img
    src="/dlicom-logo.jpg"
    alt="Dlicom"
    width={size}
    height={size}
    draggable={false}
    className={className}
    style={{
      display: 'block',
      flexShrink: 0,
      objectFit: 'contain',
      objectPosition: 'center',
      aspectRatio: '1 / 1',
      imageRendering: 'auto',
      ...style,
    }}
  />
);
