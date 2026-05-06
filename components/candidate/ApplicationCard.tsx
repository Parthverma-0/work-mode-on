'use client'

import Image from 'next/image'
import { formatDistanceToNowStrict } from 'date-fns'
import type { ApplicationWithJob } from '@/lib/candidate-types'
import { normalizeCompany } from '@/lib/candidate-utils'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type ApplicationCardProps = {
  application: ApplicationWithJob
  onOpenDetail: () => void
}

const statusStyles: Record<
  string,
  { label: string; className: string }
> = {
  submitted: {
    label: 'Submitted',
    className: 'bg-[#F3F4F6] text-[#4B5563] border-transparent',
  },
  viewed: {
    label: 'Viewed',
    className: 'bg-[#EFF6FF] text-[#1D4ED8] border-transparent',
  },
  shortlisted: {
    label: 'Shortlisted 🎉',
    className: 'bg-[#ECFDF5] text-[#047857] border-transparent',
  },
  rejected: {
    label: 'Not Selected',
    className: 'bg-[#FEF2F2] text-[#B91C1C] border-transparent',
  },
}

export function ApplicationCard({ application, onOpenDetail }: ApplicationCardProps) {
  const job = application.jobs
  if (!job) return null

  const company = normalizeCompany(job)
  const st = statusStyles[application.status] ?? statusStyles.submitted

  const appliedLabel = application.applied_at
    ? `Applied ${formatDistanceToNowStrict(new Date(application.applied_at), { addSuffix: true })}`
    : 'Applied recently'

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
        'cursor-pointer rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all',
        'hover:border-[#4F46E5]/20 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4F46E5]',
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 gap-4">
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
          <div className="min-w-0">
            <p className="text-xs font-medium text-[#6B7280]">{company.company_name}</p>
            <h3 className="mt-0.5 font-semibold text-[#0A0A0A]">{job.title}</h3>
            <p className="mt-1 text-xs text-[#9CA3AF]">{appliedLabel}</p>
          </div>
        </div>
        <Badge variant="outline" className={cn('shrink-0 rounded-md border px-2.5 py-0.5 text-xs font-medium', st.className)}>
          {st.label}
        </Badge>
      </div>
    </article>
  )
}
