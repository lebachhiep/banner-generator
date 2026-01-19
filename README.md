# Banner Generator

A simple Node.js server that generates beautiful banners and logos for your brand with gradient text effects.

## Features

- Generate full banners with domain name and tagline
- Generate letter-only logos
- Support light and dark themes
- 4 color styles: Netproxy, Aurora, Ocean, Candy
- Web UI for easy generation
- Direct API access
- Download images directly from browser

## Preview

| Light Banner | Dark Banner |
|--------------|-------------|
| ![Light](https://via.placeholder.com/400x100/f8fafc/1e293b?text=Light+Banner) | ![Dark](https://via.placeholder.com/400x100/0f172a/e2e8f0?text=Dark+Banner) |

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/banner-generator.git
cd banner-generator

# Install dependencies
npm install
```

## Usage

### Start the server

```bash
node make_banner.js
```

Open http://localhost:3001 in your browser.

### Web UI

The web interface allows you to:
- Enter any domain or brand name
- Choose from 4 color styles
- Preview all variants (banner/logo, light/dark)
- Download images directly

### API Endpoints

#### Generate Banner/Logo

```
GET /gen?logo={domain}&format={light|dark}&type={main|only_logo}&style={style}
```

**Parameters:**

| Parameter | Description | Default |
|-----------|-------------|---------|
| `logo` | Domain or brand name | `localhost` |
| `format` | Theme: `light` or `dark` | `light` |
| `type` | `main` (full banner) or `only_logo` (letter only) | `main` |
| `style` | Color style: `netproxy`, `aurora`, `ocean`, `candy` | `netproxy` |

**Examples:**

```bash
# Full banner, light theme
curl "http://localhost:3001/gen?logo=example.com&format=light&type=main"

# Logo only, dark theme, ocean style
curl "http://localhost:3001/gen?logo=example.com&format=dark&type=only_logo&style=ocean"
```

#### Other Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | Web UI |
| `GET /banner.png` | Generate banner (legacy) |
| `GET /logo.png` | Generate logo PNG |
| `GET /icon.ico` | Generate favicon ICO |

## Color Styles

| Style | Colors |
|-------|--------|
| **Netproxy** | Yellow → Orange → Red gradient |
| **Aurora** | Cyan → Blue → Purple gradient |
| **Ocean** | Light Blue → Blue gradient |
| **Candy** | Pink → Orange → Yellow gradient |

## Custom Fonts

Place font files in the `fonts/` directory. Supported fonts:

- Bodoni Moda (primary)
- Playfair Display (fallback)
- Cormorant Garamond (fallback)
- Spectral SC (fallback)

## Tech Stack

- [Express.js](https://expressjs.com/) - Web framework
- [node-canvas](https://github.com/Automattic/node-canvas) - Canvas implementation for Node.js

## Requirements

- Node.js 16+
- npm or yarn

### System Dependencies (for node-canvas)

**Ubuntu/Debian:**
```bash
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
```

**macOS:**
```bash
brew install pkg-config cairo pango libpng jpeg giflib librsvg
```

**Windows:**
See [node-canvas Windows installation](https://github.com/Automattic/node-canvas/wiki/Installation:-Windows)

## License

MIT

## Author

Your Name
