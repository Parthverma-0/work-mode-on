'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function AuthFinishPage() {
  const router = useRouter()
  const { user, loading, refreshProfile } = useAuth()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.replace('/auth/login')
      return
    }

    ;(async () => {
      const { profile, onboardingDone } = await refreshProfile(user.id)
      const destination = !profile?.role
        ? '/auth/signup'
        : !onboardingDone
          ? '/onboarding'
          : profile.role === 'candidate'
            ? '/candidate/dashboard'
            : '/company/dashboard'
      window.location.assign(destination)
    })()
  }, [loading, user, router, refreshProfile])

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-4">
      <p className="text-sm text-gray-600">Signing you in…</p>
    </main>
  )
}
