'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

type Role = 'candidate' | 'company'

type Profile = {
  id: string
  role: Role | null
  full_name: string | null
  phone: string | null
  avatar_url: string | null
}

type RefreshResult = {
  profile: Profile | null
  onboardingDone: boolean
}

type AuthContextValue = {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  onboardingDone: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (params: {
    fullName: string
    email: string
    password: string
    role: Role
  }) => Promise<{ error: string | null }>
  signInWithGoogle: (role?: Role) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: (targetUserId?: string) => Promise<RefreshResult>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

async function checkOnboarding(role: Role | null, userId: string) {
  if (!role) return false

  if (role === 'candidate') {
    const { data } = await supabase
      .from('candidate_profiles')
      .select('headline')
      .eq('user_id', userId)
      .maybeSingle()
    return Boolean(data?.headline)
  }

  const { data } = await supabase
    .from('company_profiles')
    .select('company_name')
    .eq('user_id', userId)
    .maybeSingle()

  return Boolean(data?.company_name)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [onboardingDone, setOnboardingDone] = useState(false)
  const [loading, setLoading] = useState(true)

  const refreshProfile = useCallback(
    async (targetUserId?: string): Promise<RefreshResult> => {
      const resolvedUserId = targetUserId ?? user?.id

      if (!resolvedUserId) {
        setProfile(null)
        setOnboardingDone(false)
        return { profile: null, onboardingDone: false }
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, role, full_name, phone, avatar_url')
        .eq('id', resolvedUserId)
        .maybeSingle()

      if (error || !data) {
        setProfile(null)
        setOnboardingDone(false)
        return { profile: null, onboardingDone: false }
      }

      const role = data.role as Role | null
      const done = await checkOnboarding(role, resolvedUserId)
      setProfile(data as Profile)
      setOnboardingDone(done)

      return { profile: data as Profile, onboardingDone: done }
    },
    [user?.id],
  )

  const applyPendingRole = useCallback(async (authUser: User) => {
    const pendingRole = localStorage.getItem('wmo_pending_role') as Role | null
    if (!pendingRole) return

    await supabase.from('profiles').update({ role: pendingRole }).eq('id', authUser.id)
    localStorage.removeItem('wmo_pending_role')
  }, [])

  useEffect(() => {
    let isMounted = true

    const initialize = async () => {
      const { data } = await supabase.auth.getSession()
      if (!isMounted) return

      setSession(data.session)
      setUser(data.session?.user ?? null)

      if (data.session?.user) {
        await applyPendingRole(data.session.user)
        await refreshProfile(data.session.user.id)
      } else {
        setProfile(null)
        setOnboardingDone(false)
      }

      if (isMounted) setLoading(false)
    }

    initialize()

    const { data: listener } = supabase.auth.onAuthStateChange(async (_, nextSession) => {
      setSession(nextSession)
      setUser(nextSession?.user ?? null)

      if (nextSession?.user) {
        await applyPendingRole(nextSession.user)
        await refreshProfile(nextSession.user.id)
      } else {
        setProfile(null)
        setOnboardingDone(false)
      }

      setLoading(false)
    })

    return () => {
      isMounted = false
      listener.subscription.unsubscribe()
    }
  }, [applyPendingRole, refreshProfile])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }, [])

  const signUp = useCallback(
    async ({
      fullName,
      email,
      password,
      role,
    }: {
      fullName: string
      email: string
      password: string
      role: Role
    }) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role, full_name: fullName },
        },
      })

      return { error: error?.message ?? null }
    },
    [],
  )

  const signInWithGoogle = useCallback(async (role?: Role) => {
    if (typeof window !== 'undefined') {
      const maxAge = 600
      const cookieBase = `path=/;max-age=${maxAge};SameSite=Lax`
      if (role) {
        document.cookie = `wmo_oauth_from=signup;${cookieBase}`
        document.cookie = `wmo_pending_role=${role};${cookieBase}`
        localStorage.setItem('wmo_pending_role', role)
      } else {
        document.cookie = `wmo_oauth_from=login;${cookieBase}`
        localStorage.removeItem('wmo_pending_role')
      }
    } else if (role) {
      localStorage.setItem('wmo_pending_role', role)
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    return { error: error?.message ?? null }
  }, [])

  const signOut = useCallback(async () => {
    try {
      await fetch(`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/sign-out`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch {
      /* still attempt client sign-out */
    }
    await supabase.auth.signOut({ scope: 'global' })
    setUser(null)
    setSession(null)
    setProfile(null)
    setOnboardingDone(false)
    if (typeof window !== 'undefined') {
      window.location.assign('/')
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      session,
      profile,
      loading,
      onboardingDone,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      refreshProfile,
    }),
    [
      user,
      session,
      profile,
      loading,
      onboardingDone,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      refreshProfile,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
