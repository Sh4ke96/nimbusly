'use client'

import { useActionState } from 'react'
import { login, type AuthState } from '../actions'
import { Button } from '@/components/ui/button'

/** Shared Tailwind classes for text inputs */
const inputClass =
  'flex h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50'

export function LoginForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    login,
    null
  )

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className={inputClass}
        />
      </div>

      {/* Error message from Server Action */}
      {'error' in (state ?? {}) && (
        <p className="text-sm text-destructive">
          {(state as { error: string }).error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  )
}
