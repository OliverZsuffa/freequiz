import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

describe('Freequiz', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => { cleanup(); vi.useRealTimers() })

  it('shows the calm overview and demo library', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Choose a profile' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Practise remaining/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Practise all questions' })).toBeInTheDocument()
    expect(screen.queryByText('READY WHEN YOU ARE')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Create practice/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Create exam/i })).toBeInTheDocument()
    expect(screen.getAllByText('Mathematics').length).toBeGreaterThan(0)
    expect(screen.queryByText('Good to have you here.')).not.toBeInTheDocument()
  })

  it('lets a user explicitly mark a question as professor-written', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Questions' }))
    fireEvent.click(screen.getByRole('button', { name: /New question/i }))
    fireEvent.change(screen.getByLabelText('Question'), { target: { value: 'Which source wrote this question?' } })
    fireEvent.change(screen.getByLabelText('Question source metadata'), { target: { value: 'professor-written' } })
    fireEvent.click(screen.getByRole('button', { name: /Save question/i }))
    fireEvent.click(screen.getByText('Advanced filters'))
    fireEvent.click(screen.getByRole('button', { name: 'Filter question source' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Written by professor' }))
    expect(screen.getByText('Professor-written')).toBeInTheDocument()
  })

  it('shows import and clearly separated export options on the Import & export destination', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Menu/i }))
    fireEvent.click(screen.getByRole('button', { name: /Import & export/i }))
    expect(screen.getByText('Import a question bank')).toBeInTheDocument()
    expect(screen.getByText('Prepare questions with AI')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Export or back up' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Export questions$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Back up this profile/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Back up all profiles/i })).toBeInTheDocument()
    expect(screen.getByText(/No attempts, exam results, favourites, or deferred state/i)).toBeInTheDocument()
  })

  it('puts general question search first and keeps everyday filters compact', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Questions' }))
    const tagSearch = screen.getByRole('textbox', { name: 'Search tags' })
    fireEvent.click(screen.getByText('Advanced filters'))
    const provenance = screen.getByRole('button', { name: /Question source/i })
    const generalSearch = screen.getByRole('textbox', { name: 'Search questions' })
    expect(generalSearch.compareDocumentPosition(tagSearch) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.getByText('Tags', { selector: 'summary' })).toBeInTheDocument()
    expect(screen.queryByRole('group', { name: 'Available tags' })).not.toBeVisible()
  })

  it('keeps appearance controls in Settings rather than the top bar', () => {
    render(<App />)
    expect(screen.queryByRole('combobox', { name: 'Accent colour' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
    fireEvent.click(screen.getByRole('button', { name: 'Settings' }))
    expect(screen.getByRole('combobox', { name: 'Accent colour' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Light appearance/i })).toBeInTheDocument()
  })

  it('uses the dedicated tag picker instead of general search for tags', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Questions' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Search questions' }), { target: { value: 'gardening' } })
    expect(screen.queryByText('Which plant part mainly absorbs water from the soil?')).not.toBeInTheDocument()
    fireEvent.change(screen.getByRole('textbox', { name: 'Search questions' }), { target: { value: '' } })
    fireEvent.change(screen.getByRole('textbox', { name: 'Search tags' }), { target: { value: 'gardening' } })
    fireEvent.click(screen.getByRole('checkbox', { name: 'gardening' }))
    expect(screen.getAllByText('Which plant part mainly absorbs water from the soil?').length).toBeGreaterThan(0)
  })

  it('keeps the selected accent when switching appearance', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
    fireEvent.click(screen.getByRole('button', { name: 'Settings' }))
    fireEvent.change(screen.getByRole('combobox', { name: 'Accent colour' }), { target: { value: 'purple' } })
    fireEvent.click(screen.getByRole('button', { name: /Light appearance/i }))
    expect(document.querySelector('.app')).toHaveClass('accent-purple')
    expect(localStorage.getItem('freequiz-accent')).toBe('purple')
  })

  it('persists the selected appearance', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
    fireEvent.click(screen.getByRole('button', { name: 'Settings' }))
    fireEvent.click(screen.getByRole('button', { name: /Light appearance/i }))
    expect(localStorage.getItem('freequiz-theme')).toBe('light')
  })
  it('offers explicit answer modes in the question editor', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Questions' }))
    fireEvent.click(screen.getByRole('button', { name: /New question/i }))
    expect(screen.getByLabelText('Answer mode')).toBeInTheDocument()
    expect(screen.getAllByRole('option', { name: 'Pick exactly N' }).length).toBeGreaterThan(0)
    expect(screen.getByLabelText(/Correct option number/i)).toBeInTheDocument()
  })

  it('offers a timed exam setup and answer-mode filters', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /Create exam/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Create exam/i }))
    expect(screen.getByLabelText('Questions to practise')).toBeInTheDocument()
    expect(screen.getByLabelText('Time limit (minutes)')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Advanced filters'))
    expect(screen.getByRole('button', { name: 'Filter answer types' })).toBeInTheDocument()
  })

  it('withholds correctness feedback until a timed exam is submitted', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Create exam/i }))
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
    fireEvent.click(screen.getByRole('button', { name: /Create exam/i }))
    fireEvent.change(screen.getByLabelText('Number of questions'), { target: { value: '2' } })
    fireEvent.change(screen.getByLabelText('Time limit (minutes)'), { target: { value: '1' } })
    fireEvent.click(screen.getByRole('button', { name: /Start exam/i }))
    act(() => { vi.advanceTimersByTime(60_000) })
    expect(screen.getByRole('heading', { name: 'Exam results' })).toBeInTheDocument()
    expect(screen.getByText(/0 correct out of 2 questions/)).toBeInTheDocument()
  })

})


describe('Request 004 features',()=>{beforeEach(()=>localStorage.clear());afterEach(()=>cleanup());it('shows the progress graph empty state',()=>{render(<App/>);fireEvent.click(screen.getByRole('button',{name:'Progress'}));expect(screen.getByRole('heading',{name:'Accuracy over time'})).toBeInTheDocument();expect(screen.getByText(/Your progress graph starts here/)).toBeInTheDocument()});it('offers optional gamification and reminders',()=>{render(<App/>);fireEvent.click(screen.getByRole('button',{name:/Menu/i}));fireEvent.click(screen.getByRole('button',{name:'Settings'}));expect(screen.getByRole('heading',{name:'Gamification'})).toBeInTheDocument();expect(screen.getByText('Milestones and achievements')).toBeInTheDocument();expect(screen.getByRole('checkbox',{name:'Enable study reminders'})).not.toBeChecked()});it('offers multi-section and tag filtering in the unified Questions workspace',()=>{render(<App/>);fireEvent.click(screen.getByRole('button',{name:'Questions'}));expect(screen.getByRole('group', { name: 'Filter sections' })).toBeInTheDocument();expect(screen.getByLabelText('Search tags')).toBeInTheDocument()});it('generates a reusable prompt without a source field',()=>{render(<App/>);fireEvent.click(screen.getByRole('button',{name:/Menu/i}));fireEvent.click(screen.getByRole('button',{name:/Import & export/i}));expect(screen.queryByLabelText('Source material')).not.toBeInTheDocument();fireEvent.click(screen.getByRole('button',{name:/Generate AI prompt/i}));expect(screen.getByDisplayValue(/MODE: GENERATE NEW QUESTIONS/i)).toBeInTheDocument()})});


describe('AI prompt UI and editable tags', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => cleanup())

  it('offers extraction and generation prompt modes', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Menu/i }))
    fireEvent.click(screen.getByRole('button', { name: /Import & export/i }))
    expect(screen.getByLabelText('AI prompt mode')).toHaveValue('generate')
    fireEvent.change(screen.getByLabelText('AI prompt mode'), { target: { value: 'extract' } })
    fireEvent.click(screen.getByRole('button', { name: /Generate extraction prompt/i }))
    expect(screen.getByDisplayValue(/MODE: EXTRACT EXISTING QUESTIONS/)).toBeInTheDocument()
    expect(screen.getByDisplayValue(/AI-Extracted/)).toBeInTheDocument()
  })

  it('preserves protected provenance while ordinary tags remain editable', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Menu/i }))
    fireEvent.click(screen.getByRole('button', { name: /Import & export/i }))
    fireEvent.change(screen.getByLabelText('Question bank or full profile backup (JSON)'), { target: { value: JSON.stringify({
      format: 'freequiz/questions-v1', sections: [], questions: [{
        id: 'source-question', prompt: 'Imported question?', options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }],
        correctOptionIds: ['a'], answerMode: 'single', sectionId: null, explanation: '', tags: ['old-tag'], provenance: 'AI-Generated'
      }]
    }) } })
    fireEvent.click(screen.getByRole('button', { name: /Validate and preview/i }))
    fireEvent.click(screen.getByRole('button', { name: /Merge into profile/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Edit Imported question?' }))
    expect(screen.getByText('AI-generated', { selector: 'strong' })).toBeInTheDocument()
    const tags = screen.getByLabelText('Question tags')
    expect(tags).toHaveValue('old-tag')
    fireEvent.change(tags, { target: { value: 'new-tag, review' } })
    fireEvent.click(screen.getByRole('button', { name: /Save question/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Edit Imported question?' }))
    expect(screen.getByLabelText('Question tags')).toHaveValue('new-tag, review')
    expect(screen.getByText('AI-generated', { selector: 'strong' })).toBeInTheDocument()
  })
})


describe('Request 006 import history', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => cleanup())

  it('records an import batch and shows its questions in import history', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Menu/i }))
    fireEvent.click(screen.getByRole('button', { name: /Import & export/i }))
    fireEvent.change(screen.getByLabelText('Import name'), { target: { value: 'Lecture 3' } })
    fireEvent.change(screen.getByLabelText('Question bank or full profile backup (JSON)'), { target: { value: JSON.stringify({
      format: 'freequiz/questions-v1',
      sections: [{ id: 'batch-topic', name: 'Batch topic', parentId: null }],
      questions: [{ id: 'batch-q1', prompt: 'What is import history?', options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }], correctOptionIds: ['a'], sectionId: 'batch-topic', explanation: 'Test', tags: [] }]
    }) } })
    fireEvent.click(screen.getByRole('button', { name: /Validate and preview/i }))
    fireEvent.click(screen.getByRole('button', { name: /Merge into profile/i }))
    await screen.findAllByText('What is import history?')
    fireEvent.click(screen.getByRole('button', { name: /Menu/i }))
    fireEvent.click(within(document.querySelector('.global-menu') as HTMLElement).getByRole('button', { name: 'Import history' }))
    expect(screen.getByRole('heading', { name: 'Import history' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Lecture 3' })).toBeInTheDocument()
    expect(screen.getByText('What is import history?')).toBeInTheDocument()
  })

  it('offers a short prompt and optional existing-section matching', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Menu/i }))
    fireEvent.click(screen.getByRole('button', { name: /Import & export/i }))
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
    fireEvent.click(screen.getByRole('button', { name: 'Questions' }))
    fireEvent.click(screen.getByText('Advanced filters'))
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
    fireEvent.click(screen.getByRole('button', { name: 'Questions' }))
    fireEvent.click(screen.getByText('Advanced filters'))
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
    fireEvent.click(screen.getByRole('button', { name: /Import & export/i }))
    fireEvent.change(screen.getByLabelText('Question bank or full profile backup (JSON)'), { target: { value: JSON.stringify({
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
    fireEvent.click(screen.getByRole('group', { name: 'Filter sections' }))
    fireEvent.click(screen.getByRole('button', { name: 'Expand Deep root' }))
    fireEvent.click(screen.getByRole('button', { name: 'Expand Child' }))
    fireEvent.click(screen.getByRole('button', { name: 'Expand Grandchild' }))
    expect(screen.getByRole('checkbox', { name: 'Leaf' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('checkbox', { name: 'Deep root' }))
    expect(screen.getAllByText('Question in a deeply nested section?').length).toBeGreaterThan(0)
  })

  it('deletes a profile only after confirmation and switches to another profile', () => {
    const prompt = vi.spyOn(window, 'prompt').mockReturnValue('Temporary profile')
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Add profile' }))
    expect(screen.getAllByRole('button', { name: /Temporary profile/i }).length).toBeGreaterThan(0)
    fireEvent.click(screen.getByRole('button', { name: 'Questions' }))
    fireEvent.click(screen.getByRole('button', { name: /Temporary profile \d+ questions/i }))
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
    fireEvent.click(screen.getByRole('button', { name: 'Questions' }))
    expect(screen.getByRole('group', { name: 'Filter sections' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Filter answer types' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Filter question source' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Filter answer types' }))
    expect(screen.getByRole('group', { name: 'Answer type options' })).toBeInTheDocument()
    expect(screen.getByLabelText('Search import sources')).toBeInTheDocument(); expect(screen.getByRole('group', { name: 'Available import sources' })).toBeInTheDocument()
  })
})


describe('Request 009 practice controls', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => cleanup())
  it('allows toggling a favourite during practice after answering', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Create practice/i }))
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
    fireEvent.click(screen.getByRole('button', { name: /Create practice/i }))
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
    fireEvent.click(screen.getByRole('button', { name: /Create exam/i }))
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
    expect(screen.getByLabelText('Search tags')).toBeInTheDocument()
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
    fireEvent.click(screen.getByRole('button', { name: 'Help & feedback' }))
    fireEvent.click(screen.getByRole('button', { name: /Start interactive tutorial/i }))
    expect(screen.getByRole('dialog', { name: /Find or import questions/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Next step/i }))
    expect(screen.getByRole('dialog', { name: /Filter and select a set/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Next step/i }))
    fireEvent.click(screen.getByRole('button', { name: /Next step/i }))
    fireEvent.click(screen.getByRole('button', { name: /Finish/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(localStorage.getItem('freequiz-tutorial-completed')).toBe('true')
  })

  it('keeps detailed activity and mastery goals available behind a secondary disclosure', () => {
    render(<App />)
    fireEvent.click(screen.getByText('More about your progress'))
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
    fireEvent.click(screen.getByText('Advanced filters'))
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

  it('stars tags, prioritises them in the searchable picker, and persists the preference', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Questions' }))
    const picker = screen.getByRole('group', { name: 'Available tags' })
    fireEvent.click(screen.getByRole('button', { name: 'Star tag gardening' }))
    expect(screen.getByRole('button', { name: 'Unstar tag gardening' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(picker).getAllByRole('checkbox')[0].closest('label')).toHaveTextContent('gardening')
    fireEvent.change(screen.getByLabelText('Search tags'), { target: { value: 'angle' } })
    expect(screen.queryByRole('button', { name: 'Unstar tag gardening' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Star tag angles' })).toBeInTheDocument()
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)) })
    const saved = JSON.parse(localStorage.getItem('main') || '{}')
    expect(saved.profiles?.[0]?.favouriteTags).toContain('gardening')
  })

  it('restores a validated full backup as a separate profile without losing progress or source history', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
    fireEvent.click(screen.getByRole('button', { name: 'Import & export' }))
    const backup = {
      format: 'freequiz/backup-v1',
      backupVersion: 1,
      exportedAt: '2026-10-26T12:00:00.000Z',
      activeProfileId: 'profile-demo',
      profiles: [{
        id: 'profile-demo',
        name: 'Demo library',
        sections: [{ id: 's1', name: 'Original section', parentId: null }],
        questions: [{ id: 'q1', prompt: 'A preserved question?', options: [{ id: 'a', text: 'Yes' }, { id: 'b', text: 'No' }], correctOptionIds: ['a'], sectionId: 's1', tags: ['important'], sourceFileName: 'lecture-original.json', sourceImportId: 'i1' }],
        attempts: [{ id: 'attempt-1', questionId: 'q1', at: '2026-10-25T10:00:00.000Z', selectedOptionIds: ['a'], correct: true }],
        favourites: ['q1'],
        favouriteTags: ['important'],
        deferredQuestionIds: ['q1'],
        groups: [{ id: 'g1', name: 'Review', questionIds: ['q1'] }],
        exams: [{ id: 'e1', at: '2026-10-25T11:00:00.000Z', source: 'all', timeLimitSeconds: 600, durationSeconds: 120, responses: [{ questionId: 'q1', selectedOptionIds: ['a'], correct: true }], score: 100 }],
        imports: [{ id: 'i1', name: 'Original import', at: '2026-10-25T09:00:00.000Z', source: 'json', addedQuestionIds: ['q1'], sections: [{ id: 's1', name: 'Original section', parentId: null }], questions: [], sourceFileName: 'lecture-original.json', sourceIdentity: 'lecture-original.json' }],
        futureField: { preserved: true }
      }]
    }
    fireEvent.change(screen.getByLabelText('Question bank or full profile backup (JSON)'), { target: { value: JSON.stringify(backup) } })
    fireEvent.click(screen.getByRole('button', { name: /Validate and preview/i }))
    expect(screen.getByText('Full profile backup validated')).toBeInTheDocument()
    expect(screen.getByText(/This is a full profile backup/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Restore as new profile copies' }))
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)) })
    const saved = JSON.parse(localStorage.getItem('main') || '{}')
    expect(saved.profiles).toHaveLength(2)
    const restored = saved.profiles.find((p: any) => p.name === 'Demo library (restored)')
    expect(restored.attempts).toEqual(backup.profiles[0].attempts)
    expect(restored.imports[0].sourceFileName).toBe('lecture-original.json')
    expect(restored.questions[0].sourceFileName).toBe('lecture-original.json')
    expect(restored.favouriteTags).toEqual(['important'])
    expect(restored.futureField).toEqual({ preserved: true })
  })

})


describe('Request 013 mobile-first workflow', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => cleanup())

  it('keeps Progress directly available and makes the More menu reachable', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: 'Progress' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
    expect(screen.getByRole('button', { name: /Import & export/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Export questions to share/i })).not.toBeInTheDocument()
  })

  it('starts ordinary practice with one tap from the homepage', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Study all questions/i }))
    expect(screen.getByRole('heading', { name: 'One question at a time.' })).toBeInTheDocument()
    expect(screen.getByText(/Question 1 of 4/)).toBeInTheDocument()
  })

  it('shows the question section explicitly and explains validation errors', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Questions' }))
    fireEvent.click(screen.getByRole('button', { name: /New question/i }))
    expect(screen.getByLabelText('Question section')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Save question/i }))
    expect(screen.getByRole('alert')).toHaveTextContent(/Enter a question before saving/i)
  })

  it('uses touch-friendly checkbox multi-select filters rather than native multiple-select controls', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Questions' }))
    const sectionFilter = screen.getByRole('group', { name: 'Filter sections' })
    fireEvent.click(sectionFilter)
    expect(screen.getByRole('group', { name: 'Filter sections' })).toBeInTheDocument()
    expect(screen.getAllByRole('checkbox', { name: /Geometry/i }).length).toBeGreaterThan(0)
  })

  it('shows a mixed state when only some motivation features are enabled', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
    fireEvent.click(screen.getByRole('button', { name: /Settings/i }))
    fireEvent.click(screen.getByRole('checkbox', { name: /Activity calendar/i }))
    const master = screen.getByRole('checkbox', { name: 'Enable all motivation features' })
    expect(master).toHaveProperty('indeterminate', true)
    fireEvent.click(master)
    expect(master).toBeChecked()
  })

  it('warns before leaving an exam without submitting', () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Create exam/i }))
    fireEvent.click(screen.getByRole('button', { name: /Start exam/i }))
    fireEvent.click(screen.getByRole('button', { name: /Exit session/i }))
    expect(confirm).toHaveBeenCalledWith(expect.stringMatching(/Exit this exam without submitting/i))
    expect(screen.getByRole('heading', { name: 'One question at a time.' })).toBeInTheDocument()
  })
})


describe('Request 018 unified question filters', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => cleanup())

  it('shows all six common filters without opening Advanced filters', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Questions' }))
    expect(screen.getByLabelText('Search questions')).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Filter sections' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Filter favourite status' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Filter deferred status' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Filter question source' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Filter mastery' })).toBeInTheDocument()
    expect(screen.getByText('Advanced filters').closest('details')).not.toHaveAttribute('open')
  })

  it('reuses the filters in practice setup and shows a live matching count without a question list', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Create practice/i }))
    expect(screen.getByLabelText('Search questions')).toBeInTheDocument()
    expect(screen.getByText(/questions match your filters/)).toBeInTheDocument()
    expect(document.querySelector('.setup-dialog .question-row')).toBeNull()
    fireEvent.change(screen.getByLabelText('Search questions'), { target: { value: 'triangle' } })
    expect(document.querySelector('.selection-match-count')?.textContent).toContain('1 question matches your filters')
    expect(document.querySelector('.setup-dialog .question-row')).toBeNull()
  })


  it('shows selected common filters and clears common and advanced filters together', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Questions' }))
    fireEvent.click(screen.getByRole('group', { name: 'Filter sections' }))
    fireEvent.click(screen.getByRole('button', { name: 'Expand Mathematics' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Geometry' }))
    expect(document.querySelector('.active-filter-labels')?.textContent).toContain('Section: Mathematics / Geometry')
    fireEvent.change(screen.getByLabelText('Search questions'), { target: { value: 'triangle' } })
    fireEvent.click(screen.getByText('Advanced filters'))
    fireEvent.change(screen.getByLabelText('Include tags'), { target: { value: 'angles' } })
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(screen.getByLabelText('Search questions')).toHaveValue('')
    expect(screen.getByLabelText('Include tags')).toHaveValue('')
    expect(document.querySelector('.active-filter-labels')?.textContent).toBe('')
  })

  it('does not allow a session count larger than the filtered set', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Create exam/i }))
    fireEvent.change(screen.getByLabelText('Search questions'), { target: { value: 'triangle' } })
    fireEvent.change(screen.getByLabelText('Number of questions'), { target: { value: '2' } })
    expect(screen.getByRole('alert')).toHaveTextContent(/Choose between 1 and 1 questions/)
    expect(screen.getByRole('button', { name: /Start exam/i })).toBeDisabled()
  })
})
