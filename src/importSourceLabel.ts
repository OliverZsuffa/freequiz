import type { ImportBatch } from './domain'

/** Prefer the actual filename, while retaining useful labels for older imports. */
export function formatImportSourceLabel(batch: ImportBatch): string {
  const fileName = batch.sourceFileName?.trim() || batch.sourceIdentity?.trim()
  const name = batch.name?.trim()
  if (fileName && name && name !== fileName) return fileName + ' · ' + name
  return fileName || name || batch.source
}

export function matchesImportSourceSearch(batch: ImportBatch, query: string): boolean {
  const searchable = [batch.name, batch.sourceFileName, batch.sourceIdentity, batch.source]
    .filter(Boolean)
    .join(' ')
    .toLocaleLowerCase()
  return searchable.includes(query.trim().toLocaleLowerCase())
}
