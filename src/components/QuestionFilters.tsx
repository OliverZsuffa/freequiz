import { useState, type Dispatch, type SetStateAction, type ReactNode } from 'react'
import { Search, Star, X } from 'lucide-react'
import type { AnswerMode, ImportBatch, Mastery, Profile } from '../domain'
import { formatImportSourceLabel, matchesImportSourceSearch } from '../importSourceLabel'
import { MultiSelect } from './MultiSelect'

export type QuestionFiltersProps = {
  profile: Profile
  allTags: string[]
  mode: 'management' | 'selection'
  query: string
  setQuery: Dispatch<SetStateAction<string>>
  tagSearch: string
  setTagSearch: Dispatch<SetStateAction<string>>
  importSearch: string
  setImportSearch: Dispatch<SetStateAction<string>>
  multiSectionFilter: string[]
  setMultiSectionFilter: Dispatch<SetStateAction<string[]>>
  sectionDescendants: boolean
  setSectionDescendants: Dispatch<SetStateAction<boolean>>
  multiAnswerModeFilter: AnswerMode[]
  setMultiAnswerModeFilter: Dispatch<SetStateAction<AnswerMode[]>>
  multiTagFilter: string[]
  setMultiTagFilter: Dispatch<SetStateAction<string[]>>
  multiMasteryFilter: Mastery[]
  setMultiMasteryFilter: Dispatch<SetStateAction<Mastery[]>>
  multiFavouriteFilter: string[]
  setMultiFavouriteFilter: Dispatch<SetStateAction<string[]>>
  multiDeferredFilter: string[]
  setMultiDeferredFilter: Dispatch<SetStateAction<string[]>>
  filterTagsInclude: string
  setFilterTagsInclude: Dispatch<SetStateAction<string>>
  filterTagsExclude: string
  setFilterTagsExclude: Dispatch<SetStateAction<string>>
  multiProvenanceFilter: string[]
  setMultiProvenanceFilter: Dispatch<SetStateAction<string[]>>
  multiImportFilter: string[]
  setMultiImportFilter: Dispatch<SetStateAction<string[]>>
  multiImportSourceFilter: string[]
  setMultiImportSourceFilter: Dispatch<SetStateAction<string[]>>
  multiExplanationFilter: string[]
  setMultiExplanationFilter: Dispatch<SetStateAction<string[]>>
  multiTagPresenceFilter: string[]
  setMultiTagPresenceFilter: Dispatch<SetStateAction<string[]>>
  createdAfter: string
  setCreatedAfter: Dispatch<SetStateAction<string>>
  createdBefore: string
  setCreatedBefore: Dispatch<SetStateAction<string>>
  updatedAfter: string
  setUpdatedAfter: Dispatch<SetStateAction<string>>
  updatedBefore: string
  setUpdatedBefore: Dispatch<SetStateAction<string>>
  sortBy: string
  setSortBy: Dispatch<SetStateAction<string>>
  sectionPath: (profile: Profile, id: string | null) => string
  onToggleFavouriteTag: (tag: string) => void
  onClear: () => void
}

export function QuestionFilters(p: QuestionFiltersProps) {
  const activeLabels = [
    ...(p.query.trim() ? ['Search: '+p.query.trim()] : []),
    ...p.multiTagFilter.map(value=>'Tag: '+value),
    ...p.multiSectionFilter.map(value=>'Section: '+(value==='unsorted'?'Unsorted':p.sectionPath(p.profile,value))),
    ...p.multiFavouriteFilter.map(value=>value==='favourite'?'Favourites only':'Not favourites'),
    ...p.multiDeferredFilter.map(value=>value==='deferred'?'Deferred only':'Not deferred'),
    ...p.multiProvenanceFilter.map(value=>({ 'professor-written':'Written by professor', other:'Other known source', 'AI-Generated':'AI-generated', 'AI-Extracted':'AI-extracted', unknown:'Not specified' } as Record<string,string>)[value]??value),
    ...p.multiMasteryFilter.map(value=>'Mastery: '+value.replace('-',' ')),
    ...p.multiAnswerModeFilter.map(value=>'Answer type: '+({single:'One answer','exactly-n':'Pick exactly N','select-all':'All that apply'} as Record<AnswerMode,string>)[value]),
    ...(p.filterTagsInclude.trim()?['Include tags: '+p.filterTagsInclude.trim()]:[]),
    ...(p.filterTagsExclude.trim()?['Exclude tags: '+p.filterTagsExclude.trim()]:[]),
    ...p.multiImportFilter.map(value=>{const batch=(p.profile.imports??[]).find(b=>b.id===value);return value==='unknown'?'No known import':'Import: '+(batch?.name??value)}),
    ...p.multiImportSourceFilter.map(value=>'Import type: '+value),
    ...p.multiExplanationFilter.map(value=>value==='present'?'Has explanation':'Missing explanation'),
    ...p.multiTagPresenceFilter.map(value=>value==='present'?'Has tags':'No tags'),
    ...(p.createdAfter?['Created after: '+p.createdAfter]:[]),
    ...(p.createdBefore?['Created before: '+p.createdBefore]:[]),
    ...(p.updatedAfter?['Modified after: '+p.updatedAfter]:[]),
    ...(p.updatedBefore?['Modified before: '+p.updatedBefore]:[]),
    ...(p.sortBy!=='default'?['Sort: '+p.sortBy]:[]),
  ]
  const active = activeLabels.length > 0
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  const renderSectionTree = (parentId: string | null, depth: number): ReactNode => p.profile.sections.filter(s => parentId === null ? !s.parentId : s.parentId === parentId).map(section => {
    const children = p.profile.sections.some(s => s.parentId === section.id)
    const expanded = expandedSections.includes(section.id)
    return <div className="section-filter-node" key={section.id}>
      <div className="section-filter-row" style={{ paddingLeft: 6 + depth * 16 }}>
        {children ? <button type="button" className="section-filter-toggle" aria-label={(expanded ? "Collapse " : "Expand ") + section.name} aria-expanded={expanded} onClick={() => setExpandedSections(old => expanded ? old.filter(id => id !== section.id) : [...old, section.id])}>{expanded ? "−" : "+"}</button> : <span className="section-filter-toggle-placeholder" />}
        <label title={section.name}><input type="checkbox" checked={p.multiSectionFilter.includes(section.id)} onChange={e => p.setMultiSectionFilter(old => e.target.checked ? [...new Set([...old, section.id])] : old.filter(id => id !== section.id))}/><span>{section.name}</span></label>
      </div>
      {children && expanded && <div className="section-filter-children">{renderSectionTree(section.id, depth + 1)}</div>}
    </div>
  })

  return <section className={'unified-question-filters '+(p.mode==='selection'?'selection-filters':'management-filters')} aria-label="Question search and filters">
    <div className="library-general-search"><div className="search-field"><Search size={16}/><input aria-label="Search questions" value={p.query} onChange={e=>p.setQuery(e.target.value)} placeholder="Search prompts, options, explanations, sections, sources..."/></div></div>
    <div className="common-filter-grid">
      <details className="filter-picker tag-picker tag-filter-disclosure"><summary>Tags{p.multiTagFilter.length>0&&<span className="filter-count">{p.multiTagFilter.length} selected</span>}</summary><label htmlFor={p.mode+'-tag-filter-search'}>Search tags<input id={p.mode+'-tag-filter-search'} aria-label="Search tags" value={p.tagSearch} onChange={e=>p.setTagSearch(e.target.value)} placeholder="Search tags..."/></label><div className="filter-picker-options" role="group" aria-label="Available tags">{p.allTags.filter(tag=>tag.toLocaleLowerCase().includes(p.tagSearch.trim().toLocaleLowerCase())).map(tag=>{const starred=(p.profile.favouriteTags??[]).includes(tag);return <div className="filter-picker-option" key={tag}><button type="button" className={'tag-star '+(starred?'is-starred':'')} aria-label={(starred?'Unstar':'Star')+' tag '+tag} aria-pressed={starred} title={starred?'Remove tag favourite':'Star tag'} onClick={()=>p.onToggleFavouriteTag(tag)}><Star size={13} fill={starred?'currentColor':'none'}/></button><label className="filter-option-label" title={tag}><input type="checkbox" checked={p.multiTagFilter.includes(tag)} onChange={e=>p.setMultiTagFilter(old=>e.target.checked?[...new Set([...old,tag])]:old.filter(t=>t!==tag))}/><span>{tag}</span></label></div>})}{!p.allTags.some(tag=>tag.toLocaleLowerCase().includes(p.tagSearch.trim().toLocaleLowerCase()))&&<small className="muted filter-picker-empty">No matching tags</small>}</div>{p.multiTagFilter.length>0&&<div className="filter-picker-selected" aria-label="Selected tag filters">{p.multiTagFilter.map(tag=><span className="filter-chip" key={tag}><span title={tag}>{tag}</span><button type="button" aria-label={'Remove tag filter '+tag} onClick={()=>p.setMultiTagFilter(old=>old.filter(t=>t!==tag))}><X size={12}/></button></span>)}</div>}</details>
      <div className="section-filter-picker"><strong>Sections</strong><div className="section-filter-tree" role="group" aria-label="Filter sections"><label className="section-filter-unsorted"><input type="checkbox" checked={p.multiSectionFilter.includes("unsorted")} onChange={e => p.setMultiSectionFilter(old => e.target.checked ? [...new Set([...old, "unsorted"])] : old.filter(id => id !== "unsorted"))}/><span>Unsorted</span></label>{renderSectionTree(null, 0)}</div></div>
      <label className="compact-check"><input type="checkbox" checked={p.sectionDescendants} onChange={e=>p.setSectionDescendants(e.target.checked)}/> Include descendants</label>
      <MultiSelect label="Favourites" ariaLabel="Filter favourite status" value={p.multiFavouriteFilter} onChange={p.setMultiFavouriteFilter} options={[{value:'favourite',label:'Favourites'},{value:'not-favourite',label:'Not favourites'}]}/>
      <MultiSelect label="Deferred" ariaLabel="Filter deferred status" value={p.multiDeferredFilter} onChange={p.setMultiDeferredFilter} options={[{value:'deferred',label:'Deferred'},{value:'not-deferred',label:'Not deferred'}]}/>
      <MultiSelect label="Question origin" ariaLabel="Filter question source" value={p.multiProvenanceFilter} onChange={p.setMultiProvenanceFilter} options={[{value:'professor-written',label:'Written by professor'},{value:'other',label:'Other known source'},{value:'AI-Generated',label:'AI-generated'},{value:'AI-Extracted',label:'AI-extracted'},{value:'unknown',label:'Not specified'}]}/>
      <MultiSelect label="Mastery" ariaLabel="Filter mastery" value={p.multiMasteryFilter} onChange={values=>p.setMultiMasteryFilter(values as Mastery[])} options={[{value:'new',label:'New'},{value:'weak',label:'Weak'},{value:'learning',label:'Learning'},{value:'known',label:'Known'}]}/>
    </div>
    <div className="active-filter-summary"><span className="filter-summary-status">{active?activeLabels.length+' active filters':'No filters applied'}</span><div className="active-filter-labels" aria-label="Active filters">{activeLabels.map((label,i)=><span className="filter-chip" key={label+'-'+i}>{label}</span>)}</div><button className="button button-quiet" onClick={p.onClear}>Clear filters</button></div>
    <details className="advanced-filters"><summary>Advanced filters</summary><div className="advanced-filter-grid">
      <MultiSelect label="Answer type" ariaLabel="Filter answer types" value={p.multiAnswerModeFilter} onChange={values=>p.setMultiAnswerModeFilter(values as AnswerMode[])} options={[{value:'single',label:'One answer'},{value:'exactly-n',label:'Pick exactly N'},{value:'select-all',label:'All that apply'}]}/>
      <label>Include tags, all required<input aria-label="Include tags" value={p.filterTagsInclude} onChange={e=>p.setFilterTagsInclude(e.target.value)} placeholder="tag1, tag2"/></label>
      <label>Exclude tags<input aria-label="Exclude tags" value={p.filterTagsExclude} onChange={e=>p.setFilterTagsExclude(e.target.value)} placeholder="tag to exclude"/></label>
      <div className="filter-picker import-source-picker"><label htmlFor={p.mode+'-import-filter-search'}>Import source<input id={p.mode+'-import-filter-search'} aria-label="Search import sources" value={p.importSearch} onChange={e=>p.setImportSearch(e.target.value)} placeholder="Search filenames..."/></label><div className="filter-picker-options" role="group" aria-label="Available import sources"><div className="filter-picker-option"><label className="filter-option-label" title="No known import"><input type="checkbox" checked={p.multiImportFilter.includes('unknown')} onChange={e=>p.setMultiImportFilter(old=>e.target.checked?[...new Set([...old,'unknown'])]:old.filter(v=>v!=='unknown'))}/><span>No known import</span></label></div>{(p.profile.imports??[]).filter(b=>matchesImportSourceSearch(b, p.importSearch)).map(b=>{const label=formatImportSourceLabel(b);return <div className="filter-picker-option" key={b.id}><label className="filter-option-label" title={label}><input type="checkbox" checked={p.multiImportFilter.includes(b.id)} onChange={e=>p.setMultiImportFilter(old=>e.target.checked?[...new Set([...old,b.id])]:old.filter(v=>v!==b.id))}/><span>{label}</span></label></div>})}{!(p.profile.imports??[]).length&&<small className="muted filter-picker-empty">No import history recorded yet.</small>}{(p.profile.imports??[]).length>0&&!(p.profile.imports??[]).some(b=>matchesImportSourceSearch(b, p.importSearch))&&<small className="muted filter-picker-empty">No matching import sources.</small>}</div>{p.multiImportFilter.length>0&&<div className="filter-picker-selected" aria-label="Selected import filters">{p.multiImportFilter.map(value=>{const batch=(p.profile.imports??[]).find(b=>b.id===value);const label=value==='unknown'?'No known import':batch?formatImportSourceLabel(batch):value;return <span className="filter-chip" key={value}><span title={label}>{label}</span><button type="button" aria-label={'Remove import filter '+label} onClick={()=>p.setMultiImportFilter(old=>old.filter(v=>v!==value))}><X size={12}/></button></span>})}</div>}</div>
      <MultiSelect label="Import type" ariaLabel="Filter import type" value={p.multiImportSourceFilter} onChange={p.setMultiImportSourceFilter} options={[{value:'json',label:'JSON file'},{value:'ai-extract',label:'AI extraction'},{value:'ai-generate',label:'AI generation'},{value:'unknown',label:'Unknown / no import'}]}/>
      <MultiSelect label="Explanation" ariaLabel="Filter explanation" value={p.multiExplanationFilter} onChange={p.setMultiExplanationFilter} options={[{value:'present',label:'Has explanation'},{value:'missing',label:'Missing explanation'}]}/>
      <MultiSelect label="Tag presence" ariaLabel="Filter tag presence" value={p.multiTagPresenceFilter} onChange={p.setMultiTagPresenceFilter} options={[{value:'present',label:'Has tags'},{value:'missing',label:'No tags'}]}/>
      <label>Created on or after<input aria-label="Created after" type="date" value={p.createdAfter} onChange={e=>p.setCreatedAfter(e.target.value)}/></label>
      <label>Created on or before<input aria-label="Created before" type="date" value={p.createdBefore} onChange={e=>p.setCreatedBefore(e.target.value)}/></label>
      <label>Modified on or after<input aria-label="Modified after" type="date" value={p.updatedAfter} onChange={e=>p.setUpdatedAfter(e.target.value)}/></label>
      <label>Modified on or before<input aria-label="Modified before" type="date" value={p.updatedBefore} onChange={e=>p.setUpdatedBefore(e.target.value)}/></label>
      <label>Sort by<select aria-label="Sort questions" value={p.sortBy} onChange={e=>p.setSortBy(e.target.value)}><option value="default">Original order</option><option value="prompt">Question name</option><option value="section">Section path</option><option value="answer-mode">Answer type</option><option value="provenance">Provenance</option><option value="import">Import source</option><option value="created">Created date</option><option value="updated">Modified date</option></select></label>
    </div></details>
  </section>
}
