'use client'

import { useEffect, useState } from 'react'
import { ExternalLink, FileDown } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { ApplicationStatus, CandidateProfileLite, ProfileLite } from '@/lib/company-types'
import { resolveResumeDownloadUrl } from '@/lib/resume-access'
import { supabase } from '@/lib/supabase'

type CandidateDetailDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidateProfile: CandidateProfileLite | null
  profile: ProfileLite | null
  /** Application snapshot path/url when reviewing applicants */
  applicationResumeUrl?: string | null
  jobTitle?: string | null
  jobId?: string | null
  application?: { id: string; status: string } | null
  onApplicationUpdated?: () => void
  onRequestMessage?: (args: {
    candidateUserId: string
    jobId: string | null
    jobTitle: string | null
  }) => void
}

function initials(name: string | null | undefined) {
  if (!name?.trim()) return '?'
  const p = name.trim().split(/\s+/)
  return (p[0][0] + (p[1]?.[0] ?? '')).toUpperCase()
}

export function CandidateDetailDrawer({
  open,
  onOpenChange,
  candidateProfile,
  profile,
  applicationResumeUrl,
  jobTitle,
  jobId,
  application,
  onApplicationUpdated,
  onRequestMessage,
}: CandidateDetailDrawerProps) {
  const [resumeLoading, setResumeLoading] = useState(false)
  const [statusBusy, setStatusBusy] = useState(false)

  const name = profile?.full_name ?? 'Candidate'
  const headline = candidateProfile?.headline ?? ''
  const candidateUserId = candidateProfile?.user_id ?? ''

  useEffect(() => {
    if (!open || !application?.id || application.status !== 'submitted') return
    let cancelled = false
    ;(async () => {
      const { error } = await supabase
        .from('applications')
        .update({ status: 'viewed' })
        .eq('id', application.id)
      if (!cancelled && !error) onApplicationUpdated?.()
      if (error && !cancelled) toast.error(error.message)
    })()
    return () => {
      cancelled = true
    }
  }, [open, application?.id, application?.status, onApplicationUpdated])

  async function handleResumeDownload() {
    const url = applicationResumeUrl ?? candidateProfile?.resume_url ?? null
    setResumeLoading(true)
    const resolved = await resolveResumeDownloadUrl(url)
    setResumeLoading(false)
    if (resolved.error) {
      toast.error(resolved.error)
      return
    }
    if (resolved.url) window.open(resolved.url, '_blank', 'noopener,noreferrer')
    else toast.message('No resume on file.')
  }

  async function setApplicationStatus(next: ApplicationStatus) {
    if (!application?.id) return
    setStatusBusy(true)
    const { error } = await supabase.from('applications').update({ status: next }).eq('id', application.id)
    setStatusBusy(false)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success(next === 'shortlisted' ? 'Shortlisted' : next === 'rejected' ? 'Marked as rejected' : 'Updated')
    onApplicationUpdated?.()
  }

  const skills = candidateProfile?.skills ?? []

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full max-w-full flex-col gap-0 overflow-y-auto border-l border-gray-100 bg-white p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b border-gray-100 p-6 text-left">
          <div className="flex gap-4">
            <Avatar className="size-14 shrink-0 rounded-xl border border-gray-100">
              <AvatarImage src={profile?.avatar_url ?? undefined} alt="" className="object-cover" />
              <AvatarFallback className="rounded-xl bg-[#EEF2FF] text-sm font-semibold text-[#4338CA]">
                {initials(name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 space-y-1">
              <SheetTitle className="text-lg leading-tight text-[#0A0A0A]">{name}</SheetTitle>
              {headline ? (
                <SheetDescription className="text-sm leading-snug text-[#6B7280]">{headline}</SheetDescription>
              ) : null}
              {candidateProfile?.open_to_work ? (
                <Badge className="mt-2 w-fit rounded-md border-0 bg-[#D1FAE5] font-normal text-[#065F46]">
                  Open to work
                </Badge>
              ) : null}
              {jobTitle ? (
                <p className="pt-1 text-xs text-[#9CA3AF]">
                  Applied for <span className="font-medium text-[#6B7280]">{jobTitle}</span>
                </p>
              ) : null}
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 space-y-6 p-6">
          {skills.length > 0 ? (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">Skills</p>
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="rounded-md bg-[#F3F4F6] px-2.5 py-1 text-xs font-medium text-[#374151]"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="grid gap-3 text-sm">
            {(candidateProfile?.college || candidateProfile?.course || candidateProfile?.graduation_year) && (
              <div className="rounded-xl border border-gray-100 bg-[#FAFAFA] p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">Education</p>
                <p className="mt-1 text-[#0A0A0A]">
                  {[candidateProfile.college, candidateProfile.course].filter(Boolean).join(' · ')}
                  {candidateProfile.graduation_year != null ? ` · Class of ${candidateProfile.graduation_year}` : ''}
                </p>
              </div>
            )}
            {candidateProfile?.city ? (
              <div className="rounded-xl border border-gray-100 bg-[#FAFAFA] p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">City</p>
                <p className="mt-1 text-[#0A0A0A]">{candidateProfile.city}</p>
              </div>
            ) : null}
          </div>

          {candidateProfile?.bio?.trim() ? (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">Bio</p>
              <p className="text-sm leading-relaxed text-[#374151]">{candidateProfile.bio.trim()}</p>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-lg border-gray-200"
              disabled={resumeLoading}
              onClick={() => handleResumeDownload()}
            >
              <FileDown className="mr-2 size-4" aria-hidden />
              {resumeLoading ? 'Preparing…' : 'Download resume'}
            </Button>
            {candidateProfile?.portfolio_url?.startsWith('http') ? (
              <Button variant="outline" className="rounded-lg border-gray-200" asChild>
                <a href={candidateProfile.portfolio_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 size-4" aria-hidden />
                  Portfolio
                </a>
              </Button>
            ) : null}
          </div>
        </div>

        <SheetFooter className="flex-col gap-2 border-t border-gray-100 bg-[#FAFAFA] p-4 sm:flex-col">
          {candidateUserId && onRequestMessage ? (
            <Button
              type="button"
              className="w-full rounded-lg bg-[#4F46E5] hover:bg-[#4338CA]"
              onClick={() =>
                onRequestMessage({
                  candidateUserId,
                  jobId: jobId ?? null,
                  jobTitle: jobTitle ?? null,
                })
              }
            >
              Message candidate
            </Button>
          ) : null}
          {application?.id ? (
            <div className="grid w-full grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-lg border-[#10B981]/30 text-[#059669] hover:bg-emerald-50"
                disabled={statusBusy}
                onClick={() => setApplicationStatus('shortlisted')}
              >
                Shortlist
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-lg border-[#EF4444]/30 text-[#DC2626] hover:bg-red-50"
                disabled={statusBusy}
                onClick={() => setApplicationStatus('rejected')}
              >
                Reject
              </Button>
            </div>
          ) : null}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
