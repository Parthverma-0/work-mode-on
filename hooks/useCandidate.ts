'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { CandidateProfileRow } from '@/lib/candidate-types'

export function useCandidate(userId: string | undefined) {
  const [candidate, setCandidate] = useState<CandidateProfileRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!userId) {
      setCandidate(null)
      setLoading(false)
      return
    }
    setLoading(true)
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
      setCandidate(null)
    } else {
      setCandidate(data as CandidateProfileRow | null)
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { candidate, loading, error, refresh }
}
