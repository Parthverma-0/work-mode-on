'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { CandidateSearchRow } from '@/lib/company-types'

function initials(name: string | null | undefined) {
  if (!name?.trim()) return '?'
  const p = name.trim().split(/\s+/)
  return (p[0][0] + (p[1]?.[0] ?? '')).toUpperCase()
}

type CandidateCardProps = {
  candidate: CandidateSearchRow
  onView: () => void
  onMessage: () => void
}

export function CandidateCard({ candidate, onView, onMessage }: CandidateCardProps) {
  const prof = Array.isArray(candidate.profiles) ? candidate.profiles[0] : candidate.profiles
  const name = prof?.full_name ?? 'Candidate'
  const skills = (candidate.skills ?? []).slice(0, 4)
  const more = (candidate.skills ?? []).length - skills.length

  return (
    <Card className="flex h-full flex-col rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="flex flex-1 flex-col p-5">
        <div className="flex gap-3">
          <Avatar className="size-11 shrink-0 rounded-xl border border-gray-100">
            <AvatarImage src={prof?.avatar_url ?? undefined} alt="" />
            <AvatarFallback className="rounded-xl bg-[#EEF2FF] text-xs font-semibold text-[#4338CA]">
              {initials(name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold leading-tight text-[#0A0A0A]">{name}</h3>
            {candidate.headline ? (
              <p className="mt-1 line-clamp-2 text-sm text-[#6B7280]">{candidate.headline}</p>
            ) : null}
          </div>
        </div>

        {candidate.open_to_work ? (
          <Badge className="mt-3 w-fit rounded-md border-0 bg-[#D1FAE5] font-normal text-[#065F46]">Open to work</Badge>
        ) : null}

        {skills.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {skills.map((s) => (
              <span key={s} className="rounded-md bg-[#F3F4F6] px-2 py-0.5 text-xs font-medium text-[#4B5563]">
                {s}
              </span>
            ))}
            {more > 0 ? (
              <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-[#6B7280]">+{more}</span>
            ) : null}
          </div>
        ) : null}

        <p className="mt-4 text-xs text-[#9CA3AF]">
          {[candidate.college, candidate.city].filter(Boolean).join(' · ')}
        </p>

        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          <Button type="button" variant="outline" size="sm" className="flex-1 rounded-lg sm:flex-none" onClick={onView}>
            View profile
          </Button>
          <Button
            type="button"
            size="sm"
            className="flex-1 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] sm:flex-none"
            onClick={onMessage}
          >
            Message
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
