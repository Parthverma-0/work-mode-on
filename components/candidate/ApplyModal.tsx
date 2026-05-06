'use client'

import { CheckCircle2, Loader2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase'
import { uploadCandidateResumeBlob } from '@/lib/upload-resume-client'
import type { JobWithCompany } from '@/lib/candidate-types'
import { normalizeCompany } from '@/lib/candidate-utils'

type ApplyModalProps = {
  job: JobWithCompany | null
  open: boolean
  onOpenChange: (open: boolean) => void
  candidateProfileId: string
  userId: string
  onApplied?: () => void
}

function resumeDisplayName(url: string | null): string {
  if (!url) return 'No resume on file'
  try {
    const u = new URL(url)
    const last = u.pathname.split('/').pop()
    if (last) return decodeURIComponent(last)
  } catch {
    /* stored path */
  }
  const parts = url.split('/')
  return decodeURIComponent(parts[parts.length - 1] || 'Resume')
}

export function ApplyModal({
  job,
  open,
  onOpenChange,
  candidateProfileId,
  userId,
  onApplied,
}: ApplyModalProps) {
  const [coverNote, setCoverNote] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [existingResumeUrl, setExistingResumeUrl] = useState<string | null>(null)
  const [alreadyApplied, setAlreadyApplied] = useState(false)

  const company = job ? normalizeCompany(job) : { company_name: '', logo_url: null }

  const checkDuplicateAndResume = useCallback(async () => {
    if (!job?.id || !candidateProfileId) return

    const [{ data: existing }, { data: cand }] = await Promise.all([
      supabase
        .from('applications')
        .select('id')
        .eq('job_id', job.id)
        .eq('candidate_id', candidateProfileId)
        .maybeSingle(),
      supabase.from('candidate_profiles').select('resume_url').eq('id', candidateProfileId).maybeSingle(),
    ])

    setAlreadyApplied(Boolean(existing))
    setExistingResumeUrl((cand?.resume_url as string | null) ?? null)
  }, [job?.id, candidateProfileId])

  useEffect(() => {
    if (open && job) {
      setCoverNote('')
      setFile(null)
      setSuccess(false)
      checkDuplicateAndResume()
    }
  }, [open, job, checkDuplicateAndResume])

  async function handleSubmit() {
    if (!job || alreadyApplied || success) return

    setSubmitting(true)
    try {
      let resumeUrl = existingResumeUrl

      if (file) {
        resumeUrl = await uploadCandidateResumeBlob(file, userId)
        await supabase
          .from('candidate_profiles')
          .update({ resume_url: resumeUrl })
          .eq('id', candidateProfileId)
      }

      const { error } = await supabase.from('applications').insert({
        job_id: job.id,
        candidate_id: candidateProfileId,
        status: 'submitted',
        cover_note: coverNote.trim() || null,
        resume_url: resumeUrl ?? null,
      })

      if (error) throw new Error(error.message)

      setSuccess(true)
      toast.success('Application submitted!')
      onApplied?.()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  if (!job) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-xl border border-gray-100 bg-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-left text-lg font-semibold text-[#0A0A0A]">
            Apply to {job.title}
          </DialogTitle>
          <DialogDescription className="text-left text-sm text-[#6B7280]">
            at {company.company_name ?? 'Company'}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <CheckCircle2 className="size-14 text-[#10B981]" aria-hidden />
            <p className="text-center text-base font-medium text-[#0A0A0A]">Application submitted!</p>
            <Button
              type="button"
              variant="outline"
              className="mt-2 rounded-lg"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="cover">Cover note (optional)</Label>
              <Textarea
                id="cover"
                placeholder="Tell them why you're a great fit..."
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                rows={4}
                disabled={alreadyApplied}
                className="resize-none rounded-lg border-gray-200 text-[#374151] placeholder:text-[#9CA3AF]"
              />
            </div>

            <div className="space-y-2">
              <Label>Resume</Label>
              <p className="text-sm text-[#6B7280]">
                Current:{' '}
                <span className="font-medium text-[#0A0A0A]">{resumeDisplayName(existingResumeUrl)}</span>
              </p>
              <label className="flex min-h-[44px] cursor-pointer flex-col justify-center rounded-lg border border-dashed border-gray-200 px-4 py-3 text-sm text-[#6B7280] transition-colors hover:border-[#4F46E5]/40 hover:bg-[#FAFAFA]">
                <span>{file ? file.name : 'Upload a new resume (optional)'}</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="sr-only"
                  disabled={alreadyApplied}
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>

            <DialogFooter className="gap-2 sm:flex-col sm:space-x-0">
              <Button
                type="button"
                disabled={alreadyApplied || submitting}
                onClick={handleSubmit}
                className="min-h-11 w-full rounded-lg bg-[#4F46E5] hover:bg-[#4338CA]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                    Submitting…
                  </>
                ) : alreadyApplied ? (
                  'Applied ✓'
                ) : (
                  'Submit Application'
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
