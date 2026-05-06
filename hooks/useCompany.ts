'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { CompanyProfileRow } from '@/lib/company-types'

export function useCompany(userId: string | undefined) {
  const [company, setCompany] = useState<CompanyProfileRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!userId) {
      setCompany(null)
      setLoading(false)
      return
    }
    setLoading(true)
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
      setCompany(null)
    } else {
      setCompany(data as CompanyProfileRow | null)
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { company, loading, error, refresh }
}
