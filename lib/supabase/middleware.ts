import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import {
  ONBOARDING_COMPLETE_COOKIE,
  ONBOARDING_COMPLETE_COOKIE_VALUE,
} from '@/lib/constants/session-cookies'

const PUBLIC_STATIC_PATHS = new Set(['/', '/change-log', '/offline'])

const AUTH_PAGE_PATHS = new Set(['/login', '/register', '/reset-password'])

function hasSupabaseAuthCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some((cookie) => cookie.name.includes('-auth-token'))
}

function readOnboardingCompleteCookie(request: NextRequest): boolean | null {
  const value = request.cookies.get(ONBOARDING_COMPLETE_COOKIE)?.value
  if (value === ONBOARDING_COMPLETE_COOKIE_VALUE) return true
  if (value === '0') return false
  return null
}

async function fetchOnboardingCompleteFromDb(
  supabase: ReturnType<typeof createServerClient>,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', userId)
    .maybeSingle()

  if (error || !data) {
    return false
  }

  return data.onboarding_completed === true
}

async function resolveOnboardingComplete(
  request: NextRequest,
  supabase: ReturnType<typeof createServerClient>,
  userId: string
): Promise<boolean> {
  const cached = readOnboardingCompleteCookie(request)
  if (cached !== null) {
    return cached
  }

  return fetchOnboardingCompleteFromDb(supabase, userId)
}

function setOnboardingCookie(response: NextResponse, complete: boolean) {
  response.cookies.set(ONBOARDING_COMPLETE_COOKIE, complete ? ONBOARDING_COMPLETE_COOKIE_VALUE : '0', {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (PUBLIC_STATIC_PATHS.has(pathname) && !hasSupabaseAuthCookie(request)) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthPage = AUTH_PAGE_PATHS.has(pathname)

  const isPublic =
    PUBLIC_STATIC_PATHS.has(pathname) ||
    isAuthPage ||
    pathname.startsWith('/api/auth/')

  if (user) {
    const onboardingComplete = await resolveOnboardingComplete(request, supabase, user.id)

    if (readOnboardingCompleteCookie(request) === null) {
      setOnboardingCookie(supabaseResponse, onboardingComplete)
    }

    if (onboardingComplete && pathname === '/onboarding') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    const isOnboardingRoute = pathname === '/onboarding'
    const requiresOnboarding =
      !onboardingComplete && !isPublic && !isOnboardingRoute

    if (requiresOnboarding) {
      const url = request.nextUrl.clone()
      url.pathname = '/onboarding'
      return NextResponse.redirect(url)
    }

    if (isAuthPage || pathname === '/dashboard') {
      const url = request.nextUrl.clone()
      url.pathname = onboardingComplete ? '/dashboard' : '/onboarding'
      if (pathname !== url.pathname) {
        return NextResponse.redirect(url)
      }
    }
  }

  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
