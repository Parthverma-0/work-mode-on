'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { JobType, JobMode, JobWithCompany } from '@/lib/candidate-types'

export type JobFilters = {
  search: string
  type: JobType | 'all'
  mode: JobMode | 'all'
}

export function useJobs(filters: JobFilters) {
  const [rawJobs, setRawJobs] = useState<JobWithCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const typeModeKey = useMemo(
    () => ({ type: filters.type, mode: filters.mode }),
    [filters.type, filters.mode],
  )

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)

    let q = supabase
      .from('jobs')
      .select(
        `
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
      `,
      )
      .eq('is_active', true)
      .order('posted_at', { ascending: false })

    if (typeModeKey.type !== 'all') {
      q = q.eq('type', typeModeKey.type)
    }
    if (typeModeKey.mode !== 'all') {
      q = q.eq('mode', typeModeKey.mode)
    }

    const { data, error: qErr } = await q

    if (qErr) {
      setError(qErr.message)
      setRawJobs([])
    } else {
      setRawJobs((data ?? []) as JobWithCompany[])
    }
    setLoading(false)
  }, [typeModeKey.type, typeModeKey.mode])

  useEffect(() => {
    refresh()
  }, [refresh])

  const jobs = useMemo(() => {
    const term = filters.search.trim().toLowerCase()
    if (!term) return rawJobs
    return rawJobs.filter((job) => {
      const titleMatch = job.title?.toLowerCase().includes(term)
      const descMatch = job.description?.toLowerCase().includes(term)
      const skills = job.skills_required ?? []
      const skillMatch = skills.some((s) => s.toLowerCase().includes(term))
      return titleMatch || descMatch || skillMatch
    })
  }, [rawJobs, filters.search])

  return { jobs, loading, error, refresh }
}
