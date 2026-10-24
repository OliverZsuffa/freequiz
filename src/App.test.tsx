import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

describe('Freequiz', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => { cleanup(); vi.useRealTimers() })

  it('shows the calm overview and demo library', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'What would you like to practise?' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Set up a session' })).toBeInTheDocument()
    expect(screen.getAllByText('Mathematics').length).toBeGreaterThan(0)
    expect(screen.queryByText('Good to have you here.')).not.toBeInTheDocument()
  })

  it('opens the import assistant', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Menu/i }))
    fireEvent.click(screen.getByRole('button', { name: /Import \/ export/i }))
    expect(screen.getByText('Import a question bank')).toBeInTheDocument()
    expect(screen.getByText('Prepare questions with AI')).toBeInTheDocument()
  })

  it('persists the selected appearance', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Light appearance/i }))
    expect(localStorage.getItem('freequiz-theme')).toBe('light')
  })
  it('offers explicit answer modes in the question editor', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Menu/i }))
    fireEvent.click(screen.getByRole('button', { name: /Question library/i }))
    fireEvent.click(screen.getByRole('button', { name: /New question/i }))
    expect(screen.getByLabelText('Answer mode')).toBeInTheDocument()
    expect(screen.getAllByRole('option', { name: 'Pick exactly N' }).length).toBeGreaterThan(0)
    expect(screen.getByLabelText(/Correct option number/i)).toBeInTheDocument()
  })

  it('offers a timed exam setup and answer-mode filters', () => {
    render(<App />)
    expect(screen.getByLabelText('Question source')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Session type'), { target: { value: 'exam' } })
    expect(screen.getByLabelText('Time limit (minutes)')).toBeInTheDocument()
    expect(screen.getByLabelText('Answer type')).toBeInTheDocument()
  })

  it('withholds correctness feedback until a timed exam is submitted', () => {
    render(<App />)
    fireEvent.change(screen.getByLabelText('Session type'), { target: { value: 'exam' } })
    fireEvent.change(screen.getByLabelText('Number of questions'), { target: { value: '2' } })
    fireEvent.click(screen.getByRole('button', { name: /Start exam/i }))
    expect(screen.getByText(/Exam mode/)).toBeInTheDocument()
    expect(screen.queryByText(/Correct\. Nice work\./)).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Finish now' }))
    expect(screen.getByRole('heading', { name: 'Exam results' })).toBeInTheDocument()
    expect(screen.getByText(/0 correct out of 2 questions/)).toBeInTheDocument()
  })

  it('automatically submits a timed exam when its timer expires', () => {
    vi.useFakeTimers()
    render(<App />)
    fireEvent.change(screen.getByLabelText('Session type'), { target: { value: 'exam' } })
    fireEvent.change(screen.getByLabelText('Number of questions'), { target: { value: '2' } })
    fireEvent.change(screen.getByLabelText('Time limit (minutes)'), { target: { value: '1' } })
    fireEvent.click(screen.getByRole('button', { name: /Start exam/i }))
    act(() => { vi.advanceTimersByTime(60_000) })
    expect(screen.getByRole('heading', { name: 'Exam results' })).toBeInTheDocument()
    expect(screen.getByText(/0 correct out of 2 questions/)).toBeInTheDocument()
  })

})


describe('Request 004 features',()=>{beforeEach(()=>localStorage.clear());afterEach(()=>cleanup());it('shows the progress graph empty state',()=>{render(<App/>);fireEvent.click(screen.getByRole('button',{name:/Menu/i}));fireEvent.click(screen.getByRole('button',{name:/Statistics/i}));expect(screen.getByRole('heading',{name:'Accuracy over time'})).toBeInTheDocument();expect(screen.getByText(/Your progress graph starts here/)).toBeInTheDocument()});it('offers optional gamification and reminders',()=>{render(<App/>);fireEvent.click(screen.getByRole('button',{name:/Menu/i}));fireEvent.click(screen.getByRole('button',{name:/Settings & reminders/i}));expect(screen.getByRole('heading',{name:'Gamification'})).toBeInTheDocument();expect(screen.getByText('Milestones and achievements')).toBeInTheDocument();expect(screen.getByRole('checkbox',{name:'Enable study reminders'})).not.toBeChecked()});it('offers multiple-section filtering',()=>{render(<App/>);expect(screen.getByLabelText('Search sections')).toBeInTheDocument();fireEvent.click(screen.getByRole('button',{name:'Clear'}));expect(screen.getByText('All sections')).toBeInTheDocument()});it('generates a reusable prompt without a source field',()=>{render(<App/>);fireEvent.click(screen.getByRole('button',{name:/Menu/i}));fireEvent.click(screen.getByRole('button',{name:/Import \/ export/i}));expect(screen.queryByLabelText('Source material')).not.toBeInTheDocument();fireEvent.click(screen.getByRole('button',{name:/Generate AI prompt/i}));expect(screen.getByDisplayValue(/MODE: GENERATE NEW QUESTIONS/i)).toBeInTheDocument()})});


describe('AI prompt UI and editable tags', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => cleanup())

  it('offers extraction and generation prompt modes', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Menu/i }))
    fireEvent.click(screen.getByRole('button', { name: /Import \/ export/i }))
    expect(screen.getByLabelText('AI prompt mode')).toHaveValue('generate')
    fireEvent.change(screen.getByLabelText('AI prompt mode'), { target: { value: 'extract' } })
    fireEvent.click(screen.getByRole('button', { name: /Generate extraction prompt/i }))
    expect(screen.getByDisplayValue(/MODE: EXTRACT EXISTING QUESTIONS/)).toBeInTheDocument()
    expect(screen.getByDisplayValue(/AI-Extracted/)).toBeInTheDocument()
  })

  it('preserves protected provenance while ordinary tags remain editable', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Menu/i }))
    fireEvent.click(screen.getByRole('button', { name: /Import \/ export/i }))
    fireEvent.change(screen.getByLabelText('Question bank (JSON)'), { target: { value: JSON.stringify({
      format: 'freequiz/questions-v1', sections: [], questions: [{
        id: 'source-question', prompt: 'Imported question?', options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }],
        correctOptionIds: ['a'], answerMode: 'single', sectionId: null, explanation: '', tags: ['old-tag'], provenance: 'AI-Generated'
      }]
    }) } })
    fireEvent.click(screen.getByRole('button', { name: /Validate and preview/i }))
    fireEvent.click(screen.getByRole('button', { name: /Merge into profile/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Edit Imported question?' }))
    expect(screen.getByText('AI-Generated', { selector: 'strong' })).toBeInTheDocument()
    const tags = screen.getByLabelText('Question tags')
    expect(tags).toHaveValue('old-tag')
    fireEvent.change(tags, { target: { value: 'new-tag, review' } })
    fireEvent.click(screen.getByRole('button', { name: /Save question/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Edit Imported question?' }))
    expect(screen.getByLabelText('Question tags')).toHaveValue('new-tag, review')
    expect(screen.getByText('AI-Generated', { selector: 'strong' })).toBeInTheDocument()
  })
})


describe('Request 006 import history', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => cleanup())

  it('records an import batch and shows its questions in import history', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Menu/i }))
    fireEvent.click(screen.getByRole('button', { name: /Import \/ export/i }))
    fireEvent.change(screen.getByLabelText('Import name'), { target: { value: 'Lecture 3' } })
    fireEvent.change(screen.getByLabelText('Question bank (JSON)'), { target: { value: JSON.stringify({
      format: 'freequiz/questions-v1',
      sections: [{ id: 'batch-topic', name: 'Batch topic', parentId: null }],
      questions: [{ id: 'batch-q1', prompt: 'What is import history?', options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }], correctOptionIds: ['a'], sectionId: 'batch-topic', explanation: 'Test', tags: [] }]
    }) } })
    fireEvent.click(screen.getByRole('button', { name: /Validate and preview/i }))
    fireEvent.click(screen.getByRole('button', { name: /Merge into profile/i }))
    fireEvent.click(screen.getByRole('button', { name: /Menu/i }))
    fireEvent.click(screen.getAllByRole('button', { name: /Import history/i })[0])
    expect(screen.getByRole('heading', { name: 'Import history' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Lecture 3' })).toBeInTheDocument()
    expect(screen.getByText('What is import history?')).toBeInTheDocument()
  })

  it('offers a short prompt and optional existing-section matching', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Menu/i }))
    fireEvent.click(screen.getByRole('button', { name: /Import \/ export/i }))
    expect(screen.getByLabelText('Match my existing sections')).toBeChecked()
    fireEvent.click(screen.getByRole('button', { name: /Generate AI prompt/i }))
    const prompt = (screen.getByDisplayValue(/MODE: GENERATE NEW QUESTIONS/i) as HTMLTextAreaElement).value
    expect(prompt).toContain('Build a comprehensive question bank, not a short sample')
    expect(prompt).toContain('STRICTLY DO NOT write phrases such as')
    expect(prompt).toContain('at least 3 distinct questions')
    expect(prompt).toContain('If existing sections fit, return sections: [].')
    fireEvent.click(screen.getByLabelText('Match my existing sections'))
    fireEvent.click(screen.getByRole('button', { name: /Generate AI prompt/i }))
    expect((screen.getByDisplayValue(/MODE: GENERATE NEW QUESTIONS/i) as HTMLTextAreaElement).value).not.toContain('Existing sections')
  })
  it('filters questions by tags and supports sorting', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Menu/i }))
    fireEvent.click(screen.getByRole('button', { name: /Question library/i }))
    fireEvent.click(screen.getByText('More filters and sorting'))
    fireEvent.change(screen.getByLabelText('Include tags'), { target: { value: 'angles' } })
    expect(screen.getAllByText('What is the sum of the interior angles of a triangle in Euclidean geometry?').length).toBeGreaterThan(0)
    expect(screen.queryByText('Which expression is the derivative of x²?')).not.toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Include tags'), { target: { value: '' } })
    fireEvent.change(screen.getByLabelText('Sort questions'), { target: { value: 'prompt' } })
    expect(screen.getAllByText('What is the sum of the interior angles of a triangle in Euclidean geometry?').length).toBeGreaterThan(0)
  })

  it('bulk edits selected questions and offers undo', () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Menu/i }))
    fireEvent.click(screen.getByRole('button', { name: /Question library/i }))
    fireEvent.click(screen.getByText('More filters and sorting'))
    fireEvent.change(screen.getByLabelText('Include tags'), { target: { value: 'angles' } })
    fireEvent.click(screen.getByRole('button', { name: /Select all matching/i }))
    expect(screen.getByRole('button', { name: /Select all matching/i })).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Bulk tags'), { target: { value: 'review' } })
    fireEvent.click(screen.getByRole('button', { name: /Apply to 1 selected/i }))
    expect(confirm).toHaveBeenCalled()
    expect(screen.getByText('review')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Undo add tags/i }))
    expect(screen.queryByText('review')).not.toBeInTheDocument()
    confirm.mockRestore()
  })

  it('supports deep section paths and descendant filtering', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Menu/i }))
    fireEvent.click(screen.getByRole('button', { name: /Import \/ export/i }))
    fireEvent.change(screen.getByLabelText('Question bank (JSON)'), { target: { value: JSON.stringify({
      format: 'freequiz/questions-v1',
      sections: [
        { id: 'deep-root', name: 'Deep root', parentId: null },
        { id: 'deep-child', name: 'Child', parentId: 'deep-root' },
        { id: 'deep-grandchild', name: 'Grandchild', parentId: 'deep-child' },
        { id: 'deep-leaf', name: 'Leaf', parentId: 'deep-grandchild' }
      ],
      questions: [{ id: 'deep-question', prompt: 'Question in a deeply nested section?', options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }], correctOptionIds: ['a'], sectionId: 'deep-leaf', explanation: '', tags: [] }]
    }) } })
    fireEvent.click(screen.getByRole('button', { name: /Validate and preview/i }))
    fireEvent.click(screen.getByRole('button', { name: /Merge into profile/i }))
    expect(screen.getByRole('option', { name: 'Deep root / Child / Grandchild / Leaf' })).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Filter section'), { target: { value: 'deep-root' } })
    expect(screen.getAllByText('Question in a deeply nested section?').length).toBeGreaterThan(0)
  })

  it('deletes a profile only after confirmation and switches to another profile', () => {
    const prompt = vi.spyOn(window, 'prompt').mockReturnValue('Temporary profile')
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Demo library/i }))
    fireEvent.click(screen.getByRole('button', { name: /New profile/i }))
    expect(screen.getAllByRole('button', { name: /Temporary profile/i }).length).toBeGreaterThan(0)
    fireEvent.click(screen.getAllByRole('button', { name: /Temporary profile/i })[0])
    fireEvent.click(screen.getByRole('button', { name: /Delete current profile/i }))
    expect(confirm).toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /Demo library/i })).toBeInTheDocument()
    prompt.mockRestore()
    confirm.mockRestore()
  })

})


describe('Request 009 multi-select filters', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => cleanup())
  it('exposes categorical library filters as multi-select controls', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Menu/i }))
    fireEvent.click(screen.getByRole('button', { name: /Question library/i }))
    expect(screen.getByLabelText('Filter sections')).toHaveProperty('multiple', true)
    expect(screen.getByLabelText('Filter answer types')).toHaveProperty('multiple', true)
    expect(screen.getByLabelText('Filter provenance')).toHaveProperty('multiple', true)
    expect(screen.getByLabelText('Filter import source')).toHaveProperty('multiple', true)
  })
})


describe('Request 009 practice controls', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => cleanup())
  it('allows toggling a favourite during practice after answering', () => {
    render(<App />)
    fireEvent.change(screen.getByLabelText('Number of questions'), { target: { value: '2' } })
    fireEvent.click(screen.getByRole('button', { name: /Start practice/i }))
    const option = document.querySelector('.answer-option')
    expect(option).not.toBeNull()
    fireEvent.click(option as Element)
    fireEvent.click(screen.getByRole('button', { name: /Check answer/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Favourite' }))
    expect(screen.getByRole('button', { name: 'Favourited' })).toHaveAttribute('aria-pressed', 'true')
  })
})
