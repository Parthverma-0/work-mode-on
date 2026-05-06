'use client'

import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ApplyModal } from '@/components/candidate/ApplyModal'
import { JobCard } from '@/components/candidate/JobCard'
import { JobDetailDrawer } from '@/components/candidate/JobDetailDrawer'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#0A0A0A] md:text-3xl">Browse jobs</h1>
        <p className="mt-1 text-sm text-[#6B7280] md:text-base">
          Search roles matched to your skills and preferences.
        </p>
      </div>

      <div className="space-y-4 rounded-xl border border-gray-100 bg-[#FAFAFA]/80 p-4 shadow-sm md:p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
          <Input
            placeholder="Search by title or skill…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-h-11 rounded-lg border-gray-200 bg-white pl-10 text-[#0A0A0A] placeholder:text-[#9CA3AF]"
            aria-label="Search jobs"
          />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-[#6B7280]">Type</p>
          <div className="flex flex-wrap gap-2">
            {TYPE_FILTERS.map((f) => (
              <Button
                key={f.label}
                type="button"
                variant={type === f.value ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  'min-h-9 rounded-full px-4 text-xs font-medium',
                  type === f.value
                    ? 'bg-[#4F46E5] hover:bg-[#4338CA]'
                    : 'border-gray-200 bg-white text-[#374151]',
                )}
                onClick={() => setType(f.value)}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-[#6B7280]">Work mode</p>
          <div className="flex flex-wrap gap-2">
            {MODE_FILTERS.map((f) => (
              <Button
                key={f.label}
                type="button"
                variant={mode === f.value ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  'min-h-9 rounded-full px-4 text-xs font-medium',
                  mode === f.value
                    ? 'bg-[#4F46E5] hover:bg-[#4338CA]'
                    : 'border-gray-200 bg-white text-[#374151]',
                )}
                onClick={() => setMode(f.value)}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-52 rounded-xl bg-gray-100" />
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
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-[#FAFAFA] py-16 text-center">
          <p className="text-lg font-medium text-[#0A0A0A]">No jobs match your search</p>
          <p className="mt-2 max-w-sm text-sm text-[#6B7280]">
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
