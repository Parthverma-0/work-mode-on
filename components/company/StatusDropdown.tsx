'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ApplicationStatus } from '@/lib/company-types'

const OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: 'submitted', label: 'Submitted' },
  { value: 'viewed', label: 'Viewed' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'rejected', label: 'Rejected' },
]

type StatusDropdownProps = {
  value: string
  disabled?: boolean
  onChange: (next: ApplicationStatus) => Promise<void> | void
}

export function StatusDropdown({ value, disabled, onChange }: StatusDropdownProps) {
  return (
    <Select
      value={value}
      disabled={disabled}
      onValueChange={(v) => onChange(v as ApplicationStatus)}
    >
      <SelectTrigger className="h-9 w-[140px] rounded-lg border-gray-200 text-xs font-medium">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map((o) => (
          <SelectItem key={o.value} value={o.value} className="text-xs">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
