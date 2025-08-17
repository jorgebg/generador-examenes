import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

async function main() {
  const distDir = resolve(process.cwd(), 'dist');
  const indexPath = resolve(distDir, 'index.html');
  const offlinePath = resolve(distDir, 'offline.html');

  let html = await readFile(indexPath, 'utf-8');

  // Remove <base ...> tag
  html = html.replace(/<base[^>]*>\s*/i, '');

  // Remove the download-offline anchor in the offline variant, if present
  html = html.replace(/<a[^>]*id=["']download-offline["'][\s\S]*?<\/a>/i, '');

  // Update title to reflect offline
  html = html.replace(/<title>([\s\S]*?)<\/title>/i, '<title>$1 (Offline)</title>');

  await writeFile(offlinePath, html, 'utf-8');
  console.log('[make-offline] Created', offlinePath);
}

main().catch((err) => {
  console.error('[make-offline] Failed:', err);
  process.exit(1);
});
