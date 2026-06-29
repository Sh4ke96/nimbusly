'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { ONBOARDING_COMPLETE_COOKIE } from '@/lib/constants/session-cookies'
import { createClient } from '@/lib/supabase/server'

export async function logout() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  await supabase.auth.signOut()

  const cookieStore = await cookies()
  cookieStore.delete(ONBOARDING_COMPLETE_COOKIE)

  redirect('/login')
}
