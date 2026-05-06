'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { motion, useReducedMotion } from 'framer-motion'
import { AuthAmbient } from '@/components/auth/AuthAmbient'
import { RoleSelector } from '@/components/auth/RoleSelector'
import { SignOutButton } from '@/components/auth/SignOutButton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { fadeUp, staggerContainer } from '@/lib/wmo-motion'

type Role = 'candidate' | 'company'

export default function SelectRolePage() {
  const router = useRouter()
  const reduceMotion = useReducedMotion()
  const { user, profile, loading, onboardingDone, refreshProfile } = useAuth()
  const [role, setRole] = useState<Role | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace('/auth/login')
      return
    }
    if (profile?.role && onboardingDone) {
      router.replace(profile.role === 'candidate' ? '/candidate/dashboard' : '/company/dashboard')
    }
  }, [loading, user, profile?.role, onboardingDone, router])

  useEffect(() => {
    if (!loading && profile?.role) {
      setRole(profile.role as Role)
    }
  }, [loading, profile?.role])

  async function handleContinue() {
    if (!user?.id || !role) {
      toast.error('Choose whether you are hiring or looking for opportunities.')
      return
    }
    setSaving(true)
    const { error } = await supabase.from('profiles').update({ role }).eq('id', user.id)
    setSaving(false)
    if (error) {
      toast.error(error.message)
      return
    }
    await refreshProfile(user.id)
    router.refresh()
    window.location.assign('/onboarding')
  }

  if (loading || !user) {
    return (
      <AuthAmbient>
        <main className="min-h-screen px-4 py-24" aria-busy="true">
          <div className="mx-auto h-72 max-w-lg animate-pulse rounded-3xl bg-white/35 ring-1 ring-white/55 backdrop-blur-md" />
        </main>
      </AuthAmbient>
    )
  }

  return (
    <AuthAmbient>
      <main className="min-h-screen px-4 py-16 sm:py-20">
        <div className="mx-auto w-full max-w-lg">
          <motion.div
            variants={staggerContainer}
            initial={reduceMotion ? false : 'hidden'}
            animate={reduceMotion ? undefined : 'visible'}
          >
            <motion.div variants={fadeUp}>
              <Card className="glass-panel overflow-hidden rounded-3xl border-0 shadow-none">
                <CardHeader className="space-y-2 pb-6">
                  <CardTitle className="text-[1.65rem] font-semibold tracking-tight text-[#0f172a]">
                    How will you use WMO?
                  </CardTitle>
                  <p className="text-sm leading-relaxed text-[#64748b]">
                    Students, fresh grads, and professionals use candidate profiles. Companies hire through
                    the employer portal.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <RoleSelector value={role} onChange={setRole} />
                  <Button
                    type="button"
                    className="h-12 w-full rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#6366f1] text-[15px] font-semibold shadow-lg shadow-[#4F46E5]/25 hover:opacity-[0.97]"
                    disabled={saving || !role}
                    onClick={() => handleContinue()}
                  >
                    {saving ? 'Saving…' : 'Continue'}
                  </Button>
                  <p className="text-center text-sm text-[#64748b]">
                    Wrong account?{' '}
                    <SignOutButton layout="text-link" label="Sign out" className="inline" />
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </AuthAmbient>
  )
}
