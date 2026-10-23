export type Option = { id: string; text: string }
export type Question = { id: string; prompt: string; options: Option[]; correctOptionIds: string[]; sectionId: string | null; explanation?: string; tags?: string[] }
export type Section = { id: string; name: string; parentId: string | null }
export type Attempt = { id: string; questionId: string; at: string; selectedOptionIds: string[]; correct: boolean }
export type Profile = { id: string; name: string; sections: Section[]; questions: Question[]; attempts: Attempt[] }
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
  return {id:typeof q.id==='string'?q.id:crypto.randomUUID(),prompt:q.prompt.trim(),options,correctOptionIds:correct,sectionId:typeof q.sectionId==='string'?q.sectionId:null,explanation:typeof q.explanation==='string'?q.explanation:'',tags:Array.isArray(q.tags)?q.tags.filter((t:any)=>typeof t==='string'):[]}
 })
 return {sections,questions}
}
export function buildAiPrompt(sections: Section[], material: string) {
 return 'Convert the source material into a Freequiz question bank. Return only valid JSON, no Markdown fences. Schema: '+JSON.stringify({format:'freequiz/questions-v1',sections:[{id:'stable-slug',name:'Section name',parentId:null}],questions:[{id:'stable-id',prompt:'Question text',options:[{id:'a',text:'Option A'},{id:'b',text:'Option B'}],correctOptionIds:['a'],sectionId:'section-id-or-null',explanation:'Explanation',tags:[]}]})+'. Write clear questions with plausible options, do not invent unsupported facts, and use multiple correctOptionIds only when appropriate. Reuse existing sections or create new sections with parentId relationships. Existing section tree: '+JSON.stringify(sections,null,2)+'. Source material:\n---\n'+material+'\n---'
}
export const demoProfile:Profile = {id:'profile-demo',name:'Demo library',sections:[{id:'math',name:'Mathematics',parentId:null},{id:'geometry',name:'Geometry',parentId:'math'},{id:'analysis',name:'Analysis',parentId:'math'},{id:'everyday',name:'Everyday knowledge',parentId:null}],questions:[{id:'q1',prompt:'What is the sum of the interior angles of a triangle in Euclidean geometry?',options:[{id:'a',text:'90°'},{id:'b',text:'180°'},{id:'c',text:'270°'},{id:'d',text:'360°'}],correctOptionIds:['b'],sectionId:'geometry',explanation:'A Euclidean triangle has interior angles that sum to 180°.',tags:['angles']},{id:'q2',prompt:'Which expression is the derivative of x²?',options:[{id:'a',text:'x'},{id:'b',text:'2x'},{id:'c',text:'2'},{id:'d',text:'x³'}],correctOptionIds:['b'],sectionId:'analysis',explanation:'By the power rule, the derivative of xⁿ is nxⁿ⁻¹.',tags:['derivatives']},{id:'q3',prompt:'Which of these numbers is prime?',options:[{id:'a',text:'21'},{id:'b',text:'27'},{id:'c',text:'29'},{id:'d',text:'33'}],correctOptionIds:['c'],sectionId:'math',explanation:'29 has no positive divisors other than 1 and itself.',tags:['numbers']},{id:'q4',prompt:'Which plant part mainly absorbs water from the soil?',options:[{id:'a',text:'Flower'},{id:'b',text:'Leaf'},{id:'c',text:'Root'},{id:'d',text:'Fruit'}],correctOptionIds:['c'],sectionId:'everyday',explanation:'Roots absorb water and dissolved minerals from the soil.',tags:['gardening']}],attempts:[]}
export const initialStore:Store = {version:1,activeProfileId:demoProfile.id,profiles:[demoProfile]}
