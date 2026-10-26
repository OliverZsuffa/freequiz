import { readFile } from 'node:fs/promises'

const path = new URL('../public/legal-info.json', import.meta.url)
let info
try {
  info = JSON.parse(await readFile(path, 'utf8'))
} catch (error) {
  console.error('Cannot read public/legal-info.json as valid JSON.')
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}

const required = ['name', 'address', 'email']
const missing = required.filter((key) => typeof info[key] !== 'string' || !info[key].trim())
if (missing.length) {
  console.error(`Deployment blocked: fill these required fields in public/legal-info.json: ${missing.join(', ')}.`)
  console.error('These values are published publicly on the live website. Do not use placeholders.')
  process.exit(1)
}
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email.trim())) {
  console.error('Deployment blocked: email in public/legal-info.json does not look valid.')
  process.exit(1)
}
if (info.kofiUrl && info.kofiUrl.trim()) {
  try {
    const url = new URL(info.kofiUrl)
    if (url.protocol !== 'https:') throw new Error('HTTPS required')
  } catch {
    console.error('Deployment blocked: kofiUrl must be a valid HTTPS URL when provided.')
    process.exit(1)
  }
}
console.log('Legal information configuration is valid.')
