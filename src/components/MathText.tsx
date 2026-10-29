import katex from 'katex'
import 'katex/dist/katex.min.css'
import type { ReactNode } from 'react'

type Props = { text: string; className?: string }

// Only the documented delimiters are interpreted; all other text stays ordinary text.
const delimiters = /\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)/g

export function MathText({ text, className }: Props) {
  const parts: ReactNode[] = []
  let lastIndex = 0
  let index = 0
  for (const match of text.matchAll(delimiters)) {
    const start = match.index ?? 0
    if (start > lastIndex) parts.push(text.slice(lastIndex, start))
    const displayMode = match[1] !== undefined
    const formula = displayMode ? match[1] : match[2]
    try {
      const html = katex.renderToString(formula, { displayMode, throwOnError: false, strict: 'ignore', trust: false })
      parts.push(<span key={index++} className={displayMode ? 'math-display' : 'math-inline'} dangerouslySetInnerHTML={{ __html: html }} />)
    } catch {
      parts.push(match[0])
    }
    lastIndex = start + match[0].length
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex))
  return <span className={['math-text', className].filter(Boolean).join(' ')}>{parts.map((part, i) => typeof part === 'string' ? <span key={'text-' + i}>{part}</span> : part)}</span>
}
