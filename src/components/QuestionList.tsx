import type { Dispatch, SetStateAction } from 'react'
import { BookOpen, Check, ChevronRight, Clock3, Pencil, Star } from 'lucide-react'
import { MathText } from './MathText'
import { masteryFor, type AnswerMode, type ImportBatch, type Mastery, type Profile, type Question } from '../domain'

type Props = {
  visibleFiltered: Question[]
  filteredCount: number
  visibleQuestionLimit: number
  setVisibleQuestionLimit: Dispatch<SetStateAction<number>>
  profile: Profile
  labels: Record<Mastery,string>
  bulkSelectedIds: string[]
  toggleBulkSelection: (id:string)=>void
  sectionPath: (profile:Profile,id:string|null)=>string
  answerMode: (question:Question)=>AnswerMode
  importForQuestion: (question:Question)=>ImportBatch|undefined
  toggleFavourite: (id:string)=>void
  toggleDeferred: (id:string)=>void
  openEditor: (question:Question)=>void
  beginSession: (ids:string[],exam?:boolean)=>void
  setView: (view:'overview'|'library'|'practice'|'timeline'|'import'|'imports'|'results'|'statistics'|'settings'|'help'|'impressum'|'privacy')=>void
  onPracticeSelection: ()=>void
}

export function QuestionList({visibleFiltered,filteredCount,visibleQuestionLimit,setVisibleQuestionLimit,profile,labels,bulkSelectedIds,toggleBulkSelection,sectionPath,answerMode,importForQuestion,toggleFavourite,toggleDeferred,openEditor,beginSession,setView,onPracticeSelection}:Props) {
  return <>
    <div className="library-list">{visibleFiltered.map((q,i)=>{const m=masteryFor(profile.attempts,q.id);const batch=importForQuestion(q);return <article className="question-row" key={q.id}><input aria-label={"Select "+q.prompt} type="checkbox" checked={bulkSelectedIds.includes(q.id)} onChange={()=>toggleBulkSelection(q.id)}/><span className="question-number">{String(i+1).padStart(2,'0')}</span><div className="question-row-content"><strong><MathText text={q.prompt}/></strong><div className="question-row-meta"><span>{sectionPath(profile,q.sectionId)}</span><span>·</span><span>{q.options.length} options</span><span>{answerMode(q)==='single'?'One answer':answerMode(q)==='exactly-n'?'Exactly '+q.correctOptionIds.length:'All that apply'}</span>{q.provenance&&<span className="tag provenance-tag">{q.provenance==='AI-Generated'?'AI-generated':'AI-extracted'}</span>}{q.source&&<span className="tag source-tag">{q.source==='professor-written'?'Professor-written':'Other known source'}</span>}{(profile.deferredQuestionIds??[]).includes(q.id)&&<span className="tag">Deferred</span>}{q.tags?.filter(t=>t!=='AI-Generated'&&t!=='AI-Extracted').slice(0,2).map(t=><span className="tag" key={t}>{t}</span>)}{batch&&<span className="tag import-source-tag">From: {batch.name}{(batch.sourceFileName||q.sourceFileName)?' · '+(batch.sourceFileName||q.sourceFileName):''}</span>}</div></div><span className={'mastery-pill '+m}>{labels[m]}</span><button className="icon-button" aria-label={(profile.favourites??[]).includes(q.id)?'Unfavourite '+q.prompt:'Favourite '+q.prompt} onClick={()=>toggleFavourite(q.id)}><Star size={15} fill={(profile.favourites??[]).includes(q.id)?'currentColor':'none'}/></button><button className="icon-button" aria-label={(profile.deferredQuestionIds??[]).includes(q.id)?'Unmark deferred '+q.prompt:'Mark deferred '+q.prompt} onClick={()=>toggleDeferred(q.id)}><Clock3 size={15} color={(profile.deferredQuestionIds??[]).includes(q.id)?'var(--accent)':'currentColor'}/></button><button className="icon-button" aria-label={'Edit '+q.prompt} onClick={()=>openEditor(q)}><Pencil size={15}/></button><button className="icon-button" aria-label={'Practice '+q.prompt} onClick={()=>beginSession([q.id])}><ChevronRight size={16}/></button></article>})}{filteredCount===0&&<div className="empty-state"><BookOpen size={25}/><h3>Nothing here yet</h3><p>Try a different search, or import questions to this profile.</p><button className="button button-quiet" onClick={()=>setView('import')}>Import questions</button></div>}</div>
    {filteredCount>visibleQuestionLimit&&<div className="load-more-row"><span>Showing {visibleFiltered.length} of {filteredCount} matching questions.</span><button className="button button-quiet" onClick={()=>setVisibleQuestionLimit(n=>Math.min(filteredCount,n+50))}>Show 50 more</button></div>}
    <div className="library-bottom"><span>{visibleFiltered.length} visible · {filteredCount} matching</span><button className="text-button" onClick={onPracticeSelection}>Practise selection <ChevronRight size={14}/></button></div>
  </>
}
