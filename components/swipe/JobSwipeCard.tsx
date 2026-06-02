'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ChevronDown, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { SwipeJob } from '@/lib/swipe-types'
import { formatStipend } from '@/lib/candidate-utils'
import { cn } from '@/lib/utils'

function normalizeCompany(job: SwipeJob) {
  const cp = job.company_profiles
  if (!cp) return { company_name: null, industry: null, logo_url: null }
  if (Array.isArray(cp)) return cp[0] ?? { company_name: null, industry: null, logo_url: null }
  return cp
}

type JobSwipeCardProps = {
  job: SwipeJob
}

export function JobSwipeCard({ job }: JobSwipeCardProps) {
  const [expanded, setExpanded] = useState(false)
  const company = normalizeCompany(job)
  const skills = job.skills_required ?? []
  const visibleSkills = skills.slice(0, 6)
  const extraSkills = skills.length - visibleSkills.length
  const description = job.description ?? ''
  const truncated = description.slice(0, 150)
  const needsTruncate = description.length > 150

  return (
    <div className="flex max-h-[min(72vh,640px)] flex-col p-5 sm:p-6">
      <div className="flex flex-col items-center text-center">
        <div className="relative size-12 overflow-hidden rounded-full bg-gray-50 ring-2 ring-gray-100">
          {company.logo_url ? (
            <Image
              src={company.logo_url}
              alt=""
              fill
              className="object-cover"
              sizes="48px"
              unoptimized
            />
          ) : (
            <div className="flex size-full items-center justify-center text-sm font-semibold text-[#6B7280]">
              {(company.company_name ?? '?').slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <p className="mt-3 text-sm font-medium text-[#6B7280]">
          {company.company_name ?? 'Company'}
          {company.industry ? ` · ${company.industry}` : ''}
        </p>
        <h2 className="mt-2 text-xl font-bold leading-tight tracking-tight text-[#0A0A0A] sm:text-2xl">
          {job.title}
        </h2>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <Badge variant="secondary" className="rounded-full bg-[#F3F4F6] font-normal capitalize text-[#374151]">
          {job.type}
        </Badge>
        <Badge variant="secondary" className="rounded-full bg-[#EEF2FF] font-normal capitalize text-[#4338CA]">
          {job.mode ?? '—'}
        </Badge>
        {job.location && (
          <span className="inline-flex items-center gap-1 text-xs text-[#6B7280]">
            <MapPin className="size-3.5 shrink-0" aria-hidden />
            {job.location}
          </span>
        )}
      </div>

      <p className="mt-4 text-center text-sm font-semibold text-[#374151]">
        {formatStipend(job.stipend_min, job.stipend_max)}
      </p>

      {visibleSkills.length > 0 && (
        <div className="mt-4 flex flex-wrap justify-center gap-1.5">
          {visibleSkills.map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-xs font-medium text-[#4B5563]"
            >
              {skill}
            </span>
          ))}
          {extraSkills > 0 && (
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-[#6B7280]">
              +{extraSkills} more
            </span>
          )}
        </div>
      )}

      <div className="mt-4 flex-1 overflow-y-auto">
        <p className={cn('text-sm leading-relaxed text-[#6B7280]', !expanded && needsTruncate && 'line-clamp-3')}>
          {expanded || !needsTruncate ? description : `${truncated}…`}
        </p>
        {needsTruncate && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#4F46E5] hover:text-[#4338CA]"
          >
            {expanded ? 'Show less' : 'See full details'}
            <ChevronDown className={cn('size-3.5 transition-transform', expanded && 'rotate-180')} />
          </button>
        )}
      </div>
    </div>
  )
}
