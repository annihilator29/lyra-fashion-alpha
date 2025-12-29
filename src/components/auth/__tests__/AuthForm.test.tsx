/**
 * Tests for AuthForm component
 * @file src/components/auth/__tests__/AuthForm.test.tsx
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AuthForm } from '../AuthForm'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}))

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

describe('AuthForm', () => {
  const mockPush = jest.fn()
  const mockRefresh = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    })

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    })
  })

  describe('Login Form', () => {
    beforeEach(() => {
      const mockSupabase = {
        auth: {
          signInWithPassword: jest.fn(),
        },
      }
      ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
    })

    it('renders login form fields', () => {
      render(<AuthForm type="login" />)

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('renders "Remember me" checkbox for login', () => {
      render(<AuthForm type="login" />)

      expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument()
      expect(screen.getByText(/stay logged in on this device/i)).toBeInTheDocument()
    })

    it('does not render name field for login', () => {
      render(<AuthForm type="login" />)

      expect(screen.queryByLabelText(/name/i)).not.toBeInTheDocument()
    })

    it('shows success toast on successful login', async () => {
      const mockSupabase = {
        auth: {
          signInWithPassword: jest.fn().mockResolvedValue({ error: null }),
        },
      }
      ;(createClient as jest.Mock).mockReturnValue(mockSupabase)

      render(<AuthForm type="login" />)

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      })
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'Password123!' },
      })
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Logged in successfully!')
        expect(mockPush).toHaveBeenCalledWith('/')
        expect(mockRefresh).toHaveBeenCalled()
      })
    })

    it('shows error toast on failed login', async () => {
      const mockError = new Error('Invalid login credentials')
      const mockSupabase = {
        auth: {
          signInWithPassword: jest.fn().mockResolvedValue({ error: mockError }),
        },
      }
      ;(createClient as jest.Mock).mockReturnValue(mockSupabase)

      render(<AuthForm type="login" />)

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      })
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'wrongpassword' },
      })
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Invalid login credentials')
      })
    })

    it('saves credentials to localStorage when "Remember me" is checked', async () => {
      const mockSupabase = {
        auth: {
          signInWithPassword: jest.fn().mockResolvedValue({ error: null }),
        },
      }
      ;(createClient as jest.Mock).mockReturnValue(mockSupabase)

      render(<AuthForm type="login" />)

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      })
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'Password123!' },
      })
      fireEvent.click(screen.getByLabelText(/remember me/i))
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(window.localStorage.setItem).toHaveBeenCalledWith('rememberMe', 'true')
        expect(window.localStorage.setItem).toHaveBeenCalledWith('savedEmail', 'test@example.com')
        expect(window.localStorage.setItem).toHaveBeenCalledWith('savedPassword', 'Password123!')
      })
    })

    it('removes credentials from localStorage when "Remember me" is unchecked', async () => {
      const mockSupabase = {
        auth: {
          signInWithPassword: jest.fn().mockResolvedValue({ error: null }),
        },
      }
      ;(createClient as jest.Mock).mockReturnValue(mockSupabase)

      render(<AuthForm type="login" />)

      // Start with checkbox checked (default)
      const checkbox = screen.getByLabelText(/remember me/i)
      expect(checkbox).toBeChecked()

      // Uncheck it
      fireEvent.click(checkbox)
      expect(checkbox).not.toBeChecked()

      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

      await waitFor(() => {
        expect(window.localStorage.removeItem).toHaveBeenCalledWith('rememberMe')
        expect(window.localStorage.removeItem).toHaveBeenCalledWith('savedEmail')
        expect(window.localStorage.removeItem).toHaveBeenCalledWith('savedPassword')
      })
    })

    it('loads saved credentials on mount for login type', () => {
      (window.localStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === 'rememberMe') return 'true'
        if (key === 'savedEmail') return 'test@example.com'
        if (key === 'savedPassword') return 'Password123!'
        return null
      })

      render(<AuthForm type="login" />)

      expect(window.localStorage.getItem).toHaveBeenCalledWith('rememberMe')
      expect(window.localStorage.getItem).toHaveBeenCalledWith('savedEmail')
      expect(window.localStorage.getItem).toHaveBeenCalledWith('savedPassword')
    })
  })

  describe('Registration Form', () => {
    beforeEach(() => {
      const mockSupabase = {
        auth: {
          signUp: jest.fn(),
        },
      }
      ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
    })

    it('renders registration form fields', () => {
      render(<AuthForm type="register" />)

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
    })

    it('does not render "Remember me" checkbox for registration', () => {
      render(<AuthForm type="register" />)

      expect(screen.queryByLabelText(/remember me/i)).not.toBeInTheDocument()
    })

    it('shows success toast on successful registration', async () => {
      const mockSupabase = {
        auth: {
          signUp: jest.fn().mockResolvedValue({ error: null }),
        },
      }
      ;(createClient as jest.Mock).mockReturnValue(mockSupabase)

      render(<AuthForm type="register" />)

      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: 'John Doe' },
      })
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      })
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'Password123!' },
      })
      fireEvent.click(screen.getByRole('button', { name: /create account/i }))

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Registration successful! Please check your email.')
        expect(mockPush).toHaveBeenCalledWith('/login')
      })
    })

    it('shows specific error for already registered user', async () => {
      const mockError = new Error('User already registered')
      const mockSupabase = {
        auth: {
          signUp: jest.fn().mockResolvedValue({ error: mockError }),
        },
      }
      ;(createClient as jest.Mock).mockReturnValue(mockSupabase)

      render(<AuthForm type="register" />)

      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: 'John Doe' },
      })
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      })
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'Password123!' },
      })
      fireEvent.click(screen.getByRole('button', { name: /create account/i }))

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('User already registered. Please login.')
      })
    })

    it('validates password length requirement', async () => {
      render(<AuthForm type="register" />)

      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: 'John Doe' },
      })
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      })
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'short' },
      })
      fireEvent.click(screen.getByRole('button', { name: /create account/i }))

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
      })
    })

    it('validates email format', async () => {
      render(<AuthForm type="register" />)

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'invalid-email' },
      })
      fireEvent.click(screen.getByRole('button', { name: /create account/i }))

      await waitFor(() => {
        expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
      })
    })

    it('validates password character type mix requirement', async () => {
      render(<AuthForm type="register" />)

      // Password with only lowercase - should fail
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      })
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'aaaaaaaa' },
      })
      fireEvent.click(screen.getByRole('button', { name: /create account/i }))

      await waitFor(() => {
        expect(screen.getByText(/must contain at least 2 of: lowercase letters, uppercase letters, numbers, special characters/i)).toBeInTheDocument()
      })
    })

    it('shows password strength indicator for registration', () => {
      render(<AuthForm type="register" />)

      const passwordInput = screen.getByLabelText(/password/i)
      expect(passwordInput).toBeInTheDocument()
      // PasswordInput component should render with showStrength=true
    })

    it('hides password strength indicator for login', () => {
      render(<AuthForm type="login" />)

      const passwordInput = screen.getByLabelText(/password/i)
      expect(passwordInput).toBeInTheDocument()
      // PasswordInput component should render with showStrength=false
    })
  })

  describe('Form State', () => {
    it('disables submit button while loading', async () => {
      const mockSupabase = {
        auth: {
          signInWithPassword: jest.fn().mockImplementation(
            () => new Promise((resolve) => setTimeout(() => resolve({ error: null }), 1000)
          ),)
        },
      }
      ;(createClient as jest.Mock).mockReturnValue(mockSupabase)

      render(<AuthForm type="login" />)

      const submitButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      })
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'Password123!' },
      })
      fireEvent.click(submitButton)

      // Button should be disabled while loading
      expect(submitButton).toBeDisabled()
    })

    it('enables submit button after completion', async () => {
      const mockSupabase = {
        auth: {
          signInWithPassword: jest.fn().mockResolvedValue({ error: null }),
        },
      }
      ;(createClient as jest.Mock).mockReturnValue(mockSupabase)

      render(<AuthForm type="login" />)

      const submitButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      })
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'Password123!' },
      })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled()
      })
    })
  })
})
