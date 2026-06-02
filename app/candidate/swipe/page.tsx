'use client'

import { Sparkles } from 'lucide-react'
import { JobSwipeCard } from '@/components/swipe/JobSwipeCard'
import { SwipeDeck } from '@/components/swipe/SwipeDeck'
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
    <div className="flex min-h-[calc(100vh-10rem)] flex-col">
      <div className="mb-6 text-center md:mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#EEF2FF] px-3 py-1 text-xs font-semibold text-[#4338CA]">
          <Sparkles className="size-3.5" aria-hidden />
          Discover
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[#0A0A0A] md:text-3xl">
          Swipe to apply
        </h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Right to apply instantly · Left to pass · Star to save for later
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center">
        <SwipeDeck
          items={deck}
          loading={loading}
          canUndo={canUndo}
          overlayVariant="job"
          showSuperLike
          controlsVariant="job"
          emptyTitle="You've seen all available jobs!"
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
