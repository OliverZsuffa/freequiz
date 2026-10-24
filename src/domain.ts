export type Option = { id: string; text: string }
export type AnswerMode = 'single' | 'exactly-n' | 'select-all'
export type Question = { id: string; prompt: string; options: Option[]; correctOptionIds: string[]; answerMode?: AnswerMode; sectionId: string | null; explanation?: string; tags?: string[]; provenance?: 'AI-Generated' | 'AI-Extracted' }
export type QuestionGroup = { id: string; name: string; questionIds: string[] }
export type ExamResponse = { questionId: string; selectedOptionIds: string[]; correct: boolean }
export type ExamSession = { id: string; at: string; source: string; timeLimitSeconds: number; durationSeconds: number; responses: ExamResponse[]; score: number }
export type Section = { id: string; name: string; parentId: string | null }
export type Attempt = { id: string; questionId: string; at: string; selectedOptionIds: string[]; correct: boolean }
export type Profile = { id: string; name: string; sections: Section[]; questions: Question[]; attempts: Attempt[]; favourites?: string[]; groups?: QuestionGroup[]; exams?: ExamSession[] }
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
export function buildAiPrompt(sections: Section[], mode: AiPromptMode = 'generate') {
 const schema = JSON.stringify({format:'freequiz/questions-v1',sections:[{id:'stable-slug',name:'Section name',parentId:null}],questions:[{id:'stable-id',prompt:'Question text',options:[{id:'a',text:'Option A'},{id:'b',text:'Option B'}],correctOptionIds:['a'],answerMode:'single',sectionId:'section-id-or-null',explanation:'Explanation',tags:['ordinary-tag'],provenance:mode==='extract'?'AI-Extracted':'AI-Generated'}]})
 const common = 'Return importable questions using the Freequiz freequiz/questions-v1 JSON format. Each question must have a unique stable id, prompt, at least two options with unique stable option IDs, correctOptionIds referencing option IDs, answerMode, sectionId, explanation, tags, and provenance. Supported answer modes: single (exactly one correct option), exactly-n (the specified number of correct options, at least two), and select-all (all applicable options). Option counts may vary by question. Keep ordinary tags separate from provenance. Set provenance to exactly '+JSON.stringify(mode==='extract'?'AI-Extracted':'AI-Generated')+' on every question and do not place that value in tags. Reuse existing sections or create nested sections with parentId relationships. Existing section tree: '+JSON.stringify(sections,null,2)+'. Schema example: '+schema+'.'
 if(mode==='extract') return 'MODE: EXTRACT EXISTING QUESTIONS. Return one valid JSON object for import, then provide a clearly separate review report after the JSON object for uncertain or incomplete items; never put review notes inside the JSON. The user will attach or paste a source document in this conversation. If no source is provided, ask for it before doing any work. Extract questions that already exist in the source; do not create new questions to fill gaps. Preserve the original wording, order, options, and structure as faithfully as possible, making only the changes required for valid JSON. Never invent a question, option, correct answer, answer key, explanation, or missing detail. A question's presence in the document does not prove which answer is correct. Mark an answer correct only when the source explicitly provides a reliable answer key or unambiguous answer indication. If the source has no answer key or an item is ambiguous, do not guess. Instead, return the extractable item in a clearly flagged review report outside the import JSON and omit it from importable questions if the schema cannot represent an unresolved answer. Do not silently omit uncertain items: report their question text and what is missing. Distinguish extracted text from any answer key. '+common
 return 'MODE: GENERATE NEW QUESTIONS. Return only one valid JSON object without Markdown fences. The user will attach or paste source material for learning in this conversation. If no source is provided, ask for it before doing any work. Create original assessment questions grounded only in the supplied material. Prioritize meaningful understanding, application, distinctions, and common misconceptions over trivial recall. Distractors must be credible mistakes a learner might make, based on misunderstandings of the material; never use absurd, irrelevant, or obviously false filler options. Options must be comparable in specificity, grammatical form, and length. Balance answer lengths so the correct option is not systematically longer, more detailed, or more qualified. Vary correct-answer positions across the set and avoid patterns. Remove clues from grammar, repeated keywords, absolutes, formatting, and option length. Ensure distractors are mutually distinguishable and that only the intended answer set is correct. Use a variable number of options appropriate to each question. Include concise explanations grounded in the source. Do not invent facts beyond the supplied material. If the source cannot support a sound question, skip it or flag the limitation rather than fabricating certainty. Before returning the set, audit every question for plausibility of distractors, answer-length balance, answer-position variety, ambiguity, and unintended clues; rewrite or discard weak questions. '+common
}
export const demoProfile:Profile = {id:'profile-demo',name:'Demo library',sections:[{id:'math',name:'Mathematics',parentId:null},{id:'geometry',name:'Geometry',parentId:'math'},{id:'analysis',name:'Analysis',parentId:'math'},{id:'everyday',name:'Everyday knowledge',parentId:null}],questions:[{id:'q1',prompt:'What is the sum of the interior angles of a triangle in Euclidean geometry?',options:[{id:'a',text:'90°'},{id:'b',text:'180°'},{id:'c',text:'270°'},{id:'d',text:'360°'}],correctOptionIds:['b'],sectionId:'geometry',explanation:'A Euclidean triangle has interior angles that sum to 180°.',tags:['angles']},{id:'q2',prompt:'Which expression is the derivative of x²?',options:[{id:'a',text:'x'},{id:'b',text:'2x'},{id:'c',text:'2'},{id:'d',text:'x³'}],correctOptionIds:['b'],sectionId:'analysis',explanation:'By the power rule, the derivative of xⁿ is nxⁿ⁻¹.',tags:['derivatives']},{id:'q3',prompt:'Which of these numbers is prime?',options:[{id:'a',text:'21'},{id:'b',text:'27'},{id:'c',text:'29'},{id:'d',text:'33'}],correctOptionIds:['c'],sectionId:'math',explanation:'29 has no positive divisors other than 1 and itself.',tags:['numbers']},{id:'q4',prompt:'Which plant part mainly absorbs water from the soil?',options:[{id:'a',text:'Flower'},{id:'b',text:'Leaf'},{id:'c',text:'Root'},{id:'d',text:'Fruit'}],correctOptionIds:['c'],sectionId:'everyday',explanation:'Roots absorb water and dissolved minerals from the soil.',tags:['gardening']}],attempts:[]}
export const initialStore:Store = {version:1,activeProfileId:demoProfile.id,profiles:[demoProfile]}
