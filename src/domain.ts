export type Option = { id: string; text: string }
export type AnswerMode = 'single' | 'exactly-n' | 'select-all'
export type Question = { id: string; prompt: string; options: Option[]; correctOptionIds: string[]; answerMode?: AnswerMode; sectionId: string | null; explanation?: string; tags?: string[]; provenance?: 'AI-Generated' | 'AI-Extracted'; sourceImportId?: string; sourceFileName?: string; createdAt?: string; updatedAt?: string }
export type QuestionGroup = { id: string; name: string; questionIds: string[] }
export type ExamResponse = { questionId: string; selectedOptionIds: string[]; correct: boolean }
export type ExamSession = { id: string; at: string; source: string; timeLimitSeconds: number; durationSeconds: number; responses: ExamResponse[]; score: number }
export type Section = { id: string; name: string; parentId: string | null }
export type Attempt = { id: string; questionId: string; at: string; selectedOptionIds: string[]; correct: boolean }
export type ImportBatch = { id: string; name: string; at: string; source: 'json' | 'ai-extract' | 'ai-generate' | 'unknown'; addedQuestionIds: string[]; sections: Section[]; questions: Question[]; sourceFileName?: string; sourceIdentity?: string }
export type Profile = { id: string; name: string; sections: Section[]; questions: Question[]; attempts: Attempt[]; favourites?: string[]; favouriteTags?: string[]; deferredQuestionIds?: string[]; groups?: QuestionGroup[]; exams?: ExamSession[]; imports?: ImportBatch[] }
export type FullProfileBackup = { format: 'freequiz/backup-v1'; backupVersion: 1; exportedAt: string; activeProfileId: string; profiles: Profile[] }
export type Store = { version: 1; activeProfileId: string; profiles: Profile[] }
export type Mastery = 'new' | 'learning' | 'known' | 'needs-work' | 'weak'

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
 if (history.length === 1) return history[0].correct ? 'learning' : 'needs-work'
 if (history[0].correct && history[1].correct) return 'known'
 if (!history[0].correct && !history[1].correct) return 'weak'
 return history[0].correct ? 'learning' : 'needs-work'
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
 const sections: Section[] = Array.isArray(src.sections) ? src.sections : []
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
  return {id:typeof q.id==='string'?q.id:crypto.randomUUID(),prompt:q.prompt.trim(),options,correctOptionIds:correct,answerMode,sectionId:typeof q.sectionId==='string'?q.sectionId:null,explanation:typeof q.explanation==='string'?q.explanation:'',tags:Array.isArray(q.tags)?q.tags.filter((t:any)=>typeof t==='string'&&t.trim()&&!['AI-Generated','AI-Extracted'].includes(t)).map((t:string)=>t.trim()):[],...(provenance?{provenance}:{})}
 })
 return {sections,questions}
}
export type AiPromptMode = 'extract' | 'generate'
export function buildAiPrompt(sections: Section[], mode: AiPromptMode = 'generate', includeSections = true) {
 const hasExistingSections = includeSections && sections.length > 0;
 const sectionList = hasExistingSections
  ? '\nExisting sections (id | parentId | name):\n' + sections.map(s=>s.id+' | '+(s.parentId??'-')+' | '+s.name).join('\n')
  : '';
 const sectionRules = hasExistingSections
  ? ' Treat the listed sections as the complete existing section catalogue. Reuse the exact existing section ID in each question sectionId whenever a listed section fits. Existing IDs remain valid even when their definitions are absent from this import file; Freequiz matches them against the profile section tree. Do NOT make the file self-contained by repeating existing section definitions. Do not return, copy, rename, or redefine any listed section in the output sections array. That array may contain ONLY genuinely new section definitions that do not fit any existing section. If every question fits an existing section, the required output is exactly sections: []. Example: with existing section ID ia-1-1, a question may use sectionId: ia-1-1 while the top-level sections array is empty. Do not treat generic schema conventions or assumptions about self-contained JSON as a reason to repeat existing sections. A new section parentId may refer to an existing section ID.'
  : ' No existing section list is provided. Create a concise section hierarchy from course headings/content as needed. Return only new sections actually used by questions, with stable IDs and valid parentId relationships.';
 const common = 'Return one valid JSON object in the freequiz/questions-v1 format: {format, sections, questions}. Set format to exactly freequiz/questions-v1. Each question needs a unique id, prompt, options (each with unique id and text), correctOptionIds, answerMode, sectionId, explanation, tags, and provenance. answerMode is single, exactly-n, or select-all. Option counts may vary. Correct IDs must match option IDs. Set provenance on every question to '+(mode==='extract'?'AI-Extracted':'AI-Generated')+'; keep it out of ordinary tags. '+sectionRules+sectionList;
 if(mode==='extract') return 'MODE: EXTRACT EXISTING QUESTIONS. If no source is attached or pasted, ask for it. Extract only questions explicitly posed as questions in the source, including exercises, review questions, and questions with listed answer options. Never invent a question from a fact, ranking, definition, or hierarchy that is merely stated in the material. For example, a source stating that X is the largest does not count as an existing question unless it actually asks which item is largest. Preserve original wording, order, and options as closely as possible. Never invent a question, option, correct answer, answer key, or missing detail. If the answer key is missing, do not guess answers. Mark an answer correct only if an explicit answer key or unambiguous answer indication is provided. If an existing question has no reliable answer, put its text and the missing information in a separate review report after the JSON, not inside it; omit unresolved items from importable questions. Do not include the review report in the JSON. '+common;
 return 'MODE: GENERATE NEW QUESTIONS. If no source material is attached or pasted, ask for it. Build a comprehensive question bank, not a short sample. First identify the major examinable topics and subtopics in the supplied material, then generate questions across that coverage before finishing. For each substantial topic, aim for at least 3 distinct questions and typically 5 or more for a large topic, using recall, explanation, comparison, application, and misconception checks where supported. There is no arbitrary maximum: continue while the material supports useful, distinct questions. Do not pad the bank with near-duplicates or trivia just to hit a count. Before finalizing, check that every major topic is represented and expand any thin areas. Prioritize core concepts, definitions, distinctions, relationships, reasoning, applications, and common misconceptions over isolated numbers, names, lists, or incidental details. Skip introductions, agendas, advertisements, administrative details, contacts, schedules, icebreakers, and other non-course content. A conclusion is usable only if it contains examinable course content. Every question stem must be direct, natural, self-contained, and about the subject itself. STRICTLY DO NOT write phrases such as “according to the slides,” “according to the lecture,” “as described in the course material,” “the lecture material states,” “in the presentation,” or similar references to the source. Do not mention slides, lectures, notes, documents, or the source in question stems or explanations; test the concept directly. Only mention a source when the source itself is genuinely the subject of the question. Keep stems concise without removing context needed to test the concept. Ground correct answers and concise explanations in the supplied material; do not add unsupported outside facts or guess. If the source cannot support a sound answer, skip the item. Distractors must be credible mistakes based on common misconceptions, mutually distinguishable, and not absurd filler. Balance answer lengths and keep options comparable in specificity, grammar, and length; do not systematically make correct options longer or more qualified. Vary correct-answer positions across the whole set and remove clues from grammar, repeated keywords, absolutes, formatting, and option length. Use a variable number of options appropriate to each question. Audit the final bank for coverage gaps, ambiguity, factual support, duplication, balanced options, and predictable clues. Return only the JSON object, with no Markdown fences or commentary. '+common;
}
export const demoProfile:Profile = {id:'profile-demo',name:'Demo library',sections:[{id:'math',name:'Mathematics',parentId:null},{id:'geometry',name:'Geometry',parentId:'math'},{id:'analysis',name:'Analysis',parentId:'math'},{id:'everyday',name:'Everyday knowledge',parentId:null}],questions:[{id:'q1',prompt:'What is the sum of the interior angles of a triangle in Euclidean geometry?',options:[{id:'a',text:'90°'},{id:'b',text:'180°'},{id:'c',text:'270°'},{id:'d',text:'360°'}],correctOptionIds:['b'],sectionId:'geometry',explanation:'A Euclidean triangle has interior angles that sum to 180°.',tags:['angles']},{id:'q2',prompt:'Which expression is the derivative of x²?',options:[{id:'a',text:'x'},{id:'b',text:'2x'},{id:'c',text:'2'},{id:'d',text:'x³'}],correctOptionIds:['b'],sectionId:'analysis',explanation:'By the power rule, the derivative of xⁿ is nxⁿ⁻¹.',tags:['derivatives']},{id:'q3',prompt:'Which of these numbers is prime?',options:[{id:'a',text:'21'},{id:'b',text:'27'},{id:'c',text:'29'},{id:'d',text:'33'}],correctOptionIds:['c'],sectionId:'math',explanation:'29 has no positive divisors other than 1 and itself.',tags:['numbers']},{id:'q4',prompt:'Which plant part mainly absorbs water from the soil?',options:[{id:'a',text:'Flower'},{id:'b',text:'Leaf'},{id:'c',text:'Root'},{id:'d',text:'Fruit'}],correctOptionIds:['c'],sectionId:'everyday',explanation:'Roots absorb water and dissolved minerals from the soil.',tags:['gardening']}],attempts:[]}
export const initialStore:Store = {version:1,activeProfileId:demoProfile.id,profiles:[demoProfile]}
