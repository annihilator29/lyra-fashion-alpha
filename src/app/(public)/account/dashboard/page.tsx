'use client'

import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LogOut, ShoppingBag, Package } from 'lucide-react'

export default function AccountDashboard() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading your account...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col items-center text-center">
                <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center text-4xl font-bold text-white mb-4">
                  {user.email?.charAt(0)?.toUpperCase()}
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">{user.email}</h2>
                <p className="text-sm text-muted-foreground mb-4">Welcome back!</p>
                <div className="text-xs text-gray-500">
                  <p>Member since: {new Date().getFullYear()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
              <div className="space-y-3">
                <Link href="/" className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary transition-colors">
                  <ShoppingBag className="h-4 w-4" />
                  <span>Continue Shopping</span>
                </Link>
                <Link href="/cart" className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary transition-colors">
                  <Package className="h-4 w-4" />
                  <span>View Cart</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                Account Settings
              </h3>
              <div className="space-y-3">
                <div className="p-4 border rounded-lg bg-gray-50">
                  <p className="text-sm font-medium text-gray-700 mb-2">Email Address</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>

                <div className="p-4 border rounded-lg bg-gray-50">
                  <p className="text-sm font-medium text-gray-700 mb-2">Authentication</p>
                  <p className="text-sm text-gray-600">
                    Logged in via: <span className="font-semibold">Email and Password</span>
                  </p>
                </div>

                <div className="p-4 border rounded-lg bg-gray-50">
                  <p className="text-sm font-medium text-gray-700 mb-2">Account Status</p>
                  <p className="text-sm text-green-600 font-medium">Active</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order History</h3>
              <p className="text-sm text-gray-600 mb-4">
                View your past orders and track current orders.
              </p>
              <div className="p-4 border rounded-lg bg-gray-50 text-center">
                <p className="text-sm text-muted-foreground">
                  Coming soon - Order history will be available in future updates
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>
              <p className="text-sm text-gray-600 mb-4">
                Manage your email preferences and style preferences.
              </p>
              <div className="p-4 border rounded-lg bg-gray-50 text-center">
                <p className="text-sm text-muted-foreground">
                  Coming soon - Preferences will be available in future updates
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
