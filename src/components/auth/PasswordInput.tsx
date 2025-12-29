'use client'

import * as React from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  showStrength?: boolean
}

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(({ className, showStrength = false, ...props }, ref) => {
  const [showPassword, setShowPassword] = React.useState(false)
  const [strength, setStrength] = React.useState(0)
  const [strengthText, setStrengthText] = React.useState('')

  // Calculate strength on initial render and when value changes
  React.useEffect(() => {
    if (showStrength && props.value && typeof props.value === 'string' && props.value !== '') {
      const score = calculateStrength(props.value)
      setStrength(score)
      setStrengthText(getStrengthText(score))
    }
  }, [showStrength, props.value])

  const calculateStrength = (value: string) => {
    let score = 0

    // Length requirements (8+ chars required)
    if (value.length >= 8) score += 10
    if (value.length >= 12) score += 10
    if (value.length >= 16) score += 10

    // Character variety (each category)
    if (/[a-z]/.test(value)) score += 10
    if (/[A-Z]/.test(value)) score += 10
    if (/\d/.test(value)) score += 10
    if (/[^a-zA-Z0-9]/.test(value)) score += 15

    // Complexity bonuses
    if (!/(.)\1{2}/.test(value)) score += 10 // No repeated characters
    if (value.length >= 12 && /[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value)) score += 20

    return Math.min(score, 100) // Cap at 100
  }

  const getStrengthText = (score: number): string => {
    if (score <= 40) return 'Weak: Add more characters or variety'
    if (score <= 60) return 'Medium: Good, but could be stronger'
    if (score <= 80) return 'Strong: Great!'
    return 'Very Strong: Excellent!'
  }

  const getStrengthColor = (score: number): string => {
    if (score <= 40) return 'bg-red-500'
    if (score <= 60) return 'bg-yellow-500'
    if (score <= 80) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getFillCount = (score: number): number => {
    if (score <= 20) return 1  // 0-20: 1 segment
    if (score <= 40) return 2  // 21-40: 2 segments
    if (score <= 60) return 3  // 41-60: 3 segments
    if (score <= 80) return 4  // 61-80: 4 segments
    return 4 // 81-100: All 4 segments
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (showStrength) {
      const score = calculateStrength(e.target.value)
      setStrength(score)
      setStrengthText(getStrengthText(score))
    }
    props.onChange?.(e)
  }

  return (
    <div className="relative">
      <Input
        type={showPassword ? 'text' : 'password'}
        className={cn('pr-10', className)}
        ref={ref}
        {...props}
        onChange={handleChange}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
        onClick={() => setShowPassword((prev) => !prev)}
        disabled={props.disabled}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Eye className="h-4 w-4 text-muted-foreground" />
        )}
        <span className="sr-only">
          {showPassword ? 'Hide password' : 'Show password'}
        </span>
      </Button>
      {showStrength && props.value && (
        <div className="mt-2">
          <div className="flex gap-1">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1 flex-1 rounded-full transition-colors',
                  i < getFillCount(strength)
                    ? getStrengthColor(strength)
                    : 'bg-muted'
                )}
              />
            ))}
          </div>
          {strengthText && (
            <p className="mt-1 text-xs text-muted-foreground">
              {strengthText}
            </p>
          )}
        </div>
      )}
    </div>
  )
})
PasswordInput.displayName = 'PasswordInput'
