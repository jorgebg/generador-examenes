// Lightweight local Ko‑fi floating button (no CDN)
// Uses Ko‑fi logo image instead of emoji.

export interface KofiOptions {
  username?: string;
  logoSrc?: string;
  label?: string;
}

export function initKofi(options?: KofiOptions) {
  const user = options?.username ?? 'javierfpanadero';
  const href = `https://ko-fi.com/${user}`;

  // Avoid duplicating if called twice
  if (document.getElementById('kofi-floating-btn')) return;

  // Resolve base path robustly for both dev and build
  const envBase = (import.meta as any)?.env?.BASE_URL as string | undefined;
  let base = envBase && typeof envBase === 'string' ? envBase : undefined;
  if (!base) {
    // Fallback: derive from document base URI (works when Vite dev serves under base)
    try {
      const uri = new URL(document.baseURI);
      base = uri.pathname;
    } catch {
      base = '/';
    }
  }
  if (!base.endsWith('/')) base += '/';

  const candidateLogo = base + 'kofi_symbol.png';
  const logoSrc = options?.logoSrc ?? candidateLogo;
  const label = options?.label ?? 'Donar';

  const style = document.createElement('style');
  style.id = 'kofi-floating-style';
  style.textContent = `
  .kofi-floating-btn {
    position: fixed;
    right: 1rem;
    bottom: 1rem;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background-color: #EFA00B;
    color: #fff;
    border-radius: 9999px;
    padding: 0.6rem 0.9rem;
    font-weight: 600;
    text-decoration: none;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 9999;
    transition: transform 0.1s ease, box-shadow 0.2s ease, opacity 0.2s ease;
    opacity: 0.95;
  }
  .kofi-floating-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(0,0,0,0.2);
    opacity: 1;
  }
  .kofi-floating-btn__logo {
    width: 1.1rem;
    height: 1.1rem;
    display: inline-block;
  }
  @media (prefers-reduced-motion: reduce) {
    .kofi-floating-btn {
      transition: none;
    }
  }
  `;

  const a = document.createElement('a');
  a.id = 'kofi-floating-btn';
  a.className = 'kofi-floating-btn';
  a.href = href;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.setAttribute('aria-label', 'Donar en Ko‑fi');

  const img = document.createElement('img');
  img.className = 'kofi-floating-btn__logo';
  img.src = logoSrc;
  img.alt = 'Ko‑fi';
  img.decoding = 'async';
  img.loading = 'lazy';

  const text = document.createElement('span');
  text.textContent = label;

  a.appendChild(img);
  a.appendChild(text);

  document.head.appendChild(style);
  document.body.appendChild(a);
}
