import { defineConfig } from 'vite'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Markdown -> HTML converter using marked via dynamic import
async function mdToHtml(md: string): Promise<string> {
  const { marked } = await import('marked');
  return marked.parse(md);
}

// Helper to inject README.md HTML between markers in index.html
function readmeInjectPlugin() {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  const readmePath = resolve(__dirname, 'README.md')
  const START = '<!-- Begin README.md -->'
  const END = '<!-- Close README.md -->'

  return {
    name: 'inject-readme-into-index',
    async transformIndexHtml(html: string) {
      try {
        const md = readFileSync(readmePath, 'utf-8')
        const rendered = await mdToHtml(md)
        const startIdx = html.indexOf(START)
        const endIdx = html.indexOf(END, startIdx)
        if (startIdx === -1 || endIdx === -1) return html
        const before = html.slice(0, startIdx)
        const after = html.slice(endIdx + END.length)
        return `${before}${START}\n${rendered}\n${END}${after}`
      } catch (e) {
        // If README not found, keep original HTML
        return html
      }
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [readmeInjectPlugin()],
})
