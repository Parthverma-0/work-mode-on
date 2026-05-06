'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { ApplicationWithDetails, ProfileLite } from '@/lib/company-types'

async function attachProfiles(apps: ApplicationWithDetails[]): Promise<ApplicationWithDetails[]> {
  const userIds = [
    ...new Set(
      apps
        .map((a) => a.candidate_profiles?.user_id)
        .filter(Boolean),
    ),
  ] as string[]
  if (!userIds.length) return apps

  const { data: profs } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .in('id', userIds)

  const map = new Map<string, ProfileLite>((profs ?? []).map((p) => [p.id as string, p as ProfileLite]))

  return apps.map((a) => ({
    ...a,
    profiles: a.candidate_profiles?.user_id ? map.get(a.candidate_profiles.user_id) ?? null : null,
  }))
}

export function useApplicants(companyJobIds: string[]) {
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const jobKey = JSON.stringify([...companyJobIds].sort())

  const refresh = useCallback(async () => {
    let ids: string[] = []
    try {
      ids = JSON.parse(jobKey) as string[]
    } catch {
      ids = []
    }
    if (!ids.length) {
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
        jobs ( title ),
        candidate_profiles (
          id,
          user_id,
          headline,
          skills,
          college,
          graduation_year,
          resume_url,
          portfolio_url,
          city,
          course,
          open_to_work,
          bio
        )
      `,
      )
      .in('job_id', ids)
      .order('applied_at', { ascending: false })

    if (qErr) {
      setError(qErr.message)
      setApplications([])
      setLoading(false)
      return
    }

    const raw = (data ?? []) as ApplicationWithDetails[]
    const merged = await attachProfiles(raw)
    setApplications(merged)
    setLoading(false)
  }, [jobKey])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { applications, loading, error, refresh }
}
