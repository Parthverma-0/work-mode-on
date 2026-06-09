'use client'

import Image from 'next/image'
import { MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { JobWithCompany } from '@/lib/candidate-types'
import { formatPostedAgo, formatStipend, normalizeCompany } from '@/lib/candidate-utils'
import { cn } from '@/lib/utils'

type JobCardProps = {
  job: JobWithCompany
  onOpenDetail: () => void
  onApply: () => void
  hasApplied?: boolean
  applyLoading?: boolean
}

export function JobCard({
  job,
  onOpenDetail,
  onApply,
  hasApplied,
  applyLoading,
}: JobCardProps) {
  const company = normalizeCompany(job)

  function stop(e: React.MouseEvent) {
    e.stopPropagation()
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onOpenDetail}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpenDetail()
        }
      }}
      className={cn(
        'group lift cursor-pointer rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_30px_rgba(15,23,42,0.05)]',
        'hover:border-[#4F46E5]/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4F46E5]',
      )}
    >
      <div className="flex gap-4">
        <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-gray-50 ring-1 ring-gray-100">
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
            <div className="flex size-full items-center justify-center text-xs font-semibold text-[#6B7280]">
              {(company.company_name ?? '?').slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-[#6B7280]">{company.company_name ?? 'Company'}</p>
          <h3 className="mt-0.5 text-lg font-semibold leading-snug tracking-tight text-[#0A0A0A]">
            {job.title}
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="secondary" className="rounded-md bg-[#F3F4F6] font-normal text-[#374151]">
              {job.type}
            </Badge>
            <Badge variant="secondary" className="rounded-md bg-[#EEF2FF] font-normal text-[#4338CA]">
              {job.mode ?? '—'}
            </Badge>
            {job.location && (
              <span className="inline-flex items-center gap-1 text-xs text-[#6B7280]">
                <MapPin className="size-3.5 shrink-0" aria-hidden />
                {job.location}
              </span>
            )}
          </div>
          <p className="mt-3 text-sm font-medium text-[#374151]">
            {formatStipend(job.stipend_min, job.stipend_max)}
          </p>
          <p className="mt-1 text-xs text-[#9CA3AF]">Posted {formatPostedAgo(job.posted_at)}</p>
        </div>
      </div>
      <div className="mt-4 flex justify-end border-t border-gray-50 pt-4">
        <Button
          type="button"
          size="sm"
          disabled={hasApplied || applyLoading}
          onClick={(e) => {
            stop(e)
            if (!hasApplied) onApply()
          }}
          className={cn(
            'min-h-11 rounded-lg px-5 font-medium',
            hasApplied ? 'bg-[#ECFDF5] text-[#047857] hover:bg-[#ECFDF5]' : 'bg-[#4F46E5] hover:bg-[#4338CA]',
          )}
        >
          {hasApplied ? 'Applied ✓' : 'Apply Now'}
        </Button>
      </div>
    </article>
  )
}
