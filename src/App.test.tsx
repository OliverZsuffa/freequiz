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
    fireEvent.click(screen.getByRole('button', { name: 'Import history', exact: true }))
    expect(screen.getByRole('heading', { name: 'Import history' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Lecture 3' })).toBeInTheDocument()
    expect(screen.getByText('What is import history?')).toBeInTheDocument()
    expect(screen.getByText(/1 added to library/)).toBeInTheDocument()
  })

  it('offers a short prompt and optional existing-section matching', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Menu/i }))
    fireEvent.click(screen.getByRole('button', { name: /Import \/ export/i }))
    expect(screen.getByLabelText('Match my existing sections')).toBeChecked()
    fireEvent.click(screen.getByRole('button', { name: /Generate AI prompt/i }))
    const prompt = (screen.getByDisplayValue(/MODE: GENERATE NEW QUESTIONS/i) as HTMLTextAreaElement).value
    expect(prompt).toContain('Create as many distinct high-quality questions')
    expect(prompt).toContain('avoid repetitive stems')
    fireEvent.click(screen.getByLabelText('Match my existing sections'))
    fireEvent.click(screen.getByRole('button', { name: /Generate AI prompt/i }))
    expect((screen.getByDisplayValue(/MODE: GENERATE NEW QUESTIONS/i) as HTMLTextAreaElement).value).not.toContain('Existing sections')
  })
})
