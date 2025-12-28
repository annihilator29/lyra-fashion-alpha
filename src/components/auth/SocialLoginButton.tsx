'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Provider } from '@supabase/supabase-js'

interface SocialLoginButtonProps {
  provider: 'google' | 'apple'
  children: React.ReactNode
}

export function SocialLoginButton({ provider, children }: SocialLoginButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const supabase = createClient()

  const handleLogin = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider as Provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) throw error
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Social login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      type="button"
      disabled={isLoading}
      onClick={handleLogin}
      className="w-full"
    >
      {isLoading ? (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </Button>
  )
}
