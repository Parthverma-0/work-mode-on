'use client'

import { Flame, Star, X, Check } from 'lucide-react'
import { JobSwipeCard } from '@/components/swipe/JobSwipeCard'
import { SwipeDeck } from '@/components/swipe/SwipeDeck'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { useAuth } from '@/context/AuthContext'
import { useCandidate } from '@/hooks/useCandidate'
import { useJobSwipes } from '@/hooks/useJobSwipes'

export default function CandidateSwipePage() {
  const { user } = useAuth()
  const { candidate } = useCandidate(user?.id)
  const { deck, loading, canUndo, swipeLeft, swipeRight, superLike, undo } = useJobSwipes(
    candidate?.id,
  )

  return (
    <div className="relative flex min-h-[calc(100vh-9rem)] flex-col">
      {/* Ambient Tinder-style glow behind the deck */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-16 h-80 w-80 -translate-x-1/2 rounded-full bg-[#4F46E5]/12 blur-[110px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-40 h-64 w-64 -translate-x-1/2 rounded-full bg-emerald-400/10 blur-[100px]"
      />

      <PageHeader
        align="center"
        eyebrow="Discover"
        eyebrowIcon={<Flame className="size-3.5" aria-hidden />}
        title={
          <>
            Swipe to <span className="gradient-text-indigo">apply</span>
          </>
        }
      />

      {/* Legend */}
      <div className="relative mt-4 flex items-center justify-center gap-3 text-xs font-medium text-[#64748b]">
        <span className="inline-flex items-center gap-1.5">
          <span className="flex size-5 items-center justify-center rounded-full bg-red-50 text-red-500">
            <X className="size-3" aria-hidden />
          </span>
          Pass
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="flex size-5 items-center justify-center rounded-full bg-amber-50 text-amber-500">
            <Star className="size-3 fill-amber-400" aria-hidden />
          </span>
          Save
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="flex size-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
            <Check className="size-3" aria-hidden />
          </span>
          Apply
        </span>
      </div>

      <div className="relative mt-6 flex flex-1 flex-col items-center justify-center">
        <SwipeDeck
          items={deck}
          loading={loading}
          canUndo={canUndo}
          overlayVariant="job"
          showSuperLike
          controlsVariant="job"
          emptyTitle="You're all caught up!"
          emptyCtaLabel="Browse all jobs →"
          emptyCtaHref="/candidate/jobs"
          onSwipeLeft={swipeLeft}
          onSwipeRight={swipeRight}
          onSuperLike={superLike}
          onUndo={undo}
          renderCard={(job) => <JobSwipeCard job={job} />}
        />
      </div>
    </div>
  )
}
