import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const dist = 'dist'
assert.ok(existsSync(join(dist, 'index.html')), 'production index.html must exist')
assert.ok(existsSync(join(dist, 'sw.js')), 'build must emit a service worker')
const html = readFileSync(join(dist, 'index.html'), 'utf8')
const worker = readFileSync(join(dist, 'sw.js'), 'utf8')
const base = process.env.GITHUB_ACTIONS ? '/freequiz/' : '/'
assert.ok(html.includes(base), `built HTML should use base path ${base}`)
assert.ok(worker.includes(`const SCOPE_PATH = "${base}"`), 'worker must be scoped to the Vite base path')
assert.ok(worker.includes(base + 'index.html'), 'worker must precache the app shell')
for (const required of ['manifest.webmanifest', 'icon.svg', 'legal-info.json', 'sample-question-bank.json']) {
  assert.ok(worker.includes(base + required), `worker must precache ${required}`)
  assert.ok(existsSync(join(dist, required)), `public asset ${required} must be in dist`)
}
const assets = readdirSync(join(dist, 'assets'))
assert.ok(assets.some(file => file.endsWith('.js')), 'built JavaScript must exist')
assert.ok(assets.some(file => file.endsWith('.css')), 'built CSS must exist')
for (const file of assets.filter(file => /\\.(js|css)$/.test(file))) {
  assert.ok(worker.includes(base + 'assets/' + file), `worker must precache assets/${file}`)
}
assert.ok(worker.includes('request.mode === \'navigate\''), 'worker must provide offline navigation fallback')
assert.ok(worker.includes('key.startsWith(\'freequiz-shell-\')'), 'worker must clean up only its own old cache versions')
console.log('Offline build validation passed: app shell, base path, public files, JS/CSS precache, and navigation fallback.')
