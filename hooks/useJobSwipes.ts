'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import type { SwipeDirection, SwipeJob } from '@/lib/swipe-types'

const BATCH_SIZE = 20
const PRELOAD_THRESHOLD = 3

type LastJobSwipe = {
  job: SwipeJob
  swipeId: string
  direction: SwipeDirection
  applied: boolean
  applicationId?: string
}

export function useJobSwipes(candidateProfileId: string | undefined) {
  const [deck, setDeck] = useState<SwipeJob[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchingMore, setFetchingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastSwipe, setLastSwipe] = useState<LastJobSwipe | null>(null)
  const [resumeUrl, setResumeUrl] = useState<string | null>(null)
  const deckRef = useRef(deck)
  deckRef.current = deck

  useEffect(() => {
    if (!candidateProfileId) {
      setResumeUrl(null)
      return
    }
    supabase
      .from('candidate_profiles')
      .select('resume_url')
      .eq('id', candidateProfileId)
      .maybeSingle()
      .then(({ data }) => setResumeUrl((data?.resume_url as string | null) ?? null))
  }, [candidateProfileId])

  const fetchBatch = useCallback(async () => {
    if (!candidateProfileId) return []

    // Exclusion happens in the database (see get_unswiped_jobs). p_exclude carries
    // the ids already in the deck so a refill doesn't repeat unswiped cards —
    // this avoids cramming every swiped id into the URL (which eventually 414s).
    const { data, error: qErr } = await supabase.rpc('get_unswiped_jobs', {
      p_candidate_id: candidateProfileId,
      p_limit: BATCH_SIZE,
      p_exclude: deckRef.current.map((j) => j.id),
    })
    if (qErr) throw new Error(qErr.message)
    return (data ?? []) as SwipeJob[]
  }, [candidateProfileId])

  const loadInitial = useCallback(async () => {
    if (!candidateProfileId) {
      setDeck([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const jobs = await fetchBatch()
      setDeck(jobs)
      setHasMore(jobs.length >= BATCH_SIZE)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load jobs')
      setDeck([])
    }
    setLoading(false)
  }, [candidateProfileId, fetchBatch])

  useEffect(() => {
    loadInitial()
  }, [loadInitial])

  const loadMore = useCallback(async () => {
    if (!candidateProfileId || fetchingMore || !hasMore) return
    setFetchingMore(true)
    try {
      const jobs = await fetchBatch()
      if (jobs.length === 0) {
        setHasMore(false)
      } else {
        setDeck((prev) => {
          const existing = new Set(prev.map((j) => j.id))
          const fresh = jobs.filter((j) => !existing.has(j.id))
          return [...prev, ...fresh]
        })
        setHasMore(jobs.length >= BATCH_SIZE)
      }
    } catch {
      /* silent — deck still usable */
    }
    setFetchingMore(false)
  }, [candidateProfileId, fetchBatch, fetchingMore, hasMore])

  useEffect(() => {
    if (loading || fetchingMore || !hasMore) return
    if (deck.length < PRELOAD_THRESHOLD) loadMore()
  }, [deck.length, loading, fetchingMore, hasMore, loadMore])

  const popTop = useCallback(() => {
    setDeck((prev) => prev.slice(1))
  }, [])

  const recordSwipe = useCallback(
    async (job: SwipeJob, direction: SwipeDirection, apply: boolean) => {
      if (!candidateProfileId) return null

      const { data: swipeRow, error: swipeErr } = await supabase
        .from('job_swipes')
        .upsert(
          { candidate_id: candidateProfileId, job_id: job.id, direction },
          { onConflict: 'candidate_id,job_id' },
        )
        .select('id')
        .single()

      if (swipeErr) throw new Error(swipeErr.message)

      let applicationId: string | undefined
      if (apply && direction === 'right') {
        const { data: appRow, error: appErr } = await supabase
          .from('applications')
          .insert({
            job_id: job.id,
            candidate_id: candidateProfileId,
            status: 'submitted',
            cover_note: null,
            resume_url: resumeUrl,
          })
          .select('id')
          .single()

        if (appErr) throw new Error(appErr.message)
        applicationId = appRow.id as string
      }

      return {
        swipeId: swipeRow.id as string,
        applicationId,
        applied: Boolean(applicationId),
      }
    },
    [candidateProfileId, resumeUrl],
  )

  const swipeLeft = useCallback(
    async (job: SwipeJob) => {
      try {
        const result = await recordSwipe(job, 'left', false)
        if (!result) return
        setLastSwipe({ job, swipeId: result.swipeId, direction: 'left', applied: false })
        popTop()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Could not skip job')
      }
    },
    [recordSwipe, popTop],
  )

  const swipeRight = useCallback(
    async (job: SwipeJob) => {
      try {
        const result = await recordSwipe(job, 'right', true)
        if (!result) return
        setLastSwipe({
          job,
          swipeId: result.swipeId,
          direction: 'right',
          applied: true,
          applicationId: result.applicationId,
        })
        popTop()
        toast.success('Applied! 🎉')
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Could not apply')
      }
    },
    [recordSwipe, popTop],
  )

  const superLike = useCallback(
    async (job: SwipeJob) => {
      try {
        const result = await recordSwipe(job, 'right', false)
        if (!result) return
        setLastSwipe({ job, swipeId: result.swipeId, direction: 'right', applied: false })
        popTop()
        toast.success('Saved for later ⭐')
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Could not save job')
      }
    },
    [recordSwipe, popTop],
  )

  const undo = useCallback(async () => {
    if (!lastSwipe) return
    try {
      await supabase.from('job_swipes').delete().eq('id', lastSwipe.swipeId)
      if (lastSwipe.applied && lastSwipe.applicationId) {
        await supabase.from('applications').delete().eq('id', lastSwipe.applicationId)
      }
      setDeck((prev) => [lastSwipe.job, ...prev])
      setLastSwipe(null)
      toast.message('Swipe undone')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not undo')
    }
  }, [lastSwipe])

  return {
    deck,
    loading,
    error,
    hasMore,
    lastSwipe,
    canUndo: Boolean(lastSwipe),
    swipeLeft,
    swipeRight,
    superLike,
    undo,
    refresh: loadInitial,
  }
}
