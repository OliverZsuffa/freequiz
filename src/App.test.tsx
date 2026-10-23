import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'

describe('Freequiz', () => {
  beforeEach(() => localStorage.clear())

  it('shows the calm overview and demo library', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'What would you like to practise?' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Choose a session' })).toBeInTheDocument()
    expect(screen.getAllByText('Mathematics').length).toBeGreaterThan(0)
    expect(screen.queryByText('Good to have you here.')).not.toBeInTheDocument()
  })

  it('opens the import assistant', () => {
    render(<App />)
    fireEvent.click(screen.getAllByRole('button', { name: /Import assistant/i })[0])
    expect(screen.getByText('Import JSON')).toBeInTheDocument()
    expect(screen.getByText('Ask your AI')).toBeInTheDocument()
  })

  it('persists the selected appearance', () => {
    render(<App />)
    fireEvent.click(screen.getAllByRole('button', { name: /Light appearance/i })[0])
    expect(localStorage.getItem('freequiz-theme')).toBe('light')
  })
})
