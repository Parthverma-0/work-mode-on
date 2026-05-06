'use client'

import { formatDistanceToNowStrict } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { StatusDropdown } from '@/components/company/StatusDropdown'
import type { ApplicationStatus, ApplicationWithDetails } from '@/lib/company-types'
import { supabase } from '@/lib/supabase'

function initials(name: string | null | undefined) {
  if (!name?.trim()) return '?'
  const p = name.trim().split(/\s+/)
  return (p[0][0] + (p[1]?.[0] ?? '')).toUpperCase()
}

function statusBadgeClass(status: string) {
  switch (status) {
    case 'shortlisted':
      return 'bg-[#D1FAE5] text-[#065F46]'
    case 'rejected':
      return 'bg-red-50 text-[#B91C1C]'
    case 'viewed':
      return 'bg-[#EEF2FF] text-[#4338CA]'
    default:
      return 'bg-[#F3F4F6] text-[#374151]'
  }
}

type ApplicantCardProps = {
  application: ApplicationWithDetails
  compact?: boolean
  onOpenDetail: (application: ApplicationWithDetails) => void
  onStatusChange: () => void
  onMessage: (application: ApplicationWithDetails) => void
}

export function ApplicantCard({
  application,
  compact,
  onOpenDetail,
  onStatusChange,
  onMessage,
}: ApplicantCardProps) {
  const profile = application.profiles
  const cand = application.candidate_profiles
  const name = profile?.full_name ?? 'Candidate'
  const headline = cand?.headline ?? ''
  const skills = cand?.skills ?? []
  const visibleSkills = compact ? [] : skills.slice(0, 3)
  const more = compact ? 0 : Math.max(0, skills.length - visibleSkills.length)

  const applied =
    application.applied_at &&
    formatDistanceToNowStrict(new Date(application.applied_at), { addSuffix: true })

  async function handleStatus(next: ApplicationStatus) {
    await supabase.from('applications').update({ status: next }).eq('id', application.id)
    onStatusChange()
  }

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <Avatar className="size-11 shrink-0 rounded-xl border border-gray-100">
          <AvatarImage src={profile?.avatar_url ?? undefined} alt="" />
          <AvatarFallback className="rounded-xl bg-[#EEF2FF] text-xs font-semibold text-[#4338CA]">
            {initials(name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-[#0A0A0A]">{name}</p>
          {headline ? <p className="truncate text-sm text-[#6B7280]">{headline}</p> : null}
          <p className="mt-1 text-xs text-[#9CA3AF]">
            {application.jobs?.title ? <>Applied to {application.jobs.title}</> : 'Application'} · {applied ?? 'Recently'}
          </p>
        </div>
        <Badge className={`shrink-0 rounded-md border-0 font-normal capitalize ${statusBadgeClass(application.status)}`}>
          {application.status}
        </Badge>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="shrink-0 rounded-lg"
          onClick={() => onOpenDetail(application)}
        >
          View
        </Button>
      </div>
    )
  }

  return (
    <Card className="rounded-xl border border-gray-100 bg-white shadow-sm">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <Avatar className="size-12 shrink-0 rounded-xl border border-gray-100">
            <AvatarImage src={profile?.avatar_url ?? undefined} alt="" />
            <AvatarFallback className="rounded-xl bg-[#EEF2FF] text-sm font-semibold text-[#4338CA]">
              {initials(name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <h3 className="font-semibold text-[#0A0A0A]">{name}</h3>
              {headline ? <p className="text-sm text-[#6B7280]">{headline}</p> : null}
            </div>
            {visibleSkills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {visibleSkills.map((s) => (
                  <span key={s} className="rounded-md bg-[#F3F4F6] px-2 py-0.5 text-xs text-[#4B5563]">
                    {s}
                  </span>
                ))}
                {more > 0 ? (
                  <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-[#6B7280]">+{more} more</span>
                ) : null}
              </div>
            ) : null}
            <p className="text-xs text-[#9CA3AF]">
              {[cand?.college, cand?.graduation_year != null ? `Class of ${cand.graduation_year}` : '']
                .filter(Boolean)
                .join(' · ')}
            </p>
            <p className="text-sm text-[#6B7280]">
              Applied to <span className="font-medium text-[#0A0A0A]">{application.jobs?.title ?? 'Job'}</span>
              <span className="text-[#9CA3AF]"> · {applied ?? 'recently'}</span>
            </p>
            <div className="flex flex-wrap items-center gap-2 border-t border-gray-50 pt-4">
              <Badge className={`rounded-md border-0 font-normal capitalize ${statusBadgeClass(application.status)}`}>
                {application.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 border-t border-gray-50 pt-4 sm:flex-row sm:flex-wrap sm:items-center">
          <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={() => onOpenDetail(application)}>
            View profile
          </Button>
          <StatusDropdown value={application.status} onChange={(v) => handleStatus(v)} />
          <Button type="button" size="sm" className="rounded-lg bg-[#4F46E5] hover:bg-[#4338CA]" onClick={() => onMessage(application)}>
            Message
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
