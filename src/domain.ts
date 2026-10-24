export type Option = { id: string; text: string }
export type AnswerMode = 'single' | 'exactly-n' | 'select-all'
export type Question = { id: string; prompt: string; options: Option[]; correctOptionIds: string[]; answerMode?: AnswerMode; sectionId: string | null; explanation?: string; tags?: string[]; provenance?: 'AI-Generated' | 'AI-Extracted' }
export type QuestionGroup = { id: string; name: string; questionIds: string[] }
export type ExamResponse = { questionId: string; selectedOptionIds: string[]; correct: boolean }
export type ExamSession = { id: string; at: string; source: string; timeLimitSeconds: number; durationSeconds: number; responses: ExamResponse[]; score: number }
export type Section = { id: string; name: string; parentId: string | null }
export type Attempt = { id: string; questionId: string; at: string; selectedOptionIds: string[]; correct: boolean }
export type ImportBatch = { id: string; name: string; at: string; source: 'json' | 'ai-extract' | 'ai-generate' | 'unknown'; addedQuestionIds: string[]; sections: Section[]; questions: Question[] }
export type Profile = { id: string; name: string; sections: Section[]; questions: Question[]; attempts: Attempt[]; favourites?: string[]; groups?: QuestionGroup[]; exams?: ExamSession[]; imports?: ImportBatch[] }
export type Store = { version: 1; activeProfileId: string; profiles: Profile[] }
export type Mastery = 'new' | 'learning' | 'known' | 'needs-work' | 'weak'
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
 const sectionList = includeSections && sections.length
  ? '\nExisting sections (id | parentId | name):\n' + sections.map(s=>s.id+' | '+(s.parentId??'-')+' | '+s.name).join('\n')
  : '';
 const common = 'Return one valid JSON object in the freequiz/questions-v1 format: {format, sections, questions}. Each question needs a unique id, prompt, options (each with unique id and text), correctOptionIds, answerMode, sectionId, explanation, tags, and provenance. answerMode is single, exactly-n, or select-all. Option counts may vary. Correct IDs must match option IDs. Set provenance on every question to '+(mode==='extract'?'AI-Extracted':'AI-Generated')+'; keep it out of ordinary tags. In the output, include only sections actually used by questions. Reuse existing section IDs exactly; do not repeat the whole tree, include empty sections, or return unrelated branches. Create a new section only when no existing section fits. Keep parentId relationships valid.'+sectionList;
 if(mode==='extract') return 'MODE: EXTRACT EXISTING QUESTIONS. If no source is attached or pasted, ask for it. Extract only questions explicitly posed as questions in the source, including exercises, review questions, and questions with listed answer options. Never invent a question from a fact, ranking, definition, or hierarchy that is merely stated in the material. For example, a slide stating that X is the largest does not count as an existing question unless it actually asks which item is largest. Preserve original wording, order, and options as closely as possible. Never invent a question, option, correct answer, answer key, or missing detail. Do not guess answers. Mark an answer correct only if an explicit answer key or unambiguous answer indication is provided. If an existing question has no reliable answer, put its text and the missing information in a separate review report after the JSON, not inside it; omit unresolved items from importable questions. Do not include the review report in the JSON. '+common;
 return 'MODE: GENERATE NEW QUESTIONS. If no source material is attached or pasted, ask for it. Generate a broad, useful set of original questions grounded only in the supplied course material. Create as many distinct high-quality questions as the material supports; cover each major topic with multiple questions where useful, without padding or repeating the same fact. Prioritize learning objectives, core concepts, definitions, distinctions, relationships, applications, and common misconceptions over trivia or isolated names and numbers. Skip introductions, agendas, advertisements, administrative details, contacts, schedules, icebreakers, and other non-course content. A conclusion may be used only when it contains examinable course content. Ask questions directly: avoid repetitive stems such as “According to the slides” or “Based on the course material” unless source context is genuinely necessary. Keep stems concise without removing context needed to test the concept. Ground correct answers and concise explanations in the source; do not add unsupported outside facts or guess. If the source cannot support a sound answer, skip the item or flag the limitation. Distractors must be credible mistakes based on common misconceptions, mutually distinguishable, and not absurd filler. Balance answer lengths and keep options comparable in specificity, grammar, and length; do not systematically make correct options longer or more qualified. Vary correct-answer positions and remove clues from grammar, repeated keywords, absolutes, formatting, and option length. Use a variable number of options appropriate to each question. Audit for ambiguity, factual support, duplication, balanced options, and predictable clues before returning the set. Return only the JSON object, with no Markdown fences or commentary. '+common;
}
export const demoProfile:Profile = {id:'profile-demo',name:'Demo library',sections:[{id:'math',name:'Mathematics',parentId:null},{id:'geometry',name:'Geometry',parentId:'math'},{id:'analysis',name:'Analysis',parentId:'math'},{id:'everyday',name:'Everyday knowledge',parentId:null}],questions:[{id:'q1',prompt:'What is the sum of the interior angles of a triangle in Euclidean geometry?',options:[{id:'a',text:'90°'},{id:'b',text:'180°'},{id:'c',text:'270°'},{id:'d',text:'360°'}],correctOptionIds:['b'],sectionId:'geometry',explanation:'A Euclidean triangle has interior angles that sum to 180°.',tags:['angles']},{id:'q2',prompt:'Which expression is the derivative of x²?',options:[{id:'a',text:'x'},{id:'b',text:'2x'},{id:'c',text:'2'},{id:'d',text:'x³'}],correctOptionIds:['b'],sectionId:'analysis',explanation:'By the power rule, the derivative of xⁿ is nxⁿ⁻¹.',tags:['derivatives']},{id:'q3',prompt:'Which of these numbers is prime?',options:[{id:'a',text:'21'},{id:'b',text:'27'},{id:'c',text:'29'},{id:'d',text:'33'}],correctOptionIds:['c'],sectionId:'math',explanation:'29 has no positive divisors other than 1 and itself.',tags:['numbers']},{id:'q4',prompt:'Which plant part mainly absorbs water from the soil?',options:[{id:'a',text:'Flower'},{id:'b',text:'Leaf'},{id:'c',text:'Root'},{id:'d',text:'Fruit'}],correctOptionIds:['c'],sectionId:'everyday',explanation:'Roots absorb water and dissolved minerals from the soil.',tags:['gardening']}],attempts:[]}
export const initialStore:Store = {version:1,activeProfileId:demoProfile.id,profiles:[demoProfile]}
