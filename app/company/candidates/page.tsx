'use client'

import { useMemo, useState } from 'react'
import { CandidateCard } from '@/components/company/CandidateCard'
import { CandidateDetailDrawer } from '@/components/company/CandidateDetailDrawer'
import { MessageModal } from '@/components/company/MessageModal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/context/AuthContext'
import { useCandidates } from '@/hooks/useCandidates'
import { useCompanyJobs } from '@/hooks/useCompanyJobs'
import type { CandidateSearchRow } from '@/lib/company-types'
import { useCompany } from '@/hooks/useCompany'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

export default function CompanyCandidatesPage() {
  const { user } = useAuth()
  const { company } = useCompany(user?.id)
  const { jobs } = useCompanyJobs(company?.id)
  const [search, setSearch] = useState('')
  const [skillFilter, setSkillFilter] = useState<string | null>(null)
  const [openOnly, setOpenOnly] = useState(false)
  const [detail, setDetail] = useState<CandidateSearchRow | null>(null)
  const [msgOpen, setMsgOpen] = useState(false)
  const [msgCtx, setMsgCtx] = useState<{
    receiverId: string
    name: string
    jobId: string | null
    jobTitle: string | null
  } | null>(null)

  const { candidates, loading, hasMore, loadMore, filteredTotal, skillOptions } = useCandidates({
    search,
    skill: skillFilter,
    openToWorkOnly: openOnly,
  })

  const profForDetail = detail
    ? Array.isArray(detail.profiles)
      ? detail.profiles[0]
      : detail.profiles
    : null

  const emptyMessage = useMemo(() => {
    if (openOnly && skillFilter) return 'No candidates match open-to-work and this skill.'
    if (openOnly) return 'No open-to-work candidates match your filters.'
    if (skillFilter) return 'No candidates with this skill.'
    if (search.trim()) return 'No candidates match your search.'
    return 'No candidates loaded yet.'
  }, [openOnly, skillFilter, search])

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#0A0A0A]">Find candidates</h1>
        <p className="mt-1 text-sm text-[#6B7280]">Search by name, headline, or skills.</p>
      </div>

      <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-6">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, headline, skills…"
          className="rounded-lg border-gray-200"
        />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Switch id="otw" checked={openOnly} onCheckedChange={setOpenOnly} />
            <Label htmlFor="otw" className="cursor-pointer text-sm font-medium text-[#374151]">
              Open to work only
            </Label>
          </div>
          <p className="text-xs text-[#9CA3AF]">
            Showing {candidates.length} of {filteredTotal}
          </p>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">Skills</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSkillFilter(null)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                skillFilter === null
                  ? 'bg-[#4F46E5] text-white'
                  : 'bg-[#F3F4F6] text-[#4B5563] hover:bg-gray-200',
              )}
            >
              All skills
            </button>
            {skillOptions.slice(0, 24).map((sk) => (
              <button
                key={sk}
                type="button"
                onClick={() => setSkillFilter(sk === skillFilter ? null : sk)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                  skillFilter === sk
                    ? 'bg-[#4F46E5] text-white'
                    : 'bg-[#F3F4F6] text-[#4B5563] hover:bg-gray-200',
                )}
              >
                {sk}
              </button>
            ))}
            {skillOptions.length > 24 ? (
              <Badge variant="secondary" className="rounded-full font-normal">
                +{skillOptions.length - 24} more — refine with search
              </Badge>
            ) : null}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : candidates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-[#FAFAFA] py-16 text-center text-sm text-[#6B7280]">
          {emptyMessage}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {candidates.map((c) => (
              <CandidateCard
                key={c.id}
                candidate={c}
                onView={() => setDetail(c)}
                onMessage={() => {
                  setMsgCtx({
                    receiverId: c.user_id,
                    name: (Array.isArray(c.profiles) ? c.profiles[0] : c.profiles)?.full_name ?? 'Candidate',
                    jobId: null,
                    jobTitle: null,
                  })
                  setMsgOpen(true)
                }}
              />
            ))}
          </div>
          {hasMore ? (
            <div className="flex justify-center pt-4">
              <Button variant="outline" className="rounded-lg border-gray-200" onClick={() => loadMore()}>
                Load more
              </Button>
            </div>
          ) : null}
        </>
      )}

      <CandidateDetailDrawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        candidateProfile={detail}
        profile={profForDetail}
        applicationResumeUrl={detail?.resume_url ?? null}
        onRequestMessage={({ candidateUserId, jobId, jobTitle }) => {
          setMsgCtx({
            receiverId: candidateUserId,
            name: profForDetail?.full_name ?? 'Candidate',
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
