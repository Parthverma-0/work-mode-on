'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ApplicantCard } from '@/components/company/ApplicantCard'
import { CandidateDetailDrawer } from '@/components/company/CandidateDetailDrawer'
import { MessageModal } from '@/components/company/MessageModal'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/context/AuthContext'
import { useApplicants } from '@/hooks/useApplicants'
import { useCompany } from '@/hooks/useCompany'
import { useCompanyJobs } from '@/hooks/useCompanyJobs'
import type { ApplicationWithDetails } from '@/lib/company-types'
import { supabase } from '@/lib/supabase'

function ApplicantsInner() {
  const searchParams = useSearchParams()
  const jobIdFromUrl = searchParams.get('job_id')
  const { user } = useAuth()
  const { company, loading: companyLoading } = useCompany(user?.id)
  const { jobs, loading: jobsLoading } = useCompanyJobs(company?.id)
  const jobIds = useMemo(() => jobs.map((j) => j.id), [jobs])
  const { applications, loading: appsLoading, refresh: refreshApps } = useApplicants(jobIds)

  const [jobFilter, setJobFilter] = useState<string>('all')
  const [statusTab, setStatusTab] = useState<string>('all')
  const [detailApp, setDetailApp] = useState<ApplicationWithDetails | null>(null)
  const [msgOpen, setMsgOpen] = useState(false)
  const [msgCtx, setMsgCtx] = useState<{
    receiverId: string
    name: string
    jobId: string | null
    jobTitle: string | null
  } | null>(null)

  useEffect(() => {
    if (jobIdFromUrl && jobs.some((j) => j.id === jobIdFromUrl)) {
      setJobFilter(jobIdFromUrl)
    }
  }, [jobIdFromUrl, jobs])

  const filtered = useMemo(() => {
    let list = applications
    if (jobFilter !== 'all') list = list.filter((a) => a.job_id === jobFilter)
    if (statusTab !== 'all') list = list.filter((a) => a.status === statusTab)
    return list
  }, [applications, jobFilter, statusTab])

  const loading = companyLoading || jobsLoading || appsLoading

  function openMessage(app: ApplicationWithDetails) {
    const uid = app.candidate_profiles?.user_id
    if (!uid) return
    setMsgCtx({
      receiverId: uid,
      name: app.profiles?.full_name ?? 'Candidate',
      jobId: app.job_id,
      jobTitle: app.jobs?.title ?? null,
    })
    setMsgOpen(true)
  }

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#0A0A0A]">Applicants</h1>
        <p className="mt-1 text-sm text-[#6B7280]">Review profiles and move candidates through your pipeline.</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="space-y-2 sm:min-w-[220px]">
          <Label className="text-[#374151]">Job</Label>
          <Select value={jobFilter} onValueChange={setJobFilter}>
            <SelectTrigger className="rounded-lg border-gray-200">
              <SelectValue placeholder="Filter by job" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All jobs</SelectItem>
              {jobs.map((j) => (
                <SelectItem key={j.id} value={j.id}>
                  {j.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={statusTab} onValueChange={setStatusTab}>
        <TabsList className="h-auto max-w-full flex-wrap justify-start gap-1 rounded-xl bg-[#F3F4F6] p-1">
          {(['all', 'submitted', 'viewed', 'shortlisted', 'rejected'] as const).map((s) => (
            <TabsTrigger key={s} value={s} className="rounded-lg capitalize data-[state=active]:bg-white">
              {s === 'all' ? 'All' : s}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={statusTab} className="mt-6 outline-none">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="min-h-[200px] rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-[#FAFAFA] py-16 text-center text-sm text-[#6B7280]">
              No applicants for this filter.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filtered.map((a) => (
                <ApplicantCard
                  key={a.id}
                  application={a}
                  onOpenDetail={() => setDetailApp(a)}
                  onStatusChange={() => refreshApps()}
                  onMessage={openMessage}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CandidateDetailDrawer
        open={!!detailApp}
        onOpenChange={(o) => !o && setDetailApp(null)}
        candidateProfile={detailApp?.candidate_profiles ?? null}
        profile={detailApp?.profiles ?? null}
        applicationResumeUrl={detailApp?.resume_url ?? null}
        jobTitle={detailApp?.jobs?.title ?? null}
        jobId={detailApp?.job_id ?? null}
        application={detailApp ? { id: detailApp.id, status: detailApp.status } : null}
        onApplicationUpdated={() => refreshApps()}
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
    </div>
  )
}

export default function CompanyApplicantsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 py-8">
          <Skeleton className="h-10 w-48 rounded-lg bg-gray-100" />
          <Skeleton className="h-96 w-full rounded-xl bg-gray-100" />
        </div>
      }
    >
      <ApplicantsInner />
    </Suspense>
  )
}
