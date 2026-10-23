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
    expect(screen.getByText('Import JSON')).toBeInTheDocument()
    expect(screen.getByText('Ask your AI')).toBeInTheDocument()
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


describe('Request 004 features',()=>{beforeEach(()=>localStorage.clear());afterEach(()=>cleanup());it('shows the progress graph empty state',()=>{render(<App/>);fireEvent.click(screen.getByRole('button',{name:/Menu/i}));fireEvent.click(screen.getByRole('button',{name:/Statistics/i}));expect(screen.getByRole('heading',{name:'Accuracy over time'})).toBeInTheDocument();expect(screen.getByText(/Your progress graph starts here/)).toBeInTheDocument()});it('offers optional gamification and reminders',()=>{render(<App/>);fireEvent.click(screen.getByRole('button',{name:/Menu/i}));fireEvent.click(screen.getByRole('button',{name:/Settings & reminders/i}));expect(screen.getByRole('heading',{name:'Gamification'})).toBeInTheDocument();expect(screen.getByText('Milestones and achievements')).toBeInTheDocument();expect(screen.getByRole('checkbox',{name:'Enable study reminders'})).not.toBeChecked()});it('offers multiple-section filtering',()=>{render(<App/>);expect(screen.getByLabelText('Search sections')).toBeInTheDocument();fireEvent.click(screen.getByRole('button',{name:'Clear'}));expect(screen.getByText('All sections')).toBeInTheDocument()});it('generates a reusable prompt without a source field',()=>{render(<App/>);fireEvent.click(screen.getByRole('button',{name:/Menu/i}));fireEvent.click(screen.getByRole('button',{name:/Import \/ export/i}));expect(screen.queryByLabelText('Source material')).not.toBeInTheDocument();fireEvent.click(screen.getByRole('button',{name:/Generate AI prompt/i}));expect(screen.getByDisplayValue(/source material the user will provide/i)).toBeInTheDocument()})});
