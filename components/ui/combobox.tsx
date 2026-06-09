'use client'

import { KeyboardEvent, ReactNode, useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type ComboboxProps = {
  value: string
  onChange: (value: string) => void
  options: readonly string[]
  placeholder?: string
  id?: string
  /** Leading icon (e.g. <MapPin className="size-4" />). */
  icon?: ReactNode
  inputClassName?: string
  maxVisible?: number
  'aria-label'?: string
}

/**
 * Searchable single-select with curated suggestions. Free text is always
 * allowed — typing updates the value directly; the dropdown just makes common
 * choices a tap away (mobile-friendly, no reliance on a physical Enter key).
 */
export function Combobox({
  value,
  onChange,
  options,
  placeholder,
  id,
  icon,
  inputClassName,
  maxVisible = 8,
  'aria-label': ariaLabel,
}: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const q = value.trim().toLowerCase()
  const filtered = options
    .filter((o) => (q ? o.toLowerCase().includes(q) : true))
    .slice(0, maxVisible)

  useEffect(() => {
    setActiveIndex(0)
  }, [value])

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  function select(option: string) {
    onChange(option)
    setOpen(false)
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setActiveIndex((i) => (filtered.length ? (i + 1) % filtered.length : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setOpen(true)
      setActiveIndex((i) => (filtered.length ? (i - 1 + filtered.length) % filtered.length : 0))
    } else if (e.key === 'Enter') {
      if (open && filtered[activeIndex]) {
        e.preventDefault()
        select(filtered[activeIndex])
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      {icon && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]">
          {icon}
        </span>
      )}
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-label={ariaLabel}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className={cn(icon && 'pl-9', 'pr-9', inputClassName)}
      />
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#94a3b8]"
        aria-hidden
      />

      {open && filtered.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-30 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-gray-100 bg-white p-1 shadow-lg"
        >
          {filtered.map((option, i) => {
            const selected = option.toLowerCase() === q
            return (
              <li key={option} role="option" aria-selected={i === activeIndex}>
                <button
                  type="button"
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    select(option)
                  }}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                    i === activeIndex ? 'bg-[#EEF2FF] text-[#3730A3]' : 'text-[#374151] hover:bg-gray-50',
                  )}
                >
                  <span>{option}</span>
                  {selected && <Check className="size-4 shrink-0 text-[#4F46E5]" aria-hidden />}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
