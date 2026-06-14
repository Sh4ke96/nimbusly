'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { getServerT } from '@/lib/i18n/server'
import { getPostAuthRedirectPath } from '@/lib/profile/server'
import { INVITE_CODE_COOKIE, INVITE_MAX_AGE_SEC } from '@/lib/family/constants'
import { isValidInviteCodeFormat, normalizeInviteCode } from '@/lib/family/invite'

export type AuthState = { error: string } | { success: string } | null

export async function login(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const t = await getServerT()

  if (!email || !password) {
    return { error: t.login.errorRequired }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.message.toLowerCase().includes('invalid')) {
      return { error: t.login.errorInvalid }
    }
    if (error.message.toLowerCase().includes('email not confirmed')) {
      return { error: t.login.errorNotConfirmed }
    }
    return { error: t.login.errorGeneric }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect(await getPostAuthRedirectPath(user.id))
  }

  redirect('/onboarding')
}

export async function register(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  const inviteCode = (formData.get('inviteCode') as string)?.trim() ?? ''
  const t = await getServerT()

  if (!email || !password) {
    return { error: t.register.errorRequired }
  }

  if (inviteCode && !isValidInviteCodeFormat(inviteCode)) {
    return { error: t.register.errorInviteCodeInvalid }
  }

  if (password.length < 8) {
    return { error: t.register.errorPasswordLength }
  }

  if (password !== confirmPassword) {
    return { error: t.register.errorPasswordMatch }
  }

  const supabase = await createClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/api/auth/callback`,
    },
  })

  if (error) {
    const message = error.message.toLowerCase()
    if (
      message.includes('already registered') ||
      message.includes('already been registered') ||
      error.code === 'user_already_exists'
    ) {
      return { error: t.register.errorEmailTaken }
    }
    if (
      message.includes('rate limit') ||
      error.code === 'over_email_send_rate_limit'
    ) {
      return { error: t.register.errorEmailRateLimit }
    }
    console.error('[register] signUp failed:', error.message, error.code)
    return { error: t.register.errorGeneric }
  }

  if (inviteCode) {
    const cookieStore = await cookies()
    cookieStore.set(INVITE_CODE_COOKIE, normalizeInviteCode(inviteCode), {
      path: '/',
      maxAge: INVITE_MAX_AGE_SEC,
      sameSite: 'lax',
    })
  }

  return { success: t.register.successMessage }
}
