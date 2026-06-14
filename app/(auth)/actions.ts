'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { getServerT } from '@/lib/i18n/server'
import { getPostAuthRedirectPath } from '@/lib/profile/server'
import { INVITE_CODE_COOKIE, INVITE_MAX_AGE_SEC } from '@/lib/family/constants'
import { executeSignIn } from '@/lib/auth/server/sign-in'
import { executeSignUp } from '@/lib/auth/server/sign-up'

export type AuthState = { error: string } | { success: string } | null

export async function login(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const t = await getServerT()
  const supabase = await createClient()
  const result = await executeSignIn(
    { t, supabase, getPostAuthRedirectPath },
    formData
  )

  if (!result.ok) {
    return { error: result.error }
  }

  redirect(result.redirectTo)
}

export async function register(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const t = await getServerT()
  const supabase = await createClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const result = await executeSignUp({ t, supabase, siteUrl }, formData)

  if (!result.ok) {
    return { error: result.error }
  }

  if (result.inviteCode) {
    const cookieStore = await cookies()
    cookieStore.set(INVITE_CODE_COOKIE, result.inviteCode, {
      path: '/',
      maxAge: INVITE_MAX_AGE_SEC,
      sameSite: 'lax',
    })
  }

  return { success: result.success }
}
