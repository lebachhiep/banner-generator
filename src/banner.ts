import { html } from 'satori-html';
import type { BrandStyle } from './styles';
import { toLinearGradient, textColors, SUBTEXT } from './styles';
import { splitDomainForGradient } from './utils';
import { FONT_STACK } from './fonts';

export const BANNER_WIDTH = 1466;
export const BANNER_HEIGHT = 371;

interface BannerProps {
  domain: string;
  letter: string;
  brand: BrandStyle;
  theme: 'light' | 'dark';
}

/**
 * Generate letter logo markup
 * Note: Satori requires explicit display:flex on all containers with multiple children
 */
function letterLogoMarkup(letter: string, brand: BrandStyle, size: number): string {
  const gradient = toLinearGradient(brand);
  const fontSize = Math.floor(size * 0.85);
  
  // Simplified: just the letter with gradient, no glow effect (satori has issues with position:absolute)
  return `<div style="display: flex; align-items: center; justify-content: center; width: ${size}px; height: ${size}px;"><span style="font-size: ${fontSize}px; font-weight: 900; font-family: ${FONT_STACK}; background: ${gradient}; background-clip: text; color: transparent;">${letter}</span></div>`;
}

/**
 * Generate gradient text markup
 */
function gradientTextMarkup(
  text: string,
  brand: BrandStyle,
  fontSize: number,
  fontWeight: number = 900,
  letterSpacing: number = 0
): string {
  const gradient = toLinearGradient(brand);
  const spacing = letterSpacing ? `letter-spacing: ${letterSpacing}em;` : '';
  
  return `<span style="font-size: ${fontSize}px; font-weight: ${fontWeight}; font-family: ${FONT_STACK}; ${spacing} text-transform: uppercase; background: ${gradient}; background-clip: text; color: transparent;">${text}</span>`;
}

/**
 * Generate full banner markup
 */
export function bannerMarkup({ domain, letter, brand, theme }: BannerProps): ReturnType<typeof html> {
  const colors = textColors(theme);
  const parts = splitDomainForGradient(domain);
  
  // Calculate responsive font size based on domain length
  const domainLength = domain.length;
  let domainFontSize = 160;
  let subFontSize = 72;
  let letterSpacing = 0.018;
  
  if (domainLength >= 14) {
    domainFontSize = 100;
    subFontSize = 52;
    letterSpacing = 0.01;
  } else if (domainLength >= 11) {
    domainFontSize = 120;
    subFontSize = 58;
    letterSpacing = 0.014;
  } else if (domainLength >= 8) {
    domainFontSize = 140;
    subFontSize = 64;
    letterSpacing = 0.016;
  }

  const logoHtml = letterLogoMarkup(letter, brand, BANNER_HEIGHT);
  
  const suffixHtml = parts.suf
    ? gradientTextMarkup(parts.suf, brand, domainFontSize, 900, letterSpacing)
    : '';

  const markup = `
    <div style="display: flex; width: ${BANNER_WIDTH}px; height: ${BANNER_HEIGHT}px; align-items: center; padding: 0 24px 0 16px;">
      ${logoHtml}
      <div style="display: flex; flex-direction: column; margin-left: -20px; gap: 16px;">
        <div style="display: flex; align-items: baseline;">
          <span style="font-size: ${domainFontSize}px; font-weight: 900; font-family: ${FONT_STACK}; letter-spacing: ${letterSpacing}em; text-transform: uppercase; color: ${colors.main};">${parts.main}</span>${suffixHtml}
        </div>
        <span style="font-size: ${subFontSize}px; font-weight: 400; font-family: ${FONT_STACK}; letter-spacing: 0.055em; text-transform: uppercase; color: ${colors.sub};">${SUBTEXT}</span>
      </div>
    </div>
  `;

  return html(markup);
}

/**
 * Generate logo-only markup
 */
export function logoOnlyMarkup(letter: string, brand: BrandStyle, size: number = 1024): ReturnType<typeof html> {
  const logoHtml = letterLogoMarkup(letter, brand, size);
  
  const markup = `
    <div style="display: flex; width: ${size}px; height: ${size}px; align-items: center; justify-content: center;">
      ${logoHtml}
    </div>
  `;

  return html(markup);
}

/**
 * Generate favicon markup
 */
export function faviconMarkup(letter: string, brand: BrandStyle, size: number = 64): ReturnType<typeof html> {
  const logoHtml = letterLogoMarkup(letter, brand, size);
  
  const markup = `
    <div style="display: flex; width: ${size}px; height: ${size}px; align-items: center; justify-content: center;">
      ${logoHtml}
    </div>
  `;

  return html(markup);
}
