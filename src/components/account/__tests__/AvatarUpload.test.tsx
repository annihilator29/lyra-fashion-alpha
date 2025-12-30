/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AvatarUpload from '../AvatarUpload'

// Mock server actions
jest.mock('@/app/account/actions', () => ({
  uploadAvatar: jest.fn(),
  deleteAvatar: jest.fn(),
}))

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

describe('AvatarUpload', () => {
  it('renders avatar with default image when no avatar URL', () => {
    render(<AvatarUpload currentAvatarUrl={undefined} />)
    
    const img = screen.getByAltText(/profile avatar/i)
    expect(img).toHaveAttribute('src', '/default-avatar.png')
  })

  it('renders avatar with current avatar URL', () => {
    const avatarUrl = 'https://example.com/avatar.jpg'
    render(<AvatarUpload currentAvatarUrl={avatarUrl} />)
    
    const img = screen.getByAltText(/profile avatar/i)
    expect(img).toHaveAttribute('src', avatarUrl)
  })

  it('shows upload and remove buttons', () => {
    const avatarUrl = 'https://example.com/avatar.jpg'
    render(<AvatarUpload currentAvatarUrl={avatarUrl} />)
    
    expect(screen.getByRole('button', { name: /upload new/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument()
  })

  it('does not show remove button when no avatar', () => {
    render(<AvatarUpload currentAvatarUrl={undefined} />)
    
    expect(screen.getByRole('button', { name: /upload new/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument()
  })

  it('validates file type on upload', async () => {
    const { toast } = await import('sonner')
    
    render(<AvatarUpload currentAvatarUrl={undefined} />)
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const invalidFile = new File(['content'], 'document.pdf', { type: 'application/pdf' })
    
    Object.defineProperty(fileInput, 'files', {
      value: [invalidFile],
      writable: false,
    })
    
    fireEvent.change(fileInput)
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please select an image file')
    })
  })

  it('validates file size on upload', async () => {
    const { toast } = await import('sonner')
    
    render(<AvatarUpload currentAvatarUrl={undefined} />)
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    
    // Create a file larger than 2MB
    const largeFile = new File([new ArrayBuffer(3 * 1024 * 1024)], 'large.jpg', { 
      type: 'image/jpeg' 
    })
    
    Object.defineProperty(fileInput, 'files', {
      value: [largeFile],
      writable: false,
    })
    
    fireEvent.change(fileInput)
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Image must be smaller than 2MB')
    })
  })

  it('uploads avatar successfully', async () => {
    const { uploadAvatar } = await import('@/app/account/actions')
    const { toast } = await import('sonner')
    
    const newAvatarUrl = 'https://example.com/new-avatar.jpg'
    jest.mocked(uploadAvatar).mockResolvedValue({ 
      error: null, 
      data: { avatar_url: newAvatarUrl } 
    })
    
    render(<AvatarUpload currentAvatarUrl={undefined} />)
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const validFile = new File(['content'], 'avatar.jpg', { type: 'image/jpeg' })
    
    Object.defineProperty(fileInput, 'files', {
      value: [validFile],
      writable: false,
    })
    
    fireEvent.change(fileInput)
    
    await waitFor(() => {
      expect(uploadAvatar).toHaveBeenCalledWith(validFile)
      expect(toast.success).toHaveBeenCalledWith('Avatar updated successfully')
    })
  })

  it('deletes avatar successfully', async () => {
    const { deleteAvatar } = await import('@/app/account/actions')
    const { toast } = await import('sonner')
    
    jest.mocked(deleteAvatar).mockResolvedValue({ 
      error: null, 
      data: {} 
    })
    
    const avatarUrl = 'https://example.com/avatar.jpg'
    render(<AvatarUpload currentAvatarUrl={avatarUrl} />)
    
    const removeButton = screen.getByRole('button', { name: /remove/i })
    fireEvent.click(removeButton)
    
    await waitFor(() => {
      expect(deleteAvatar).toHaveBeenCalled()
      expect(toast.success).toHaveBeenCalledWith('Avatar removed')
    })
  })

  it('handles upload error', async () => {
    const { uploadAvatar } = await import('@/app/account/actions')
    const { toast } = await import('sonner')
    
    jest.mocked(uploadAvatar).mockResolvedValue({ 
      error: 'Upload failed', 
      data: null 
    })
    
    render(<AvatarUpload currentAvatarUrl={undefined} />)
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const validFile = new File(['content'], 'avatar.jpg', { type: 'image/jpeg' })
    
    Object.defineProperty(fileInput, 'files', {
      value: [validFile],
      writable: false,
    })
    
    fireEvent.change(fileInput)
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Upload failed')
    })
  })
})
