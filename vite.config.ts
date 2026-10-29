import { createHash } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve, relative, sep } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const base = process.env.GITHUB_ACTIONS ? '/freequiz/' : '/'
const publicDir = resolve(process.cwd(), 'public')

function listPublicFiles(dir = publicDir): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const fullPath = resolve(dir, entry.name)
    if (entry.isDirectory()) return listPublicFiles(fullPath)
    const path = relative(publicDir, fullPath).split(sep).join('/')
    return path === 'sw.js' ? [] : [path]
  })
}

function offlineServiceWorker(): Plugin {
  return {
    name: 'freequiz-offline-service-worker',
    apply: 'build',
    generateBundle(_options, bundle) {
      const publicFiles = listPublicFiles()
      const buildFiles = Object.keys(bundle).filter(path => !path.endsWith('.map') && path !== 'sw.js')
      const files = [...new Set([...buildFiles, ...publicFiles])].sort()
      const hash = createHash('sha256')
      for (const path of files) {
        hash.update(path)
        const output = bundle[path]
        if (output) hash.update(output.type === 'chunk' ? output.code : output.source)
        else hash.update(readFileSync(resolve(publicDir, path)))
      }
      const cacheName = 'freequiz-shell-' + hash.digest('hex').slice(0, 12)
      const precacheUrls = files.map(path => base + path)
      const appShell = base + 'index.html'
      const worker = `const CACHE_NAME = ${JSON.stringify(cacheName)};
const APP_SHELL = ${JSON.stringify(appShell)};
const SCOPE_PATH = ${JSON.stringify(base)};
const PRECACHE_URLS = ${JSON.stringify(precacheUrls)};
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(PRECACHE_URLS);
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('freequiz-shell-') && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const scopeUrl = new URL(SCOPE_PATH, self.location.origin);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(scopeUrl.pathname)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok && response.type !== 'opaque') await cache.put(request, response.clone());
      return response;
    } catch {
      if (request.mode === 'navigate') return (await cache.match(APP_SHELL)) || Response.error();
      return Response.error();
    }
  })());
});
`
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: worker })
    },
  }
}

export default defineConfig({
  plugins: [react(), offlineServiceWorker()],
  base,
})
