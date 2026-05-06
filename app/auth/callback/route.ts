import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

type Role = 'candidate' | 'company'

function redirectWithSessionCookies(from: NextResponse, url: URL) {
  const redirectResponse = NextResponse.redirect(url)
  from.cookies.getAll().forEach(({ name, value }) => {
    redirectResponse.cookies.set(name, value)
  })
  return redirectResponse
}

function clearOAuthHintCookies(res: NextResponse) {
  res.cookies.set('wmo_pending_role', '', { path: '/', maxAge: 0 })
  res.cookies.set('wmo_oauth_from', '', { path: '/', maxAge: 0 })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  const cookieStore = await cookies()
  let response = NextResponse.redirect(new URL('/onboarding', req.url))

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  const {
    data: { session },
    error,
  } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !session) {
    console.error('Callback error:', error)
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  const userId = session.user.id

  const pendingRaw = req.cookies.get('wmo_pending_role')?.value
  const oauthFrom = req.cookies.get('wmo_oauth_from')?.value
  const validPending: Role | null =
    pendingRaw === 'candidate' || pendingRaw === 'company' ? pendingRaw : null

  if (validPending) {
    await supabase.from('profiles').update({ role: validPending }).eq('id', userId)
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle()

  const role = profile?.role as Role | null | undefined

  const createdAt = new Date(session.user.created_at).getTime()
  const lastSignIn = new Date(session.user.last_sign_in_at ?? session.user.created_at).getTime()
  const isNewUser = Math.abs(lastSignIn - createdAt) < 120_000

  let destinationPath = '/onboarding'

  if (!role) {
    destinationPath = '/auth/select-role'
  } else if (oauthFrom === 'login' && isNewUser) {
    const { data: cp } = await supabase.from('candidate_profiles').select('id').eq('user_id', userId).maybeSingle()
    const { data: comp } = await supabase.from('company_profiles').select('id').eq('user_id', userId).maybeSingle()
    if (!cp && !comp) {
      destinationPath = '/auth/select-role'
    }
  }

  if (destinationPath !== '/auth/select-role') {
    if (role === 'candidate') {
      const { data: cp } = await supabase
        .from('candidate_profiles')
        .select('headline')
        .eq('user_id', userId)
        .maybeSingle()

      if (cp?.headline) {
        destinationPath = '/candidate/dashboard'
      }
    } else if (role === 'company') {
      const { data: comp } = await supabase
        .from('company_profiles')
        .select('company_name')
        .eq('user_id', userId)
        .maybeSingle()

      if (comp?.company_name) {
        destinationPath = '/company/dashboard'
      }
    }
  }

  const redirectResponse = redirectWithSessionCookies(response, new URL(destinationPath, req.url))
  clearOAuthHintCookies(redirectResponse)
  return redirectResponse
}
