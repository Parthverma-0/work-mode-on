'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import type { SwipeCandidate, SwipeDirection } from '@/lib/swipe-types'

const BATCH_SIZE = 20
const PRELOAD_THRESHOLD = 3

type LastCandidateSwipe = {
  candidate: SwipeCandidate
  swipeId: string
  direction: SwipeDirection
}

export function useCandidateSwipes(companyProfileId: string | undefined) {
  const [deck, setDeck] = useState<SwipeCandidate[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchingMore, setFetchingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastSwipe, setLastSwipe] = useState<LastCandidateSwipe | null>(null)
  const deckRef = useRef(deck)
  deckRef.current = deck

  const fetchBatch = useCallback(
    async (excludeIds: string[] = []) => {
      if (!companyProfileId) return []

      const { data: swiped } = await supabase
        .from('candidate_swipes')
        .select('candidate_id')
        .eq('company_id', companyProfileId)

      const swipedIds = new Set([
        ...(swiped?.map((s) => s.candidate_id as string) ?? []),
        ...excludeIds,
        ...deckRef.current.map((c) => c.id),
      ])

      let q = supabase
        .from('candidate_profiles')
        .select(
          'id, user_id, headline, bio, skills, college, graduation_year, resume_url, portfolio_url, city, course, open_to_work',
        )
        .eq('open_to_work', true)
        .limit(BATCH_SIZE)

      if (swipedIds.size > 0) {
        q = q.not('id', 'in', `(${[...swipedIds].join(',')})`)
      }

      const { data: rows, error: qErr } = await q
      if (qErr) throw new Error(qErr.message)

      const list = rows ?? []
      const userIds = [...new Set(list.map((r) => r.user_id).filter(Boolean))] as string[]

      let profileMap = new Map<string, { id: string; full_name: string | null; avatar_url: string | null }>()
      if (userIds.length) {
        const { data: profs } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds)
        profileMap = new Map((profs ?? []).map((p) => [p.id as string, p]))
      }

      return list.map((r) => ({
        ...r,
        profiles: profileMap.get(r.user_id) ?? null,
      })) as SwipeCandidate[]
    },
    [companyProfileId],
  )

  const loadInitial = useCallback(async () => {
    if (!companyProfileId) {
      setDeck([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const candidates = await fetchBatch()
      setDeck(candidates)
      setHasMore(candidates.length >= BATCH_SIZE)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load candidates')
      setDeck([])
    }
    setLoading(false)
  }, [companyProfileId, fetchBatch])

  useEffect(() => {
    loadInitial()
  }, [loadInitial])

  const loadMore = useCallback(async () => {
    if (!companyProfileId || fetchingMore || !hasMore) return
    setFetchingMore(true)
    try {
      const candidates = await fetchBatch()
      if (candidates.length === 0) {
        setHasMore(false)
      } else {
        setDeck((prev) => {
          const existing = new Set(prev.map((c) => c.id))
          const fresh = candidates.filter((c) => !existing.has(c.id))
          return [...prev, ...fresh]
        })
        setHasMore(candidates.length >= BATCH_SIZE)
      }
    } catch {
      /* silent */
    }
    setFetchingMore(false)
  }, [companyProfileId, fetchBatch, fetchingMore, hasMore])

  useEffect(() => {
    if (loading || fetchingMore || !hasMore) return
    if (deck.length < PRELOAD_THRESHOLD) loadMore()
  }, [deck.length, loading, fetchingMore, hasMore, loadMore])

  const popTop = useCallback(() => {
    setDeck((prev) => prev.slice(1))
  }, [])

  const recordSwipe = useCallback(
    async (candidate: SwipeCandidate, direction: SwipeDirection) => {
      if (!companyProfileId) return null

      const { data, error: swipeErr } = await supabase
        .from('candidate_swipes')
        .upsert(
          { company_id: companyProfileId, candidate_id: candidate.id, direction },
          { onConflict: 'company_id,candidate_id' },
        )
        .select('id')
        .single()

      if (swipeErr) throw new Error(swipeErr.message)
      return data.id as string
    },
    [companyProfileId],
  )

  const swipeLeft = useCallback(
    async (candidate: SwipeCandidate) => {
      try {
        const swipeId = await recordSwipe(candidate, 'left')
        if (!swipeId) return
        setLastSwipe({ candidate, swipeId, direction: 'left' })
        popTop()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Could not skip candidate')
      }
    },
    [recordSwipe, popTop],
  )

  const swipeRight = useCallback(
    async (candidate: SwipeCandidate, onSaved?: (candidate: SwipeCandidate) => void) => {
      try {
        const swipeId = await recordSwipe(candidate, 'right')
        if (!swipeId) return
        setLastSwipe({ candidate, swipeId, direction: 'right' })
        popTop()
        toast.success('Candidate saved! Send them a message?', {
          action: {
            label: 'Message Now →',
            onClick: () => onSaved?.(candidate),
          },
        })
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Could not save candidate')
      }
    },
    [recordSwipe, popTop],
  )

  const undo = useCallback(async () => {
    if (!lastSwipe) return
    try {
      await supabase.from('candidate_swipes').delete().eq('id', lastSwipe.swipeId)
      setDeck((prev) => [lastSwipe.candidate, ...prev])
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
    undo,
    refresh: loadInitial,
  }
}
