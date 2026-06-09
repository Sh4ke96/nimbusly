'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Signs the current user out and redirects to the login page.
 * Auth is verified server-side before acting — per Next.js docs,
 * never rely solely on proxy for authorization.
 */
export async function logout() {
  const supabase = await createClient()

  // Verify session exists before signing out
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  await supabase.auth.signOut()
  redirect('/login')
}
