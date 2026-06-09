'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { ApplicationWithJob } from '@/lib/candidate-types'

export function useApplications(candidateProfileId: string | undefined) {
  const [applications, setApplications] = useState<ApplicationWithJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!candidateProfileId) {
      setApplications([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)

    const { data, error: qErr } = await supabase
      .from('applications')
      .select(
        `
        id,
        job_id,
        candidate_id,
        status,
        cover_note,
        resume_url,
        applied_at,
        jobs (
          id,
          company_id,
          title,
          type,
          description,
          skills_required,
          location,
          mode,
          stipend_min,
          stipend_max,
          is_active,
          posted_at,
          company_profiles ( company_name, logo_url )
        )
      `,
      )
      .eq('candidate_id', candidateProfileId)
      .order('applied_at', { ascending: false })

    if (qErr) {
      setError(qErr.message)
      setApplications([])
    } else {
      // Supabase types embedded to-one relations as arrays; at runtime they're objects.
      setApplications((data ?? []) as unknown as ApplicationWithJob[])
    }
    setLoading(false)
  }, [candidateProfileId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { applications, loading, error, refresh }
}
