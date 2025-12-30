import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PasswordChangeForm from '../PasswordChangeForm'

// Mock server action
jest.mock('@/app/account/actions', () => ({
  changePassword: jest.fn(),
}))

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

describe('PasswordChangeForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders password change form with all fields', () => {
    render(<PasswordChangeForm />)
    
    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /change password/i })).toBeInTheDocument()
  })

  it('shows password requirements when new password is entered', () => {
    render(<PasswordChangeForm />)
    
    const newPasswordInput = screen.getByLabelText(/^new password$/i)
    fireEvent.change(newPasswordInput, { target: { value: 'Test' } })
    
    expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument()
    expect(screen.getByText(/at least 1 uppercase letter/i)).toBeInTheDocument()
    expect(screen.getByText(/at least 1 lowercase letter/i)).toBeInTheDocument()
    expect(screen.getByText(/at least 1 number/i)).toBeInTheDocument()
    expect(screen.getByText(/at least 1 special character/i)).toBeInTheDocument()
  })

  it('validates password strength requirements', () => {
    render(<PasswordChangeForm />)
    
    const newPasswordInput = screen.getByLabelText(/^new password$/i)
    
    // Weak password
    fireEvent.change(newPasswordInput, { target: { value: 'weak' } })
    expect(screen.getByText(/✗/)).toBeInTheDocument()
    
    // Strong password
    fireEvent.change(newPasswordInput, { target: { value: 'Strong123!' } })
    expect(screen.getAllByText(/✓/)).toHaveLength(5)
  })

  it('submits password change with valid data', async () => {
    const { changePassword } = await import('@/app/account/actions')
    const { toast } = await import('sonner')
    
    jest.mocked(changePassword).mockResolvedValue({ error: null, data: { success: true } })
    
    render(<PasswordChangeForm />)
    
    fireEvent.change(screen.getByLabelText(/current password/i), { 
      target: { value: 'OldPass123!' } 
    })
    fireEvent.change(screen.getByLabelText(/^new password$/i), { 
      target: { value: 'NewPass123!' } 
    })
    fireEvent.change(screen.getByLabelText(/confirm new password/i), { 
      target: { value: 'NewPass123!' } 
    })
    
    const submitButton = screen.getByRole('button', { name: /change password/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(changePassword).toHaveBeenCalled()
      expect(toast.success).toHaveBeenCalledWith('Password changed successfully')
    })
  })

  it('shows error when current password is incorrect', async () => {
    const { changePassword } = await import('@/app/account/actions')
    const { toast } = await import('sonner')
    
    jest.mocked(changePassword).mockResolvedValue({ 
      error: 'Current password is incorrect', 
      data: null 
    })
    
    render(<PasswordChangeForm />)
    
    fireEvent.change(screen.getByLabelText(/current password/i), { 
      target: { value: 'WrongPass123!' } 
    })
    fireEvent.change(screen.getByLabelText(/^new password$/i), { 
      target: { value: 'NewPass123!' } 
    })
    fireEvent.change(screen.getByLabelText(/confirm new password/i), { 
      target: { value: 'NewPass123!' } 
    })
    
    const submitButton = screen.getByRole('button', { name: /change password/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Current password is incorrect')
    })
  })
})
