// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ProfileForm from '../ProfileForm'
import type { Customer } from '@/types/database.types'

// Mock server action
jest.mock('@/app/account/actions', () => ({
  updateProfile: jest.fn(),
}))

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

describe('ProfileForm', () => {
  const mockCustomer: Customer = {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    phone_number: '+15555551234',
    avatar_url: null,
    preferences: null,
    email_preferences: null,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  }

  it('renders profile form with customer data', () => {
    render(<ProfileForm customer={mockCustomer} />)
    
    expect(screen.getByLabelText(/name/i)).toHaveValue('Test User')
    expect(screen.getByLabelText(/email/i)).toHaveValue('test@example.com')
    expect(screen.getByLabelText(/phone/i)).toHaveValue('+15555551234')
  })

  it('email field is disabled', () => {
    render(<ProfileForm customer={mockCustomer} />)
    
    const emailInput = screen.getByLabelText(/email/i)
    expect(emailInput).toBeDisabled()
  })

  it('shows validation error for short name', async () => {
    render(<ProfileForm customer={mockCustomer} />)
    
    const nameInput = screen.getByLabelText(/name/i)
    fireEvent.change(nameInput, { target: { value: 'A' } })
    
    const submitButton = screen.getByRole('button', { name: /save/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    const { updateProfile } = await import('@/app/account/actions')
    jest.mocked(updateProfile).mockResolvedValue({ error: null, data: mockCustomer })
    
    render(<ProfileForm customer={mockCustomer} />)
    
    const nameInput = screen.getByLabelText(/name/i)
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } })
    
    const submitButton = screen.getByRole('button', { name: /save/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalled()
    })
  })

  it('displays error toast on update failure', async () => {
    const { updateProfile } = await import('@/app/account/actions')
    const { toast } = await import('sonner')
    
    jest.mocked(updateProfile).mockResolvedValue({ 
      error: 'Update failed', 
      data: null 
    })
    
    render(<ProfileForm customer={mockCustomer} />)
    
    const submitButton = screen.getByRole('button', { name: /save/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Update failed')
    })
  })
})
