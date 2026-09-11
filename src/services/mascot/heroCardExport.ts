/**
 * Dlicom Hero Share Card — Client-Side Canvas Renderer & Social Export Utilities
 *
 * Provides:
 * - 100% client-side, zero-dependency HTML5 Canvas 2D card rendering
 * - High-DPI 800×1000 collectible card PNG export
 * - Predictable sanitized filenames: dlicom-hero-{username}-{dli-mascot-id}.png
 * - Canonical X web intent URL builder
 * - Shareable public Hero profile URL generator
 */

import type { MascotVariant } from '../../types/mascot';

/**
 * Returns canonical public URL for a Hero profile
 */
export function getHeroShareUrl(username: string): string {
  const clean = username.replace(/^@/, '').trim();
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/mascot/${clean}`;
  }
  return `https://dlicom.io/mascot/${clean}`;
}

/**
 * Generates sanitized filesystem-safe filename for downloaded hero card
 */
export function getHeroCardFilename(username: string, mascotId: string): string {
  const cleanUser = (username || 'anon')
    .replace(/^@/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .toLowerCase();
  const cleanId = (mascotId || 'identity')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .toLowerCase();
  return `dlicom-hero-${cleanUser}-${cleanId}.png`;
}

/**
 * Builds canonical X (Twitter) web intent URL with prefilled post content
 */
export function getHeroXShareIntentUrl(mascot: MascotVariant): string {
  const publicUrl = getHeroShareUrl(mascot.username);
  const heroTitle = mascot.heroTitle || mascot.title || 'Dlicom Hero';
  const mascotId = mascot.mascotId;

  const postText = [
    'I just discovered my Dlicom Hero.',
    '',
    heroTitle,
    mascotId,
    '',
    'Discover yours:',
    publicUrl,
    '',
    '#Dlicom #DlicomNexus',
  ].join('\n');

  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(postText)}`;
}

/**
 * Helper to draw a rounded rectangle on Canvas 2D context
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.arcTo(x + width, y, x + width, y + radius, radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
  ctx.lineTo(x + radius, y + height);
  ctx.arcTo(x, y + height, x, y + height - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
}

/**
 * Renders the complete, high-fidelity Dlicom Hero Share Card onto an HTML5 Canvas
 */
export async function renderHeroShareCardCanvas(mascot: MascotVariant): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  const width = 800;
  const height = 1000;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context is not available');
  }

  const primaryColor = mascot.visual?.colorTheme?.primary || '#a855f7';
  const secondaryColor = mascot.visual?.colorTheme?.secondary || '#6366f1';
  const pillarText = (mascot.heroPillar || 'DLICOM_HERO_CORE').replace('DLICOM_HERO_', '');
  const usernameText = `@${mascot.username.replace(/^@/, '')}`;

  // 1. Base Outer Background
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#0a071a');
  bgGrad.addColorStop(0.5, '#070510');
  bgGrad.addColorStop(1, '#05030c');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Ambient Color Glow behind center stage
  const glow = ctx.createRadialGradient(width / 2, 380, 20, width / 2, 380, 360);
  glow.addColorStop(0, `${primaryColor}38`);
  glow.addColorStop(0.5, `${secondaryColor}18`);
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  // 3. Card Outer Frame (Double border)
  const cardX = 28;
  const cardY = 28;
  const cardW = width - 56;
  const cardH = height - 56;
  const cardR = 24;

  // Outer border line
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardR);
  ctx.strokeStyle = primaryColor;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Subtle inner border line
  drawRoundedRect(ctx, cardX + 6, cardY + 6, cardW - 12, cardH - 12, cardR - 4);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Corner Accent Brackets
  ctx.strokeStyle = primaryColor;
  ctx.lineWidth = 2.5;
  const bracketLen = 18;
  // Top-left
  ctx.beginPath();
  ctx.moveTo(cardX + 16, cardY + 16 + bracketLen);
  ctx.lineTo(cardX + 16, cardY + 16);
  ctx.lineTo(cardX + 16 + bracketLen, cardY + 16);
  ctx.stroke();
  // Top-right
  ctx.beginPath();
  ctx.moveTo(cardX + cardW - 16 - bracketLen, cardY + 16);
  ctx.lineTo(cardX + cardW - 16, cardY + 16);
  ctx.lineTo(cardX + cardW - 16, cardY + 16 + bracketLen);
  ctx.stroke();
  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(cardX + 16, cardY + cardH - 16 - bracketLen);
  ctx.lineTo(cardX + 16, cardY + cardH - 16);
  ctx.lineTo(cardX + 16 + bracketLen, cardY + cardH - 16);
  ctx.stroke();
  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(cardX + cardW - 16 - bracketLen, cardY + cardH - 16);
  ctx.lineTo(cardX + cardW - 16, cardY + cardH - 16);
  ctx.lineTo(cardX + cardW - 16, cardY + cardH - 16 - bracketLen);
  ctx.stroke();

  // 4. Header Bar
  // 4a. "DLICOM" Logo Brandmark
  ctx.font = '900 16px Inter, system-ui, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('DLICOM', cardX + 32, cardY + 48);

  // 4b. "DLICOM HERO" Badge
  const badgeX = cardX + 130;
  const badgeY = cardY + 30;
  const badgeW = 120;
  const badgeH = 26;
  drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 13);
  ctx.fillStyle = `${primaryColor}26`;
  ctx.fill();
  ctx.strokeStyle = `${primaryColor}66`;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.font = '700 11px Inter, system-ui, sans-serif';
  ctx.fillStyle = '#f3e8ff';
  ctx.textAlign = 'center';
  ctx.fillText('DLICOM HERO', badgeX + badgeW / 2, badgeY + 17);
  ctx.textAlign = 'left';

  // 4c. Mascot ID Badge (Right-aligned)
  ctx.font = '600 13px "JetBrains Mono", monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'right';
  ctx.fillText(mascot.mascotId, cardX + cardW - 32, cardY + 48);
  ctx.textAlign = 'left';

  // 5. Artwork Showcase Frame
  const stageX = cardX + 32;
  const stageY = cardY + 76;
  const stageW = cardW - 64;
  const stageH = 470;
  const stageR = 16;

  drawRoundedRect(ctx, stageX, stageY, stageW, stageH, stageR);
  const stageGrad = ctx.createLinearGradient(stageX, stageY, stageX, stageY + stageH);
  stageGrad.addColorStop(0, '#100b22');
  stageGrad.addColorStop(1, '#080512');
  ctx.fillStyle = stageGrad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Load and draw mascot character image
  if (mascot.visual?.characterImage) {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => {
          // If image load fails, resolve gracefully so card still renders
          resolve();
        };
        img.src = mascot.visual.characterImage;
      });

      if (img.complete && img.naturalWidth > 0) {
        // Clip to stage rounded rect
        ctx.save();
        drawRoundedRect(ctx, stageX + 1, stageY + 1, stageW - 2, stageH - 2, stageR);
        ctx.clip();

        // Calculate aspect ratio containment with padding
        const imgPadding = 24;
        const maxDrawW = stageW - imgPadding * 2;
        const maxDrawH = stageH - imgPadding * 2;
        const imgAspect = img.naturalWidth / img.naturalHeight;
        const stageAspect = maxDrawW / maxDrawH;

        let drawW: number;
        let drawH: number;
        if (imgAspect > stageAspect) {
          drawW = maxDrawW;
          drawH = maxDrawW / imgAspect;
        } else {
          drawH = maxDrawH;
          drawW = maxDrawH * imgAspect;
        }

        const drawX = stageX + (stageW - drawW) / 2;
        const drawY = stageY + (stageH - drawH) / 2;

        ctx.drawImage(img, drawX, drawY, drawW, drawH);
        ctx.restore();
      }
    } catch {
      // Non-fatal, continue rendering text content
    }
  }

  // 6. Dossier & Hero Identity Details (Below stage)
  const infoStartY = stageY + stageH + 34;

  // 6a. Handle & Archetype Row
  ctx.font = '600 15px "JetBrains Mono", monospace';
  ctx.fillStyle = primaryColor;
  ctx.fillText(usernameText, stageX, infoStartY);

  // Archetype Badge (Right side of handle row)
  ctx.font = '700 11px Inter, system-ui, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'right';
  ctx.fillText(mascot.archetypeLabel.toUpperCase(), stageX + stageW, infoStartY);
  ctx.textAlign = 'left';

  // 6b. Hero Title (Large bold)
  ctx.font = '900 36px Inter, system-ui, sans-serif';
  ctx.fillStyle = '#ffffff';
  const heroTitle = mascot.heroTitle || mascot.title;
  ctx.fillText(heroTitle, stageX, infoStartY + 42);

  // 6c. Hero Pillar & Variant Details Pill Row
  const pillRowY = infoStartY + 64;

  // Hero Pillar Pill
  const pillarBadgeW = ctx.measureText(`PILLAR • ${pillarText}`).width + 24;
  const pillarBadgeH = 24;
  drawRoundedRect(ctx, stageX, pillRowY, pillarBadgeW, pillarBadgeH, 12);
  ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.font = '700 11px "JetBrains Mono", monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(`PILLAR • ${pillarText}`, stageX + 12, pillRowY + 16);

  // Variant & Family metadata
  const metaX = stageX + pillarBadgeW + 16;
  ctx.font = '600 13px Inter, system-ui, sans-serif';
  ctx.fillStyle = '#cbd5e1';
  ctx.fillText(`${mascot.variantName}  •  ${mascot.familyName}`, metaX, pillRowY + 16);

  // 6d. Personalized Motto (Italic)
  const mottoY = pillRowY + 48;
  ctx.font = 'italic 500 14px Inter, system-ui, sans-serif';
  ctx.fillStyle = '#e2e8f0';
  const mottoText = `"${mascot.personality.motto}"`;
  ctx.fillText(mottoText, stageX, mottoY);

  // 6e. Visual Attributes Specs
  const specsY = mottoY + 34;
  ctx.font = '500 12px "JetBrains Mono", monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(`ATTIRE: ${mascot.visual.outfit}`, stageX, specsY);
  ctx.fillText(`EQUIPMENT: ${mascot.visual.equipment}`, stageX, specsY + 20);

  // 7. Footer Divider & Watermark
  const footerLineY = cardY + cardH - 52;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(stageX, footerLineY);
  ctx.lineTo(stageX + stageW, footerLineY);
  ctx.stroke();

  ctx.font = '600 11px "JetBrains Mono", monospace';
  ctx.fillStyle = '#64748b';
  ctx.fillText('DLICOM NEXUS • IMMUTABLE MASCOT IDENTITY', stageX, footerLineY + 28);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#818cf8';
  ctx.fillText('dlicom.io/mascot', stageX + stageW, footerLineY + 28);
  ctx.textAlign = 'left';

  return canvas;
}

/**
 * Triggers a client-side download of the complete Dlicom Hero Share Card as a PNG image
 */
export async function exportHeroShareCardAsPng(mascot: MascotVariant): Promise<void> {
  const canvas = await renderHeroShareCardCanvas(mascot);
  const filename = getHeroCardFilename(mascot.username, mascot.mascotId);

  return new Promise<void>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to generate image blob from canvas'));
        return;
      }
      try {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        resolve();
      } catch (err) {
        reject(err);
      }
    }, 'image/png');
  });
}
