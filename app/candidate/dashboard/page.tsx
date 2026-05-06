'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { BookOpen, Handshake, Rocket } from 'lucide-react'
import { JobCard } from '@/components/candidate/JobCard'
import { JobDetailDrawer } from '@/components/candidate/JobDetailDrawer'
import { ApplyModal } from '@/components/candidate/ApplyModal'
import { CourseCard } from '@/components/candidate/CourseCard'
import { ProfileCompletionBar } from '@/components/candidate/ProfileCompletionBar'
import { StatCard } from '@/components/candidate/StatCard'
import { DashboardSection } from '@/components/dashboard/DashboardSection'
import { PageEnter } from '@/components/motion/PageEnter'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/context/AuthContext'
import { useCandidate } from '@/hooks/useCandidate'
import { useApplications } from '@/hooks/useApplications'
import { supabase } from '@/lib/supabase'
import type { CourseRow, JobWithCompany } from '@/lib/candidate-types'
import { profileCompletionPercent } from '@/lib/candidate-utils'

function EmptyInsight({ icon: Icon, title, body }: { icon: typeof Rocket; title: string; body: string }) {
  return (
    <div className="glass-panel rounded-2xl border border-dashed border-black/[0.08] px-8 py-14 text-center ring-1 ring-black/[0.03]">
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#4338CA] shadow-inner ring-1 ring-[#4F46E5]/15">
        <Icon className="size-7" strokeWidth={1.75} aria-hidden />
      </div>
      <p className="mt-5 font-semibold text-[#0f172a]">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-[#64748b]">{body}</p>
    </div>
  )
}

export default function CandidateDashboardPage() {
  const { user, profile } = useAuth()
  const reduceMotion = useReducedMotion()
  const { candidate, loading: candLoading } = useCandidate(user?.id)
  const { applications, loading: appsLoading, refresh: refreshApps } = useApplications(candidate?.id)

  const [recentJobs, setRecentJobs] = useState<JobWithCompany[]>([])
  const [jobsLoading, setJobsLoading] = useState(true)
  const [courses, setCourses] = useState<CourseRow[]>([])
  const [coursesLoading, setCoursesLoading] = useState(true)

  const [drawerJob, setDrawerJob] = useState<JobWithCompany | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [applyJob, setApplyJob] = useState<JobWithCompany | null>(null)
  const [applyOpen, setApplyOpen] = useState(false)

  const appliedJobIds = useMemo(() => new Set(applications.map((a) => a.job_id)), [applications])

  const firstName =
    profile?.full_name?.split(/\s+/)[0] ??
    profile?.full_name ??
    user?.email?.split('@')[0] ??
    'there'

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setJobsLoading(true)
      const { data, error } = await supabase
        .from('jobs')
        .select(
          `
          id,
          company_id,
          title,
          type,
          description,
          skills_required,
          location,
          mode,
          stipend_min,
          stipend_max,
          is_active,
          posted_at,
          company_profiles ( company_name, logo_url )
        `,
        )
        .eq('is_active', true)
        .order('posted_at', { ascending: false })
        .limit(4)

      if (!cancelled) {
        if (!error && data) setRecentJobs(data as JobWithCompany[])
        else setRecentJobs([])
        setJobsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setCoursesLoading(true)
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, provider, url, affiliate_url, skills_covered, level, is_featured')
        .eq('is_featured', true)
        .limit(6)

      if (!cancelled) {
        if (!error && data) setCourses((data as CourseRow[]).slice(0, 3))
        else setCourses([])
        setCoursesLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  function openJob(job: JobWithCompany) {
    setDrawerJob(job)
    setDrawerOpen(true)
  }

  function openApply(job: JobWithCompany) {
    setDrawerOpen(false)
    setApplyJob(job)
    setApplyOpen(true)
  }

  const shortlisted = applications.filter((a) => a.status === 'shortlisted').length
  const completion = candidate ? profileCompletionPercent(candidate) : candLoading ? 0 : 0

  const subtitle = candidate?.open_to_work
    ? "You're visible to hiring teams — keep your headline and skills current so recruiters reach out."
    : 'Toggle Open to Work in your profile to surface in recruiter search and inbound messages.'

  return (
    <PageEnter className="space-y-12 pb-4">
      <section className="relative overflow-hidden rounded-3xl ring-1 ring-black/[0.05]">
        <div className="mesh-app-bg absolute inset-0 rounded-3xl" aria-hidden />
        <div className="dot-grid-subtle absolute inset-0 rounded-3xl opacity-70" aria-hidden />
        {!reduceMotion && (
          <>
            <motion.div
              className="absolute -left-24 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-[#4F46E5]/15 blur-[100px]"
              aria-hidden
              animate={{ opacity: [0.4, 0.65, 0.4], scale: [1, 1.05, 1] }}
              transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute -right-16 bottom-0 h-40 w-40 rounded-full bg-[#818CF8]/20 blur-[72px]"
              aria-hidden
              animate={{ opacity: [0.35, 0.55, 0.35] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
            />
          </>
        )}

        <div className="relative flex flex-col gap-8 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#4338CA] shadow-sm backdrop-blur-sm">
              <Rocket className="size-3.5" aria-hidden strokeWidth={2.5} /> Candidate workspace
            </div>
            <h1 className="text-[1.75rem] font-semibold tracking-tight text-[#0f172a] sm:text-4xl">
              Hey {firstName},{' '}
              <span className="gradient-text-indigo">let&apos;s find your edge</span>
            </h1>
            <p className="text-[15px] leading-relaxed text-[#475569] sm:text-base">{subtitle}</p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Button size="lg" className="rounded-xl bg-[#4F46E5] px-6 font-semibold shadow-lg shadow-[#4F46E5]/22 hover:bg-[#4338CA]" asChild>
                <Link href="/candidate/profile">Finish profile details</Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-xl border-[#e2e8f0] bg-white/85 backdrop-blur-sm" asChild>
                <Link href="/candidate/jobs">Browse all jobs</Link>
              </Button>
            </div>
          </div>
          <motion.div
            className="glass-panel relative flex shrink-0 flex-col gap-4 rounded-2xl px-8 py-7 shadow-lg ring-1 ring-white/80 sm:w-[min(100%,340px)]"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          >
            <div className="flex items-start gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-[#eef2ff] text-[#4338CA]">
                <Handshake className="size-6" strokeWidth={2} aria-hidden />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0f172a]">Momentum tips</p>
                <ul className="mt-3 space-y-2.5 text-sm text-[#64748b]">
                  <li>• Refresh skills after every sprint or internship.</li>
                  <li>• Tailor your headline to the roles you dream about.</li>
                  <li>• Résumé uploads unlock richer applicant threads.</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <ProfileCompletionBar percent={completion} />

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Jobs applied"
          value={appsLoading ? '—' : applications.length}
          loading={appsLoading}
        />
        <StatCard title="Profile views" value="—" loading={false} />
        <StatCard title="Shortlisted" value={appsLoading ? '—' : shortlisted} loading={appsLoading} />
      </section>

      <DashboardSection
        title="Recent jobs"
        description="Live roles from teams hiring through Work Mode — tap a card to read the full brief."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {jobsLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-52 rounded-2xl bg-slate-100/90" />
              ))
            : recentJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  hasApplied={appliedJobIds.has(job.id)}
                  onOpenDetail={() => openJob(job)}
                  onApply={() => openApply(job)}
                />
              ))}
        </div>
        {!jobsLoading && recentJobs.length === 0 && (
          <EmptyInsight
            icon={Rocket}
            title="No listings live yet"
            body="We’re onboarding more companies every week. Check back soon or widen your search from the jobs tab."
          />
        )}
      </DashboardSection>

      <DashboardSection
        title="Recommended courses"
        description="Curated picks to sharpen the skills employers filter on."
        action={
          <Button variant="ghost" size="sm" className="rounded-lg text-[#4338CA] hover:bg-[#eef2ff]" asChild>
            <Link href="/candidate/courses">See library</Link>
          </Button>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          {coursesLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-2xl bg-slate-100/90" />
              ))
            : courses.map((c) => <CourseCard key={c.id} course={c} featured />)}
        </div>
        {!coursesLoading && courses.length === 0 && (
          <EmptyInsight
            icon={BookOpen}
            title="Courses land here soon"
            body="We’re curating partner programs. Meanwhile, keep your profile polished so you’re first in line."
          />
        )}
      </DashboardSection>

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
    </PageEnter>
  )
}
