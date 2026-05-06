'use client'

import Link from 'next/link'
import { formatDistanceToNowStrict } from 'date-fns'
import {
  ArrowRight,
  Briefcase,
  ClipboardList,
  LayoutDashboard,
  LineChart,
  Users,
} from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { ApplicantCard } from '@/components/company/ApplicantCard'
import { CandidateDetailDrawer } from '@/components/company/CandidateDetailDrawer'
import { MessageModal } from '@/components/company/MessageModal'
import { StatCard } from '@/components/company/StatCard'
import { DashboardSection } from '@/components/dashboard/DashboardSection'
import { PageEnter } from '@/components/motion/PageEnter'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/context/AuthContext'
import { useApplicants } from '@/hooks/useApplicants'
import { useCompany } from '@/hooks/useCompany'
import { useCompanyJobs } from '@/hooks/useCompanyJobs'
import { formatStipend } from '@/lib/candidate-utils'
import type { ApplicationWithDetails } from '@/lib/company-types'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

export default function CompanyDashboardPage() {
  const { user } = useAuth()
  const reduceMotion = useReducedMotion()
  const { company, loading: companyLoading } = useCompany(user?.id)
  const { jobs, loading: jobsLoading } = useCompanyJobs(company?.id)
  const jobIds = useMemo(() => jobs.map((j) => j.id), [jobs])
  const { applications, loading: appsLoading, refresh: refreshApps } = useApplicants(jobIds)

  const [detailApp, setDetailApp] = useState<ApplicationWithDetails | null>(null)
  const [msgOpen, setMsgOpen] = useState(false)
  const [msgCtx, setMsgCtx] = useState<{
    receiverId: string
    name: string
    jobId: string | null
    jobTitle: string | null
  } | null>(null)

  const activeJobs = useMemo(() => jobs.filter((j) => j.is_active !== false), [jobs])
  const totalApplicants = applications.length
  const shortlisted = useMemo(
    () => applications.filter((a) => a.status === 'shortlisted').length,
    [applications],
  )
  const newToday = useMemo(() => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000
    return applications.filter((a) => {
      if (!a.applied_at) return false
      return new Date(a.applied_at).getTime() >= cutoff
    }).length
  }, [applications])

  const recentApplicants = applications.slice(0, 5)

  const statsLoading = companyLoading || jobsLoading || appsLoading

  return (
    <PageEnter className="space-y-12 pb-10">
      <section className="relative overflow-hidden rounded-3xl ring-1 ring-black/[0.05]">
        <div className="mesh-app-bg absolute inset-0 rounded-3xl" aria-hidden />
        <div className="dot-grid-subtle absolute inset-0 rounded-3xl opacity-60 mix-blend-multiply dark:opacity-40" aria-hidden />
        {!reduceMotion && (
          <>
            <motion.div
              className="absolute -top-28 right-[-10%] h-64 w-64 rounded-full bg-emerald-400/25 blur-[100px]"
              aria-hidden
              animate={{ opacity: [0.35, 0.6, 0.35], x: [0, 12, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute bottom-[-20%] left-[-15%] h-72 w-72 rounded-full bg-[#6366f1]/20 blur-[100px]"
              aria-hidden
              animate={{ opacity: [0.3, 0.55, 0.3] }}
              transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
            />
          </>
        )}

        <div className="relative flex flex-col gap-8 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-10">
          <div className="max-w-2xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0f766e] shadow-sm backdrop-blur-sm">
              <LayoutDashboard className="size-3.5" aria-hidden strokeWidth={2.5} /> Employer hub
            </div>
            {companyLoading ? (
              <Skeleton className="h-10 w-4/5 max-w-lg rounded-xl bg-white/55" />
            ) : (
              <h1 className="text-[1.75rem] font-semibold tracking-tight text-[#0f172a] sm:text-4xl">
                {company?.company_name ? (
                  <>
                    Welcome back,{' '}
                    <span className="bg-gradient-to-r from-[#0f766e] via-[#0f172a] to-[#4338CA] bg-clip-text text-transparent">
                      {company.company_name}
                    </span>
                  </>
                ) : (
                  <>Welcome — let&apos;s build your hiring pipeline.</>
                )}
              </h1>
            )}
            <p className="text-[15px] leading-relaxed text-[#475569] sm:text-base">
              Track applicant velocity, nurture shortlists, and keep live roles visible — all without leaving Work Mode.
            </p>
          </div>
          <motion.div
            className="glass-panel flex shrink-0 flex-col gap-3 rounded-2xl px-6 py-5 shadow-lg ring-1 ring-white/70 sm:w-[min(100%,260px)]"
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          >
            <p className="text-xs font-bold uppercase tracking-wider text-[#64748b]">Today&apos;s pulse</p>
            <div className="flex items-center gap-2 text-[#0f172a]">
              <LineChart className="size-5 text-[#4F46E5]" aria-hidden />
              <span className="text-2xl font-semibold tabular-nums">{statsLoading ? '—' : `${newToday} new`}</span>
              <span className="text-sm text-[#64748b]">in 24h</span>
            </div>
          </motion.div>
        </div>
      </section>

      <section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Active jobs" value={activeJobs.length} loading={statsLoading} />
          <StatCard title="Total applicants" value={totalApplicants} loading={statsLoading} />
          <StatCard title="Shortlisted" value={shortlisted} loading={statsLoading} />
          <StatCard title="New today" value={newToday} loading={statsLoading} />
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <motion.div
          whileHover={reduceMotion ? undefined : { y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        >
          <Button size="lg" className="h-12 rounded-xl bg-[#4F46E5] px-6 font-semibold shadow-lg shadow-[#4F46E5]/22 hover:bg-[#4338CA]" asChild>
            <Link href="/company/jobs/new">
              Post a new role
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </motion.div>
        <motion.div
          whileHover={reduceMotion ? undefined : { y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        >
          <Button size="lg" variant="outline" className="h-12 rounded-xl border-[#e2e8f0] bg-white/85 backdrop-blur-sm" asChild>
            <Link href="/company/candidates" className="inline-flex items-center gap-2">
              <Users className="size-4" />
              Browse talent
            </Link>
          </Button>
        </motion.div>
        <Button size="lg" variant="ghost" className="h-12 rounded-xl text-[#475569]" asChild>
          <Link href="/company/applicants" className="inline-flex items-center gap-2">
            <ClipboardList className="size-4" />
            Applicants inbox
          </Link>
        </Button>
      </div>

      <DashboardSection
        title="Recent applicants"
        description="Warm leads from your postings — react fast to win top candidates."
        action={
          <Link href="/company/applicants" className="text-sm font-semibold text-[#4F46E5] transition hover:text-[#4338CA]">
            View inbox
          </Link>
        }
      >
        {appsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[96px] w-full rounded-2xl bg-slate-100/90" />
            ))}
          </div>
        ) : recentApplicants.length === 0 ? (
          <div className="glass-panel rounded-2xl border border-dashed border-black/[0.07] px-8 py-14 text-center ring-1 ring-black/[0.03]">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#4338CA] shadow-inner ring-1 ring-[#4F46E5]/15">
              <Briefcase className="size-7" strokeWidth={1.75} aria-hidden />
            </div>
            <p className="mt-5 font-semibold text-[#0f172a]">No applications yet</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#64748b]">
              Publish a polished role description and applicants will funnel here instantly.
            </p>
            <Button className="mt-8 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA]" asChild>
              <Link href="/company/jobs/new">Craft your first listing</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentApplicants.map((a) => (
              <ApplicantCard
                key={a.id}
                application={a}
                compact
                onOpenDetail={() => setDetailApp(a)}
                onStatusChange={refreshApps}
                onMessage={(app) => {
                  const uid = app.candidate_profiles?.user_id
                  if (!uid) return
                  setMsgCtx({
                    receiverId: uid,
                    name: app.profiles?.full_name ?? 'Candidate',
                    jobId: app.job_id,
                    jobTitle: app.jobs?.title ?? null,
                  })
                  setMsgOpen(true)
                }}
              />
            ))}
          </div>
        )}
      </DashboardSection>

      <DashboardSection
        title="Active listings"
        description="Keep stipends, modes, and hiring goals aligned — edit anytime from Manage jobs."
        action={
          <Link href="/company/jobs" className="text-sm font-semibold text-[#4F46E5] transition hover:text-[#4338CA]">
            Manage pipeline
          </Link>
        }
      >
        {jobsLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-32 rounded-2xl bg-slate-100/90" />
            ))}
          </div>
        ) : activeJobs.length === 0 ? (
          <div className="glass-panel rounded-2xl border border-dashed border-black/[0.07] px-8 py-12 text-center ring-1 ring-black/[0.03]">
            <p className="text-sm font-medium text-[#0f172a]">Nothing live right now.</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-[#64748b]">
              Spin up a concise listing — we guide you through pay bands, modalities, and must-have skills.
            </p>
            <Button className="mt-6 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA]" asChild>
              <Link href="/company/jobs/new">Post your flagship role</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {activeJobs.map((job, idx) => {
              const count = job.applicant_count ?? 0
              const posted =
                job.posted_at &&
                `${formatDistanceToNowStrict(new Date(job.posted_at), { addSuffix: false })} ago`
              return (
                <motion.div
                  key={job.id}
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05, duration: 0.35 }}
                >
                  <Card className="group glass-panel overflow-hidden rounded-2xl border-0 shadow-none ring-1 ring-black/[0.04] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-lg">
                    <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold tracking-tight text-[#0f172a]">{job.title}</h3>
                          <Badge
                            variant="secondary"
                            className="rounded-lg border border-[#c7d2fe]/70 bg-[#eef2ff] font-normal text-[#4338CA]"
                          >
                            {job.mode}
                          </Badge>
                        </div>
                        <p className="text-xs uppercase tracking-wide text-[#94a3b8]">
                          Posted {posted ?? 'recently'}
                        </p>
                        <p className="text-sm text-[#475569]">{formatStipend(job.stipend_min, job.stipend_max)}</p>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-2">
                        <Badge variant="secondary" className={cn('rounded-full border-transparent bg-[#f1f5f9] font-medium text-[#334155]')}>
                          {count} applicant{count !== 1 ? 's' : ''}
                        </Badge>
                        <Button variant="outline" size="sm" className="rounded-xl border-[#e2e8f0]" asChild>
                          <Link href={`/company/applicants?job_id=${job.id}`}>Review</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </DashboardSection>

      <CandidateDetailDrawer
        open={!!detailApp}
        onOpenChange={(o) => !o && setDetailApp(null)}
        candidateProfile={detailApp?.candidate_profiles ?? null}
        profile={detailApp?.profiles ?? null}
        applicationResumeUrl={detailApp?.resume_url ?? null}
        jobTitle={detailApp?.jobs?.title ?? null}
        jobId={detailApp?.job_id ?? null}
        application={detailApp ? { id: detailApp.id, status: detailApp.status } : null}
        onApplicationUpdated={refreshApps}
        onRequestMessage={({ candidateUserId, jobId, jobTitle }) => {
          setMsgCtx({
            receiverId: candidateUserId,
            name: detailApp?.profiles?.full_name ?? 'Candidate',
            jobId,
            jobTitle,
          })
          setMsgOpen(true)
        }}
      />

      <MessageModal
        open={msgOpen}
        onOpenChange={(o) => {
          setMsgOpen(o)
          if (!o) setMsgCtx(null)
        }}
        receiverName={msgCtx?.name ?? ''}
        jobs={jobs.map((j) => ({ id: j.id, title: j.title }))}
        defaultJobId={msgCtx?.jobId ?? null}
        jobSubtitle={msgCtx?.jobTitle ?? undefined}
        onSend={async (content, jobId) => {
          if (!user?.id || !msgCtx?.receiverId) return { error: 'Missing user.' }
          const { error } = await supabase.from('messages').insert({
            sender_id: user.id,
            receiver_id: msgCtx.receiverId,
            job_id: jobId,
            content,
            is_read: false,
          })
          return { error: error?.message ?? null }
        }}
      />
    </PageEnter>
  )
}
