'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { GoogleButton } from '@/components/auth/GoogleButton'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { fadeUp, staggerContainer } from '@/lib/wmo-motion'

export function LoginForm() {
  const router = useRouter()
  const reduceMotion = useReducedMotion()
  const { signIn, signInWithGoogle, refreshProfile } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>(
    {},
  )

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const nextErrors: typeof errors = {}
    if (!email.trim()) nextErrors.email = 'Email is required.'
    if (!password.trim()) nextErrors.password = 'Password is required.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) {
      setErrors({ form: error })
      setLoading(false)
      return
    }

    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session?.user) {
      setErrors({ form: 'Session could not be established. Please try again.' })
      setLoading(false)
      return
    }

    const { profile, onboardingDone } = await refreshProfile(session.user.id)
    await router.refresh()

    const destination = !profile?.role
      ? '/auth/select-role'
      : !onboardingDone
        ? '/onboarding'
        : profile.role === 'candidate'
          ? '/candidate/dashboard'
          : '/company/dashboard'

    setLoading(false)
    window.location.assign(destination)
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    const { error } = await signInWithGoogle()
    if (error) {
      setErrors({ form: error })
      setGoogleLoading(false)
    }
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial={reduceMotion ? false : 'hidden'}
      animate={reduceMotion ? undefined : 'visible'}
      className="w-full"
    >
      <motion.div variants={fadeUp}>
        <Card className="glass-panel overflow-hidden rounded-3xl border-0 shadow-none">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-[1.65rem] font-semibold tracking-tight text-[#0f172a]">
              Welcome back
            </CardTitle>
            <p className="text-sm leading-relaxed text-[#64748b]">Sign in to continue to Work Mode On.</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <GoogleButton onClick={handleGoogle} loading={googleLoading} />

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#e2e8f0]" />
              </div>
              <p className="relative mx-auto w-fit bg-white/90 px-3 text-xs font-medium text-[#94a3b8]">
                or continue with email
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#334155]">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl border-[#e2e8f0] bg-white/80 text-[15px] transition-shadow focus-visible:ring-[#4F46E5]/25"
                />
                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#334155]">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl border-[#e2e8f0] bg-white/80 text-[15px] transition-shadow focus-visible:ring-[#4F46E5]/25"
                />
                {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
              </div>

              {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}

              <Button
                type="submit"
                className="h-12 w-full rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#6366f1] text-[15px] font-semibold shadow-lg shadow-[#4F46E5]/25 transition-opacity hover:opacity-[0.97]"
                disabled={loading}
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>

            <p className="text-center text-sm text-[#64748b]">
              New to WMO?{' '}
              <Link href="/auth/signup" className="font-semibold text-[#4F46E5] hover:underline">
                Create an account
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
