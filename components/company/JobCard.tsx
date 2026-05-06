'use client'

import Link from 'next/link'
import { formatDistanceToNowStrict } from 'date-fns'
import { Pencil, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import type { JobWithApplicantCount } from '@/lib/company-types'
import { formatStipend } from '@/lib/candidate-utils'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

type JobCardProps = {
  job: JobWithApplicantCount
  onUpdated: () => void
}

export function JobCard({ job, onUpdated }: JobCardProps) {
  const applicants = job.applicant_count ?? 0

  async function toggleActive(next: boolean) {
    await supabase.from('jobs').update({ is_active: next }).eq('id', job.id)
    onUpdated()
  }

  async function softDelete() {
    await supabase.from('jobs').update({ is_active: false }).eq('id', job.id)
    onUpdated()
  }

  const posted =
    job.posted_at &&
    `${formatDistanceToNowStrict(new Date(job.posted_at), { addSuffix: false })} ago`

  return (
    <article
      className={cn(
        'rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow',
        job.is_active === false && 'opacity-75',
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold tracking-tight text-[#0A0A0A]">{job.title}</h3>
            <Badge variant="secondary" className="rounded-md bg-[#F3F4F6] font-normal">
              {job.type}
            </Badge>
            <Badge variant="secondary" className="rounded-md bg-[#EEF2FF] font-normal text-[#4338CA]">
              {job.mode}
            </Badge>
          </div>
          <p className="text-sm text-[#6B7280]">
            {job.location ?? 'Location not set'} · {formatStipend(job.stipend_min, job.stipend_max)}
          </p>
          <p className="text-xs text-[#9CA3AF]">Posted {posted ?? 'recently'}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F4F6] px-3 py-1 text-xs font-medium text-[#374151]">
            <Users className="size-3.5" aria-hidden />
            {applicants} applicant{applicants !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#6B7280]">Active</span>
            <Switch
              checked={job.is_active !== false}
              onCheckedChange={(v) => toggleActive(v)}
              aria-label="Toggle job active"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-50 pt-4">
        <Button variant="outline" size="sm" className="rounded-lg" asChild>
          <Link href={`/company/applicants?job_id=${job.id}`}>View applicants</Link>
        </Button>
        <Button variant="outline" size="sm" className="rounded-lg" asChild>
          <Link href={`/company/jobs/${job.id}/edit`}>
            <Pencil className="mr-1 size-3.5" aria-hidden />
            Edit
          </Link>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="rounded-lg text-[#EF4444] hover:bg-red-50">
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Deactivate this listing?</AlertDialogTitle>
              <AlertDialogDescription>
                Candidates won&apos;t see inactive jobs. You can turn it back on from edit anytime.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="rounded-lg bg-[#EF4444] hover:bg-red-600"
                onClick={() => softDelete()}
              >
                Deactivate
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </article>
  )
}
