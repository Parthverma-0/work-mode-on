'use client'

import { useState } from 'react'
import { Briefcase, ExternalLink, GraduationCap, MapPin } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { SwipeApplicant } from '@/lib/swipe-types'
import { cn } from '@/lib/utils'

function initials(name: string | null | undefined) {
  if (!name?.trim()) return '?'
  const p = name.trim().split(/\s+/)
  return (p[0][0] + (p[1]?.[0] ?? '')).toUpperCase()
}

type CandidateSwipeCardProps = {
  applicant: SwipeApplicant
}

export function CandidateSwipeCard({ applicant }: CandidateSwipeCardProps) {
  const [expanded, setExpanded] = useState(false)
  const candidate = applicant.candidate
  const prof = applicant.profile
  const name = prof?.full_name ?? 'Candidate'
  const skills = candidate.skills ?? []
  const visibleSkills = skills.slice(0, 8)
  const extraSkills = skills.length - visibleSkills.length
  const bio = candidate.bio ?? ''
  const truncated = bio.slice(0, 120)
  const needsTruncate = bio.length > 120

  return (
    <div className="flex max-h-[min(72vh,640px)] flex-col p-5 sm:p-6">
      {applicant.jobTitle && (
        <div className="mb-4 flex items-center justify-center gap-1.5 rounded-full bg-[#EEF2FF] px-3 py-1.5 text-xs font-semibold text-[#4338CA]">
          <Briefcase className="size-3.5 shrink-0" aria-hidden />
          Applied for {applicant.jobTitle}
        </div>
      )}

      <div className="flex flex-col items-center text-center">
        <Avatar className="size-16 border-2 border-[#EEF2FF] shadow-sm">
          <AvatarImage src={prof?.avatar_url ?? undefined} alt="" />
          <AvatarFallback className="bg-[#EEF2FF] text-lg font-semibold text-[#4338CA]">
            {initials(name)}
          </AvatarFallback>
        </Avatar>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <h2 className="text-xl font-bold tracking-tight text-[#0A0A0A]">{name}</h2>
          {candidate.open_to_work && (
            <Badge className="rounded-full border-0 bg-[#D1FAE5] font-normal text-[#065F46]">
              Open to Work
            </Badge>
          )}
        </div>
        {candidate.headline && (
          <p className="mt-2 text-sm font-medium text-[#374151]">{candidate.headline}</p>
        )}
      </div>

      <div className="mt-4 space-y-2 text-center text-sm text-[#6B7280]">
        {(candidate.college || candidate.graduation_year) && (
          <p className="inline-flex items-center justify-center gap-1.5">
            <GraduationCap className="size-4 shrink-0" aria-hidden />
            {[candidate.college, candidate.graduation_year && `Class of ${candidate.graduation_year}`]
              .filter(Boolean)
              .join(' · ')}
          </p>
        )}
        {candidate.city && (
          <p className="inline-flex items-center justify-center gap-1.5">
            <MapPin className="size-4 shrink-0" aria-hidden />
            {candidate.city}
          </p>
        )}
      </div>

      {visibleSkills.length > 0 && (
        <div className="mt-4 -mx-1 overflow-x-auto px-1 pb-1">
          <div className="flex gap-1.5">
            {visibleSkills.map((skill) => (
              <span
                key={skill}
                className="shrink-0 rounded-full bg-[#F3F4F6] px-2.5 py-1 text-xs font-medium text-[#4B5563]"
              >
                {skill}
              </span>
            ))}
            {extraSkills > 0 && (
              <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-[#6B7280]">
                +{extraSkills}
              </span>
            )}
          </div>
        </div>
      )}

      {bio && (
        <div className="mt-4 flex-1 overflow-y-auto text-center">
          <p className={cn('text-sm leading-relaxed text-[#6B7280]', !expanded && needsTruncate && 'line-clamp-3')}>
            {expanded || !needsTruncate ? bio : `${truncated}…`}
          </p>
          {needsTruncate && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-2 text-xs font-medium text-[#4F46E5] hover:text-[#4338CA]"
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}

      {applicant.coverNote && (
        <div className="mt-4 rounded-xl bg-[#F9FAFB] px-4 py-3 text-left">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">Cover note</p>
          <p className="mt-1 text-sm leading-relaxed text-[#4B5563]">{applicant.coverNote}</p>
        </div>
      )}

      {candidate.portfolio_url && (
        <div className="mt-4 flex justify-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full border-gray-200"
            asChild
          >
            <a href={candidate.portfolio_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1.5 size-3.5" aria-hidden />
              Portfolio
            </a>
          </Button>
        </div>
      )}
    </div>
  )
}
