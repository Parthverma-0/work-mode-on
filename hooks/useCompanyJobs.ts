'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { JobWithApplicantCount } from '@/lib/company-types'

export function useCompanyJobs(companyProfileId: string | undefined) {
  const [jobs, setJobs] = useState<JobWithApplicantCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!companyProfileId) {
      setJobs([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)

    const { data: jobRows, error: jobErr } = await supabase
      .from('jobs')
      .select(
        'id, company_id, title, type, description, skills_required, location, mode, stipend_min, stipend_max, is_active, posted_at',
      )
      .eq('company_id', companyProfileId)
      .order('posted_at', { ascending: false })

    if (jobErr || !jobRows?.length) {
      if (jobErr) setError(jobErr.message)
      setJobs([])
      setLoading(false)
      return
    }

    const ids = jobRows.map((j) => j.id)
    const { data: appRows } = await supabase.from('applications').select('job_id').in('job_id', ids)

    const counts = new Map<string, number>()
    for (const row of appRows ?? []) {
      const jid = row.job_id as string
      counts.set(jid, (counts.get(jid) ?? 0) + 1)
    }

    const merged = jobRows.map((j) => ({
      ...(j as JobWithApplicantCount),
      applicant_count: counts.get(j.id) ?? 0,
    }))

    setJobs(merged)
    setLoading(false)
  }, [companyProfileId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { jobs, loading, error, refresh }
}
