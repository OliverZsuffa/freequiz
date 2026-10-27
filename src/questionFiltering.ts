import { masteryFor, type AnswerMode, type ImportBatch, type Mastery, type Profile, type Question } from './domain'

type FilterQuestionsOptions = {
  profile: Profile
  query: string
  multiSectionFilter: string[]
  sectionDescendants: boolean
  multiAnswerModeFilter: AnswerMode[]
  multiTagFilter: string[]
  multiMasteryFilter: Mastery[]
  multiFavouriteFilter: string[]
  multiDeferredFilter: string[]
  filterTagsInclude: string
  filterTagsExclude: string
  multiProvenanceFilter: string[]
  multiImportFilter: string[]
  multiImportSourceFilter: string[]
  multiExplanationFilter: string[]
  multiTagPresenceFilter: string[]
  createdAfter: string
  createdBefore: string
  updatedAfter: string
  updatedBefore: string
  sortBy: string
  sectionPath: (profile: Profile, id: string | null) => string
  descendants: (profile: Profile, id: string) => Set<string>
  answerMode: (question: Question) => AnswerMode
  importForQuestion: (question: Question) => ImportBatch | undefined
}

/** Apply the question-library filters and sorting without changing their matching semantics. */
export function filterQuestions({
  profile,
  query,
  multiSectionFilter,
  sectionDescendants,
  multiAnswerModeFilter,
  multiTagFilter,
  multiMasteryFilter,
  multiFavouriteFilter,
  multiDeferredFilter,
  filterTagsInclude,
  filterTagsExclude,
  multiProvenanceFilter,
  multiImportFilter,
  multiImportSourceFilter,
  multiExplanationFilter,
  multiTagPresenceFilter,
  createdAfter,
  createdBefore,
  updatedAfter,
  updatedBefore,
  sortBy,
  sectionPath,
  descendants,
  answerMode,
  importForQuestion,
}: FilterQuestionsOptions): Question[] {
  const includeTags = filterTagsInclude.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
  const excludeTags = filterTagsExclude.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)

  return profile.questions
    .map((q, originalIndex) => ({ q, originalIndex }))
    .filter(({ q }) => {
      const batch = importForQuestion(q)
      const searchable = [
        q.prompt,
        ...q.options.map(o => o.text),
        q.explanation ?? '',
        sectionPath(profile, q.sectionId),
        q.provenance ?? '',
        q.source ?? '',
        batch?.name ?? '',
        batch?.source ?? '',
        batch?.sourceFileName ?? '',
        q.sourceFileName ?? '',
      ].join(' ').toLowerCase()

      return searchable.includes(query.toLowerCase())
        && (!multiSectionFilter.length || multiSectionFilter.some(sf => sf === 'unsorted'
          ? !q.sectionId
          : sectionDescendants
            ? descendants(profile, sf).has(q.sectionId ?? '')
            : q.sectionId === sf))
        && (!multiAnswerModeFilter.length || multiAnswerModeFilter.includes(answerMode(q)))
        && (!multiTagFilter.length || multiTagFilter.some(tf => (q.tags ?? []).includes(tf)))
        && (!multiMasteryFilter.length || multiMasteryFilter.includes(masteryFor(profile.attempts, q.id)))
        && (!multiFavouriteFilter.length || multiFavouriteFilter.some(ff => ff === 'favourite'
          ? (profile.favourites ?? []).includes(q.id)
          : !(profile.favourites ?? []).includes(q.id)))
        && (!multiDeferredFilter.length || multiDeferredFilter.some(df => df === 'deferred'
          ? (profile.deferredQuestionIds ?? []).includes(q.id)
          : !(profile.deferredQuestionIds ?? []).includes(q.id)))
        && includeTags.every(t => (q.tags ?? []).some(tag => tag.toLowerCase() === t))
        && !excludeTags.some(t => (q.tags ?? []).some(tag => tag.toLowerCase() === t))
        && (!multiProvenanceFilter.length || multiProvenanceFilter.some(pf => pf === 'unknown'
          ? (!q.provenance && !q.source)
          : pf === 'professor-written'
            ? q.source === 'professor-written'
            : pf === 'other'
              ? q.source === 'other'
              : q.provenance === pf))
        && (!multiImportFilter.length || multiImportFilter.some(ifv => ifv === 'unknown' ? !batch : batch?.id === ifv))
        && (!multiImportSourceFilter.length || multiImportSourceFilter.some(isf => isf === 'unknown'
          ? (!batch || batch.source === 'unknown')
          : batch?.source === isf))
        && (!multiExplanationFilter.length || multiExplanationFilter.some(ef => ef === 'present'
          ? !!q.explanation?.trim()
          : !q.explanation?.trim()))
        && (!multiTagPresenceFilter.length || multiTagPresenceFilter.some(tf => tf === 'present'
          ? (q.tags ?? []).length > 0
          : (q.tags ?? []).length === 0))
        && (!createdAfter || (!!q.createdAt && q.createdAt.slice(0, 10) >= createdAfter))
        && (!createdBefore || (!!q.createdAt && q.createdAt.slice(0, 10) <= createdBefore))
        && (!updatedAfter || (!!q.updatedAt && q.updatedAt.slice(0, 10) >= updatedAfter))
        && (!updatedBefore || (!!q.updatedAt && q.updatedAt.slice(0, 10) <= updatedBefore))
    })
    .sort((a, b) => {
      const av = a.q
      const bv = b.q
      let cmp = 0
      if (sortBy === 'prompt') cmp = av.prompt.localeCompare(bv.prompt)
      else if (sortBy === 'section') cmp = sectionPath(profile, av.sectionId).localeCompare(sectionPath(profile, bv.sectionId))
      else if (sortBy === 'answer-mode') cmp = answerMode(av).localeCompare(answerMode(bv))
      else if (sortBy === 'provenance') cmp = (av.source ?? av.provenance ?? '').localeCompare(bv.source ?? bv.provenance ?? '')
      else if (sortBy === 'import') cmp = (importForQuestion(av)?.name ?? '').localeCompare(importForQuestion(bv)?.name ?? '')
      else if (sortBy === 'created') cmp = (av.createdAt ?? '').localeCompare(bv.createdAt ?? '')
      else if (sortBy === 'updated') cmp = (av.updatedAt ?? '').localeCompare(bv.updatedAt ?? '')
      return cmp || a.originalIndex - b.originalIndex
    })
    .map(x => x.q)
}

