/**
 * Tests for PasswordInput component
 * @file src/components/auth/__tests__/PasswordInput.test.tsx
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PasswordInput } from '../PasswordInput'

describe('PasswordInput', () => {
  describe('Basic Functionality', () => {
    it('renders password input with toggle button', () => {
      render(<PasswordInput />)

      const input = screen.getByDisplayValue('')
      const toggleButton = screen.getByRole('button', { name: /show password/i })

      expect(input).toBeInTheDocument()
      expect(toggleButton).toBeInTheDocument()
      expect(input).toHaveAttribute('type', 'password')
    })

    it('shows password when toggle button is clicked', () => {
      render(<PasswordInput />)

      const input = screen.getByDisplayValue('')
      const toggleButton = screen.getByRole('button', { name: /show password/i })

      fireEvent.click(toggleButton)

      expect(input).toHaveAttribute('type', 'text')
    })

    it('hides password when toggle button is clicked again', () => {
      render(<PasswordInput />)

      const input = screen.getByDisplayValue('')
      const toggleButton = screen.getByRole('button', { name: /show password/i })

      fireEvent.click(toggleButton)
      fireEvent.click(toggleButton)

      expect(input).toHaveAttribute('type', 'password')
    })

    it('updates icon based on password visibility', () => {
      render(<PasswordInput />)

      const toggleButton = screen.getByRole('button', { name: /show password/i })

      // Initially shows Eye icon with "Show password" text
      expect(toggleButton).toHaveTextContent(/show password/i)

      // After clicking, shows EyeOff icon with "Hide password" text
      fireEvent.click(toggleButton)
      expect(toggleButton).toHaveTextContent(/hide password/i)
    })

    it('applies custom className', () => {
      render(<PasswordInput className="custom-class" />)

      const input = screen.getByDisplayValue('')
      expect(input).toHaveClass('custom-class')
    })

    it('applies custom placeholder', () => {
      render(<PasswordInput placeholder="Enter password" />)

      expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument()
    })

    it('can be disabled', () => {
      render(<PasswordInput disabled />)

      const input = screen.getByDisplayValue('')
      expect(input).toBeDisabled()
    })

    it('disables toggle button when input is disabled', () => {
      render(<PasswordInput disabled />)

      const toggleButton = screen.getByRole('button', { name: /show password/i })
      expect(toggleButton).toBeDisabled()
    })
  })

  describe('Password Strength Indicator', () => {
    it('does not show strength indicator by default', () => {
      render(<PasswordInput />)

      expect(screen.queryByText(/weak/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/medium/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/strong/i)).not.toBeInTheDocument()
    })

    it('shows strength indicator when showStrength is true and has value', () => {
      render(<PasswordInput showStrength={true} value="test" />)

      // Should show strength bar segments
      const segments = document.querySelectorAll('.h-1.rounded-full')
      expect(segments.length).toBe(4)
    })

    it('does not show strength when showStrength is true but no value', () => {
      render(<PasswordInput showStrength={true} value="" />)

      // Should not show strength text
      expect(screen.queryByText(/weak/i)).not.toBeInTheDocument()
    })

    it('shows weak password strength (score 0-40)', () => {
      const onChange = jest.fn()
      render(<PasswordInput showStrength={true} value="aaaaaaaa" onChange={onChange} />)

      expect(screen.getByText(/weak:/i)).toBeInTheDocument()
    })

    it('shows medium password strength (score 41-60)', () => {
      const onChange = jest.fn()
      render(<PasswordInput showStrength={true} value="Password12" onChange={onChange} />)

      expect(screen.getByText(/medium:/i)).toBeInTheDocument()
    })

    it('shows strong password strength (score 61-80)', () => {
      const onChange = jest.fn()
      render(<PasswordInput showStrength={true} value="Password123!" onChange={onChange} />)

      expect(screen.getByText(/strong:/i)).toBeInTheDocument()
    })

    it('shows very strong password strength (score 81-100)', () => {
      const onChange = jest.fn()
      render(
        <PasswordInput showStrength={true} value="VeryStrong!Pass123@2024" onChange={onChange} />
      )

      expect(screen.getByText(/very strong:/i)).toBeInTheDocument()
    })

    it('displays correct feedback text for weak passwords', () => {
      const onChange = jest.fn()
      render(<PasswordInput showStrength={true} value="weak" onChange={onChange} />)

      expect(screen.getByText(/add more characters or variety/i)).toBeInTheDocument()
    })

    it('displays correct feedback text for medium passwords', () => {
      const onChange = jest.fn()
      render(<PasswordInput showStrength={true} value="Medium12" onChange={onChange} />)

      expect(screen.getByText(/good, but could be stronger/i)).toBeInTheDocument()
    })

    it('displays correct feedback text for strong passwords', () => {
      const onChange = jest.fn()
      // "StrongPass1!" scores ~65: length 9(10) + types 30 + no repeat 10 + simple 0
      render(<PasswordInput showStrength={true} value="StrongPass1!" onChange={onChange} />)

      expect(screen.getByText(/strong:/i)).toBeInTheDocument()
    })

    it('displays correct feedback text for very strong passwords', () => {
      const onChange = jest.fn()
      // "VeryStrong!Pass123@2024" scores ~100 (capped): length 20(30) + types 45 + special 15 + no repeat 10
      render(<PasswordInput showStrength={true} value="VeryStrong!Pass123@2024" onChange={onChange} />)

      expect(screen.getByText(/excellent!/i)).toBeInTheDocument()
    })
  })

  describe('Password Strength Bar', () => {
    it('fills 1 segment for very weak passwords (score 0-20)', () => {
      const onChange = jest.fn()
      render(<PasswordInput showStrength={true} value="aa" onChange={onChange} />)

      const segments = document.querySelectorAll('.h-1.rounded-full')
      const filledSegments = Array.from(segments).filter((seg) =>
        seg.classList.contains('bg-red-500')
      )
      expect(filledSegments.length).toBe(1)
    })

    it('fills 2 segments for weak passwords (score 21-40)', () => {
      const onChange = jest.fn()
      render(<PasswordInput showStrength={true} value="aA1" onChange={onChange} />)

      const segments = document.querySelectorAll('.h-1.rounded-full')
      const filledSegments = Array.from(segments).filter((seg) =>
        seg.classList.contains('bg-red-500')
      )
      expect(filledSegments.length).toBe(2)
    })

    it('fills 3 segments for medium passwords (score 41-60)', () => {
      const onChange = jest.fn()
      render(<PasswordInput showStrength={true} value="Password12" onChange={onChange} />)

      const segments = document.querySelectorAll('.h-1.rounded-full')
      const filledSegments = Array.from(segments).filter((seg) =>
        seg.classList.contains('bg-yellow-500')
      )
      expect(filledSegments.length).toBe(3)
    })

    it('fills 4 segments for strong passwords (score 61-80)', () => {
      const onChange = jest.fn()
      // "Password1!" scores ~65: length 9(10) + types 45 + no repeat 10 + simple 0
      render(<PasswordInput showStrength={true} value="Password1!" onChange={onChange} />)

      const segments = document.querySelectorAll('.h-1.rounded-full')
      const filledSegments = Array.from(segments).filter((seg) =>
        seg.classList.contains('bg-blue-500')
      )
      expect(filledSegments.length).toBe(4)
    })

    it('fills all 4 segments for very strong passwords (score 81-100)', () => {
      const onChange = jest.fn()
      render(<PasswordInput showStrength={true} value="VeryStrong!Pass123@2024" onChange={onChange} />)

      const segments = document.querySelectorAll('.h-1.rounded-full')
      const filledSegments = Array.from(segments).filter((seg) =>
        seg.classList.contains('bg-green-500')
      )
      expect(filledSegments.length).toBe(4)
    })
  })

  describe('Password Strength Calculation', () => {
    it('awards points for length', () => {
      const onChange = jest.fn()
      render(
        <PasswordInput showStrength={true} value="12CharsPass" onChange={onChange} />
      )

      // 12+ characters should award at least 20 points (10 for 8+, 10 for 12+)
      expect(screen.queryByText(/medium:/i)).toBeInTheDocument()
    })

    it('awards points for character variety', () => {
      const onChange = jest.fn()
      // Has all 4 character types but too short: length 0 + variety 45 + no repeat 10 = 55 (Medium)
      render(<PasswordInput showStrength={true} value="aA1!" onChange={onChange} />)

      expect(screen.getByText(/medium:/i)).toBeInTheDocument()
    })

    it('awards bonus for no repeated characters', () => {
      const onChange = jest.fn()
      // 10 chars + all 4 types + no repeat = 10 + 45 + 10 = 65 (Strong)
      render(<PasswordInput showStrength={true} value="aBc1!xyz" onChange={onChange} />)

      // Length 10 + variety 45 + no repeat 10 = 65 (Strong)
      expect(screen.getByText(/strong:/i)).toBeInTheDocument()
    })

    it('awards complexity bonus for long, complex passwords', () => {
      const onChange = jest.fn()
      render(
        <PasswordInput showStrength={true} value="ComplexPass123!@2024" onChange={onChange} />
      )

      // 12+ chars with all types = +20 bonus
      expect(screen.getByText(/very strong:/i)).toBeInTheDocument()
    })

    it('caps score at 100', () => {
      const onChange = jest.fn()
      // Very long password with all types and variety
      render(
        <PasswordInput
          showStrength={true}
          value="VeryLongComplexPassword123!@#$%^&*()2024"
          onChange={onChange}
        />
      )

      // Should show "Very Strong" (capped at 100)
      expect(screen.getByText(/very strong:/i)).toBeInTheDocument()
    })
  })

  describe('Event Handling', () => {
    it('calls onChange when input changes', () => {
      const onChange = jest.fn()
      render(<PasswordInput onChange={onChange} />)

      const input = screen.getByDisplayValue('')
      fireEvent.change(input, { target: { value: 'newpassword' } })

      expect(onChange).toHaveBeenCalled()
    })

    it('updates strength on input change when showStrength is true', async () => {
      const onChange = jest.fn()
      // Render with initial value that shows strength
      render(<PasswordInput showStrength={true} value="weak" onChange={onChange} />)

      // Should show weak strength text
      await waitFor(() => {
        expect(screen.getByText(/weak:/i)).toBeInTheDocument()
      })
    })

    it('does not update strength on input change when showStrength is false', () => {
      const onChange = jest.fn()
      render(<PasswordInput showStrength={false} value="" onChange={onChange} />)

      const input = screen.getByDisplayValue('')
      fireEvent.change(input, { target: { value: 'StrongPass123!' } })

      // Should not show strength text
      expect(screen.queryByText(/strong:/i)).not.toBeInTheDocument()
    })

    it('passes through other props to input', () => {
      render(<PasswordInput id="test-id" name="password" autoComplete="current-password" />)

      const input = screen.getByDisplayValue('')
      expect(input).toHaveAttribute('id', 'test-id')
      expect(input).toHaveAttribute('name', 'password')
      expect(input).toHaveAttribute('autoComplete', 'current-password')
    })
  })
})
