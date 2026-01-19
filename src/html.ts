/**
 * HTML preview page
 */
export function getPreviewHTML(): string {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Banner Generator</title>
  <link rel="icon" type="image/svg+xml" href="/icon.svg?domain=netproxy.io">
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
      <p class="subtitle">Generate beautiful banners and logos for your brand (SVG)</p>
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
            '<a class="action-btn primary" href="' + urls.bannerLight + '" download="banner-light.svg">' + icons.download + ' Download</a>' +
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
            '<a class="action-btn primary" href="' + urls.bannerDark + '" download="banner-dark.svg">' + icons.download + ' Download</a>' +
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
            '<a class="action-btn primary" href="' + urls.logoLight + '" download="logo-light.svg">' + icons.download + ' Download</a>' +
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
            '<a class="action-btn primary" href="' + urls.logoDark + '" download="logo-dark.svg">' + icons.download + ' Download</a>' +
            '<button class="action-btn" onclick="copyUrl(\\'' + urls.logoDark + '\\')">' + icons.copy + ' Copy</button>' +
          '</div>' +
        '</div>';
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
}
