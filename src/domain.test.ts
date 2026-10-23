import { describe, expect, it } from 'vitest'
import { buildAiPrompt, dueForReview, isCorrect, masteryFor, parseImport, type Attempt } from './domain'
const a=(correct:boolean,at:string):Attempt=>({id:at,questionId:'q',at,selectedOptionIds:[],correct})
describe('mastery states',()=>{it('marks untouched questions new',()=>expect(masteryFor([],'q')).toBe('new'));it('uses one attempt for learning and needs work',()=>{expect(masteryFor([a(true,'2026-01-01')],'q')).toBe('learning');expect(masteryFor([a(false,'2026-01-01')],'q')).toBe('needs-work')});it('requires two recent correct answers for known',()=>expect(masteryFor([a(true,'2026-01-02'),a(true,'2026-01-01')],'q')).toBe('known'));it('marks two recent incorrect answers weak',()=>expect(masteryFor([a(false,'2026-01-02'),a(false,'2026-01-01')],'q')).toBe('weak'))})
describe('answer and review helpers',()=>{it('checks exact multi select matches',()=>{expect(isCorrect(['a','b'],['b','a'])).toBe(true);expect(isCorrect(['a'],['a','b'])).toBe(false)});it('makes unseen questions due immediately',()=>expect(dueForReview([],'q')).toBe(true));it('makes incorrect answers due immediately',()=>expect(dueForReview([a(false,new Date().toISOString())],'q')).toBe(true))})
describe('JSON import',()=>{it('normalises simple question arrays',()=>{const r=parseImport([{prompt:'Pick one',options:['A','B'],answer:1}]);expect(r.questions[0].correctOptionIds).toEqual(['o2'])});it('rejects too few options',()=>expect(()=>parseImport({questions:[{prompt:'Broken',options:['A'],correctOptionIds:['a']}]})).toThrow(/at least two options/));it('rejects invalid option IDs',()=>expect(()=>parseImport({questions:[{prompt:'Broken',options:['A','B'],correctOptionIds:['missing']}]})).toThrow(/correctOptionIds/))})
it('includes existing sections and reusable source instructions in AI prompt',()=>{const p=buildAiPrompt([{id:'math',name:'Math',parentId:null}]);expect(p).toContain('Math');expect(p).toContain('source material');expect(p).toContain('exactly-n');expect(p).toContain('select-all')})

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
