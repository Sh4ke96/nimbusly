'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getServerT } from '@/lib/i18n/server'
import { getPostAuthRedirectPath } from '@/lib/profile/server'

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
  const t = await getServerT()

  if (!email || !password) {
    return { error: t.register.errorRequired }
  }

  if (password.length < 8) {
    return { error: t.register.errorPasswordLength }
  }

  if (password !== confirmPassword) {
    return { error: t.register.errorPasswordMatch }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`,
    },
  })

  if (error) {
    if (error.message.toLowerCase().includes('already registered')) {
      return { error: t.register.errorEmailTaken }
    }
    return { error: t.register.errorGeneric }
  }

  return { success: t.register.successMessage }
}
