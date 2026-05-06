'use client'

import { useEffect, useMemo, useState } from 'react'
import { CourseCard } from '@/components/candidate/CourseCard'
import { Skeleton } from '@/components/ui/skeleton'
import { useCandidate } from '@/hooks/useCandidate'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import type { CourseRow } from '@/lib/candidate-types'

export default function CandidateCoursesPage() {
  const { user } = useAuth()
  const { candidate, loading: candLoading } = useCandidate(user?.id)

  const [courses, setCourses] = useState<CourseRow[]>([])
  const [loading, setLoading] = useState(true)
  const [skillFilter, setSkillFilter] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, provider, url, affiliate_url, skills_covered, level, is_featured')
        .order('is_featured', { ascending: false })
        .order('title', { ascending: true })

      if (!cancelled) {
        if (!error && data) setCourses(data as CourseRow[])
        else setCourses([])
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const featured = useMemo(() => courses.filter((c) => c.is_featured), [courses])

  const skillsHint = useMemo(() => {
    const s = candidate?.skills ?? []
    if (!s.length) return 'Add skills to your profile for smarter picks.'
    return `Based on your skills: ${s.slice(0, 6).join(', ')}${s.length > 6 ? '…' : ''}`
  }, [candidate?.skills])

  const filteredGrid = useMemo(() => {
    const rest = courses.filter((c) => !c.is_featured)
    if (!skillFilter) return rest
    return rest.filter((c) => (c.skills_covered ?? []).some((x) => x === skillFilter))
  }, [courses, skillFilter])

  const filteredFeatured = useMemo(() => {
    if (!skillFilter) return featured
    return featured.filter((c) => (c.skills_covered ?? []).some((x) => x === skillFilter))
  }, [featured, skillFilter])

  return (
    <div className="space-y-10 pb-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#0A0A0A] md:text-3xl">
          Recommended for you
        </h1>
        <p className="mt-2 text-sm text-[#6B7280] md:text-base">{skillsHint}</p>
        {skillFilter && (
          <button
            type="button"
            onClick={() => setSkillFilter(null)}
            className="mt-3 text-sm font-medium text-[#4F46E5] hover:underline"
          >
            Clear skill filter: {skillFilter}
          </button>
        )}
      </div>

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#6B7280]">
          Featured
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {loading || candLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl bg-gray-100" />)
          ) : filteredFeatured.length ? (
            filteredFeatured.map((c) => (
              <CourseCard key={c.id} course={c} featured onSkillClick={setSkillFilter} />
            ))
          ) : (
            <p className="col-span-full rounded-xl border border-gray-100 bg-[#FAFAFA] py-10 text-center text-sm text-[#6B7280]">
              No featured courses yet — browse all below.
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-[#0A0A0A]">All courses</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl bg-gray-100" />)
          ) : filteredGrid.length ? (
            filteredGrid.map((c) => (
              <CourseCard key={c.id} course={c} onSkillClick={setSkillFilter} />
            ))
          ) : (
            <div className="col-span-full rounded-2xl border border-dashed border-gray-200 bg-[#FAFAFA] py-16 text-center">
              <p className="font-medium text-[#0A0A0A]">No courses in the catalog yet</p>
              <p className="mt-2 text-sm text-[#6B7280]">Check back soon for new learning paths.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
