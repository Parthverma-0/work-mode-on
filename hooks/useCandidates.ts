'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { CandidateSearchRow } from '@/lib/company-types'

const PAGE_SIZE = 12
const FETCH_CAP = 400

export function useCandidates(filters: {
  search: string
  skill: string | null
  openToWorkOnly: boolean
}) {
  const [rawRows, setRawRows] = useState<CandidateSearchRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [visiblePages, setVisiblePages] = useState(1)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    setVisiblePages(1)

    let q = supabase
      .from('candidate_profiles')
      .select(
        'id, user_id, headline, skills, college, graduation_year, resume_url, portfolio_url, city, course, open_to_work, bio',
      )
      .limit(FETCH_CAP)

    if (filters.openToWorkOnly) {
      q = q.eq('open_to_work', true)
    }

    const { data: rows, error: qErr } = await q

    if (qErr) {
      setError(qErr.message)
      setRawRows([])
      setLoading(false)
      return
    }

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

    const merged: CandidateSearchRow[] = list.map((r) => ({
      ...r,
      profiles: profileMap.get(r.user_id) ?? null,
    }))

    setRawRows(merged)
    setLoading(false)
  }, [filters.openToWorkOnly])

  useEffect(() => {
    refresh()
  }, [refresh])

  const filtered = useMemo(() => {
    let list = rawRows
    const term = filters.search.trim().toLowerCase()
    if (term) {
      list = list.filter((c) => {
        const prof = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles
        const name = prof?.full_name?.toLowerCase() ?? ''
        const headMatch = c.headline?.toLowerCase().includes(term)
        const nameMatch = name.includes(term)
        const skillMatch = (c.skills ?? []).some((s) => s.toLowerCase().includes(term))
        return nameMatch || headMatch || skillMatch
      })
    }
    if (filters.skill) {
      const sk = filters.skill.toLowerCase()
      list = list.filter((c) =>
        (c.skills ?? []).some((s) => s.toLowerCase() === sk || s.toLowerCase().includes(sk)),
      )
    }
    return list
  }, [rawRows, filters.search, filters.skill])

  const candidates = useMemo(
    () => filtered.slice(0, visiblePages * PAGE_SIZE),
    [filtered, visiblePages],
  )

  const hasMore = candidates.length < filtered.length

  const loadMore = useCallback(() => {
    if (hasMore) setVisiblePages((p) => p + 1)
  }, [hasMore])

  const skillOptions = useMemo(() => {
    const set = new Set<string>()
    for (const c of rawRows) {
      for (const s of c.skills ?? []) {
        if (s?.trim()) set.add(s.trim())
      }
    }
    return [...set].sort((a, b) => a.localeCompare(b))
  }, [rawRows])

  return {
    candidates,
    loading,
    hasMore,
    error,
    refresh,
    loadMore,
    filteredTotal: filtered.length,
    skillOptions,
  }
}
