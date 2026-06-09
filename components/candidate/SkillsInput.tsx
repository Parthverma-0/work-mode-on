'use client'

import { KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Plus, Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { SKILL_SUGGESTIONS } from '@/lib/skills'

type SkillsInputProps = {
  skills: string[]
  onChange: (skills: string[]) => void
  placeholder?: string
  /** Override the suggestion pool (defaults to the curated SKILL_SUGGESTIONS). */
  suggestions?: readonly string[]
}

type Option = { kind: 'custom' | 'suggestion'; label: string }

const MAX_VISIBLE = 8

export function SkillsInput({
  skills,
  onChange,
  placeholder = 'Type a skill — e.g. React',
  suggestions = SKILL_SUGGESTIONS,
}: SkillsInputProps) {
  const [input, setInput] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const trimmed = input.trim()

  function hasSkill(value: string) {
    return skills.some((s) => s.toLowerCase() === value.toLowerCase())
  }

  function addSkill(raw: string) {
    const value = raw.trim().replace(/,+$/, '').trim()
    if (!value || hasSkill(value)) {
      setInput('')
      setActiveIndex(0)
      return
    }
    onChange([...skills, value])
    setInput('')
    setActiveIndex(0)
  }

  function removeSkill(skillToRemove: string) {
    onChange(skills.filter((skill) => skill !== skillToRemove))
  }

  const options = useMemo<Option[]>(() => {
    const q = trimmed.toLowerCase()
    const matches = suggestions
      .filter((s) => !hasSkill(s))
      .filter((s) => (q ? s.toLowerCase().includes(q) : true))
      .slice(0, MAX_VISIBLE)

    const exactExists =
      matches.some((s) => s.toLowerCase() === q) || hasSkill(trimmed)
    const custom: Option[] =
      trimmed.length > 0 && !exactExists ? [{ kind: 'custom', label: trimmed }] : []

    return [...custom, ...matches.map<Option>((label) => ({ kind: 'suggestion', label }))]
  }, [trimmed, suggestions, skills])

  // Keep the highlighted row in range as the option list changes.
  useEffect(() => {
    setActiveIndex((i) => Math.min(i, Math.max(options.length - 1, 0)))
  }, [options.length])

  // Close the dropdown when focus/clicks leave the component.
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  function commitActive() {
    const opt = options[activeIndex] ?? options[0]
    addSkill(opt ? opt.label : input)
    setOpen(true)
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      commitActive()
    } else if (e.key === ',') {
      e.preventDefault()
      addSkill(input)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setActiveIndex((i) => (options.length ? (i + 1) % options.length : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setOpen(true)
      setActiveIndex((i) => (options.length ? (i - 1 + options.length) % options.length : 0))
    } else if (e.key === 'Backspace' && !input && skills.length) {
      removeSkill(skills[skills.length - 1])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className="space-y-3" ref={containerRef}>
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]"
              aria-hidden
            />
            <Input
              value={input}
              placeholder={placeholder}
              onChange={(e) => {
                setInput(e.target.value)
                setOpen(true)
                setActiveIndex(0)
              }}
              onFocus={() => setOpen(true)}
              // Commit a typed-but-unconfirmed skill when leaving the field, so it
              // isn't silently lost if the user taps "Save" without pressing Enter.
              onBlur={() => addSkill(input)}
              onKeyDown={onKeyDown}
              className="min-h-11 pl-9"
              role="combobox"
              aria-expanded={open}
              aria-autocomplete="list"
            />
          </div>
          <button
            type="button"
            // onMouseDown (not onClick) so the input doesn't blur-commit first.
            onMouseDown={(e) => {
              e.preventDefault()
              addSkill(input)
            }}
            disabled={!trimmed}
            className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-lg bg-[#4F46E5] px-4 text-sm font-medium text-white transition-colors hover:bg-[#4338CA] disabled:opacity-40"
            aria-label="Add skill"
          >
            <Plus className="size-4" aria-hidden />
            Add
          </button>
        </div>

        {open && options.length > 0 && (
          <ul
            role="listbox"
            className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-gray-100 bg-white p-1 shadow-lg"
          >
            {options.map((opt, i) => (
              <li key={`${opt.kind}-${opt.label}`} role="option" aria-selected={i === activeIndex}>
                <button
                  type="button"
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    addSkill(opt.label)
                  }}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                    i === activeIndex ? 'bg-[#EEF2FF] text-[#3730A3]' : 'text-[#374151] hover:bg-gray-50',
                  )}
                >
                  {opt.kind === 'custom' ? (
                    <>
                      <Plus className="size-4 shrink-0 text-[#4F46E5]" aria-hidden />
                      <span>
                        Add <span className="font-semibold">&ldquo;{opt.label}&rdquo;</span>
                      </span>
                    </>
                  ) : (
                    <span>{opt.label}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center gap-1 rounded-full bg-[#EEF2FF] px-3 py-1 text-sm text-[#3730A3]"
          >
            {skill}
            <button type="button" onClick={() => removeSkill(skill)} aria-label={`Remove ${skill}`}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}
