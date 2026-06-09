'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  BookOpen,
  ClipboardList,
  Flame,
  MessageCircle,
  Rocket,
  Search,
} from 'lucide-react'
import { JobCard } from '@/components/candidate/JobCard'
import { JobDetailDrawer } from '@/components/candidate/JobDetailDrawer'
import { ApplyModal } from '@/components/candidate/ApplyModal'
import { CourseCard } from '@/components/candidate/CourseCard'
import { StatCard } from '@/components/candidate/StatCard'
import { DashboardSection } from '@/components/dashboard/DashboardSection'
import { MatchModal } from '@/components/swipe/MatchModal'
import { PageEnter } from '@/components/motion/PageEnter'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/context/AuthContext'
import { useCandidate } from '@/hooks/useCandidate'
import { useApplications } from '@/hooks/useApplications'
import { useMatchAlerts } from '@/hooks/useMatchAlerts'
import { supabase } from '@/lib/supabase'
import type { CourseRow, JobWithCompany } from '@/lib/candidate-types'
import { normalizeCompany, profileCompletionPercent } from '@/lib/candidate-utils'
import { cn } from '@/lib/utils'

function initials(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean)
  if (!p.length) return 'WMO'
  return ((p[0][0] ?? '') + (p[1]?.[0] ?? '')).toUpperCase()
}

function EmptyInsight({ icon: Icon, title, body }: { icon: typeof Rocket; title: string; body: string }) {
  return (
    <div className="glass-panel rounded-2xl border border-dashed border-black/[0.08] px-8 py-14 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#4338CA] shadow-inner ring-1 ring-[#4F46E5]/15">
        <Icon className="size-7" strokeWidth={1.75} aria-hidden />
      </div>
      <p className="mt-5 font-semibold text-[#0f172a]">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-[#64748b]">{body}</p>
    </div>
  )
}

function QuickAction({
  href,
  icon: Icon,
  label,
  sub,
  accent,
}: {
  href: string
  icon: typeof Rocket
  label: string
  sub: string
  accent?: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        'lift group flex items-center gap-3 rounded-2xl p-4',
        accent
          ? 'bg-gradient-to-br from-[#4F46E5] to-[#6366f1] text-white shadow-[0_8px_24px_rgba(79,70,229,0.28)]'
          : 'border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.05)]',
      )}
    >
      <div
        className={cn(
          'flex size-11 shrink-0 items-center justify-center rounded-xl',
          accent ? 'bg-white/20 text-white' : 'bg-[#EEF2FF] text-[#4338CA]',
        )}
      >
        <Icon className="size-5" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className={cn('text-sm font-semibold', accent ? 'text-white' : 'text-[#0f172a]')}>{label}</p>
        <p className={cn('truncate text-xs', accent ? 'text-white/80' : 'text-[#64748b]')}>{sub}</p>
      </div>
      <ArrowRight
        className={cn(
          'ml-auto size-4 shrink-0 transition-transform group-hover:translate-x-0.5',
          accent ? 'text-white/90' : 'text-[#94a3b8]',
        )}
        aria-hidden
      />
    </Link>
  )
}

export default function CandidateDashboardPage() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const reduceMotion = useReducedMotion()
  const { candidate, loading: candLoading } = useCandidate(user?.id)
  const { applications, loading: appsLoading, refresh: refreshApps } = useApplications(candidate?.id)
  const { pending: pendingMatches, acknowledge: acknowledgeMatch } = useMatchAlerts(user?.id, applications)
  const match = pendingMatches[0] ?? null
  const matchCompany = match?.jobs ? normalizeCompany(match.jobs) : null

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
          id, company_id, title, type, description, skills_required, location,
          mode, stipend_min, stipend_max, is_active, posted_at,
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
  const completion = candidate ? profileCompletionPercent(candidate) : 0
  const avatar = profile?.avatar_url ?? null

  return (
    <PageEnter className="space-y-8 pb-4">
      {/* Welcome banner */}
      <section className="glass-panel relative overflow-hidden rounded-3xl p-6 sm:p-8">
        <div className="dot-grid-subtle pointer-events-none absolute inset-0 rounded-3xl opacity-60" aria-hidden />
        {!reduceMotion && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-20 h-60 w-60 rounded-full bg-[#4F46E5]/12 blur-[90px]"
            animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.06, 1] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-[#EEF2FF] shadow-md ring-4 ring-white">
              {avatar ? (
                <Image src={avatar} alt="" fill className="object-cover" unoptimized />
              ) : (
                <div className="flex size-full items-center justify-center text-lg font-bold text-[#4338CA]">
                  {initials(profile?.full_name ?? firstName)}
                </div>
              )}
            </div>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#4338CA] shadow-sm backdrop-blur-sm">
                <Rocket className="size-3.5" strokeWidth={2.5} aria-hidden /> Candidate workspace
              </div>
              <h1 className="mt-3 text-[1.75rem] font-semibold tracking-tight text-[#0f172a] sm:text-4xl">
                Hey {firstName}, <span className="gradient-text-indigo">let&apos;s find your edge</span>
              </h1>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button className="rounded-xl px-5 font-semibold" asChild>
                  <Link href="/candidate/swipe">
                    <Flame className="mr-1.5 size-4" aria-hidden /> Start swiping
                  </Link>
                </Button>
                <Button variant="outline" className="rounded-xl bg-white/85 backdrop-blur-sm" asChild>
                  <Link href="/candidate/jobs">Browse all jobs</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Profile strength */}
          <Link
            href="/candidate/profile"
            className="lift w-full shrink-0 rounded-2xl bg-white/70 p-5 ring-1 ring-black/[0.05] md:w-56"
          >
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">
                Profile strength
              </span>
              <span className="text-2xl font-bold tabular-nums text-[#4338CA]">{completion}%</span>
            </div>
            <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-[#EEF2FF]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#4F46E5] to-[#6366f1] transition-[width] duration-500"
                style={{ width: `${completion}%` }}
              />
            </div>
            <p className="mt-2.5 inline-flex items-center gap-1 text-xs font-medium text-[#4338CA]">
              Complete your profile <ArrowRight className="size-3.5" aria-hidden />
            </p>
          </Link>
        </div>
      </section>

      {/* Quick actions */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <QuickAction href="/candidate/swipe" icon={Flame} label="Discover" sub="Swipe to apply" accent />
        <QuickAction href="/candidate/jobs" icon={Search} label="Browse jobs" sub="Search all roles" />
        <QuickAction
          href="/candidate/applications"
          icon={ClipboardList}
          label="Applications"
          sub={`${applications.length} submitted`}
        />
        <QuickAction href="/candidate/messages" icon={MessageCircle} label="Messages" sub="Recruiter chats" />
      </div>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Jobs applied" value={appsLoading ? '—' : applications.length} loading={appsLoading} />
        <StatCard title="Shortlisted" value={appsLoading ? '—' : shortlisted} loading={appsLoading} />
        <StatCard title="Profile strength" value={candLoading ? '—' : `${completion}%`} loading={candLoading} />
      </section>

      <DashboardSection
        title="Recent jobs"
        description="Live roles from teams hiring through Work Mode — tap a card to read the full brief."
        action={
          <Button variant="ghost" size="sm" className="rounded-lg text-[#4338CA] hover:bg-[#eef2ff]" asChild>
            <Link href="/candidate/jobs">View all</Link>
          </Button>
        }
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

      {match && (
        <MatchModal
          open
          onOpenChange={(open) => {
            if (!open) acknowledgeMatch(match.id)
          }}
          subtitle={`${matchCompany?.company_name ?? 'A company'} shortlisted you${
            match.jobs?.title ? ` for ${match.jobs.title}` : ''
          }. The recruiter can now reach you directly!`}
          leftName={profile?.full_name ?? 'You'}
          leftAvatar={profile?.avatar_url}
          rightName={matchCompany?.company_name ?? 'Company'}
          rightAvatar={matchCompany?.logo_url}
          primaryLabel="View application"
          onPrimary={() => {
            acknowledgeMatch(match.id)
            router.push('/candidate/applications')
          }}
          secondaryLabel="Nice!"
        />
      )}
    </PageEnter>
  )
}
