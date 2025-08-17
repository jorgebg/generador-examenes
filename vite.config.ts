import { defineConfig } from 'vite'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { marked } from "marked";
import { gfmHeadingId } from "marked-gfm-heading-id";

marked.use(gfmHeadingId());

function readmeInjectPlugin() {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  const readmePath = resolve(__dirname, 'README.md')
  const START = '<!-- Begin README.md -->'
  const END = '<!-- Close README.md -->'
  const blockRe = /<!-- Begin README\.md -->[\s\S]*?<!-- Close README\.md -->/m

  return {
    name: 'html-readme-injector',
    enforce: 'pre' as const,
    async transformIndexHtml(html: string) {
        const hasMarkers = blockRe.test(html)
        if (!hasMarkers) return html
        const md = readFileSync(readmePath, 'utf-8')
        const rendered = await marked(md)
        const replaced = html.replace(blockRe, `${START}\n${rendered}\n${END}`)
        return replaced
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  base: '/generador-examenes/',
  plugins: [readmeInjectPlugin()],
})
