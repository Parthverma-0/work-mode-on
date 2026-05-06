'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { GoogleButton } from '@/components/auth/GoogleButton'
import { RoleSelector } from '@/components/auth/RoleSelector'
import { useAuth } from '@/context/AuthContext'
import { fadeUp, staggerContainer } from '@/lib/wmo-motion'

type Role = 'candidate' | 'company'

export function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reduceMotion = useReducedMotion()
  const { signUp, signInWithGoogle } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [errors, setErrors] = useState<{
    fullName?: string
    email?: string
    password?: string
    role?: string
    form?: string
  }>({})

  useEffect(() => {
    const r = searchParams.get('role')
    if (r === 'candidate' || r === 'company') setRole(r)
  }, [searchParams])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const nextErrors: typeof errors = {}
    if (!fullName.trim()) nextErrors.fullName = 'Full name is required.'
    if (!email.trim()) nextErrors.email = 'Email is required.'
    if (!password.trim()) nextErrors.password = 'Password is required.'
    if (password.trim() && password.length < 6) nextErrors.password = 'Use at least 6 characters.'
    if (!role) nextErrors.role = 'Please select your role.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setLoading(true)
    const { error } = await signUp({ fullName, email, password, role: role as Role })
    setLoading(false)

    if (error) {
      setErrors({ form: error })
      return
    }

    router.push('/onboarding')
  }

  async function handleGoogle() {
    if (!role) {
      setErrors({ role: 'Select a role before continuing with Google.' })
      return
    }

    setGoogleLoading(true)
    const { error } = await signInWithGoogle(role)
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
              Create your account
            </CardTitle>
            <p className="text-sm leading-relaxed text-[#64748b]">
              Pick how you&apos;ll use WMO, then continue with Google or email.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <RoleSelector value={role} onChange={(nextRole) => setRole(nextRole)} />
            {errors.role && <p className="text-sm text-red-600">{errors.role}</p>}

            <GoogleButton onClick={handleGoogle} loading={googleLoading} />

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#e2e8f0]" />
              </div>
              <p className="relative mx-auto w-fit bg-white/90 px-3 text-xs font-medium text-[#94a3b8]">
                or sign up with email
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-[#334155]">
                  Full name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Riya Shah"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-12 rounded-xl border-[#e2e8f0] bg-white/80 text-[15px] focus-visible:ring-[#4F46E5]/25"
                />
                {errors.fullName && <p className="text-sm text-red-600">{errors.fullName}</p>}
              </div>

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
                  className="h-12 rounded-xl border-[#e2e8f0] bg-white/80 text-[15px] focus-visible:ring-[#4F46E5]/25"
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
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl border-[#e2e8f0] bg-white/80 text-[15px] focus-visible:ring-[#4F46E5]/25"
                />
                {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
              </div>

              {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}

              <Button
                type="submit"
                className="h-12 w-full rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#6366f1] text-[15px] font-semibold shadow-lg shadow-[#4F46E5]/25 hover:opacity-[0.97]"
                disabled={loading}
              >
                {loading ? 'Creating account…' : 'Sign up'}
              </Button>
            </form>

            <p className="text-center text-sm text-[#64748b]">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-semibold text-[#4F46E5] hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
