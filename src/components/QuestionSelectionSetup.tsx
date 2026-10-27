import type { Dispatch, SetStateAction } from 'react'
import { ChevronRight, X } from 'lucide-react'
import type { Profile, Question } from '../domain'
import { QuestionFilters, type QuestionFiltersProps } from './QuestionFilters'

type Props = {
  open: boolean
  profile: Profile
  setupQuestions: Question[]
  sessionType: 'practice' | 'exam'
  setupSource: string
  setSetupSource: Dispatch<SetStateAction<string>>
  questionCount: string
  setQuestionCount: Dispatch<SetStateAction<string>>
  examMinutes: string
  setExamMinutes: Dispatch<SetStateAction<string>>
  filterProps: Omit<QuestionFiltersProps, 'mode'>
  onClose: () => void
  onStart: () => void
}

export function QuestionSelectionSetup({open,profile,setupQuestions,sessionType,setupSource,setSetupSource,questionCount,setQuestionCount,examMinutes,setExamMinutes,filterProps,onClose,onStart}:Props) {
  if(!open)return null
  const validCount=Number.isInteger(Number(questionCount))&&Number(questionCount)>=1&&Number(questionCount)<=setupQuestions.length
  return <div className="setup-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><section className="panel setup-dialog" role="dialog" aria-modal="true" aria-labelledby="setup-dialog-title"><div className="panel-heading"><div><p className="eyebrow">{sessionType==='exam'?'EXAM':'PRACTICE'} SETUP</p><h2 id="setup-dialog-title">{sessionType==='exam'?'Create an exam':'Create practice'}</h2></div><button className="icon-button" aria-label="Close setup" onClick={onClose}><X size={17}/></button></div><p className="selection-match-count" aria-live="polite"><strong>{setupQuestions.length}</strong> {setupQuestions.length===1?'question matches':'questions match'} your filters</p><div className="setup-grid"><label>Question set<select aria-label="Questions to practise" value={setupSource} onChange={e=>setSetupSource(e.target.value)}><option value="all">All questions</option><option value="favourites">Favourites</option><option value="unsorted">Unsorted</option>{(profile.groups??[]).map(g=><option key={g.id} value={'group:'+g.id}>{g.name}</option>)}</select></label><label>Number of questions<input aria-label="Number of questions" type="number" min="1" step="1" max={Math.max(1,setupQuestions.length)} value={questionCount} onChange={e=>setQuestionCount(e.target.value)}/></label>{sessionType==='exam'&&<label>Time limit (minutes)<input aria-label="Time limit (minutes)" type="number" min="1" max="180" value={examMinutes} onChange={e=>setExamMinutes(e.target.value)}/></label>}</div><details className="session-filter-disclosure"><summary>Filters</summary><QuestionFilters {...filterProps} mode="selection" /></details>{setupQuestions.length===0&&<p className="selection-validation" role="alert">No questions match. Clear a filter or choose a different question set.</p>}{setupQuestions.length>0&&!validCount&&<p className="selection-validation" role="alert">Choose between 1 and {setupQuestions.length} questions, or adjust your filters.</p>}<div className="setup-actions"><button className="button button-quiet" onClick={onClose}>Cancel</button><button className="button button-primary" onClick={()=>{onStart();onClose()}} disabled={!validCount}>{sessionType==='exam'?'Start exam':'Start practice'} <ChevronRight size={15}/></button></div></section></div>
}
