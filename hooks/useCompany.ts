'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { CompanyProfileRow } from '@/lib/company-types'

// Session cache — see useCandidate for rationale (instant repeat navigations).
const cache = new Map<string, CompanyProfileRow | null>()

export function useCompany(userId: string | undefined) {
  const [company, setCompany] = useState<CompanyProfileRow | null>(() =>
    userId && cache.has(userId) ? cache.get(userId)! : null,
  )
  const [loading, setLoading] = useState(() => !(userId && cache.has(userId)))
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!userId) {
      setCompany(null)
      setLoading(false)
      return
    }
    if (!cache.has(userId)) setLoading(true)
    setError(null)
    const { data, error: qErr } = await supabase
      .from('company_profiles')
      .select(
        'id, user_id, company_name, industry, website, about, logo_url, city, social_links',
      )
      .eq('user_id', userId)
      .maybeSingle()

    if (qErr) {
      setError(qErr.message)
    } else {
      const row = (data as CompanyProfileRow | null) ?? null
      cache.set(userId, row)
      setCompany(row)
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    if (userId && cache.has(userId)) {
      setCompany(cache.get(userId)!)
      setLoading(false)
    }
    refresh()
  }, [userId, refresh])

  return { company, loading, error, refresh }
}
