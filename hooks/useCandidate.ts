'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { CandidateProfileRow } from '@/lib/candidate-types'

// Session cache. The candidate profile gates most candidate pages and rarely
// changes, so we serve it from memory on repeat navigations (instant, no skeleton)
// while revalidating in the background — instead of a fresh round trip every time.
const cache = new Map<string, CandidateProfileRow | null>()

export function useCandidate(userId: string | undefined) {
  const [candidate, setCandidate] = useState<CandidateProfileRow | null>(() =>
    userId && cache.has(userId) ? cache.get(userId)! : null,
  )
  const [loading, setLoading] = useState(() => !(userId && cache.has(userId)))
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!userId) {
      setCandidate(null)
      setLoading(false)
      return
    }
    if (!cache.has(userId)) setLoading(true)
    setError(null)
    const { data, error: qErr } = await supabase
      .from('candidate_profiles')
      .select(
        'id, user_id, headline, bio, resume_url, portfolio_url, skills, city, college, course, graduation_year, open_to_work',
      )
      .eq('user_id', userId)
      .maybeSingle()

    if (qErr) {
      setError(qErr.message)
    } else {
      const row = (data as CandidateProfileRow | null) ?? null
      cache.set(userId, row)
      setCandidate(row)
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    if (userId && cache.has(userId)) {
      setCandidate(cache.get(userId)!)
      setLoading(false)
    }
    refresh()
  }, [userId, refresh])

  return { candidate, loading, error, refresh }
}
