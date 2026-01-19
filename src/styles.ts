/**
 * Brand color palettes and style configurations
 */

export interface BrandStyle {
  fillStops: Array<{ offset: string; color: string }>;
}

export const BRAND_STYLES: Record<string, BrandStyle> = {
  netproxy: {
    fillStops: [
      { offset: '0%', color: '#FFF1A6' },
      { offset: '22%', color: '#FFC458' },
      { offset: '55%', color: '#FF781F' },
      { offset: '100%', color: '#FF3A1F' },
    ],
  },
  aurora: {
    fillStops: [
      { offset: '0%', color: '#5CF1E2' },
      { offset: '30%', color: '#59C8F9' },
      { offset: '60%', color: '#7D86FF' },
      { offset: '100%', color: '#9757F6' },
    ],
  },
  ocean: {
    fillStops: [
      { offset: '0%', color: '#4ED0FF' },
      { offset: '45%', color: '#3AA0FF' },
      { offset: '100%', color: '#2B66FF' },
    ],
  },
  candy: {
    fillStops: [
      { offset: '0%', color: '#FF6FD8' },
      { offset: '50%', color: '#FF8C6F' },
      { offset: '100%', color: '#FFCA5C' },
    ],
  },
};

export function getBrand(style: string | null | undefined): BrandStyle {
  const key = String(style || 'netproxy').toLowerCase();
  return BRAND_STYLES[key] || BRAND_STYLES.netproxy;
}

/**
 * Generate CSS linear-gradient string from brand stops
 */
export function toLinearGradient(brand: BrandStyle, direction = '135deg'): string {
  const stops = brand.fillStops.map((s) => `${s.color} ${s.offset}`).join(', ');
  return `linear-gradient(${direction}, ${stops})`;
}

/**
 * Text colors based on theme
 */
export function textColors(theme: 'light' | 'dark'): { main: string; sub: string } {
  if (theme === 'dark') {
    return { main: '#FFFFFF', sub: '#E5E7FF' };
  }
  return { main: '#111111', sub: '#4B5563' };
}

/**
 * Subtext for the banner
 */
export const SUBTEXT = 'PROXY RESIDENTIAL P2P';
