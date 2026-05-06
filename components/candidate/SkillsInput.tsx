'use client'

import { KeyboardEvent, useState } from 'react'
import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'

type SkillsInputProps = {
  skills: string[]
  onChange: (skills: string[]) => void
}

export function SkillsInput({ skills, onChange }: SkillsInputProps) {
  const [input, setInput] = useState('')

  function addSkill(raw: string) {
    const trimmed = raw.trim()
    if (!trimmed) return
    if (skills.some((skill) => skill.toLowerCase() === trimmed.toLowerCase())) return
    onChange([...skills, trimmed])
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addSkill(input.replace(',', ''))
      setInput('')
    }
  }

  function removeSkill(skillToRemove: string) {
    onChange(skills.filter((skill) => skill !== skillToRemove))
  }

  return (
    <div className="space-y-3">
      <Input
        placeholder="Type a skill and press Enter or comma"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        className="min-h-11"
      />
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
