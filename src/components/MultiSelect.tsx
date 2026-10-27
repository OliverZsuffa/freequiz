import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'

type MultiSelectProps = {
  label: string
  ariaLabel?: string
  value: string[]
  options: { value: string; label: string }[]
  onChange: (values: string[]) => void
}

type PopoverPosition = { top: number; left: number; width: number; maxHeight: number }

export function MultiSelect({ label, ariaLabel, value, options, onChange }: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [position, setPosition] = useState<PopoverPosition | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const media = window.matchMedia('(max-width: 760px)')
    const update = () => setIsMobile(media.matches)
    update()
    media.addEventListener?.('change', update)
    return () => media.removeEventListener?.('change', update)
  }, [])

  useEffect(() => {
    if (!open) return
    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target as Node
      if (!rootRef.current?.contains(target) && !popoverRef.current?.contains(target)) setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', closeOnOutsidePointer)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  useEffect(() => {
    if (!open || !isMobile) {
      setPosition(null)
      return
    }
    const placePopover = () => {
      const trigger = triggerRef.current
      const popover = popoverRef.current
      if (!trigger || !popover) return
      const rect = trigger.getBoundingClientRect()
      const margin = 14
      const bottomReserved = 76
      const width = Math.min(320, window.innerWidth - margin * 2)
      const maxHeight = Math.max(120, Math.min(window.innerHeight * 0.55, window.innerHeight - bottomReserved - 16))
      const left = Math.max(margin, Math.min(rect.left, window.innerWidth - margin - width))
      const below = window.innerHeight - bottomReserved - rect.bottom - 6
      const above = rect.top - 6
      const top = below >= Math.min(popover.scrollHeight, maxHeight) || below >= above
        ? Math.min(rect.bottom + 6, window.innerHeight - bottomReserved - maxHeight)
        : Math.max(8, rect.top - Math.min(popover.scrollHeight, maxHeight) - 6)
      setPosition({ top: Math.max(8, top), left, width, maxHeight })
    }
    placePopover()
    window.addEventListener('resize', placePopover)
    window.addEventListener('scroll', placePopover, true)
    return () => {
      window.removeEventListener('resize', placePopover)
      window.removeEventListener('scroll', placePopover, true)
    }
  }, [open, isMobile, options.length])

  const changeValues = (next: string[]) => {
    onChange(next)
    if (isMobile) setOpen(false)
  }

  const popover = open && <div
    ref={popoverRef}
    className={'multi-select-popover' + (isMobile ? ' is-mobile' : '')}
    role="group"
    aria-label={label + ' options'}
    style={isMobile && position ? {
      top: position.top,
      left: position.left,
      width: position.width,
      maxHeight: position.maxHeight,
      right: 'auto',
      bottom: 'auto',
    } : undefined}
  >
    {options.map(option => <label key={option.value} className="multi-select-option">
      <input
        type="checkbox"
        checked={value.includes(option.value)}
        onChange={e => changeValues(e.target.checked ? [...value, option.value] : value.filter(v => v !== option.value))}
      />
      <span>{option.label}</span>
    </label>)}
    <div className="multi-select-footer">
      <button type="button" className="text-button" onClick={() => changeValues([])}>Clear</button>
      {!isMobile && <button type="button" className="text-button" onClick={() => setOpen(false)}>Done</button>}
    </div>
  </div>

  return <div className="multi-select" ref={rootRef}>
    <button ref={triggerRef} type="button" className="multi-select-trigger" aria-label={ariaLabel ?? label} aria-expanded={open} onClick={() => setOpen(v => !v)}>
      {label}{value.length > 0 && <span className="multi-select-count">{value.length}</span>}<ChevronDown size={13}/>
    </button>
    {open && isMobile && typeof document !== 'undefined' ? createPortal(popover, document.body) : popover}
  </div>
}
