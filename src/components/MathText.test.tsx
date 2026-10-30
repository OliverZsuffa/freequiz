import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MathText } from './MathText'
import { parseImport } from '../domain'

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

  it('parses valid JSON escaping and renders the decoded inline and display formulas', () => {
    const jsonText = String.raw`{"format":"freequiz/questions-v1","sections":[],"questions":[{"id":"math","prompt":"Solve \\(x^2 = 4\\).","options":[{"id":"a","text":"\\(2\\)"},{"id":"b","text":"\\(3\\)"}],"correctOptionIds":["a"],"sectionId":null,"explanation":"Roots: \\[x=\\pm2\\]"}]}`
    const parsed = parseImport(JSON.parse(jsonText))
    expect(parsed.questions[0].prompt).toBe('Solve \\(x^2 = 4\\).')
    expect(parsed.questions[0].options[0].text).toBe('\\(2\\)')
    expect(parsed.questions[0].explanation).toBe('Roots: \\[x=\\pm2\\]')
    const { container } = render(<>
      <MathText text={parsed.questions[0].prompt} />
      <MathText text={parsed.questions[0].options[0].text} />
      <MathText text={parsed.questions[0].explanation ?? ''} />
    </>)
    expect(container.querySelectorAll('.katex').length).toBe(3)
    expect(container.querySelector('.math-display .katex-display')).toBeInTheDocument()
  })

  it('renders a complete implication/equivalence formula from valid question-bank JSON', () => {
    const formula = 'Equivalence: \\((A \\rightarrow B) \\iff (\\neg A \\rightarrow \\neg B)\\)'
    const rawJson = JSON.stringify({
      format: 'freequiz/questions-v1',
      sections: [],
      questions: [{
        id: 'equivalence',
        prompt: 'Which equivalence is valid?',
        options: [
          { id: 'a', text: formula },
          { id: 'b', text: 'Not equivalent' }
        ],
        correctOptionIds: ['a'],
        sectionId: null,
        explanation: formula
      }]
    })
    expect(rawJson).toContain('\\\\(')
    const parsed = parseImport(JSON.parse(rawJson))
    expect(parsed.questions[0].options[0].text).toBe(formula)
    const { container } = render(<>
      <MathText text={parsed.questions[0].options[0].text} />
      <MathText text={parsed.questions[0].explanation ?? ''} />
    </>)
    expect(container.querySelectorAll('.katex').length).toBe(2)
    expect(container.textContent).toContain('A')
  })

  it('does not interpret over-escaped JSON delimiters as normal delimiters', () => {
    const jsonText = String.raw`{"questions":[{"id":"over","prompt":"Solve \\\\(x^2 = 4\\\\).","options":[{"id":"a","text":"A"},{"id":"b","text":"B"}],"correctOptionIds":["a"]}]}`
    const parsed = parseImport(JSON.parse(jsonText))
    const { container } = render(<MathText text={parsed.questions[0].prompt} />)
    expect(container.querySelector('.katex')).toBeNull()
  })

  it('does not crash on malformed LaTeX', () => {
    expect(() => render(<MathText text={'Bad formula \\(\\notacommand{'} />)).not.toThrow()
    expect(document.querySelector('.math-inline')).toBeInTheDocument()
  })
})
