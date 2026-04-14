import { createClient } from '@/lib/supabase/server'
import { logout } from '../actions'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Dashboard — Nimbusly',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Logged in as{' '}
          <span className="font-medium text-foreground">{user?.email}</span>
        </p>
        <p className="text-xs text-muted-foreground">User ID: {user?.id}</p>
      </div>

      {/* Logout form — Server Action */}
      <form action={logout}>
        <Button type="submit" variant="outline">
          Sign out
        </Button>
      </form>
    </main>
  )
}
