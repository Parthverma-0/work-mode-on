'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import type { CandidateProfileLite, ProfileLite } from '@/lib/company-types'
import type { SwipeApplicant } from '@/lib/swipe-types'

// Applications still awaiting a decision from the company.
const PENDING_STATUSES = ['submitted', 'viewed']
const MAX_DECK = 100

type LastDecision = { applicant: SwipeApplicant; prevStatus: string }

/**
 * Company applicant-review deck: shows only candidates who applied to this
 * company's jobs (one card per application). Swiping right shortlists the
 * application, left rejects it — the decision is the application's status.
 */
export function useCandidateSwipes(companyProfileId: string | undefined) {
  const [deck, setDeck] = useState<SwipeApplicant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastDecision, setLastDecision] = useState<LastDecision | null>(null)

  const load = useCallback(async () => {
    if (!companyProfileId) {
      setDeck([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { data: jobRows, error: jobErr } = await supabase
        .from('jobs')
        .select('id, title')
        .eq('company_id', companyProfileId)
      if (jobErr) throw new Error(jobErr.message)

      const jobIds = (jobRows ?? []).map((j) => j.id as string)
      if (!jobIds.length) {
        setDeck([])
        setLoading(false)
        return
      }
      const jobTitle = new Map((jobRows ?? []).map((j) => [j.id as string, j.title as string]))

      const { data: apps, error: appErr } = await supabase
        .from('applications')
        .select(
          `
          id,
          job_id,
          status,
          cover_note,
          applied_at,
          candidate_profiles (
            id, user_id, headline, skills, college, graduation_year,
            resume_url, portfolio_url, city, course, open_to_work, bio
          )
        `,
        )
        .in('job_id', jobIds)
        .in('status', PENDING_STATUSES)
        .order('applied_at', { ascending: true })
        .limit(MAX_DECK)
      if (appErr) throw new Error(appErr.message)

      const rows = apps ?? []

      const userIds = [
        ...new Set(
          rows
            .map((r) => {
              const cp = Array.isArray(r.candidate_profiles)
                ? r.candidate_profiles[0]
                : r.candidate_profiles
              return (cp as CandidateProfileLite | null)?.user_id
            })
            .filter(Boolean),
        ),
      ] as string[]

      let profMap = new Map<string, ProfileLite>()
      if (userIds.length) {
        const { data: profs } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds)
        profMap = new Map((profs ?? []).map((p) => [p.id as string, p as ProfileLite]))
      }

      const applicants: SwipeApplicant[] = rows
        .map((r) => {
          const cp = (
            Array.isArray(r.candidate_profiles) ? r.candidate_profiles[0] : r.candidate_profiles
          ) as CandidateProfileLite | null
          if (!cp) return null
          return {
            id: r.id as string,
            jobId: r.job_id as string,
            jobTitle: jobTitle.get(r.job_id as string) ?? null,
            status: r.status as string,
            coverNote: (r.cover_note as string | null) ?? null,
            candidate: cp,
            profile: cp.user_id ? profMap.get(cp.user_id) ?? null : null,
          } satisfies SwipeApplicant
        })
        .filter((a): a is SwipeApplicant => a !== null)

      setDeck(applicants)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load applicants')
      setDeck([])
    }
    setLoading(false)
  }, [companyProfileId])

  useEffect(() => {
    load()
  }, [load])

  const popTop = useCallback((id: string) => {
    setDeck((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const decide = useCallback(
    async (applicant: SwipeApplicant, status: 'shortlisted' | 'rejected') => {
      const { error: upErr } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', applicant.id)
      if (upErr) throw new Error(upErr.message)
    },
    [],
  )

  const swipeLeft = useCallback(
    async (applicant: SwipeApplicant) => {
      try {
        await decide(applicant, 'rejected')
        setLastDecision({ applicant, prevStatus: applicant.status })
        popTop(applicant.id)
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Could not update application')
      }
    },
    [decide, popTop],
  )

  const swipeRight = useCallback(
    async (applicant: SwipeApplicant, onMatch?: (a: SwipeApplicant) => void) => {
      try {
        await decide(applicant, 'shortlisted')
        setLastDecision({ applicant, prevStatus: applicant.status })
        popTop(applicant.id)
        // The deck only contains candidates who already applied, so a shortlist is
        // always a mutual match — fire the match moment.
        onMatch?.(applicant)
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Could not update application')
      }
    },
    [decide, popTop],
  )

  const undo = useCallback(async () => {
    if (!lastDecision) return
    try {
      await supabase
        .from('applications')
        .update({ status: lastDecision.prevStatus })
        .eq('id', lastDecision.applicant.id)
      setDeck((prev) => [lastDecision.applicant, ...prev])
      setLastDecision(null)
      toast.message('Decision undone')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not undo')
    }
  }, [lastDecision])

  return {
    deck,
    loading,
    error,
    canUndo: Boolean(lastDecision),
    swipeLeft,
    swipeRight,
    undo,
    refresh: load,
  }
}
