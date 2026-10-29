import katex from 'katex'
import 'katex/dist/katex.min.css'

type Props = { text: string; className?: string }

const delimiters = /\\\\\\[([\\s\\S]*?)\\\\\\]|\\\\\\(([\\s\\S]*?)\\\\\\)/g

/** Render supported inline and display LaTeX while leaving ordinary text as React text. */
export function MathText({ text, className }: Props) {
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let index = 0
  for (const match of text.matchAll(delimiters)) {
    const start = match.index ?? 0
    if (start > lastIndex) parts.push(text.slice(lastIndex, start))
    const displayMode = match[1] !== undefined
    const formula = displayMode ? match[1] : match[2]
    try {
      parts.push(<span key={index++} className={displayMode ? 'math-display' : 'math-inline'} dangerouslySetInnerHTML={{ __html: katex.renderToString(formula, { displayMode, throwOnError: false, strict: 'ignore', trust: false }) }} />)
    } catch {
      parts.push(match[0])
    }
    lastIndex = start + match[0].length
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex))
  return <span className={['math-text', className].filter(Boolean).join(' ')}>{parts.map((part, i) => typeof part === 'string' ? <span key={'text-' + i}>{part}</span> : part)}</span>
}
