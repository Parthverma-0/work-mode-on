'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { CandidateSwipeCard } from '@/components/swipe/CandidateSwipeCard'
import { MessageModal } from '@/components/company/MessageModal'
import { SwipeDeck } from '@/components/swipe/SwipeDeck'
import { useAuth } from '@/context/AuthContext'
import { useCandidateSwipes } from '@/hooks/useCandidateSwipes'
import { useCompany } from '@/hooks/useCompany'
import { useCompanyJobs } from '@/hooks/useCompanyJobs'
import { supabase } from '@/lib/supabase'
import type { SwipeCandidate } from '@/lib/swipe-types'

export default function CompanySwipePage() {
  const { user } = useAuth()
  const { company } = useCompany(user?.id)
  const { jobs } = useCompanyJobs(company?.id)
  const { deck, loading, canUndo, swipeLeft, swipeRight, undo } = useCandidateSwipes(company?.id)

  const [msgOpen, setMsgOpen] = useState(false)
  const [msgCandidate, setMsgCandidate] = useState<SwipeCandidate | null>(null)

  function openMessage(candidate: SwipeCandidate) {
    setMsgCandidate(candidate)
    setMsgOpen(true)
  }

  function profileName(candidate: SwipeCandidate) {
    const prof = Array.isArray(candidate.profiles) ? candidate.profiles[0] : candidate.profiles
    return prof?.full_name ?? 'Candidate'
  }

  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col">
      <div className="mb-6 text-center md:mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#EEF2FF] px-3 py-1 text-xs font-semibold text-[#4338CA]">
          <Sparkles className="size-3.5" aria-hidden />
          Discover
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[#0A0A0A] md:text-3xl">
          Find your next hire
        </h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Swipe right on candidates you want to connect with
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center">
        <SwipeDeck
          items={deck}
          loading={loading}
          canUndo={canUndo}
          overlayVariant="candidate"
          controlsVariant="company"
          emptyTitle="You've seen all open-to-work candidates!"
          emptyCtaLabel="Search all candidates →"
          emptyCtaHref="/company/candidates"
          onSwipeLeft={swipeLeft}
          onSwipeRight={(candidate) => swipeRight(candidate, openMessage)}
          onUndo={undo}
          renderCard={(candidate) => <CandidateSwipeCard candidate={candidate} />}
        />
      </div>

      <MessageModal
        open={msgOpen}
        onOpenChange={(open) => {
          setMsgOpen(open)
          if (!open) setMsgCandidate(null)
        }}
        receiverName={msgCandidate ? profileName(msgCandidate) : ''}
        jobs={jobs.map((j) => ({ id: j.id, title: j.title }))}
        defaultJobId={null}
        onSend={async (content, jobId) => {
          if (!user?.id || !msgCandidate?.user_id) return { error: 'Missing user.' }
          const { error } = await supabase.from('messages').insert({
            sender_id: user.id,
            receiver_id: msgCandidate.user_id,
            job_id: jobId,
            content,
            is_read: false,
          })
          return { error: error?.message ?? null }
        }}
      />
    </div>
  )
}
