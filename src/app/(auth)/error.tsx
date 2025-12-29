'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { AlertCircle, HomeIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

// This component serves as the auth error page
// It's automatically used by Next.js for errors in the (auth) route group

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [errorInfo, setErrorInfo] = useState<{
    title: string
    message: string
    canRecover: boolean
  }>({
    title: 'Authentication Error',
    message: error.message || 'An unexpected error occurred during authentication.',
    canRecover: true,
  })

  useEffect(() => {
    // Parse error message to provide helpful context
    const message = error.message.toLowerCase()

    if (message.includes('expired')) {
      setErrorInfo({
        title: 'Link Expired',
        message: 'The authentication link has expired. Please try signing in again.',
        canRecover: true,
      })
    } else if (message.includes('invalid') || message.includes('token')) {
      setErrorInfo({
        title: 'Invalid Token',
        message: 'The authentication token is invalid. Please try signing in again.',
        canRecover: true,
      })
    } else if (message.includes('denied')) {
      setErrorInfo({
        title: 'Access Denied',
        message: 'Access was denied by the authentication provider. Please try again.',
        canRecover: true,
      })
    } else if (message.includes('rate limit') || message.includes('too many')) {
      setErrorInfo({
        title: 'Too Many Attempts',
        message: 'You have made too many attempts. Please wait a few minutes before trying again.',
        canRecover: false,
      })
    } else if (message.includes('already registered') || message.includes('user already')) {
      setErrorInfo({
        title: 'Account Already Exists',
        message: 'An account with this email already exists. Please sign in instead.',
        canRecover: true,
      })
    } else if (message.includes('password')) {
      setErrorInfo({
        title: 'Password Error',
        message: 'There was an issue with your password. Please check and try again.',
        canRecover: true,
      })
    } else if (message.includes('email')) {
      setErrorInfo({
        title: 'Email Error',
        message: 'There was an issue with your email. Please check and try again.',
        canRecover: true,
      })
    }
  }, [error.message])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl">{errorInfo.title}</CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-center text-sm text-gray-600 mb-6">
            {errorInfo.message}
          </p>

          <div className="space-y-3">
            {errorInfo.canRecover && (
              <Button
                className="w-full"
                onClick={() => reset()}
              >
                Try Again
              </Button>
            )}

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="w-full"
                asChild
              >
                <Link href="/login">
                  Sign In
                </Link>
              </Button>

              <Button
                variant="outline"
                className="w-full"
                asChild
              >
                <Link href="/register">
                  Sign Up
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col items-center gap-2 text-sm text-gray-500">
          <Link
            href="/"
            className="flex items-center gap-1 text-primary hover:text-primary/90 hover:underline"
          >
            <HomeIcon className="h-4 w-4" />
            Return to Home
          </Link>

          {error.digest && (
            <p className="text-xs text-gray-400">
              Error ID: {error.digest}
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
