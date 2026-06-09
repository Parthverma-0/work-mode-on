'use client'

import { useMemo, useState } from 'react'
import { ClipboardList } from 'lucide-react'
import { ApplicationCard } from '@/components/candidate/ApplicationCard'
import { JobDetailDrawer } from '@/components/candidate/JobDetailDrawer'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/context/AuthContext'
import { useCandidate } from '@/hooks/useCandidate'
import { useApplications } from '@/hooks/useApplications'
import type { ApplicationStatus, ApplicationWithJob, JobWithCompany } from '@/lib/candidate-types'
import { cn } from '@/lib/utils'

const TABS: { label: string; value: ApplicationStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'Viewed', value: 'viewed' },
  { label: 'Shortlisted', value: 'shortlisted' },
  { label: 'Rejected', value: 'rejected' },
]

export default function CandidateApplicationsPage() {
  const { user } = useAuth()
  const { candidate, loading: candLoading } = useCandidate(user?.id)
  const { applications, loading } = useApplications(candidate?.id)

  const [tab, setTab] = useState<ApplicationStatus | 'all'>('all')
  const [drawerJob, setDrawerJob] = useState<JobWithCompany | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: applications.length }
    for (const a of applications) c[a.status] = (c[a.status] ?? 0) + 1
    return c
  }, [applications])

  const filtered = useMemo(() => {
    if (tab === 'all') return applications
    return applications.filter((a) => a.status === tab)
  }, [applications, tab])

  function openDetail(app: ApplicationWithJob) {
    if (app.jobs) {
      setDrawerJob(app.jobs)
      setDrawerOpen(true)
    }
  }

  const busy = candLoading || loading

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Pipeline"
        eyebrowIcon={<ClipboardList className="size-3.5" aria-hidden />}
        title="My applications"
        description="Track where you stand in each hiring process."
      />

      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((t) => {
          const active = tab === t.value
          const count = counts[t.value] ?? 0
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => setTab(t.value)}
              className={cn(
                'inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all active:scale-[0.97]',
                active
                  ? 'bg-[#4F46E5] text-white shadow-[0_4px_14px_rgba(79,70,229,0.28)]'
                  : 'border border-black/[0.08] bg-white text-[#475569] hover:border-[#4F46E5]/30 hover:text-[#4338CA]',
              )}
            >
              {t.label}
              <span
                className={cn(
                  'inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold tabular-nums',
                  active ? 'bg-white/25 text-white' : 'bg-[#EEF2FF] text-[#4338CA]',
                )}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      <div className="space-y-3">
        {busy ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl bg-slate-100/90" />
          ))
        ) : filtered.length ? (
          filtered.map((app) => (
            <ApplicationCard key={app.id} application={app} onOpenDetail={() => openDetail(app)} />
          ))
        ) : (
          <div className="glass-panel flex flex-col items-center justify-center rounded-3xl py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#4338CA]">
              <ClipboardList className="size-7" aria-hidden />
            </div>
            <p className="mt-5 text-lg font-semibold text-[#0f172a]">Nothing here yet</p>
            <p className="mt-2 max-w-sm text-sm text-[#64748b]">
              {tab === 'all'
                ? 'Apply to jobs from Browse or Discover to see them tracked here.'
                : `No applications marked “${TABS.find((x) => x.value === tab)?.label}” yet.`}
            </p>
          </div>
        )}
      </div>

      <JobDetailDrawer job={drawerJob} open={drawerOpen} onOpenChange={setDrawerOpen} readOnly hasApplied />
    </div>
  )
}
