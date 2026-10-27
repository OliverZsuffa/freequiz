import { describe, expect, it } from 'vitest'
import type { ImportBatch } from './domain'
import { formatImportSourceLabel, matchesImportSourceSearch } from './importSourceLabel'

const batch = (overrides: Partial<ImportBatch> = {}): ImportBatch => ({
  id: 'batch-1',
  name: 'Lecture import',
  at: '2026-10-26T12:00:00.000Z',
  source: 'json',
  addedQuestionIds: [],
  sections: [],
  questions: [],
  ...overrides,
})

describe('import source labels', () => {
  it('shows the original filename before the friendly import name', () => {
    expect(formatImportSourceLabel(batch({ sourceFileName: 'Financial Accounting – Chapter 4.json' })))
      .toBe('Financial Accounting – Chapter 4.json · Lecture import')
  })

  it('uses source identity if the original filename was not saved', () => {
    expect(formatImportSourceLabel(batch({ sourceIdentity: 'backup-lecture-4.json', sourceFileName: undefined })))
      .toBe('backup-lecture-4.json · Lecture import')
  })

  it('falls back cleanly for legacy batches without filename metadata', () => {
    expect(formatImportSourceLabel(batch({ sourceFileName: undefined, sourceIdentity: undefined })))
      .toBe('Lecture import')
    expect(formatImportSourceLabel(batch({ name: '', sourceFileName: undefined, sourceIdentity: undefined })))
      .toBe('json')
  })

  it('searches filenames, source identities, names, and source types', () => {
    const source = batch({ sourceFileName: 'chapter-4.json', sourceIdentity: 'chapter-four-identity' })
    expect(matchesImportSourceSearch(source, 'CHAPTER-4')).toBe(true)
    expect(matchesImportSourceSearch(source, 'identity')).toBe(true)
    expect(matchesImportSourceSearch(source, 'lecture import')).toBe(true)
    expect(matchesImportSourceSearch(source, 'ai-generate')).toBe(false)
    expect(matchesImportSourceSearch(source, '  ')).toBe(true)
  })
})
