// server.js
// Run: npm i express canvas && node server.js
// Visit: http://localhost:3001

const express = require("express");
const { createCanvas, registerFont } = require("canvas");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3001;

const W = 1466,
  H = 371;
const FONT_STACK =
  '"Bodoni Moda","Playfair Display","Cormorant Garamond","Spectral SC","Times New Roman","Serif"';
const SUBTEXT = "PROXY RESIDENTIAL P2P";
const FONT_DIR = path.join(__dirname, "fonts");

/* ===== Register fonts ===== */
function tryRegister(file, family, weight = "normal", style = "normal") {
  try {
    const p = path.join(FONT_DIR, file);
    if (fs.existsSync(p)) registerFont(p, { family, weight, style });
  } catch (_) {}
}

// Bodoni Moda
tryRegister("BodoniModa-Black.ttf", "Bodoni Moda", "900");
tryRegister("BodoniModa-ExtraBold.ttf", "Bodoni Moda", "800");
tryRegister("BodoniModa-Bold.ttf", "Bodoni Moda", "700");
tryRegister("BodoniModa-SemiBold.ttf", "Bodoni Moda", "600");
tryRegister("BodoniModa-Regular.ttf", "Bodoni Moda", "400");
// Playfair Display & Cormorant Garamond (fallbacks)
tryRegister("PlayfairDisplay-Black.ttf", "Playfair Display", "900");
tryRegister("PlayfairDisplay-Bold.ttf", "Playfair Display", "700");
tryRegister("PlayfairDisplay-Regular.ttf", "Playfair Display", "400");
tryRegister("CormorantGaramond-Bold.ttf", "Cormorant Garamond", "700");
tryRegister("CormorantGaramond-Regular.ttf", "Cormorant Garamond", "400");
tryRegister("SpectralSC-Bold.ttf", "Spectral SC", "700");
tryRegister("SpectralSC-Regular.ttf", "Spectral SC", "400");

/* ===== Brand palettes ===== */
const BRAND_STYLES = {
  netproxy: {
    fillStops: [
      [0.0, "#FFF1A6"],
      [0.22, "#FFC458"],
      [0.55, "#FF781F"],
      [1.0, "#FF3A1F"],
    ],
  },
  aurora: {
    fillStops: [
      [0.0, "#5CF1E2"],
      [0.3, "#59C8F9"],
      [0.6, "#7D86FF"],
      [1.0, "#9757F6"],
    ],
  },
  ocean: {
    fillStops: [
      [0.0, "#4ED0FF"],
      [0.45, "#3AA0FF"],
      [1.0, "#2B66FF"],
    ],
  },
  candy: {
    fillStops: [
      [0.0, "#FF6FD8"],
      [0.5, "#FF8C6F"],
      [1.0, "#FFCA5C"],
    ],
  },
};

function getBrand(style) {
  const k = String(style || "netproxy").toLowerCase();
  return BRAND_STYLES[k] || BRAND_STYLES.netproxy;
}

/* ===== Utils ===== */
function normalizeHost(h) {
  const s = (h || "localhost").toString().trim();
  const noProto = s.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
  const cutPath = noProto.split(/[/?#]/)[0];
  return cutPath.split(":")[0].trim().toLowerCase();
}

/* Lấy tên miền gốc (bỏ subdomain) — hỗ trợ .co.uk, .com.vn, .com.au, ... */
const SLD_CC = new Set([
  "co",
  "com",
  "net",
  "org",
  "gov",
  "edu",
  "ac",
  "mil",
  "go",
  "ne",
  "or",
]);

function rootDomain(input) {
  const labels = normalizeHost(input).split(".").filter(Boolean);
  if (labels.length <= 2) return labels.join(".") || "localhost";
  const last = labels[labels.length - 1];
  const second = labels[labels.length - 2];
  const third = labels[labels.length - 3];
  if (SLD_CC.has(second) && third) return `${third}.${second}.${last}`;
  return `${second}.${last}`;
}

function sldLabel(input) {
  const rd = rootDomain(input);
  const parts = rd.split(".");
  return parts.length >= 2 ? parts[0] : parts[0] || "x";
}

function firstLetterOfDomain(input) {
  const sld = sldLabel(input);
  const m = (sld || "").match(/[a-z0-9]/i);
  return (m ? m[0] : "x").toUpperCase();
}

function splitDomainForGradient(domain) {
  const i = domain.lastIndexOf(".");
  if (i <= 0 || i === domain.length - 1) return { main: domain, suf: "" };
  const suf = domain.slice(i + 1);
  if (/^(io|net|com|ai|app|dev|co|me|gg|org|vn)$/i.test(suf))
    return { main: domain.slice(0, i + 1), suf };
  return { main: domain, suf: "" };
}

function measure(ctx, text) {
  const m = ctx.measureText(text);
  const asc = m.actualBoundingBoxAscent ?? m.emHeightAscent ?? 0;
  const des = m.actualBoundingBoxDescent ?? m.emHeightDescent ?? 0;
  return { w: m.width, asc, des };
}

function buildGradient(ctx, x0, y0, x1, y1, stops) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  stops.forEach((s) => g.addColorStop(s[0], s[1]));
  return g;
}

/* ========= Fancy word rendering ========= */
function measureFancyWidth(
  ctx,
  text,
  {
    size,
    weight = "900",
    trackingEm = 0.03,
    smallCaps = true,
    smallScale = 0.92,
  },
) {
  let width = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === " ") {
      width += size * 0.36;
      continue;
    }
    const isLower = /[a-z]/.test(ch);
    const useSize = smallCaps && isLower ? size * smallScale : size;
    ctx.font = `${weight} ${useSize}px ${FONT_STACK}`;
    const glyph = smallCaps ? ch.toUpperCase() : ch;
    width += measure(ctx, glyph).w;
    if (i < text.length - 1) width += trackingEm * size;
  }
  return width;
}

/* Fit width; nếu minPx cũng không fit thì tự scale nhỏ hơn minPx */
function fitFancyToWidth(ctx, text, maxW, minPx, maxPx, opts) {
  let lo = minPx,
    hi = maxPx,
    ans = minPx;
  let anyFit = false;

  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const w = measureFancyWidth(ctx, text, { ...opts, size: mid });
    if (w <= maxW) {
      anyFit = true;
      ans = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  if (!anyFit) {
    const wMin = measureFancyWidth(ctx, text, { ...opts, size: minPx });
    if (wMin <= 0 || !isFinite(wMin)) return minPx;
    const scale = maxW / wMin;
    const s = Math.max(40, Math.floor(minPx * scale));
    return s;
  }

  return ans;
}

function drawFancyText(
  ctx,
  text,
  {
    x,
    baseline,
    size,
    color = "#FFFFFF",
    weight = "900",
    trackingEm = 0.03,
    smallCaps = true,
    smallScale = 0.92,
    strokeWidth = 0,
  },
) {
  ctx.save();
  let cursor = x;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === " ") {
      cursor += size * 0.36;
      continue;
    }

    const isLower = /[a-z]/.test(ch);
    const useSize = smallCaps && isLower ? size * smallScale : size;

    ctx.font = `${weight} ${useSize}px ${FONT_STACK}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = color;

    const glyph = smallCaps ? ch.toUpperCase() : ch;

    if (strokeWidth > 0) {
      ctx.lineWidth = strokeWidth;
      ctx.lineJoin = "round";
      ctx.miterLimit = 2;
      ctx.strokeStyle = color;
      ctx.strokeText(glyph, cursor, baseline);
    }

    ctx.fillText(glyph, cursor, baseline);

    const w = measure(ctx, glyph).w;
    cursor += w + trackingEm * size;
  }

  ctx.restore();
  return cursor - x;
}

/* ===== Gradient text ===== */
function drawGradientText(
  main,
  brand,
  {
    text,
    x,
    baseline,
    size,
    weight = "900",
    trackingEm = 0.03,
    smallCaps = true,
    smallScale = 0.92,
    strokeWidth = 0,
  },
) {
  const tmp = createCanvas(10, 10).getContext("2d");
  const textW = measureFancyWidth(tmp, text, {
    size,
    weight,
    trackingEm,
    smallCaps,
    smallScale,
  });

  const padX = Math.ceil(size * 0.12);
  const boxW = Math.ceil(textW + padX * 2);
  const boxH = Math.ceil(size * 1.26);

  const c = createCanvas(boxW, boxH);
  const g = c.getContext("2d");

  let cursor = padX;
  const padY = Math.ceil(size * 0.18);
  const base = padY + size * 0.98;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === " ") {
      cursor += size * 0.36;
      continue;
    }
    const isLower = /[a-z]/.test(ch);
    const useSize = smallCaps && isLower ? size * smallScale : size;
    g.font = `${weight} ${useSize}px ${FONT_STACK}`;
    g.textAlign = "left";
    g.textBaseline = "alphabetic";
    const glyph = smallCaps ? ch.toUpperCase() : ch;
    g.fillStyle = "#000";

    if (strokeWidth > 0) {
      g.lineWidth = strokeWidth;
      g.lineJoin = "round";
      g.miterLimit = 2;
      g.strokeStyle = "#000";
      g.strokeText(glyph, cursor, base);
    }

    g.fillText(glyph, cursor, base);
    const w = measure(g, glyph).w;
    cursor += w + trackingEm * size;
  }

  g.globalCompositeOperation = "source-in";
  g.fillStyle = buildGradient(g, 0, 0, boxW, boxH, brand.fillStops);
  g.fillRect(0, 0, boxW, boxH);

  main.drawImage(c, x, baseline - size * 0.98 - padY);
  return { w: boxW, asc: size * 0.98, des: size * 0.28 };
}

/* ===== Letter logo ===== */
function drawLetterLogo(ctx, x, y, w, h, letter, brand) {
  const pad = 2;
  const maxW = w - pad * 2;
  const maxH = h - pad * 2;

  const cx = x + w / 2;
  const cy = y + h / 2;
  const r = Math.min(w, h) * 0.48;
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  glow.addColorStop(0, "rgba(255,255,255,0.06)");
  glow.addColorStop(1, "rgba(255,255,255,0.00)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  const size = (function () {
    let lo = 8,
      hi = h * 3,
      ans = 8;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      ctx.font = `900 ${mid}px ${FONT_STACK}`;
      const m = measure(ctx, letter);
      if (m.w <= maxW && m.asc + m.des <= maxH) {
        ans = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    return Math.floor(ans * 1.04);
  })();

  ctx.font = `900 ${size}px ${FONT_STACK}`;
  const m = measure(ctx, letter);
  const asc = m.asc || size * 0.78;
  const des = m.des || size * 0.22;
  const baseline = y + pad + (maxH + asc - des) / 2;

  const padX = Math.ceil(size * 0.12);
  const gradientBoxW = m.w + padX * 2;
  const startX = x + pad + (maxW - gradientBoxW) / 2;

  drawGradientText(ctx, brand, {
    text: letter,
    x: startX,
    baseline,
    size,
    weight: "900",
    trackingEm: 0.0,
    smallCaps: false,
    smallScale: 1.0,
    strokeWidth: 0,
  });
}

/* ===== Text color ===== */
function textColors(theme) {
  if (theme === "dark") {
    return {
      main: "#FFFFFF",
      sub: "#E5E7FF",
    };
  }
  return {
    main: "#111111",
    sub: "#4B5563",
  };
}

/* Layout theo độ dài SLD */
function domainLayout(domain) {
  const core = sldLabel(domain).toUpperCase();
  const len = core.length;

  if (len >= 14) {
    return { trackingEm: 0.01, minSize: 64, maxSize: 540 };
  } else if (len >= 11) {
    return { trackingEm: 0.014, minSize: 80, maxSize: 620 };
  }
  return { trackingEm: 0.018, minSize: 110, maxSize: 720 };
}

/* ===== Banner ===== */
function drawBannerTransparent({ domain, letter, brand, theme = "light" }) {
  const canvas = createCanvas(W, H);
  const g = canvas.getContext("2d");

  const PAD_L = 16,
    PAD_R = 24,
    GAP = 36;
  const LOGO_W = H,
    LOGO_X = PAD_L;

  drawLetterLogo(g, LOGO_X, 0, LOGO_W, H, letter, brand);

  const parts = splitDomainForGradient(domain);
  const textX = LOGO_X + LOGO_W + GAP;
  const textMaxW = W - textX - PAD_R;

  const layout = domainLayout(domain);
  const trackingEmDomain = layout.trackingEm;
  const smallScale = 0.9;

  let domainSize = fitFancyToWidth(
    g,
    parts.main + (parts.suf || ""),
    Math.floor(textMaxW * 0.998),
    layout.minSize,
    layout.maxSize,
    {
      weight: "900",
      trackingEm: trackingEmDomain,
      smallCaps: true,
      smallScale,
    },
  );

  const maxByHeight = Math.floor(H * 0.44);
  if (domainSize > maxByHeight) domainSize = maxByHeight;

  const ascApprox = domainSize * 0.98;
  const desApprox = domainSize * 0.28;

  const blockTop = Math.max(
    0,
    Math.floor((H - (ascApprox + desApprox) - 20 - domainSize * 0.5) / 2),
  );

  const baselineDom = blockTop + ascApprox;
  const colors = textColors(theme);

  const drawnMainW = drawFancyText(g, parts.main, {
    x: textX,
    baseline: baselineDom,
    size: domainSize,
    color: colors.main,
    weight: "900",
    trackingEm: trackingEmDomain,
    smallCaps: true,
    smallScale,
    strokeWidth: 3.0,
  });

  if (parts.suf) {
    drawGradientText(g, brand, {
      text: parts.suf,
      x: textX + drawnMainW,
      baseline: baselineDom,
      size: domainSize,
      weight: "900",
      trackingEm: trackingEmDomain,
      smallCaps: true,
      smallScale,
      strokeWidth: 3.0,
    });
  }

  const subTracking = 0.055;
  let subSize = Math.min(260, Math.max(52, Math.floor(domainSize * 0.92)));
  while (
    measureFancyWidth(g, SUBTEXT, {
      size: subSize,
      weight: "400",
      trackingEm: subTracking,
      smallCaps: true,
      smallScale: 0.9,
    }) > textMaxW
  ) {
    subSize -= 2;
    if (subSize <= 32) break;
  }

  const baselineSub =
    baselineDom +
    desApprox +
    Math.max(22, Math.round(domainSize * 0.24)) +
    subSize * 0.9;

  drawFancyText(g, SUBTEXT, {
    x: textX,
    baseline: baselineSub,
    size: subSize,
    color: colors.sub,
    weight: "400",
    trackingEm: subTracking,
    smallCaps: true,
    smallScale: 0.9,
    strokeWidth: 0,
  });

  return canvas;
}

/* ===== ICO ===== */
function canvasToPNGBuffer(size, letter, brand) {
  const c = createCanvas(size, size),
    x = c.getContext("2d");
  drawLetterLogo(x, 0, 0, size, size, letter, brand);
  return c.toBuffer("image/png");
}

function buildICOFromPNGs(entries) {
  const count = entries.length,
    header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);
  let offset = 6 + count * 16;
  const dirs = [];
  for (const { size, buf } of entries) {
    const b = Buffer.alloc(16);
    b.writeUInt8(size === 256 ? 0 : size, 0);
    b.writeUInt8(size === 256 ? 0 : size, 1);
    b.writeUInt8(0, 2);
    b.writeUInt8(0, 3);
    b.writeUInt16LE(1, 4);
    b.writeUInt16LE(32, 6);
    b.writeUInt32LE(buf.length, 8);
    b.writeUInt32LE(offset, 12);
    dirs.push(b);
    offset += buf.length;
  }
  return Buffer.concat([header, ...dirs, ...entries.map((e) => e.buf)]);
}

function generateFaviconICO(letter, brand) {
  const sizes = [256, 128, 64, 48, 32, 16];
  const entries = sizes.map((s) => ({
    size: s,
    buf: canvasToPNGBuffer(s, letter, brand),
  }));
  return buildICOFromPNGs(entries);
}

/* ===== API: /gen ===== */
app.get("/gen", (req, res) => {
  try {
    const host = normalizeHost(req.headers.host);
    const rawLogo = (req.query.logo || host).toString();
    const base = rootDomain(rawLogo);
    const letter = firstLetterOfDomain(base);

    const format = (req.query.format || "light").toString().toLowerCase();
    const theme = format === "dark" ? "dark" : "light";

    const type = (req.query.type || "main").toString();
    const style = (req.query.style || "netproxy").toString();
    const brand = getBrand(style);

    let canvas;
    if (type === "only_logo") {
      const size = 1024;
      canvas = createCanvas(size, size);
      const ctx = canvas.getContext("2d");
      drawLetterLogo(ctx, 0, 0, size, size, letter, brand);
    } else {
      canvas = drawBannerTransparent({
        domain: base,
        letter,
        brand,
        theme,
      });
    }

    res.setHeader("Cache-Control", "no-store");
    res.type("png");
    canvas.createPNGStream().pipe(res);
  } catch (e) {
    console.error(e);
    res.status(500).send(`Gen error: ${e.message}`);
  }
});

/* ===== Routes cũ (preview + download) ===== */
app.get("/", (req, res) => {
  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Banner Generator</title>
  <link rel="icon" href="/icon.ico?domain=netproxy.io">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #f8fafc;
      --card: #ffffff;
      --border: #e2e8f0;
      --text: #1e293b;
      --muted: #64748b;
      --accent: linear-gradient(135deg, #FFF1A6 0%, #FFC458 30%, #FF781F 60%, #FF3A1F 100%);
      --radius: 12px;
      --shadow: 0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04);
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      padding: 24px;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
    }

    header {
      text-align: center;
      margin-bottom: 40px;
    }

    h1 {
      font-size: 2.5rem;
      font-weight: 700;
      background: var(--accent);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 8px;
    }

    .subtitle {
      color: var(--muted);
      font-size: 1rem;
    }

    .controls {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 24px;
      margin-bottom: 32px;
      box-shadow: var(--shadow);
    }

    .form-row {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: flex-end;
    }

    .form-group {
      flex: 1;
      min-width: 200px;
    }

    label {
      display: block;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text);
      margin-bottom: 8px;
    }

    input[type="text"] {
      width: 100%;
      padding: 12px 16px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text);
      font-size: 1rem;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    input[type="text"]:focus {
      outline: none;
      border-color: #FF781F;
      box-shadow: 0 0 0 3px rgba(255, 120, 31, 0.1);
    }

    input[type="text"]::placeholder {
      color: var(--muted);
    }

    .btn-group {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .style-btn {
      padding: 10px 18px;
      border: 2px solid var(--border);
      border-radius: 8px;
      background: var(--card);
      color: var(--text);
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s;
    }

    .style-btn:hover {
      border-color: #FF781F;
    }

    .style-btn.active {
      background: linear-gradient(135deg, #FF781F 0%, #FF3A1F 100%);
      border-color: transparent;
      color: #fff;
    }

    .style-btn.aurora.active {
      background: linear-gradient(135deg, #5CF1E2 0%, #9757F6 100%);
    }

    .style-btn.ocean.active {
      background: linear-gradient(135deg, #4ED0FF 0%, #2B66FF 100%);
    }

    .style-btn.candy.active {
      background: linear-gradient(135deg, #FF6FD8 0%, #FFCA5C 100%);
    }

    .generate-btn {
      padding: 12px 32px;
      background: linear-gradient(135deg, #FF781F 0%, #FF3A1F 100%);
      border: none;
      border-radius: 8px;
      color: #fff;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .generate-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(255, 120, 31, 0.3);
    }

    .results {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 24px;
    }

    .result-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
      box-shadow: var(--shadow);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 18px;
      border-bottom: 1px solid var(--border);
      background: var(--bg);
    }

    .card-title {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text);
    }

    .badge {
      font-size: 0.75rem;
      padding: 4px 10px;
      border-radius: 999px;
      font-weight: 500;
    }

    .badge.light {
      background: #fef3c7;
      color: #92400e;
    }

    .badge.dark {
      background: #1e293b;
      color: #e2e8f0;
    }

    .preview-area {
      padding: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 140px;
      background: #fff;
    }

    .preview-area.dark-bg {
      background: #0f172a;
    }

    .preview-area img {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
    }

    .logo-preview {
      min-height: 160px;
    }

    .logo-preview img {
      width: 120px;
      height: 120px;
    }

    .card-actions {
      padding: 14px 18px;
      border-top: 1px solid var(--border);
      display: flex;
      gap: 10px;
      background: var(--bg);
    }

    .action-btn {
      flex: 1;
      padding: 10px 16px;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;
      text-align: center;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }

    .action-btn:hover {
      border-color: #FF781F;
      color: #FF781F;
    }

    .action-btn.primary {
      background: linear-gradient(135deg, #FF781F 0%, #FF3A1F 100%);
      border: none;
      color: #fff;
    }

    .action-btn.primary:hover {
      color: #fff;
      box-shadow: 0 4px 12px rgba(255, 120, 31, 0.3);
    }

    .action-btn svg {
      width: 16px;
      height: 16px;
    }

    .api-info {
      margin-top: 40px;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 24px;
      box-shadow: var(--shadow);
    }

    .api-info h3 {
      font-size: 1.125rem;
      margin-bottom: 16px;
      color: var(--text);
    }

    .api-endpoint {
      background: var(--bg);
      padding: 14px 18px;
      border-radius: 8px;
      font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
      font-size: 0.85rem;
      margin-bottom: 12px;
      overflow-x: auto;
      white-space: nowrap;
      border: 1px solid var(--border);
    }

    .api-endpoint code {
      color: #FF781F;
      font-weight: 600;
    }

    .param-list {
      display: grid;
      gap: 10px;
      margin-top: 16px;
    }

    .param-item {
      display: flex;
      gap: 12px;
      font-size: 0.875rem;
      padding: 8px 0;
      border-bottom: 1px solid var(--border);
    }

    .param-item:last-child {
      border-bottom: none;
    }

    .param-name {
      font-family: monospace;
      color: #FF781F;
      font-weight: 600;
      min-width: 80px;
    }

    .param-desc {
      color: var(--muted);
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: var(--muted);
      grid-column: 1 / -1;
    }

    .empty-state svg {
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.4;
    }

    .toast {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background: #10b981;
      color: #fff;
      padding: 14px 28px;
      border-radius: 10px;
      font-size: 0.9rem;
      font-weight: 500;
      opacity: 0;
      transition: all 0.3s ease;
      z-index: 1000;
      box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
    }

    .toast.show {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }

    @media (max-width: 640px) {
      body { padding: 16px; }
      h1 { font-size: 1.75rem; }
      .form-row { flex-direction: column; }
      .form-group { min-width: 100%; }
      .results { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Banner Generator</h1>
      <p class="subtitle">Generate beautiful banners and logos for your brand</p>
    </header>

    <div class="controls">
      <div class="form-row">
        <div class="form-group">
          <label for="logo">Domain / Brand Name</label>
          <input type="text" id="logo" placeholder="netproxy.io" value="netproxy.io">
        </div>

        <div class="form-group">
          <label>Style</label>
          <div class="btn-group" id="styleGroup">
            <button class="style-btn netproxy active" data-style="netproxy">Netproxy</button>
            <button class="style-btn aurora" data-style="aurora">Aurora</button>
            <button class="style-btn ocean" data-style="ocean">Ocean</button>
            <button class="style-btn candy" data-style="candy">Candy</button>
          </div>
        </div>

        <div class="form-group" style="flex: 0 0 auto;">
          <label>&nbsp;</label>
          <button class="generate-btn" id="generateBtn" onclick="generate()">Generate</button>
        </div>
      </div>
    </div>

    <div class="results" id="results">
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p>Enter a domain name and click Generate to create your banner</p>
      </div>
    </div>

    <div class="api-info">
      <h3>API Reference</h3>
      <div class="api-endpoint">
        GET <code>/gen?logo={domain}&format={light|dark}&type={main|only_logo}&style={style}</code>
      </div>
      <div class="param-list">
        <div class="param-item">
          <span class="param-name">logo</span>
          <span class="param-desc">Domain or brand name (e.g., netproxy.io)</span>
        </div>
        <div class="param-item">
          <span class="param-name">format</span>
          <span class="param-desc">Theme: light or dark</span>
        </div>
        <div class="param-item">
          <span class="param-name">type</span>
          <span class="param-desc">Output type: main (full banner) or only_logo (letter logo)</span>
        </div>
        <div class="param-item">
          <span class="param-name">style</span>
          <span class="param-desc">Color style: netproxy, aurora, ocean, candy</span>
        </div>
      </div>
    </div>
  </div>

  <div class="toast" id="toast">URL copied to clipboard!</div>

  <script>
    let currentStyle = 'netproxy';

    const icons = {
      download: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>',
      copy: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>'
    };

    document.querySelectorAll('.style-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.style-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentStyle = btn.dataset.style;
      });
    });

    document.getElementById('logo').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') generate();
    });

    function showToast(message) {
      const toast = document.getElementById('toast');
      toast.textContent = message;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2000);
    }

    function generate() {
      const logo = document.getElementById('logo').value.trim() || 'netproxy.io';
      const style = currentStyle;

      const urls = {
        bannerLight: '/gen?logo=' + encodeURIComponent(logo) + '&format=light&type=main&style=' + style,
        bannerDark: '/gen?logo=' + encodeURIComponent(logo) + '&format=dark&type=main&style=' + style,
        logoLight: '/gen?logo=' + encodeURIComponent(logo) + '&format=light&type=only_logo&style=' + style,
        logoDark: '/gen?logo=' + encodeURIComponent(logo) + '&format=dark&type=only_logo&style=' + style
      };

      const results = document.getElementById('results');
      results.innerHTML =
        '<div class="result-card">' +
          '<div class="card-header">' +
            '<span class="card-title">Full Banner</span>' +
            '<span class="badge light">Light</span>' +
          '</div>' +
          '<div class="preview-area">' +
            '<img src="' + urls.bannerLight + '" alt="Banner Light">' +
          '</div>' +
          '<div class="card-actions">' +
            '<button class="action-btn primary" onclick="downloadImage(\\'' + urls.bannerLight + '\\', \\'banner-light.png\\')">' + icons.download + ' Download</button>' +
            '<button class="action-btn" onclick="copyUrl(\\'' + urls.bannerLight + '\\')">' + icons.copy + ' Copy</button>' +
          '</div>' +
        '</div>' +

        '<div class="result-card">' +
          '<div class="card-header">' +
            '<span class="card-title">Full Banner</span>' +
            '<span class="badge dark">Dark</span>' +
          '</div>' +
          '<div class="preview-area dark-bg">' +
            '<img src="' + urls.bannerDark + '" alt="Banner Dark">' +
          '</div>' +
          '<div class="card-actions">' +
            '<button class="action-btn primary" onclick="downloadImage(\\'' + urls.bannerDark + '\\', \\'banner-dark.png\\')">' + icons.download + ' Download</button>' +
            '<button class="action-btn" onclick="copyUrl(\\'' + urls.bannerDark + '\\')">' + icons.copy + ' Copy</button>' +
          '</div>' +
        '</div>' +

        '<div class="result-card">' +
          '<div class="card-header">' +
            '<span class="card-title">Logo Only</span>' +
            '<span class="badge light">Light</span>' +
          '</div>' +
          '<div class="preview-area logo-preview">' +
            '<img src="' + urls.logoLight + '" alt="Logo Light">' +
          '</div>' +
          '<div class="card-actions">' +
            '<button class="action-btn primary" onclick="downloadImage(\\'' + urls.logoLight + '\\', \\'logo-light.png\\')">' + icons.download + ' Download</button>' +
            '<button class="action-btn" onclick="copyUrl(\\'' + urls.logoLight + '\\')">' + icons.copy + ' Copy</button>' +
          '</div>' +
        '</div>' +

        '<div class="result-card">' +
          '<div class="card-header">' +
            '<span class="card-title">Logo Only</span>' +
            '<span class="badge dark">Dark</span>' +
          '</div>' +
          '<div class="preview-area logo-preview dark-bg">' +
            '<img src="' + urls.logoDark + '" alt="Logo Dark">' +
          '</div>' +
          '<div class="card-actions">' +
            '<button class="action-btn primary" onclick="downloadImage(\\'' + urls.logoDark + '\\', \\'logo-dark.png\\')">' + icons.download + ' Download</button>' +
            '<button class="action-btn" onclick="copyUrl(\\'' + urls.logoDark + '\\')">' + icons.copy + ' Copy</button>' +
          '</div>' +
        '</div>';
    }

    async function downloadImage(url, filename) {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);

        showToast('Download started!');
      } catch (err) {
        window.open(url, '_blank');
        showToast('Opening in new tab...');
      }
    }

    function copyUrl(url) {
      const fullUrl = window.location.origin + url;
      navigator.clipboard.writeText(fullUrl).then(() => {
        showToast('URL copied to clipboard!');
      }).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = fullUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('URL copied to clipboard!');
      });
    }

    generate();
  </script>
</body>
</html>`;
  res.setHeader("Cache-Control", "no-store");
  res.type("html").send(html);
});

app.get("/banner.png", (req, res) => {
  const host = normalizeHost(req.headers.host);
  const input = (req.query.domain || host).toString();
  const base = rootDomain(input);
  const letter = firstLetterOfDomain(base);
  const brand = getBrand(req.query.style);
  const theme = req.query.theme === "dark" ? "dark" : "light";
  const canvas = drawBannerTransparent({ domain: base, letter, brand, theme });
  res.setHeader("Cache-Control", "no-store");
  res.type("png");
  canvas.createPNGStream().pipe(res);
});

app.get("/logo.png", (req, res) => {
  const host = normalizeHost(req.headers.host);
  const input = (req.query.domain || host).toString();
  const base = rootDomain(input);
  const letter = firstLetterOfDomain(base);
  const size = Math.max(64, Math.min(2048, parseInt(req.query.size) || 512));
  const brand = getBrand(req.query.style);
  const canvas = createCanvas(size, size),
    ctx = canvas.getContext("2d");
  drawLetterLogo(ctx, 0, 0, size, size, letter, brand);
  res.setHeader("Cache-Control", "no-store");
  res.type("png");
  canvas.createPNGStream().pipe(res);
});

app.get("/icon.ico", (req, res) => {
  const host = normalizeHost(req.headers.host);
  const input = (req.query.domain || host).toString();
  const base = rootDomain(input);
  const letter = firstLetterOfDomain(base);
  const brand = getBrand(req.query.style);
  const ico = generateFaviconICO(letter, brand);
  res.setHeader("Cache-Control", "no-store");
  res.type("image/x-icon");
  res.end(ico);
});

app.get("/favicon.ico", (req, res) => {
  res.redirect("/icon.ico");
});

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
