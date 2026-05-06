import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

type Role = 'candidate' | 'company'

async function getOnboardingDone(
  supabase: ReturnType<typeof createServerClient>,
  userId: string,
  role: Role | null,
) {
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

/** Preserve Supabase cookie updates (e.g. refresh) when issuing redirects. */
function redirectWithCookies(from: NextResponse, url: URL) {
  const redirectResponse = NextResponse.redirect(url)
  from.cookies.getAll().forEach(({ name, value }) => {
    redirectResponse.cookies.set(name, value)
  })
  return redirectResponse
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const pathname = request.nextUrl.pathname

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const { data: authData } = await supabase.auth.getUser()
  const user = authData.user

  if (!user) {
    if (
      pathname.startsWith('/candidate') ||
      pathname.startsWith('/company') ||
      pathname.startsWith('/onboarding')
    ) {
      return redirectWithCookies(response, new URL('/auth/login', request.url))
    }
    return response
  }

  const { data: profileData } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const role = (profileData?.role ?? null) as Role | null
  const onboardingDone = await getOnboardingDone(supabase, user.id, role)
  const defaultAuthedPath = !role
    ? '/auth/select-role'
    : onboardingDone
      ? role === 'candidate'
        ? '/candidate/dashboard'
        : '/company/dashboard'
      : '/onboarding'

  // Auth entry pages: always show login/signup until onboarding is complete.
  // Forces the flow sign in / sign up → then select-role (if needed) → onboarding — never skip straight to onboarding from these links.
  if (pathname === '/auth/login' || pathname === '/auth/signup') {
    if (role && onboardingDone) {
      const dest =
        role === 'candidate' ? '/candidate/dashboard' : '/company/dashboard'
      return redirectWithCookies(response, new URL(dest, request.url))
    }
    return response
  }

  if (pathname === '/auth/select-role') {
    if (!user) return redirectWithCookies(response, new URL('/auth/login', request.url))
    return response
  }

  if (pathname.startsWith('/onboarding')) {
    if (!role) return redirectWithCookies(response, new URL('/auth/select-role', request.url))
    if (onboardingDone)
      return redirectWithCookies(response, new URL(defaultAuthedPath, request.url))
    return response
  }

  if (pathname.startsWith('/candidate')) {
    if (role !== 'candidate')
      return redirectWithCookies(response, new URL(defaultAuthedPath, request.url))
    if (!onboardingDone)
      return redirectWithCookies(response, new URL('/onboarding', request.url))
  }

  if (pathname.startsWith('/company')) {
    if (role !== 'company')
      return redirectWithCookies(response, new URL(defaultAuthedPath, request.url))
    if (!onboardingDone)
      return redirectWithCookies(response, new URL('/onboarding', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/auth/login',
    '/auth/signup',
    '/auth/select-role',
    '/onboarding',
    '/candidate',
    '/candidate/:path*',
    '/company',
    '/company/:path*',
  ],
}
