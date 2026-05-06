'use client'

import { ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { CourseRow } from '@/lib/candidate-types'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type CourseCardProps = {
  course: CourseRow
  featured?: boolean
  onSkillClick?: (skill: string) => void
}

function levelLabel(level: string | null): string {
  if (!level) return 'Course'
  const l = level.toLowerCase()
  if (l.includes('begin')) return 'Beginner'
  if (l.includes('inter')) return 'Intermediate'
  if (l.includes('adv')) return 'Advanced'
  return level
}

export function CourseCard({ course, featured, onSkillClick }: CourseCardProps) {
  const href = course.affiliate_url || course.url || '#'

  return (
    <article
      className={cn(
        'flex h-full flex-col rounded-xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md',
        featured ? 'border-[#4F46E5]/30 ring-1 ring-[#4F46E5]/10' : 'border-gray-100',
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
          {course.provider ?? 'Course'}
        </span>
        <Badge variant="secondary" className="rounded-md bg-[#F3F4F6] text-[10px] font-medium text-[#374151]">
          {levelLabel(course.level)}
        </Badge>
      </div>
      <h3 className="mt-3 text-lg font-semibold leading-snug tracking-tight text-[#0A0A0A]">
        {course.title}
      </h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {(course.skills_covered ?? []).slice(0, 6).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSkillClick?.(s)}
            className="rounded-full bg-[#F9FAFB] px-2.5 py-0.5 text-xs font-medium text-[#4B5563] ring-1 ring-gray-100 transition-colors hover:bg-[#EEF2FF] hover:text-[#4338CA]"
          >
            {s}
          </button>
        ))}
      </div>
      <div className="mt-auto pt-5">
        <Button
          type="button"
          variant="outline"
          className="w-full rounded-lg border-gray-200 font-medium text-[#4F46E5] hover:bg-[#EEF2FF]"
          disabled={href === '#'}
          onClick={() => href !== '#' && window.open(href, '_blank', 'noopener,noreferrer')}
        >
          View Course
          <ArrowUpRight className="ml-1 size-4" aria-hidden />
        </Button>
      </div>
    </article>
  )
}
