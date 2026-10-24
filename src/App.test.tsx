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


describe('Request 004 features',()=>{beforeEach(()=>localStorage.clear());afterEach(()=>cleanup());it('shows the progress graph empty state',()=>{render(<App/>);fireEvent.click(screen.getByRole('button',{name:/Menu/i}));fireEvent.click(screen.getByRole('button',{name:'Statistics',exact:true}));expect(screen.getByRole('heading',{name:'Accuracy over time'})).toBeInTheDocument();expect(screen.getByText(/Your progress graph starts here/)).toBeInTheDocument()});it('offers optional gamification and reminders',()=>{render(<App/>);fireEvent.click(screen.getByRole('button',{name:/Menu/i}));fireEvent.click(screen.getByRole('button',{name:/Settings & reminders/i}));expect(screen.getByRole('heading',{name:'Gamification'})).toBeInTheDocument();expect(screen.getByText('Milestones and achievements')).toBeInTheDocument();expect(screen.getByRole('checkbox',{name:'Enable study reminders'})).not.toBeChecked()});it('offers multi-section and tag filtering in the unified Questions workspace',()=>{render(<App/>);fireEvent.click(screen.getByRole('button',{name:'Questions'}));expect(screen.getByLabelText('Filter section')).toBeInTheDocument();expect(screen.getByLabelText('Filter tags')).toBeInTheDocument()});it('generates a reusable prompt without a source field',()=>{render(<App/>);fireEvent.click(screen.getByRole('button',{name:/Menu/i}));fireEvent.click(screen.getByRole('button',{name:/Import \/ export/i}));expect(screen.queryByLabelText('Source material')).not.toBeInTheDocument();fireEvent.click(screen.getByRole('button',{name:/Generate AI prompt/i}));expect(screen.getByDisplayValue(/MODE: GENERATE NEW QUESTIONS/i)).toBeInTheDocument()})});


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
    expect(prompt).toContain('If every question fits an existing section, the required output is exactly sections: [].')
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
    expect(screen.getByText('review', { selector: '.tag' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Undo add tags/i }))
    expect(screen.queryByText('review', { selector: '.tag' })).not.toBeInTheDocument()
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
    expect(screen.getByLabelText('Filter section')).toHaveProperty('multiple', true)
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


describe('Request 009 practice deferral', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => cleanup())
  it('skips deferred practice questions without recording answers', () => {
    render(<App />)
    fireEvent.change(screen.getByLabelText('Number of questions'), { target: { value: '2' } })
    fireEvent.click(screen.getByRole('button', { name: /Start practice/i }))
    const first = screen.getByRole('heading', { level: 2 }).textContent
    fireEvent.click(screen.getByRole('button', { name: 'Defer' }))
    expect(screen.getByRole('heading', { level: 2 }).textContent).not.toBe(first)
    fireEvent.click(screen.getByRole('button', { name: 'Defer' }))
    expect(screen.getByRole('heading', { name: 'Practice results' })).toBeInTheDocument()
    expect(screen.getByText('0 correct out of 0 questions.')).toBeInTheDocument()
  })
})


describe('Request 009 exam deferral', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => cleanup())
  it('marks an exam question deferred without skipping it', () => {
    render(<App />)
    fireEvent.change(screen.getByLabelText('Session type'), { target: { value: 'exam' } })
    fireEvent.change(screen.getByLabelText('Number of questions'), { target: { value: '2' } })
    fireEvent.click(screen.getByRole('button', { name: /Start exam/i }))
    const question = screen.getByRole('heading', { level: 2 }).textContent
    fireEvent.click(screen.getByRole('button', { name: 'Mark deferred' }))
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe(question)
  })
})


describe('Request 010 unified workspace and guidance', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => cleanup())

  it('offers one Questions workspace with tag filters and selection actions', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Questions' }))
    expect(screen.getByLabelText('Search questions')).toBeInTheDocument()
    expect(screen.getByLabelText('Filter tags')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Select all matching/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Practise matches/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Exam \(/i })).toBeInTheDocument()
  })

  it('provides GitHub feedback drafts and a feature guide', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Help & feedback' }))
    expect(screen.getByRole('heading', { name: 'Help & feedback' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Report a bug/i })).toHaveAttribute('href', expect.stringContaining('github.com/OliverZsuffa/freequiz/issues/new'))
    expect(screen.getByRole('link', { name: /Suggest a feature/i })).toBeInTheDocument()
    expect(screen.getByText(/does not send reports automatically/i)).toBeInTheDocument()
    expect(screen.getByText('AI extraction vs generation')).toBeInTheDocument()
  })

  it('runs the interactive workflow tutorial and remembers completion', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Start tutorial/i }))
    expect(screen.getByRole('dialog', { name: /Find or import questions/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Next step/i }))
    expect(screen.getByRole('dialog', { name: /Filter and select a set/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Next step/i }))
    fireEvent.click(screen.getByRole('button', { name: /Next step/i }))
    fireEvent.click(screen.getByRole('button', { name: /Finish/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(localStorage.getItem('freequiz-tutorial-completed')).toBe('true')
  })

  it('shows the activity calendar and question-bank mastery goals on the home page', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Last 7 days' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Mastery, not just activity' })).toBeInTheDocument()
    expect(screen.getByText(/Bank-relative target/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Edit goals/i })).toBeInTheDocument()
  })
})


describe('Request 010 question metadata filters and bulk actions', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => { cleanup(); vi.restoreAllMocks() })

  it('offers mastery, favourite and deferred filters', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Questions' }))
    fireEvent.click(screen.getByText('More filters and sorting'))
    expect(screen.getByLabelText('Filter mastery')).toBeInTheDocument()
    expect(screen.getByLabelText('Filter favourite status')).toBeInTheDocument()
    expect(screen.getByLabelText('Filter deferred status')).toBeInTheDocument()
  })

  it('bulk-favourites selected questions and can undo the change', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Questions' }))
    fireEvent.click(screen.getByRole('button', { name: /Select all matching/i }))
    fireEvent.change(screen.getByLabelText('Bulk edit action'), { target: { value: 'set-favourite' } })
    fireEvent.click(screen.getByRole('button', { name: /Apply to 4 selected/i }))
    expect(screen.getByRole('button', { name: /Undo favourite questions/i })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /Unfavourite/i }).length).toBeGreaterThanOrEqual(4)
    fireEvent.click(screen.getByRole('button', { name: /Undo favourite questions/i }))
    expect(screen.getAllByRole('button', { name: /Favourite/i }).length).toBeGreaterThanOrEqual(4)
  })
})
