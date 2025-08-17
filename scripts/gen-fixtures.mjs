import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { generatePapel } from '../src/papel'
import { generateMoodle } from '../src/moodle'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const root = join(__dirname, '..')
const testsDir = join(root, 'tests')
const fixturesDir = join(testsDir, 'fixtures')

mkdirSync(fixturesDir, { recursive: true })

function withMockedRandom(seq, fn) {
  const original = Math.random
  let i = 0
  Math.random = () => {
    const v = seq[i] ?? 0.5
    i = (i + 1) % seq.length
    return v
  }
  try {
    return fn()
  } finally {
    Math.random = original
  }
}

const seq = [0.12, 0.34, 0.56, 0.78, 0.9]

const exam1 = readFileSync(join(root, 'examen.txt'), 'utf-8')
const exam2 = readFileSync(join(root, 'examen2.txt'), 'utf-8')

const fixtures = [
  ['papel-examen1.txt', () => generatePapel(exam1)],
  ['papel-examen2.txt', () => generatePapel(exam2)],
  ['moodle-examen1.xml', () => generateMoodle(exam1)],
  ['moodle-examen2.xml', () => generateMoodle(exam2)],
]

for (const [name, gen] of fixtures) {
  const out = withMockedRandom(seq.slice(), gen)
  writeFileSync(join(fixturesDir, name), out, 'utf-8')
  console.log('Wrote', name, out.length, 'bytes')
}
