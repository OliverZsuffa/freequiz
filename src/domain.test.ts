import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { buildAiPrompt, dueForReview, exportQuestions, isCorrect, masteryFor, selectRandom, parseBackup, parseImport, demoProfile, type Attempt } from './domain'
const a=(correct:boolean,at:string):Attempt=>({id:at,questionId:'q',at,selectedOptionIds:[],correct})
describe('mastery states',()=>{
 it('marks untouched questions new',()=>expect(masteryFor([],'q')).toBe('new'))
 it('classifies a single attempt as learning regardless of its result',()=>{expect(masteryFor([a(true,'2026-01-01')],'q')).toBe('learning');expect(masteryFor([a(false,'2026-01-01')],'q')).toBe('learning')})
 it('requires two recent correct answers for known',()=>expect(masteryFor([a(true,'2026-01-02'),a(true,'2026-01-01')],'q')).toBe('known'))
 it('marks two recent incorrect answers weak',()=>expect(masteryFor([a(false,'2026-01-02'),a(false,'2026-01-01')],'q')).toBe('weak'))
 it('classifies mixed recent results as learning regardless of order',()=>{expect(masteryFor([a(true,'2026-01-02'),a(false,'2026-01-01')],'q')).toBe('learning');expect(masteryFor([a(false,'2026-01-02'),a(true,'2026-01-01')],'q')).toBe('learning')})
 it('uses the two most recent attempts rather than lifetime totals',()=>expect(masteryFor([a(false,'2026-01-03'),a(false,'2026-01-02'),a(true,'2026-01-01')],'q')).toBe('weak'))
})
describe('random question selection',()=>{
 const pool=Array.from({length:170},(_,i)=>({id:'q'+i}))
 it('selects the requested number of distinct eligible questions',()=>{const selected=selectRandom(pool,10,()=>0.37);expect(selected).toHaveLength(10);expect(new Set(selected.map(q=>q.id)).size).toBe(10);expect(selected.every(q=>pool.includes(q))).toBe(true)})
 it('includes every eligible question exactly once when the full pool is requested',()=>{const selected=selectRandom(pool,170,()=>0.37);expect(selected).toHaveLength(170);expect(new Set(selected.map(q=>q.id)).size).toBe(170);expect(new Set(selected.map(q=>q.id))).toEqual(new Set(pool.map(q=>q.id)))})
 it('clamps the requested count to the available pool',()=>expect(selectRandom(pool.slice(0,4),30,()=>0.5)).toHaveLength(4))
 it('returns an empty list for an empty pool or zero count',()=>{expect(selectRandom([],30)).toEqual([]);expect(selectRandom(pool,0)).toEqual([])})
})
describe('answer and review helpers',()=>{it('checks exact multi select matches',()=>{expect(isCorrect(['a','b'],['b','a'])).toBe(true);expect(isCorrect(['a'],['a','b'])).toBe(false)});it('makes unseen questions due immediately',()=>expect(dueForReview([],'q')).toBe(true));it('makes incorrect answers due immediately',()=>expect(dueForReview([a(false,new Date().toISOString())],'q')).toBe(true))})
describe('JSON import',()=>{it('normalises simple question arrays',()=>{const r=parseImport([{prompt:'Pick one',options:['A','B'],answer:1}]);expect(r.questions[0].correctOptionIds).toEqual(['o2'])});it('normalises section title aliases into the internal name field',()=>{const r=parseImport({sections:[{id:'sec-1',title:'Einführung & Grundbegriffe'}],questions:[{id:'q1',prompt:'Question?',options:['A','B'],answer:0,sectionId:'sec-1'}]});expect(r.sections).toEqual([{id:'sec-1',name:'Einführung & Grundbegriffe',parentId:null}]);expect(r.questions[0].sectionId).toBe('sec-1')});it('rejects too few options',()=>expect(()=>parseImport({questions:[{prompt:'Broken',options:['A'],correctOptionIds:['a']}]})).toThrow(/at least two options/));it('rejects invalid option IDs',()=>expect(()=>parseImport({questions:[{prompt:'Broken',options:['A','B'],correctOptionIds:['missing']}]})).toThrow(/correctOptionIds/))})
it('includes existing sections and reusable source instructions in AI prompt',()=>{const p=buildAiPrompt([{id:'math',name:'Math',parentId:null}]);expect(p).toContain('Math');expect(p).toContain('source material');expect(p).toContain('exactly-n');expect(p).toContain('select-all');expect(p).toContain('freequiz/questions-v1');expect(p).toContain('"name": "Section name"');expect(p).toContain('Use "name", not "title"');expect(p).toContain('MATHEMATICAL NOTATION');expect(p).toContain('correctOptionIds')})

describe('LaTeX instructions in AI prompts', () => {
  it('specifies renderer-supported delimiters and complete formula spans in both AI modes', () => {
    for (const mode of ['extract', 'generate'] as const) {
      const prompt = buildAiPrompt([], mode)
      expect(prompt).toContain('MATHEMATICAL NOTATION')
      expect(prompt).toContain('Do NOT use dollar delimiters')
      expect(prompt).toContain('Freequiz does not render those delimiters')
      expect(prompt).toContain('Enclose each complete mathematical expression in one matching pair of delimiters')
      expect(prompt).toContain('operators are not accidentally outside the span')
      expect(prompt).toContain('Correct complete formula in JSON')
      expect(prompt).toContain('In extraction mode, preserve source wording')
      expect(prompt).toContain('Correct inline JSON example: "prompt": "Solve ' + '\\\\' + '(x^2 = 4' + '\\\\' + ')."' )
      expect(prompt).toContain('After JSON parsing, the question text is: Solve ' + '\\(' + 'x^2 = 4' + '\\)' + '.')
      expect(prompt).toContain('Do not add a second layer of escaping')
      expect(prompt).toContain('Correct it to the complete-formula example above')
    }
  })
})

describe('answer modes and import compatibility', () => {
  it('defaults older single-answer questions to single mode', () => {
    const parsed = parseImport({ questions: [{ id: 'old-single', prompt: 'Pick one', options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }], correctOptionIds: ['a'] }] })
    expect(parsed.questions[0].answerMode).toBe('single')
  })

  it('defaults older multi-answer questions to select-all, never exactly-N', () => {
    const parsed = parseImport({ questions: [{ id: 'old-multi', prompt: 'Pick all', options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }, { id: 'c', text: 'C' }], correctOptionIds: ['a', 'c'] }] })
    expect(parsed.questions[0].answerMode).toBe('select-all')
    expect(parsed.questions[0].correctOptionIds).toEqual(['a', 'c'])
  })

  it('preserves exactly-N mode and grades exact sets', () => {
    const parsed = parseImport({ questions: [{ id: 'n', prompt: 'Pick two', answerMode: 'exactly-n', options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }, { id: 'c', text: 'C' }], correctOptionIds: ['a', 'c'] }] })
    expect(parsed.questions[0].answerMode).toBe('exactly-n')
    expect(isCorrect(['a', 'c'], parsed.questions[0].correctOptionIds)).toBe(true)
    expect(isCorrect(['a'], parsed.questions[0].correctOptionIds)).toBe(false)
    expect(isCorrect(['a', 'b', 'c'], parsed.questions[0].correctOptionIds)).toBe(false)
  })

  it('supports more than 26 variable options', () => {
    const options = Array.from({ length: 35 }, (_, i) => ({ id: 'choice-' + i, text: 'Choice ' + (i + 1) }))
    const parsed = parseImport({ questions: [{ id: 'many', prompt: 'Pick the last', options, correctOptionIds: ['choice-34'] }] })
    expect(parsed.questions[0].options).toHaveLength(35)
    expect(parsed.questions[0].correctOptionIds).toEqual(['choice-34'])
  })

  it('rejects inconsistent explicit answer modes', () => {
    expect(() => parseImport({ questions: [{ prompt: 'Invalid single', answerMode: 'single', options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }], correctOptionIds: ['a', 'b'] }] })).toThrow(/single-answer mode/)
    expect(() => parseImport({ questions: [{ prompt: 'Invalid N', answerMode: 'exactly-n', options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }], correctOptionIds: ['a'] }] })).toThrow(/exactly-N mode/)
  })
})


describe('AI prompt modes and provenance', () => {
  it('writes an extraction-only prompt that forbids invented content and guessing', () => {
    const prompt = buildAiPrompt([{ id: 'math', name: 'Math', parentId: null }], 'extract')
    expect(prompt).toContain('MODE: EXTRACT EXISTING QUESTIONS')
    expect(prompt).toContain('AI-Extracted')
    expect(prompt).toContain('Never invent a question')
    expect(prompt).toContain('do not guess')
    expect(prompt).toContain('Math')
  })

  it('writes a generation prompt with quality constraints and generated provenance', () => {
    const prompt = buildAiPrompt([], 'generate')
    expect(prompt).toContain('MODE: GENERATE NEW QUESTIONS')
    expect(prompt).toContain('AI-Generated')
    expect(prompt).toContain('Every incorrect option must be a credible mistake')
    expect(prompt).toContain('ANSWER-LENGTH AND OPTION BALANCE')
    expect(prompt).toContain('Vary the positions of correct answers across the whole question set')
    expect(prompt).toContain('grammar')
  })

  it('round-trips valid provenance and keeps it separate from ordinary tags', () => {
    const parsed = parseImport({ questions: [{
      id: 'generated', prompt: 'Question?', options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }],
      correctOptionIds: ['a'], provenance: 'AI-Generated', tags: ['revision', 'AI-Extracted']
    }] })
    expect(parsed.questions[0].provenance).toBe('AI-Generated')
    expect(parsed.questions[0].tags).toEqual(['revision'])
  })

  it('ignores unsupported provenance values and remains compatible with legacy questions', () => {
    const parsed = parseImport({ questions: [
      { id: 'bad', prompt: 'Question?', options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }], correctOptionIds: ['a'], provenance: 'AI-Whatever', tags: ['topic'] },
      { id: 'legacy', prompt: 'Old question?', options: ['A', 'B'], answer: 0 }
    ] })
    expect(parsed.questions[0].provenance).toBeUndefined()
    expect(parsed.questions[1].provenance).toBeUndefined()
    expect(parsed.questions[1].tags).toEqual([])
  })
})


describe('Request 006 AI prompt quality', () => {
  it('keeps extraction strictly to explicitly posed questions', () => {
    const prompt = buildAiPrompt([{ id: 'math', name: 'Math', parentId: null }], 'extract')
    expect(prompt).toContain('Extract only questions explicitly posed as questions')
    expect(prompt).toContain('Never invent a question from a fact, ranking, definition, or hierarchy')
    expect(prompt).toContain('AI-Extracted')
  })

  it('treats supplied sections as references and forbids repeating their definitions', () => {
    const sections = [
      { id: 'accounting', name: 'Accounting', parentId: null },
      { id: 'valuation', name: 'Valuation', parentId: 'accounting' }
    ]
    const included = buildAiPrompt(sections, 'generate')
    expect(included).toContain('accounting | - | Accounting')
    expect(included).toContain('valuation | accounting | Valuation')
    expect(included).toContain('Do not return, copy, rename, or redefine any listed section')
    expect(included).toContain('create a new subsection under the best-fitting existing parent')
    expect(included).toContain('set parentId to that existing parent ID')
    expect(included).toContain('Assign each question to the most specific appropriate existing or newly created section')
    expect(included).toContain('If all questions fit the existing hierarchy at the appropriate level, return sections: [].')
    expect(included).toContain('Existing IDs remain valid even when their definitions are absent from this import file')
    expect(included).toContain('Do NOT make the file self-contained by repeating existing section definitions')
    expect(included).toContain('Do not treat generic schema conventions or assumptions about self-contained JSON as a reason to repeat existing sections')
    expect(included).toContain('"parentId": null')
    const omitted = buildAiPrompt(sections, 'generate', false)
    expect(omitted).not.toContain('Existing sections (id | parentId | name)')
    expect(omitted).toContain('Create a useful hierarchy from the source headings and examinable topics')
    expect(omitted).toContain('meaningful subsections where the source structure and topic depth warrant them')
    expect(omitted).toContain('Avoid flattening distinct substantial topics into a few broad sections')
    expect(omitted).toContain('JSON OUTPUT CONTRACT — FOLLOW EXACTLY')
    expect(omitted).toContain('"parentId": null')
  })

  it('requires broad coverage and a substantial set without padding', () => {
    const prompt = buildAiPrompt([], 'generate')
    expect(prompt).toContain('Build a comprehensive question bank, not a short sample')
    expect(prompt).toContain('Create a large, thorough question bank')
    expect(prompt).toContain('Err on the side of generating more useful questions rather than fewer')
    expect(prompt).toContain('small set of representative questions is not sufficient')
    expect(prompt).toContain('meaningful subtopics and individual examinable concepts')
    expect(prompt).toContain('Do not combine several independently examinable ideas into one broad question')
    expect(prompt).toContain('Continue generating distinct, useful questions wherever the source supports them')
    expect(prompt).toContain('Do not pad the bank with trivia or near-duplicates')
    expect(prompt).not.toContain('at least 3 distinct questions')
    expect(prompt).not.toMatch(/\\b\\d+ questions per page\\b/i)
    expect(prompt).toContain('Skip introductions, agendas, advertisements')
    expect(prompt).toContain('Vary the positions of correct answers across the whole question set')
  })

  it('strictly forbids source-referencing wording in generated questions', () => {
    const prompt = buildAiPrompt([], 'generate')
    expect(prompt).toContain('STRICTLY DO NOT write phrases such as')
    expect(prompt).toContain('according to the slides')
    expect(prompt).toContain('Do not mention slides, lectures, notes, documents, or the source')
    expect(prompt).toContain('Every question stem must be direct, natural, self-contained')
  })

  it('keeps distractor, option-balance, answer-position, and ambiguity rules explicit and separate', () => {
    const prompt = buildAiPrompt([], 'generate')
    expect(prompt).toContain('DISTRACTOR QUALITY')
    expect(prompt).toContain('ANSWER-LENGTH AND OPTION BALANCE')
    expect(prompt).toContain('CORRECT-ANSWER POSITION BALANCE')
    expect(prompt).toContain('AVOIDING ANSWER CLUES AND AMBIGUITY')
    expect(prompt).toContain('Every incorrect option must be a credible mistake')
    expect(prompt).toContain('Do not systematically make the correct answer longer')
    expect(prompt).toContain('Vary the positions of correct answers across the whole question set')
    expect(prompt).toContain('Do not rely on unstated assumptions to rule out a distractor')
  })

  it('adds source-wide learning coverage and avoids hard-coded source filenames', () => {
    const generated = buildAiPrompt([], 'generate')
    const extracted = buildAiPrompt([], 'extract')
    for (const prompt of [generated, extracted]) {
      expect(prompt).toContain("Use the supplied source's original filename for the output filename")
      expect(prompt).toContain('Do not assume a particular filename or directory')
      expect(prompt).not.toContain('quiz-sections.json')
    }
    expect(generated).toContain('Read the supplied source as a whole')
    expect(generated).toContain('Do not generate questions about author names, publication years, document metadata')
    expect(generated).toContain("Do not test arbitrary exact numbers from an example company's dataset")
  })

  it('accepts a question that references an existing section without repeating its definition', () => {
    const existingSection = { id: 'accounting', name: 'Accounting', parentId: null }
    const parsed = parseImport({
      format: 'freequiz/questions-v1',
      sections: [],
      questions: [{
        id: 'q-accounting',
        prompt: 'What is accounting used for?',
        options: [{ id: 'a', text: 'Decision-useful information' }, { id: 'b', text: 'Eliminating all risk' }],
        correctOptionIds: ['a'],
        sectionId: existingSection.id
      }]
    })
    expect(parsed.sections).toEqual([])
    expect(parsed.questions[0].sectionId).toBe(existingSection.id)
  })

describe('backup and question-only exports', () => {
  it('keeps the full profile and future fields when validating a backup', () => {
    const profile = {
      ...demoProfile,
      attempts: [a(true, '2026-10-01T10:00:00.000Z')],
      favourites: ['q1'],
      deferredQuestionIds: ['q2'],
      favouriteTags: ['exam'],
      groups: [{ id: 'g1', name: 'Review', questionIds: ['q1'] }],
      exams: [{ id: 'e1', at: '2026-10-02T10:00:00.000Z', source: 'all', timeLimitSeconds: 600, durationSeconds: 120, responses: [], score: 100 }],
      imports: [{ id: 'i1', name: 'original.json', at: '2026-10-01T09:00:00.000Z', source: 'json', addedQuestionIds: ['q1'], sections: [], questions: [], sourceFileName: 'original.json', sourceIdentity: 'original.json' }],
      customFutureField: { retained: true }
    } as any
    const backup = parseBackup({ format: 'freequiz/backup-v1', exportedAt: '2026-10-03T00:00:00.000Z', activeProfileId: profile.id, profiles: [profile] })
    expect(backup.activeProfileId).toBe(profile.id)
    expect(backup.profiles[0]).toEqual(profile)
    expect((backup.profiles[0] as any).customFutureField).toEqual({ retained: true })
    expect(backup.profiles[0].imports?.[0].sourceFileName).toBe('original.json')
  })

  it('rejects malformed full backups before any restore can occur', () => {
    expect(() => parseBackup({ format: 'freequiz/backup-v1', profiles: [] })).toThrow(/at least one profile/i)
    expect(() => parseBackup({ format: 'freequiz/backup-v1', backupVersion: 99, profiles: [{ ...demoProfile }] })).toThrow(/version is not supported/i)
    expect(() => parseBackup({ format: 'freequiz/backup-v1', profiles: [{ id: 'x', name: 'Broken', sections: [], questions: [], attempts: 'not-an-array' }] })).toThrow(/missing required profile data/i)
    expect(() => parseBackup({ format: 'freequiz/backup-v1', profiles: [{ ...demoProfile }, { ...demoProfile }] })).toThrow(/duplicate profile IDs/i)
    expect(() => parseBackup({ format: 'freequiz/backup-v1', profiles: [{ ...demoProfile, questions: [...demoProfile.questions, { ...demoProfile.questions[0] }] }] })).toThrow(/duplicate question IDs/i)
  })

  it('exports question content and section ancestors without learning state or import links', () => {
    const profile = {
      ...demoProfile,
      attempts: [a(true, '2026-10-01T10:00:00.000Z')],
      favourites: ['q1'],
      deferredQuestionIds: ['q1'],
      groups: [{ id: 'g1', name: 'Review', questionIds: ['q1'] }],
      exams: [{ id: 'e1', at: '2026-10-02T10:00:00.000Z', source: 'all', timeLimitSeconds: 600, durationSeconds: 120, responses: [], score: 100 }],
      questions: demoProfile.questions.map(q => ({ ...q, sourceImportId: 'i1', sourceFileName: 'source.json' }))
    }
    const exported = exportQuestions(profile)
    expect(exported.format).toBe('freequiz/questions-v1')
    expect(exported.questions).toHaveLength(profile.questions.length)
    expect(exported.questions[0]).not.toHaveProperty('sourceImportId')
    expect(exported.questions[0].sourceFileName).toBe('source.json')
    expect(exported.sections.length).toBeGreaterThan(0)
    expect(exported).not.toHaveProperty('attempts')
    expect(exported).not.toHaveProperty('favourites')
    expect(exported).not.toHaveProperty('exams')
  })
})

})


describe('public sample question bank',()=>{
 it('is valid under the normal question-bank parser and covers nested sections and answer modes',()=>{
  const raw=JSON.parse(readFileSync('public/sample-question-bank.json','utf8'))
  const parsed=parseImport(raw)
  expect(parsed.questions).toHaveLength(6)
  expect(parsed.sections.some(section=>section.parentId!==null)).toBe(true)
  expect(new Set(parsed.questions.map(question=>question.answerMode??(question.correctOptionIds.length>1?'select-all':'single')))).toEqual(new Set(['single','exactly-n','select-all']))
  expect(parsed.questions.every(question=>question.options.length>=2&&question.correctOptionIds.every(id=>question.options.some(option=>option.id===id)))).toBe(true)
 })
})


describe('question source metadata',()=>{
 it('preserves an explicitly recorded source through question export and import',()=>{
  const parsed=parseImport({format:'freequiz/questions-v1',sections:[],questions:[{id:'professor-q',prompt:'A source question?',options:[{id:'a',text:'A'},{id:'b',text:'B'}],correctOptionIds:['a'],sectionId:null,source:'professor-written'}]})
  expect(parsed.questions[0].source).toBe('professor-written')
  const profile={...demoProfile,sections:[],questions:parsed.questions}
  const exported=exportQuestions(profile)
  expect(exported.questions[0].source).toBe('professor-written')
  expect(parseImport(exported).questions[0].source).toBe('professor-written')
 })
 it('keeps legacy questions without source metadata valid',()=>{
  const parsed=parseImport([{id:'legacy-q',prompt:'Old question?',options:['A','B'],answer:0}])
  expect(parsed.questions[0].source).toBeUndefined()
 })
})
