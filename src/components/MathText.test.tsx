import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MathText } from './MathText'

describe('MathText', () => {
  it('renders inline LaTeX and surrounding text', () => {
    render(<MathText text={'Calculate \\(x^2\\) now.'} />)
    expect(document.querySelector('.math-inline .katex')).toBeInTheDocument()
    expect(document.body.textContent).toContain('Calculate')
    expect(document.body.textContent).toContain('now.')
  })

  it('renders display equations with display mode', () => {
    render(<MathText text={'Solve: \\[x^2 = 4\\]'} />)
    expect(document.querySelector('.math-display .katex-display')).toBeInTheDocument()
  })

  it('does not crash on malformed LaTeX', () => {
    expect(() => render(<MathText text={'Bad formula \\(\\notacommand{'} />)).not.toThrow()
    expect(document.querySelector('.katex')).toBeInTheDocument()
  })
})
