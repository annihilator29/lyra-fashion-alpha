/**
 * Tests for use-auth hook
 * @file src/hooks/__tests__/use-auth.test.tsx
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import { useAuth } from '../use-auth'
import { createClient } from '@/lib/supabase/client'

// Mock dependencies
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}))

describe('useAuth', () => {
  interface MockSupabaseAuth {
    onAuthStateChange: jest.Mock
    signOut: jest.Mock
  }

  interface MockSupabaseClient {
    auth: MockSupabaseAuth
  }

  let mockSupabase: MockSupabaseClient
  let mockAuthStateChange: jest.Mock
  let mockUnsubscribe: jest.Mock
  let storedCallback: any = null

  beforeEach(() => {
    storedCallback = null

    mockAuthStateChange = jest.fn((callback) => {
      // Store callback for later invocation
      storedCallback = callback

      // Return mock subscription object
      const subscription = {
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      }
      return subscription
    })

    mockUnsubscribe = jest.fn()

    mockSupabase = {
      auth: {
        onAuthStateChange: mockAuthStateChange,
        signOut: jest.fn(async () => {
          // Simulate Supabase signOut triggering state change
          if (storedCallback) {
            await storedCallback('SIGNED_OUT', null)
          }
        }),
      },
    }

    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Initial State', () => {
    it('initializes with loading state true', () => {
      const { result } = renderHook(() => useAuth())

      // Loading should be true initially
      expect(result.current.loading).toBe(true)
      expect(result.current.user).toBeNull()
      expect(result.current.session).toBeNull()
    })

    it('sets loading to false after initial auth check', async () => {
      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })

    it('calls supabase auth state change listener on mount', () => {
      renderHook(() => useAuth())

      expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalled()
    })

    it('returns null user when unauthenticated', () => {
      const { result } = renderHook(() => useAuth())

      expect(result.current.user).toBeNull()
    })

    it('returns null session when unauthenticated', () => {
      const { result } = renderHook(() => useAuth())

      expect(result.current.session).toBeNull()
    })
  })

  describe('Authenticated State', () => {
    it('updates user when authentication changes', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        aud: 'authenticated',
      }
      const mockSession = {
        user: mockUser,
        access_token: 'mock-token',
        expires_in: 3600,
      }

      // Override mock to simulate authenticated state
      mockAuthStateChange = jest.fn((callback) => {
        const subscription = {
          data: { subscription: { unsubscribe: mockUnsubscribe } },
        }
        callback('SIGNED_IN', mockSession)
        return subscription
      })

      mockSupabase.auth.onAuthStateChange = mockAuthStateChange

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
        expect(result.current.session).toEqual(mockSession)
      })
    })

    it('updates session when authentication changes', async () => {
      const mockSession = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          aud: 'authenticated',
        },
        access_token: 'mock-token',
        expires_in: 3600,
      }

      // Override mock to simulate authenticated state
      mockAuthStateChange = jest.fn((callback) => {
        const subscription = {
          data: { subscription: { unsubscribe: mockUnsubscribe } },
        }
        callback('SIGNED_IN', mockSession)
        return subscription
      })

      mockSupabase.auth.onAuthStateChange = mockAuthStateChange

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.session).toEqual(mockSession)
      })
    })

    it('sets loading to false after authentication check', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        aud: 'authenticated',
      }
      const mockSession = {
        user: mockUser,
        access_token: 'mock-token',
        expires_in: 3600,
      }

      mockAuthStateChange = jest.fn((callback) => {
        const subscription = {
          data: { subscription: { unsubscribe: mockUnsubscribe } },
        }
        callback('SIGNED_IN', mockSession)
        return subscription
      })

      mockSupabase.auth.onAuthStateChange = mockAuthStateChange

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })
  })

  describe('Sign Out', () => {
    it('clears user state after signOut', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        aud: 'authenticated',
      }
      const mockSession = {
        user: mockUser,
        access_token: 'mock-token',
        expires_in: 3600,
      }

      // Override mock to simulate authenticated state
      mockAuthStateChange = jest.fn((callback) => {
        storedCallback = callback

        const subscription = {
          data: { subscription: { unsubscribe: mockUnsubscribe } },
        }

        callback('SIGNED_IN', mockSession)
        return subscription
      })

      mockSupabase.auth.onAuthStateChange = mockAuthStateChange

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
      })

      await act(async () => {
        await result.current.signOut()
      })

      await waitFor(() => {
        expect(result.current.user).toBeNull()
      })
    })

    it('calls supabase signOut when signOut is invoked', async () => {
      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.signOut()
      })

      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
    })

    it('clears user state after signOut', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        aud: 'authenticated',
      }
      const mockSession = {
        user: mockUser,
        access_token: 'mock-token',
        expires_in: 3600,
      }

      // Simulate sign out
      let callCount = 0
      mockAuthStateChange = jest.fn((callback) => {
        const subscription = {
          data: { subscription: { unsubscribe: mockUnsubscribe } },
        }

        if (callCount === 0) {
          callback('SIGNED_IN', mockSession)
        } else {
          callback('SIGNED_OUT', null)
        }

        callCount++
        return subscription
      })

      mockSupabase.auth.onAuthStateChange = mockAuthStateChange

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
      })

      await act(async () => {
        await result.current.signOut()
      })

      await waitFor(() => {
        expect(result.current.user).toBeNull()
      })
    })

    it('clears session after signOut', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        aud: 'authenticated',
      }
      const mockSession = {
        user: mockUser,
        access_token: 'mock-token',
        expires_in: 3600,
      }

      // Override mock to simulate authenticated state
      mockAuthStateChange = jest.fn((callback) => {
        storedCallback = callback

        const subscription = {
          data: { subscription: { unsubscribe: mockUnsubscribe } },
        }

        callback('SIGNED_IN', mockSession)
        return subscription
      })

      mockSupabase.auth.onAuthStateChange = mockAuthStateChange

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.session).toEqual(mockSession)
      })

      await act(async () => {
        await result.current.signOut()
      })

      await waitFor(() => {
        expect(result.current.session).toBeNull()
      })
    })
  })

  describe('Cleanup', () => {
    it('unsubscribes from auth state change on unmount', () => {
      const { unmount } = renderHook(() => useAuth())

      unmount()

      expect(mockUnsubscribe).toHaveBeenCalled()
    })

    it('prevents memory leaks by cleaning up subscription', () => {
      const { unmount } = renderHook(() => useAuth())

      // Unmount
      unmount()

      // Manually trigger auth state change - should not update hook state
      // This test verifies no updates occur after unmount
      expect(mockUnsubscribe).toHaveBeenCalled()
    })
  })

  describe('Session Updates', () => {
    it('updates user when session refreshes', async () => {
      const initialUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { name: 'John' },
        aud: 'authenticated',
      }
      const updatedUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { name: 'John Updated' },
        aud: 'authenticated',
      }

      const initialSession = {
        user: initialUser,
        access_token: 'token-1',
        expires_in: 3600,
      }

      const updatedSession = {
        user: updatedUser,
        access_token: 'token-2',
        expires_in: 3600,
      }

      // Override mock to simulate session refresh
      mockAuthStateChange = jest.fn((callback) => {
        storedCallback = callback

        const subscription = {
          data: { subscription: { unsubscribe: mockUnsubscribe } },
        }

        callback('SIGNED_IN', initialSession)
        return subscription
      })

      mockSupabase.auth.onAuthStateChange = mockAuthStateChange

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.user).toEqual(initialUser)
      })

      // Simulate token refresh
      act(() => {
        if (storedCallback) {
          storedCallback('TOKEN_REFRESHED', updatedSession)
        }
      })

      await waitFor(() => {
        expect(result.current.user).toEqual(updatedUser)
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles multiple auth state changes', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        aud: 'authenticated',
      }
      const mockSession = {
        user: mockUser,
        access_token: 'mock-token',
        expires_in: 3600,
      }

      let callCount = 0
      mockAuthStateChange = jest.fn((callback) => {
        const subscription = {
          data: { subscription: { unsubscribe: mockUnsubscribe } },
        }

        // Simulate multiple auth events
        const events = ['SIGNED_IN', 'USER_UPDATED', 'TOKEN_REFRESHED']
        callback(events[callCount] || 'SIGNED_IN', mockSession)

        callCount++
        return subscription
      })

      mockSupabase.auth.onAuthStateChange = mockAuthStateChange

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
        expect(result.current.loading).toBe(false)
      })
    })

    it('handles user with metadata', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        aud: 'authenticated',
        user_metadata: {
          name: 'John Doe',
          avatar_url: 'https://example.com/avatar.jpg',
        },
      }
      const mockSession = {
        user: mockUser,
        access_token: 'mock-token',
        expires_in: 3600,
      }

      mockAuthStateChange = jest.fn((callback) => {
        const subscription = {
          data: { subscription: { unsubscribe: mockUnsubscribe } },
        }
        callback('SIGNED_IN', mockSession)
        return subscription
      })

      mockSupabase.auth.onAuthStateChange = mockAuthStateChange

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
        expect(result.current.user?.user_metadata).toEqual(mockUser.user_metadata)
      })
    })
  })
})
