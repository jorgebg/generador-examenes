// Lightweight local Ko‑fi floating button (no CDN)
// Replaces the previous overlay widget behavior with a simple floating button.

export function initKofi(options?: { username?: string }) {
  const user = options?.username ?? 'javierfpanadero';
  const href = `https://ko-fi.com/${user}`;

  // Avoid duplicating if called twice
  if (document.getElementById('kofi-floating-btn')) return;

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
  .kofi-floating-btn__emoji {
    font-size: 1.1rem;
    line-height: 1;
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

  const emoji = document.createElement('span');
  emoji.className = 'kofi-floating-btn__emoji';
  emoji.textContent = '☕';

  const text = document.createElement('span');
  text.textContent = 'Donar';

  a.appendChild(emoji);
  a.appendChild(text);

  document.head.appendChild(style);
  document.body.appendChild(a);
}
