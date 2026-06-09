'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ApplicationWithJob } from '@/lib/candidate-types'

const key = (userId: string) => `wmo_seen_matches_${userId}`

/**
 * Surfaces applications that the company has shortlisted ("It's a Match!") and
 * that this candidate hasn't acknowledged yet. Seen ids are persisted per-user
 * in localStorage so a match is only celebrated once.
 */
export function useMatchAlerts(
  userId: string | undefined,
  applications: ApplicationWithJob[],
) {
  const [seen, setSeen] = useState<Set<string>>(new Set())
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!userId) {
      setReady(false)
      return
    }
    try {
      const raw = localStorage.getItem(key(userId))
      setSeen(new Set(raw ? (JSON.parse(raw) as string[]) : []))
    } catch {
      setSeen(new Set())
    }
    setReady(true)
  }, [userId])

  const pending = useMemo(
    () =>
      ready
        ? applications.filter((a) => a.status === 'shortlisted' && !seen.has(a.id))
        : [],
    [ready, applications, seen],
  )

  function acknowledge(id: string) {
    if (!userId) return
    setSeen((prev) => {
      const next = new Set(prev).add(id)
      try {
        localStorage.setItem(key(userId), JSON.stringify([...next]))
      } catch {
        /* ignore quota/availability errors */
      }
      return next
    })
  }

  return { pending, acknowledge }
}
