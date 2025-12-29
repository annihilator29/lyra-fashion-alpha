import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  // Handle OAuth errors with specific messages
  if (error) {
    let errorMessage = 'Authentication failed. Please try again.'
    let errorCode = 'unknown_error'

    if (error === 'access_denied') {
      errorMessage = 'Access was denied by the provider. Please try again.'
      errorCode = 'access_denied'
    } else if (error === 'expired_token' || errorDescription?.includes('expired')) {
      errorMessage = 'The authentication link has expired. Please try signing in again.'
      errorCode = 'link_expired'
    } else if (error === 'invalid_token' || errorDescription?.includes('invalid')) {
      errorMessage = 'Invalid authentication token. Please try signing in again.'
      errorCode = 'invalid_token'
    } else if (errorDescription) {
      errorMessage = errorDescription
      errorCode = 'oauth_error'
    }

    // Redirect to login page with error query parameters
    const loginUrl = new URL('/login', origin)
    loginUrl.searchParams.set('error', errorCode)
    loginUrl.searchParams.set('message', errorMessage)
    loginUrl.searchParams.set('next', next)
    return NextResponse.redirect(loginUrl)
  }

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError) {
      return NextResponse.redirect(`${origin}${next}`)
    }

    // Handle exchange errors
    let errorMessage = 'Failed to complete authentication. Please try again.'
    let errorCode = 'exchange_failed'

    if (exchangeError.message.includes('expired')) {
      errorMessage = 'The authentication link has expired. Please try signing in again.'
      errorCode = 'link_expired'
    } else if (exchangeError.message.includes('invalid')) {
      errorMessage = 'Invalid authentication token. Please try signing in again.'
      errorCode = 'invalid_token'
    } else if (exchangeError.message) {
      errorMessage = exchangeError.message
      errorCode = 'auth_error'
    }

    // Redirect to login page with error query parameters
    const loginUrl = new URL('/login', origin)
    loginUrl.searchParams.set('error', errorCode)
    loginUrl.searchParams.set('message', errorMessage)
    loginUrl.searchParams.set('next', next)
    return NextResponse.redirect(loginUrl)
  }

  // No code and no error - unexpected state
  const loginUrl = new URL('/login', origin)
  loginUrl.searchParams.set('error', 'invalid_request')
  loginUrl.searchParams.set('message', 'Invalid authentication request. Please try signing in again.')
  return NextResponse.redirect(loginUrl)
}
