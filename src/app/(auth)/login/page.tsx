'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AuthForm } from '@/components/auth/AuthForm'
import { SocialLoginButton } from '@/components/auth/SocialLoginButton'
import { AlertCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const [showError, setShowError] = useState(true)
  const error = searchParams.get('error')
  const errorMessage = searchParams.get('message')

  return (
    <div className="bg-white p-8 shadow-lg sm:rounded-lg">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Sign in to your account to continue
        </p>
      </div>

      {error && errorMessage && showError && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
            <div className="flex-1">
              <p className="font-medium">Authentication Error</p>
              <p className="mt-1 text-red-700">{errorMessage}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setShowError(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Dismiss</span>
            </Button>
          </div>
        </div>
      )}

      <AuthForm type="login" />

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <SocialLoginButton provider="google">
          Google
        </SocialLoginButton>
        <SocialLoginButton provider="apple">
          Apple
        </SocialLoginButton>
      </div>

      <div className="mt-6 flex flex-col gap-2 text-center text-sm">
        <Link
          href="/reset-password"
          className="font-medium text-primary hover:text-primary/90 hover:underline"
        >
          Forgot your password?
        </Link>
        <p className="text-gray-600">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="font-medium text-primary hover:text-primary/90 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
