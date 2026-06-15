import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

async function isOnboardingComplete(
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

export async function updateSession(request: NextRequest) {
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

  const pathname = request.nextUrl.pathname

  const authOnlyPaths = ['/login', '/register']
  const isAuthPage = authOnlyPaths.includes(pathname)

  const isPublic =
    pathname === '/' ||
    pathname === '/change-log' ||
    isAuthPage ||
    pathname.startsWith('/api/auth/')

  if (user) {
    const onboardingComplete = await isOnboardingComplete(supabase, user.id)

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
