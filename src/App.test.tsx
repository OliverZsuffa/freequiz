import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from './App'

describe('Freequiz', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => cleanup())

  it('shows the calm overview and demo library', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'What would you like to practise?' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Choose a session' })).toBeInTheDocument()
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
    expect(screen.getByRole('option', { name: 'Pick exactly N' })).toBeInTheDocument()
    expect(screen.getByLabelText(/Correct option number/i)).toBeInTheDocument()
  })

  it('offers a timed exam setup and answer-mode filters', () => {
    render(<App />)
    expect(screen.getByLabelText('Question source')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Session type'), { target: { value: 'exam' } })
    expect(screen.getByLabelText('Time limit (minutes)')).toBeInTheDocument()
    expect(screen.getByLabelText('Answer type')).toBeInTheDocument()
  })

})
