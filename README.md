# Banner Generator

A Cloudflare Workers-powered service that generates beautiful SVG banners and logos with gradient text effects.

**Live Demo:** https://banner-generator.bynari.workers.dev/

## Features

- Generate full banners with domain name and tagline
- Generate letter-only logos
- SVG favicon generation
- Light and dark themes
- 4 color styles: Netproxy, Aurora, Ocean, Candy
- Web UI for easy generation
- Direct API access
- Edge deployment (fast globally)

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Run locally (note: WASM may have limitations in local dev)
npm run dev

# Deploy to Cloudflare Workers
npm run deploy
```

### Prerequisites

- Node.js 18+
- Cloudflare account (for deployment)
- Wrangler CLI (included in devDependencies)

## API Endpoints

### Generate Banner/Logo

```
GET /gen?logo={domain}&format={light|dark}&type={main|only_logo}&style={style}
```

**Parameters:**

| Parameter | Description | Default |
|-----------|-------------|---------|
| `logo` | Domain or brand name | Request host |
| `format` | Theme: `light` or `dark` | `light` |
| `type` | `main` (full banner) or `only_logo` (letter only) | `main` |
| `style` | Color style: `netproxy`, `aurora`, `ocean`, `candy` | `netproxy` |
| `size` | Logo size in pixels (only for `type=only_logo`) | `1024` |

**Examples:**

```bash
# Full banner, light theme
curl "https://banner-generator.bynari.workers.dev/gen?logo=example.com&format=light&type=main"

# Logo only, dark theme, ocean style
curl "https://banner-generator.bynari.workers.dev/gen?logo=example.com&format=dark&type=only_logo&style=ocean"

# Custom size logo
curl "https://banner-generator.bynari.workers.dev/gen?logo=example.com&type=only_logo&size=512"
```

### Other Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | Web UI |
| `GET /banner.svg` | Generate banner SVG (legacy) |
| `GET /logo.svg` | Generate logo SVG (legacy) |
| `GET /icon.svg` | Generate SVG favicon |
| `GET /favicon.ico` | SVG favicon (redirects to /icon.svg) |

## Color Styles

| Style | Colors |
|-------|--------|
| **Netproxy** | Yellow → Orange → Red gradient |
| **Aurora** | Cyan → Blue → Purple gradient |
| **Ocean** | Light Blue → Blue gradient |
| **Candy** | Pink → Orange → Yellow gradient |

## Tech Stack

- [Cloudflare Workers](https://workers.cloudflare.com/) - Edge runtime
- [@cf-wasm/satori](https://github.com/AltNext/cf-wasm) - SVG generation (Cloudflare Workers compatible)
- [satori-html](https://github.com/natemoo-re/satori-html) - HTML to Satori VDOM
- [Google Fonts](https://fonts.google.com/) - Inter font family

## Project Structure

```
src/
├── index.ts       # Worker entry point & routes
├── banner.ts      # Banner/logo SVG markup
├── fonts.ts       # Google Fonts loading
├── styles.ts      # Brand color palettes
├── utils.ts       # Domain parsing utilities
└── html.ts        # Preview page HTML
```

## Configuration

Edit `wrangler.toml` to customize:

```toml
name = "banner-generator"
main = "src/index.ts"
compatibility_date = "2025-01-19"
compatibility_flags = ["nodejs_compat"]
```

## Output Format

All endpoints return **SVG** format (`image/svg+xml`). SVG advantages:

- Scalable to any size without quality loss
- Smaller file size than PNG
- Native browser support
- Can be used directly in `<img>` tags or as favicon

## License

MIT
