import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useState } from 'react'
import { MultiSelect } from './MultiSelect'

function Harness() {
  const [value, setValue] = useState<string[]>([])
  return <MultiSelect label="Deferred" value={value} onChange={setValue} options={[
    { value: 'deferred', label: 'Deferred' },
    { value: 'not-deferred', label: 'Not deferred' },
  ]} />
}

describe('MultiSelect', () => {
  let originalMatchMedia: PropertyDescriptor | undefined

  beforeEach(() => {
    originalMatchMedia = Object.getOwnPropertyDescriptor(window, 'matchMedia')
  })

  afterEach(() => {
    cleanup()
    if (originalMatchMedia) Object.defineProperty(window, 'matchMedia', originalMatchMedia)
    else Reflect.deleteProperty(window, 'matchMedia')
  })

  function setMobile(matches: boolean) {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockImplementation(() => ({
        matches,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    })
  }

  it('closes after a phone selection and keeps the selected value', async () => {
    setMobile(true)
    render(<div className="app"><Harness /></div>)
    fireEvent.click(screen.getByRole('button', { name: /^Deferred/ }))
    expect(screen.getByRole('group', { name: 'Deferred options' })).toBeInTheDocument()
    expect(document.querySelector('.app')?.contains(screen.getByRole('group', { name: 'Deferred options' }))).toBe(true)
    fireEvent.click(screen.getByRole('checkbox', { name: 'Deferred' }))
    expect(screen.queryByRole('group', { name: 'Deferred options' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Deferred/ })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByRole('button', { name: /^Deferred/ })).toHaveTextContent('1')
    fireEvent.click(screen.getByRole('button', { name: /^Deferred/ }))
    expect(screen.getByRole('checkbox', { name: 'Deferred' })).toBeChecked()
  })

  it('stays open for successive desktop selections', () => {
    setMobile(false)
    render(<Harness />)
    fireEvent.click(screen.getByRole('button', { name: 'Deferred' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Deferred' }))
    expect(screen.getByRole('group', { name: 'Deferred options' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('checkbox', { name: 'Not deferred' }))
    expect(screen.getByRole('group', { name: 'Deferred options' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Deferred/ })).toHaveTextContent('2')
  })

  it('closes on Escape and outside pointer interaction', () => {
    setMobile(false)
    render(<Harness />)
    const trigger = screen.getByRole('button', { name: /^Deferred/ })
    fireEvent.click(trigger)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('group', { name: 'Deferred options' })).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
    fireEvent.click(trigger)
    fireEvent.pointerDown(document.body)
    expect(screen.queryByRole('group', { name: 'Deferred options' })).not.toBeInTheDocument()
  })
})
