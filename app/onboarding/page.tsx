'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CandidateOnboarding } from '@/components/onboarding/CandidateOnboarding'
import { CompanyOnboarding } from '@/components/onboarding/CompanyOnboarding'
import { AuthAmbient } from '@/components/auth/AuthAmbient'
import { PageEnter } from '@/components/motion/PageEnter'
import { useAuth } from '@/context/AuthContext'

export default function OnboardingPage() {
  const router = useRouter()
  const { user, profile, loading, onboardingDone } = useAuth()

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.push('/auth/login')
      return
    }
    if (!profile?.role) {
      router.push('/auth/select-role')
      return
    }
    if (onboardingDone) {
      router.push(profile.role === 'candidate' ? '/candidate/dashboard' : '/company/dashboard')
    }
  }, [loading, onboardingDone, profile?.role, router, user])

  if (loading || !user || !profile?.role) {
    return (
      <AuthAmbient>
        <main className="min-h-screen px-4 py-24" aria-busy="true">
          <div className="mx-auto h-96 max-w-2xl animate-pulse rounded-3xl bg-white/40 ring-1 ring-white/60 backdrop-blur-md" />
        </main>
      </AuthAmbient>
    )
  }

  return (
    <AuthAmbient>
      <main className="min-h-screen px-4 py-10 sm:py-14">
        <PageEnter className="mx-auto w-full max-w-3xl">
          {profile.role === 'candidate' ? (
            <CandidateOnboarding userId={user.id} />
          ) : (
            <CompanyOnboarding userId={user.id} />
          )}
        </PageEnter>
      </main>
    </AuthAmbient>
  )
}
