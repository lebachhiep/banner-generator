import satori from '@cf-wasm/satori';
import { loadFonts } from './fonts';
import { getBrand } from './styles';
import { normalizeHost, rootDomain, firstLetterOfDomain } from './utils';
import { bannerMarkup, logoOnlyMarkup, faviconMarkup, BANNER_WIDTH, BANNER_HEIGHT } from './banner';
import { getPreviewHTML } from './html';

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    try {
      // Route: Home page
      if (pathname === '/' || pathname === '') {
        return new Response(getPreviewHTML(), {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }

      // Route: Generate banner/logo
      if (pathname === '/gen') {
        return await handleGen(url, request);
      }

      // Route: Banner SVG (legacy support)
      if (pathname === '/banner.svg' || pathname === '/banner.png') {
        const newUrl = new URL(url);
        newUrl.pathname = '/gen';
        newUrl.searchParams.set('type', 'main');
        if (url.searchParams.has('domain')) {
          newUrl.searchParams.set('logo', url.searchParams.get('domain')!);
        }
        if (url.searchParams.has('theme')) {
          newUrl.searchParams.set('format', url.searchParams.get('theme')!);
        }
        return await handleGen(newUrl, request);
      }

      // Route: Logo SVG (legacy support)
      if (pathname === '/logo.svg' || pathname === '/logo.png') {
        const newUrl = new URL(url);
        newUrl.pathname = '/gen';
        newUrl.searchParams.set('type', 'only_logo');
        if (url.searchParams.has('domain')) {
          newUrl.searchParams.set('logo', url.searchParams.get('domain')!);
        }
        return await handleGen(newUrl, request);
      }

      // Route: Favicon SVG
      if (pathname === '/icon.svg' || pathname === '/favicon.ico' || pathname === '/icon.ico') {
        return await handleFavicon(url, request);
      }

      // 404
      return new Response('Not Found', { status: 404 });
    } catch (error) {
      console.error('Error:', error);
      return new Response(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, {
        status: 500,
      });
    }
  },
};

async function handleGen(url: URL, request: Request): Promise<Response> {
  const host = normalizeHost(request.headers.get('host'));
  const rawLogo = url.searchParams.get('logo') || host;
  const base = rootDomain(rawLogo);
  const letter = firstLetterOfDomain(base);

  const format = (url.searchParams.get('format') || 'light').toLowerCase();
  const theme: 'light' | 'dark' = format === 'dark' ? 'dark' : 'light';

  const type = url.searchParams.get('type') || 'main';
  const style = url.searchParams.get('style') || 'netproxy';
  const brand = getBrand(style);

  // Load fonts
  const fonts = await loadFonts();

  let svg: string;

  if (type === 'only_logo') {
    const size = Math.max(64, Math.min(2048, parseInt(url.searchParams.get('size') || '1024', 10)));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    svg = await satori(
      logoOnlyMarkup(letter, brand, size) as any,
      {
        width: size,
        height: size,
        fonts,
      }
    );
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    svg = await satori(
      bannerMarkup({ domain: base, letter, brand, theme }) as any,
      {
        width: BANNER_WIDTH,
        height: BANNER_HEIGHT,
        fonts,
      }
    );
  }

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}

async function handleFavicon(url: URL, request: Request): Promise<Response> {
  const host = normalizeHost(request.headers.get('host'));
  const rawDomain = url.searchParams.get('domain') || host;
  const base = rootDomain(rawDomain);
  const letter = firstLetterOfDomain(base);
  const style = url.searchParams.get('style') || 'netproxy';
  const brand = getBrand(style);

  const fonts = await loadFonts();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const svg = await satori(
    faviconMarkup(letter, brand, 64) as any,
    {
      width: 64,
      height: 64,
      fonts,
    }
  );

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
