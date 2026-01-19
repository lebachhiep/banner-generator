/**
 * Font weight type matching Satori's expected values
 */
type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

/**
 * Font type for Satori
 */
export interface SatoriFont {
  name: string;
  data: ArrayBuffer;
  weight: FontWeight;
  style: 'normal' | 'italic';
}

// Font URLs from Google Fonts (TTF format for Satori compatibility)
const FONT_URLS: Array<{ url: string; weight: FontWeight }> = [
  {
    url: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf',
    weight: 400,
  },
  {
    url: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZg.ttf',
    weight: 700,
  },
  {
    url: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuBWYMZg.ttf',
    weight: 900,
  },
];

// Cache for loaded fonts
let fontsCache: SatoriFont[] | null = null;

/**
 * Load fonts from Google Fonts
 */
export async function loadFonts(): Promise<SatoriFont[]> {
  if (fontsCache) {
    return fontsCache;
  }

  try {
    const fontPromises = FONT_URLS.map(async ({ url, weight }): Promise<SatoriFont> => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch font: ${response.status}`);
      }
      const data = await response.arrayBuffer();
      return {
        name: 'Inter',
        data,
        weight,
        style: 'normal',
      };
    });

    fontsCache = await Promise.all(fontPromises);
    return fontsCache;
  } catch (error) {
    console.error('Error loading fonts:', error);
    throw error;
  }
}

/**
 * Font stack for CSS
 */
export const FONT_STACK = 'Inter, sans-serif';
