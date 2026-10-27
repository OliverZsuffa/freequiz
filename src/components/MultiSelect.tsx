import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

type MultiSelectProps = {
  label: string
  ariaLabel?: string
  value: string[]
  options: { value: string; label: string }[]
  onChange: (values: string[]) => void
}

export function MultiSelect({ label, ariaLabel, value, options, onChange }: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  return <div className="multi-select"><button type="button" className="multi-select-trigger" aria-label={ariaLabel ?? label} aria-expanded={open} onClick={() => setOpen(v => !v)}>{label}{value.length > 0 && <span className="multi-select-count">{value.length}</span>}<ChevronDown size={13}/></button>{open && <div className="multi-select-popover" role="group" aria-label={label + ' options'}>{options.map(option => <label key={option.value} className="multi-select-option"><input type="checkbox" checked={value.includes(option.value)} onChange={e => onChange(e.target.checked ? [...value, option.value] : value.filter(v => v !== option.value))}/><span>{option.label}</span></label>)}<div className="multi-select-footer"><button type="button" className="text-button" onClick={() => onChange([])}>Clear</button><button type="button" className="text-button" onClick={() => setOpen(false)}>Done</button></div></div>}</div>
}
