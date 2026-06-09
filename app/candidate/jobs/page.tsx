'use client'

import { Briefcase, Search, SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ApplyModal } from '@/components/candidate/ApplyModal'
import { JobCard } from '@/components/candidate/JobCard'
import { JobDetailDrawer } from '@/components/candidate/JobDetailDrawer'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/AuthContext'
import { useCandidate } from '@/hooks/useCandidate'
import { useApplications } from '@/hooks/useApplications'
import { useJobs } from '@/hooks/useJobs'
import type { JobType, JobMode, JobWithCompany } from '@/lib/candidate-types'
import { cn } from '@/lib/utils'

const TYPE_FILTERS: { label: string; value: JobType | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Internship', value: 'internship' },
  { label: 'Full-time', value: 'full-time' },
  { label: 'Part-time', value: 'part-time' },
  { label: 'Freelance', value: 'freelance' },
]

const MODE_FILTERS: { label: string; value: JobMode | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Remote', value: 'remote' },
  { label: 'Onsite', value: 'onsite' },
  { label: 'Hybrid', value: 'hybrid' },
]

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'min-h-9 rounded-full px-4 text-xs font-semibold transition-all active:scale-[0.97]',
        active
          ? 'bg-[#4F46E5] text-white shadow-[0_4px_14px_rgba(79,70,229,0.28)]'
          : 'border border-black/[0.08] bg-white text-[#475569] hover:border-[#4F46E5]/30 hover:text-[#4338CA]',
      )}
    >
      {children}
    </button>
  )
}

export default function CandidateJobsPage() {
  const { user } = useAuth()
  const { candidate } = useCandidate(user?.id)
  const { applications, refresh: refreshApps } = useApplications(candidate?.id)

  const [search, setSearch] = useState('')
  const [type, setType] = useState<JobType | 'all'>('all')
  const [mode, setMode] = useState<JobMode | 'all'>('all')

  const { jobs, loading } = useJobs({ search, type, mode })

  const [drawerJob, setDrawerJob] = useState<JobWithCompany | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [applyJob, setApplyJob] = useState<JobWithCompany | null>(null)
  const [applyOpen, setApplyOpen] = useState(false)

  const appliedJobIds = useMemo(() => new Set(applications.map((a) => a.job_id)), [applications])

  function openApply(job: JobWithCompany) {
    setDrawerOpen(false)
    setApplyJob(job)
    setApplyOpen(true)
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Find work"
        eyebrowIcon={<Briefcase className="size-3.5" aria-hidden />}
        title="Browse jobs"
        description="Search live roles matched to your skills and preferences."
      />

      {/* Filter panel */}
      <div className="glass-panel space-y-5 rounded-2xl p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#94a3b8]" />
          <Input
            placeholder="Search by title or skill…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-h-12 rounded-xl bg-white/90 pl-10 text-[15px]"
            aria-label="Search jobs"
          />
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
            <SlidersHorizontal className="size-3.5" aria-hidden />
            Type
          </span>
          <div className="flex flex-wrap gap-2">
            {TYPE_FILTERS.map((f) => (
              <Pill key={f.label} active={type === f.value} onClick={() => setType(f.value)}>
                {f.label}
              </Pill>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
            <SlidersHorizontal className="size-3.5" aria-hidden />
            Mode
          </span>
          <div className="flex flex-wrap gap-2">
            {MODE_FILTERS.map((f) => (
              <Pill key={f.label} active={mode === f.value} onClick={() => setMode(f.value)}>
                {f.label}
              </Pill>
            ))}
          </div>
        </div>
      </div>

      {!loading && (
        <p className="-mb-3 text-sm text-[#64748b]">
          <span className="font-semibold text-[#0f172a]">{jobs.length}</span>{' '}
          {jobs.length === 1 ? 'role' : 'roles'} found
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-52 rounded-2xl bg-slate-100/90" />
            ))
          : jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                hasApplied={appliedJobIds.has(job.id)}
                onOpenDetail={() => {
                  setDrawerJob(job)
                  setDrawerOpen(true)
                }}
                onApply={() => openApply(job)}
              />
            ))}
      </div>

      {!loading && jobs.length === 0 && (
        <div className="glass-panel flex flex-col items-center justify-center rounded-3xl py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#4338CA]">
            <Search className="size-7" aria-hidden />
          </div>
          <p className="mt-5 text-lg font-semibold text-[#0f172a]">No jobs match your search</p>
          <p className="mt-2 max-w-sm text-sm text-[#64748b]">
            Try different keywords or clear filters to see more roles.
          </p>
        </div>
      )}

      <JobDetailDrawer
        job={drawerJob}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        hasApplied={drawerJob ? appliedJobIds.has(drawerJob.id) : false}
        onApply={() => drawerJob && openApply(drawerJob)}
      />

      {candidate && user && (
        <ApplyModal
          job={applyJob}
          open={applyOpen}
          onOpenChange={setApplyOpen}
          candidateProfileId={candidate.id}
          userId={user.id}
          onApplied={() => refreshApps()}
        />
      )}
    </div>
  )
}
