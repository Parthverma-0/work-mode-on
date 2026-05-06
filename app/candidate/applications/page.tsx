'use client'

import { useMemo, useState } from 'react'
import { ApplicationCard } from '@/components/candidate/ApplicationCard'
import { JobDetailDrawer } from '@/components/candidate/JobDetailDrawer'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#0A0A0A] md:text-3xl">
          My applications
        </h1>
        <p className="mt-1 text-sm text-[#6B7280]">Track where you are in each hiring process.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((t) => (
          <Button
            key={t.value}
            type="button"
            variant={tab === t.value ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'shrink-0 rounded-full px-4 text-xs font-medium',
              tab === t.value ? 'bg-[#4F46E5] hover:bg-[#4338CA]' : 'border-gray-200 bg-white',
            )}
            onClick={() => setTab(t.value)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {candLoading || loading ? (
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl bg-gray-100" />)
        ) : filtered.length ? (
          filtered.map((app) => <ApplicationCard key={app.id} application={app} onOpenDetail={() => openDetail(app)} />)
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-[#FAFAFA] py-16 text-center">
            <p className="font-medium text-[#0A0A0A]">Nothing here yet</p>
            <p className="mt-2 text-sm text-[#6B7280]">
              {tab === 'all'
                ? 'Apply to jobs from Browse to see them listed here.'
                : `No applications with status “${TABS.find((x) => x.value === tab)?.label}”.`}
            </p>
          </div>
        )}
      </div>

      <JobDetailDrawer
        job={drawerJob}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        readOnly
        hasApplied
      />
    </div>
  )
}
