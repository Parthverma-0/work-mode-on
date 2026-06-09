'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { CandidateSwipeCard } from '@/components/swipe/CandidateSwipeCard'
import { MatchModal } from '@/components/swipe/MatchModal'
import { MessageModal } from '@/components/company/MessageModal'
import { SwipeDeck } from '@/components/swipe/SwipeDeck'
import { useAuth } from '@/context/AuthContext'
import { useCandidateSwipes } from '@/hooks/useCandidateSwipes'
import { useCompany } from '@/hooks/useCompany'
import { useCompanyJobs } from '@/hooks/useCompanyJobs'
import { supabase } from '@/lib/supabase'
import type { SwipeApplicant } from '@/lib/swipe-types'

export default function CompanySwipePage() {
  const { user } = useAuth()
  const { company } = useCompany(user?.id)
  const { jobs } = useCompanyJobs(company?.id)
  const { deck, loading, canUndo, swipeLeft, swipeRight, undo } = useCandidateSwipes(company?.id)

  const [msgOpen, setMsgOpen] = useState(false)
  const [msgApplicant, setMsgApplicant] = useState<SwipeApplicant | null>(null)
  const [matchOpen, setMatchOpen] = useState(false)
  const [matchApplicant, setMatchApplicant] = useState<SwipeApplicant | null>(null)

  function openMessage(applicant: SwipeApplicant) {
    setMsgApplicant(applicant)
    setMsgOpen(true)
  }

  function openMatch(applicant: SwipeApplicant) {
    setMatchApplicant(applicant)
    setMatchOpen(true)
  }

  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col">
      <div className="mb-6 text-center md:mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#EEF2FF] px-3 py-1 text-xs font-semibold text-[#4338CA]">
          <Sparkles className="size-3.5" aria-hidden />
          Review applicants
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[#0A0A0A] md:text-3xl">
          Your applicants
        </h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Swipe right to shortlist · left to pass
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center">
        <SwipeDeck
          items={deck}
          loading={loading}
          canUndo={canUndo}
          overlayVariant="candidate"
          controlsVariant="company"
          emptyTitle="No applicants waiting for a decision"
          emptyCtaLabel="View all applicants →"
          emptyCtaHref="/company/applicants"
          onSwipeLeft={swipeLeft}
          onSwipeRight={(applicant) => swipeRight(applicant, openMatch)}
          onUndo={undo}
          renderCard={(applicant) => <CandidateSwipeCard applicant={applicant} />}
        />
      </div>

      <MatchModal
        open={matchOpen}
        onOpenChange={setMatchOpen}
        subtitle={
          matchApplicant
            ? `${matchApplicant.profile?.full_name ?? 'This candidate'} applied${
                matchApplicant.jobTitle ? ` for ${matchApplicant.jobTitle}` : ''
              } and you shortlisted them. Start the conversation!`
            : ''
        }
        leftName={matchApplicant?.profile?.full_name ?? 'Candidate'}
        leftAvatar={matchApplicant?.profile?.avatar_url}
        rightName={company?.company_name ?? 'You'}
        rightAvatar={company?.logo_url}
        primaryLabel="Send a message"
        onPrimary={() => {
          setMatchOpen(false)
          if (matchApplicant) openMessage(matchApplicant)
        }}
      />

      <MessageModal
        open={msgOpen}
        onOpenChange={(open) => {
          setMsgOpen(open)
          if (!open) setMsgApplicant(null)
        }}
        receiverName={msgApplicant?.profile?.full_name ?? 'Candidate'}
        jobs={jobs.map((j) => ({ id: j.id, title: j.title }))}
        defaultJobId={msgApplicant?.jobId ?? null}
        onSend={async (content, jobId) => {
          if (!user?.id || !msgApplicant?.candidate.user_id) return { error: 'Missing user.' }
          const { error } = await supabase.from('messages').insert({
            sender_id: user.id,
            receiver_id: msgApplicant.candidate.user_id,
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
