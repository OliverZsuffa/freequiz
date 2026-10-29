export type Option = { id: string; text: string }
export type AnswerMode = 'single' | 'exactly-n' | 'select-all'
export type Question = { id: string; prompt: string; options: Option[]; correctOptionIds: string[]; answerMode?: AnswerMode; sectionId: string | null; explanation?: string; tags?: string[]; provenance?: 'AI-Generated' | 'AI-Extracted'; source?: 'professor-written' | 'other'; sourceImportId?: string; sourceFileName?: string; createdAt?: string; updatedAt?: string }
export type QuestionGroup = { id: string; name: string; questionIds: string[] }
export type ExamResponse = { questionId: string; selectedOptionIds: string[]; correct: boolean }
export type ExamSession = { id: string; at: string; source: string; timeLimitSeconds: number; durationSeconds: number; responses: ExamResponse[]; score: number }
export type Section = { id: string; name: string; parentId: string | null }
export type Attempt = { id: string; questionId: string; at: string; selectedOptionIds: string[]; correct: boolean }
export type ImportBatch = { id: string; name: string; at: string; source: 'json' | 'ai-extract' | 'ai-generate' | 'unknown'; addedQuestionIds: string[]; sections: Section[]; questions: Question[]; sourceFileName?: string; sourceIdentity?: string }
export type Profile = { id: string; name: string; sections: Section[]; questions: Question[]; attempts: Attempt[]; favourites?: string[]; favouriteTags?: string[]; deferredQuestionIds?: string[]; groups?: QuestionGroup[]; exams?: ExamSession[]; imports?: ImportBatch[] }
export type FullProfileBackup = { format: 'freequiz/backup-v1'; backupVersion: 1; exportedAt: string; activeProfileId: string; profiles: Profile[] }
export type Store = { version: 1; activeProfileId: string; profiles: Profile[] }
export type Mastery = 'new' | 'weak' | 'learning' | 'known'

export function exportQuestions(profile: Profile) {
 const used = new Set(profile.questions.map(q => q.sectionId).filter((id): id is string => !!id))
 let changed = true
 while (changed) {
  changed = false
  profile.sections.forEach(section => {
   if (used.has(section.id) && section.parentId && !used.has(section.parentId)) {
    used.add(section.parentId)
    changed = true
   }
  })
 }
 const questions = profile.questions.map(q => {
  const { sourceImportId: _sourceImportId, ...content } = q
  return content
 })
 return { format: 'freequiz/questions-v1' as const, sections: profile.sections.filter(section => used.has(section.id)).map(section => ({...section})), questions }
}
export function parseBackup(raw: unknown): FullProfileBackup {
 const src = raw as any
 if (src && src.format === 'freequiz/backup-v1' && src.backupVersion !== undefined && src.backupVersion !== 1) throw new Error('This Freequiz backup version is not supported.')
 if (!src || src.format !== 'freequiz/backup-v1' || !Array.isArray(src.profiles) || src.profiles.length === 0) {
  throw new Error('Expected a full Freequiz profile backup with at least one profile.')
 }
 const ids = new Set<string>()
 for (let i = 0; i < src.profiles.length; i++) {
  const p = src.profiles[i]
  if (!p || typeof p.id !== 'string' || !p.id || typeof p.name !== 'string' || !p.name.trim() || !Array.isArray(p.sections) || !Array.isArray(p.questions) || !Array.isArray(p.attempts)) {
   throw new Error('Backup profile ' + (i + 1) + ' is missing required profile data.')
  }
  if (ids.has(p.id)) throw new Error('Backup contains duplicate profile IDs.')
  ids.add(p.id)
  if (p.sections.some((s: any) => !s || typeof s.id !== 'string' || typeof s.name !== 'string' || !(s.parentId === null || typeof s.parentId === 'string'))) {
   throw new Error('Backup profile "' + p.name + '" contains an invalid section.')
  }
  const questionIds = new Set<string>()
  for (const q of p.questions) {
   if (!q || typeof q.id !== 'string' || !q.id || !Array.isArray(q.options) || q.options.some((o: any) => !o || typeof o.id !== 'string' || typeof o.text !== 'string')) {
    throw new Error('Backup profile "' + p.name + '" contains an invalid question.')
   }
   if (questionIds.has(q.id)) throw new Error('Backup profile "' + p.name + '" contains duplicate question IDs.')
   questionIds.add(q.id)
  }
  parseImport({sections:p.sections,questions:p.questions})
  if (p.attempts.some((a: any) => !a || typeof a.id !== 'string' || typeof a.questionId !== 'string' || typeof a.at !== 'string' || !Array.isArray(a.selectedOptionIds) || typeof a.correct !== 'boolean')) {
   throw new Error('Backup profile "' + p.name + '" contains an invalid learning attempt.')
  }
  if (p.favourites !== undefined && (!Array.isArray(p.favourites) || p.favourites.some((id: any) => typeof id !== 'string'))) throw new Error('Backup profile "' + p.name + '" contains invalid favourites.')
  if (p.favouriteTags !== undefined && (!Array.isArray(p.favouriteTags) || p.favouriteTags.some((tag: any) => typeof tag !== 'string'))) throw new Error('Backup profile "' + p.name + '" contains invalid favourite tags.')
  for (const key of ['deferredQuestionIds','groups','exams','imports']) if (p[key] !== undefined && !Array.isArray(p[key])) throw new Error('Backup profile "' + p.name + '" contains invalid ' + key + '.')
 }
 const activeProfileId = typeof src.activeProfileId === 'string' && ids.has(src.activeProfileId) ? src.activeProfileId : src.profiles[0].id
 return {format:'freequiz/backup-v1',backupVersion:1,exportedAt:typeof src.exportedAt === 'string' ? src.exportedAt : new Date(0).toISOString(),activeProfileId,profiles:src.profiles as Profile[]}
}
export function masteryFor(attempts: Attempt[], id: string): Mastery {
 const history = attempts.filter(a => a.questionId === id).sort((a,b) => b.at.localeCompare(a.at))
 if (!history.length) return 'new'
 if (history.length === 1) return 'learning'
 if (history[0].correct && history[1].correct) return 'known'
 if (!history[0].correct && !history[1].correct) return 'weak'
 return 'learning'
}
export function selectRandom<T>(items: T[], count: number, random: () => number = Math.random): T[] {
 const shuffled = [...items]
 for (let i = shuffled.length - 1; i > 0; i--) {
  const j = Math.floor(random() * (i + 1))
  ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
 }
 const limit = Number.isFinite(count) ? Math.max(0, Math.min(shuffled.length, Math.floor(count))) : shuffled.length
 return shuffled.slice(0, limit)
}
export function isCorrect(selected: string[], expected: string[]) { return selected.length === expected.length && selected.every(id => expected.includes(id)) }
export function dueForReview(attempts: Attempt[], id: string, now = Date.now()) {
 const history = attempts.filter(a => a.questionId === id).sort((a,b) => b.at.localeCompare(a.at))
 if (!history.length || !history[0].correct) return true
 const days = masteryFor(attempts,id) === 'known' ? 7 : 1
 return now - new Date(history[0].at).getTime() >= days * 86400000
}
export function parseImport(raw: unknown): {sections: Section[]; questions: Question[]} {
 const src: any = Array.isArray(raw) ? {questions:raw} : raw
 if (!src || !Array.isArray(src.questions)) throw new Error('Expected an object with a questions array, or a questions array directly.')
 const sections: Section[] = Array.isArray(src.sections) ? src.sections.map((s: any, i: number): Section => {
  if (!s || typeof s.id !== 'string' || !s.id.trim() || !((typeof s.name === 'string' && s.name.trim()) || (typeof s.title === 'string' && s.title.trim()))) {
   throw new Error('Section ' + (i + 1) + ': provide an id and a non-empty name (or title).')
  }
  return { id: s.id, name: (typeof s.name === 'string' && s.name.trim() ? s.name : s.title).trim(), parentId: typeof s.parentId === 'string' && s.parentId.trim() ? s.parentId : null }
 }) : []
 const sectionIds = new Set<string>()
 for (const section of sections) {
  if (sectionIds.has(section.id)) throw new Error('Imported sections contain duplicate IDs.')
  sectionIds.add(section.id)
 }
 const questions = src.questions.map((q:any,i:number):Question => {
  if (!q || typeof q.prompt !== 'string' || !q.prompt.trim()) throw new Error('Question '+(i+1)+': prompt is missing.')
  if (!Array.isArray(q.options) || q.options.length < 2) throw new Error('Question '+(i+1)+': provide at least two options.')
  const options:Option[] = q.options.map((o:any,j:number) => typeof o === 'string' ? {id:'o'+(j+1),text:o} : {id:typeof o.id === 'string' ? o.id : 'o'+(j+1),text:o.text})
  let correct = q.correctOptionIds
  if (!Array.isArray(correct) && typeof q.answer === 'number') correct = [options[q.answer]?.id]
  if (!Array.isArray(correct) && typeof q.answer === 'string') correct = [q.answer]
  if (!Array.isArray(correct) || !correct.length || !correct.every((id:string) => options.some(o=>o.id===id))) throw new Error('Question '+(i+1)+': correctOptionIds must reference existing option IDs.')
  const answerMode = q.answerMode === 'single' || q.answerMode === 'exactly-n' || q.answerMode === 'select-all' ? q.answerMode : (correct.length > 1 ? 'select-all' : 'single')
  if (answerMode === 'single' && correct.length !== 1) throw new Error('Question '+(i+1)+': single-answer mode requires exactly one correct option.')
  if (answerMode === 'exactly-n' && correct.length < 2) throw new Error('Question '+(i+1)+': exactly-N mode requires at least two correct options.')
  const provenance = q.provenance === 'AI-Generated' || q.provenance === 'AI-Extracted' ? q.provenance : undefined
  const source = q.source === 'professor-written' || q.source === 'other' ? q.source : undefined
  return {id:typeof q.id==='string'?q.id:crypto.randomUUID(),prompt:q.prompt.trim(),options,correctOptionIds:correct,answerMode,sectionId:typeof q.sectionId==='string'?q.sectionId:null,explanation:typeof q.explanation==='string'?q.explanation:'',tags:Array.isArray(q.tags)?q.tags.filter((t:any)=>typeof t==='string'&&t.trim()&&!['AI-Generated','AI-Extracted'].includes(t)).map((t:string)=>t.trim()):[],...(provenance?{provenance}:{}),...(source?{source}:{})}
 })
 return {sections,questions}
}
import extractPrompt from './prompts/extract.txt?raw'
import generatePrompt from './prompts/generate.txt?raw'

export type AiPromptMode = 'extract' | 'generate'
export function buildAiPrompt(sections: Section[], mode: AiPromptMode = 'generate', includeSections = true) {
 const hasExistingSections = includeSections && sections.length > 0;
 const sectionList = hasExistingSections
  ? '\nExisting sections (id | parentId | name):\n' + sections.map(s=>s.id+' | '+(s.parentId??'-')+' | '+s.name).join('\n')
  : '';
 const sectionRules = hasExistingSections
  ? ' Treat the supplied section catalogue as the complete existing section catalogue. Reuse the exact existing section ID in each question sectionId whenever a listed section fits. Existing IDs remain valid even when their definitions are absent from this import file; Freequiz matches them against the profile section tree. Do NOT make the file self-contained by repeating existing section definitions. Do not return, copy, rename, or redefine any listed section in the output sections array. That array may contain ONLY genuinely new section definitions that do not fit any existing section. If every question fits an existing section, the required output is exactly sections: []. Example: with an existing section ID such as section-1-1, a question may use sectionId: section-1-1 while the top-level sections array is empty. Do not treat generic schema conventions or assumptions about self-contained JSON as a reason to repeat existing sections. A new section parentId may refer to an existing section ID.'
  : ' No existing section list is provided. Create a concise section hierarchy from course headings/content as needed. Return only new sections actually used by questions, with stable IDs and valid parentId relationships.';
 const common = `JSON OUTPUT CONTRACT — FOLLOW EXACTLY
Return only one valid JSON object, with no Markdown fences, comments, trailing commas, or text before/after it. Its top-level shape is:
{
  "format": "freequiz/questions-v1",
  "sections": [
    { "id": "sec-1", "name": "Section name", "parentId": null }
  ],
  "questions": [
    {
      "id": "q-1",
      "prompt": "Question text",
      "options": [
        { "id": "q-1-a", "text": "First answer option" },
        { "id": "q-1-b", "text": "Second answer option" }
      ],
      "correctOptionIds": ["q-1-a"],
      "answerMode": "single",
      "sectionId": "sec-1",
      "explanation": "Brief explanation",
      "tags": ["topic"],
      "provenance": "${mode==='extract'?'AI-Extracted':'AI-Generated'}"
    }
  ]
}
The example is illustrative: return the actual questions, sections, IDs, and answers required by the rules below.

TOP-LEVEL RULES
- Set format to exactly "freequiz/questions-v1".
- Always include both sections and questions as arrays, even when sections must be [].
- Give every question a unique non-empty id and every option within a question a unique non-empty id.
- Every question must include prompt (non-empty string), options (at least two objects), correctOptionIds (array of option IDs), answerMode, sectionId (section ID string or null), explanation (string; use "" if none), tags (array of strings; use [] if none), and provenance.
- Each option object must contain id and text as strings. Do not output options as bare strings.
- correctOptionIds must contain one or more IDs that exactly match option IDs in that question. Never use option text or a numeric index as an answer key.
- answerMode must be "single", "exactly-n", or "select-all". Use "single" only with exactly one correct ID; "exactly-n" only when the question explicitly asks for a fixed number and at least two options are correct; use "select-all" when the respondent must choose every valid answer and there can be multiple correct answers.
- Set provenance on every question to "${mode==='extract'?'AI-Extracted':'AI-Generated'}". Provenance is a field, not a tag. Do not put AI provenance labels in tags.
- Do not invent extra top-level fields. The optional source field should be omitted unless the original question is explicitly known to be professor-written or another source is explicitly recorded; never infer authorship.

SECTION FORMAT AND ASSIGNMENT
- Every new section object must use exactly these fields: id, name, parentId. Use "name", not "title". name is the visible section label. parentId is the parent section ID or null for a top-level section.
- Every question's sectionId must be null or the ID of a real section: either an existing section listed below or a new section included in the output sections array. Never use a section name in sectionId.
- If an existing section catalogue is supplied, treat it as authoritative. Reuse exact existing IDs for matching questions; do not redefine, rename, or repeat existing sections in the output sections array. If all questions fit existing sections, return "sections": [].
- Only add new section definitions when the supplied material contains a meaningful topic not covered by the existing catalogue. Do not create duplicate or near-duplicate sections. New sections may have parentId pointing to an existing section ID or another new section ID.
- If no existing catalogue is supplied, create a concise hierarchy that reflects the actual examinable topics. Include only sections used by at least one question. Use stable unique IDs and valid parent relationships.
- If a question cannot be assigned confidently, use sectionId: null rather than inventing an ID.

MATHEMATICAL NOTATION
- Preserve mathematical notation accurately. Use LaTeX delimiters for formulas: \\( ... \\) for inline math and \\[ ... \\] for display equations.
- Because the output is JSON, escape every LaTeX backslash as \\\\ in the JSON text. For example, a prompt containing inline x squared should contain the JSON text "prompt": "Simplify \\\\(x^2\\\\)." and a display equation should use "\\\\[ ... \\\\]".
- Keep formulas in the original mathematical meaning; do not replace them with screenshots, Unicode approximations, or Markdown code. Use plain text for ordinary prose and LaTeX delimiters only around mathematical expressions.

${sectionRules}${sectionList}`;

 const promptTemplate = mode === 'extract' ? extractPrompt : generatePrompt;
 return promptTemplate.replace('{{COMMON_SCHEMA_AND_SECTION_RULES}}', common);
}
export const demoProfile:Profile = {id:'profile-demo',name:'Demo library',sections:[{id:'math',name:'Mathematics',parentId:null},{id:'geometry',name:'Geometry',parentId:'math'},{id:'analysis',name:'Analysis',parentId:'math'},{id:'everyday',name:'Everyday knowledge',parentId:null}],questions:[{id:'q1',prompt:'What is the sum of the interior angles of a triangle in Euclidean geometry?',options:[{id:'a',text:'90°'},{id:'b',text:'180°'},{id:'c',text:'270°'},{id:'d',text:'360°'}],correctOptionIds:['b'],sectionId:'geometry',explanation:'A Euclidean triangle has interior angles that sum to 180°.',tags:['angles']},{id:'q2',prompt:'Which expression is the derivative of x²?',options:[{id:'a',text:'x'},{id:'b',text:'2x'},{id:'c',text:'2'},{id:'d',text:'x³'}],correctOptionIds:['b'],sectionId:'analysis',explanation:'By the power rule, the derivative of xⁿ is nxⁿ⁻¹.',tags:['derivatives']},{id:'q3',prompt:'Which of these numbers is prime?',options:[{id:'a',text:'21'},{id:'b',text:'27'},{id:'c',text:'29'},{id:'d',text:'33'}],correctOptionIds:['c'],sectionId:'math',explanation:'29 has no positive divisors other than 1 and itself.',tags:['numbers']},{id:'q4',prompt:'Which plant part mainly absorbs water from the soil?',options:[{id:'a',text:'Flower'},{id:'b',text:'Leaf'},{id:'c',text:'Root'},{id:'d',text:'Fruit'}],correctOptionIds:['c'],sectionId:'everyday',explanation:'Roots absorb water and dissolved minerals from the soil.',tags:['gardening']}],attempts:[]}
export const initialStore:Store = {version:1,activeProfileId:demoProfile.id,profiles:[demoProfile]}
