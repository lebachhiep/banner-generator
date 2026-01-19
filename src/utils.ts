/**
 * Domain parsing utilities
 */

export function normalizeHost(h: string | null | undefined): string {
  const s = (h || 'localhost').toString().trim();
  const noProto = s.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
  const cutPath = noProto.split(/[/?#]/)[0];
  return cutPath.split(':')[0].trim().toLowerCase();
}

// Second-level domain country codes (e.g., .co.uk, .com.vn)
const SLD_CC = new Set([
  'co', 'com', 'net', 'org', 'gov', 'edu', 'ac', 'mil', 'go', 'ne', 'or',
]);

export function rootDomain(input: string): string {
  const labels = normalizeHost(input).split('.').filter(Boolean);
  if (labels.length <= 2) return labels.join('.') || 'localhost';
  const last = labels[labels.length - 1];
  const second = labels[labels.length - 2];
  const third = labels[labels.length - 3];
  if (SLD_CC.has(second) && third) return `${third}.${second}.${last}`;
  return `${second}.${last}`;
}

export function sldLabel(input: string): string {
  const rd = rootDomain(input);
  const parts = rd.split('.');
  return parts.length >= 2 ? parts[0] : parts[0] || 'x';
}

export function firstLetterOfDomain(input: string): string {
  const sld = sldLabel(input);
  const m = (sld || '').match(/[a-z0-9]/i);
  return (m ? m[0] : 'x').toUpperCase();
}

export function splitDomainForGradient(domain: string): { main: string; suf: string } {
  const i = domain.lastIndexOf('.');
  if (i <= 0 || i === domain.length - 1) return { main: domain, suf: '' };
  const suf = domain.slice(i + 1);
  if (/^(io|net|com|ai|app|dev|co|me|gg|org|vn)$/i.test(suf)) {
    return { main: domain.slice(0, i + 1), suf };
  }
  return { main: domain, suf: '' };
}

/**
 * Layout configuration based on domain length
 */
export function domainLayout(domain: string): {
  trackingEm: number;
  minSize: number;
  maxSize: number;
} {
  const core = sldLabel(domain).toUpperCase();
  const len = core.length;

  if (len >= 14) {
    return { trackingEm: 0.01, minSize: 64, maxSize: 540 };
  } else if (len >= 11) {
    return { trackingEm: 0.014, minSize: 80, maxSize: 620 };
  }
  return { trackingEm: 0.018, minSize: 110, maxSize: 720 };
}
