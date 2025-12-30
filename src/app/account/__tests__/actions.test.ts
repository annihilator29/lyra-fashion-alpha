/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  updateProfile,
  updatePreferences,
  changePassword,
  uploadAvatar,
  deleteAvatar,
  createShippingAddress,
  updateShippingAddress,
  deleteShippingAddress,
  setDefaultShippingAddress,
  reorderItems,
} from '../actions'

// Mock Supabase client
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() => Promise.resolve({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null,
      })),
      signInWithPassword: jest.fn(),
      updateUser: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(() => ({
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: {}, error: null })),
          })),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: {}, error: null })),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null })),
      })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: {}, error: null })),
        })),
      })),
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(() => Promise.resolve({ error: null })),
        getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'https://example.com/avatar.jpg' } })),
        remove: jest.fn(() => Promise.resolve({ error: null })),
      })),
    },
  })),
}))

// Mock Next.js cache revalidation
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

// Mock phone number validation
jest.mock('libphonenumber-js', () => ({
  parsePhoneNumber: jest.fn((value: string) => ({
    isValid: () => true,
    format: () => '+15555551234',
  })),
}))

describe('Account Server Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('updateProfile', () => {
    it('updates profile with valid data', async () => {
      const formData = new FormData()
      formData.append('name', 'Test User')
      formData.append('email', 'test@example.com')
      formData.append('phone_number', '+15555551234')

      const result = await updateProfile(formData)

      expect(result.error).toBeNull()
      expect(result.data).toBeDefined()
    })

    it('returns error when not authenticated', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      jest.mocked(createClient).mockReturnValueOnce({
        auth: {
          getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
        },
      } as any)

      const formData = new FormData()
      const result = await updateProfile(formData)

      expect(result.error).toBe('Not authenticated')
    })
  })

  describe('changePassword', () => {
    it('changes password with valid current password', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      const mockSupabase = {
        auth: {
          getUser: jest.fn(() => Promise.resolve({
            data: { user: { id: 'test-user-id', email: 'test@example.com' } },
          })),
          signInWithPassword: jest.fn(() => Promise.resolve({ error: null })),
          updateUser: jest.fn(() => Promise.resolve({ error: null })),
        },
      }
      jest.mocked(createClient).mockReturnValueOnce(mockSupabase as any)

      const formData = new FormData()
      formData.append('current_password', 'OldPass123!')
      formData.append('new_password', 'NewPass123!')
      formData.append('confirm_password', 'NewPass123!')

      const result = await changePassword(formData)

      expect(result.error).toBeNull()
      expect(mockSupabase.auth.updateUser).toHaveBeenCalled()
    })

    it('returns error with incorrect current password', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      const mockSupabase = {
        auth: {
          getUser: jest.fn(() => Promise.resolve({
            data: { user: { id: 'test-user-id', email: 'test@example.com' } },
          })),
          signInWithPassword: jest.fn(() => Promise.resolve({ 
            error: { message: 'Invalid credentials' } 
          })),
        },
      }
      jest.mocked(createClient).mockReturnValueOnce(mockSupabase as any)

      const formData = new FormData()
      formData.append('current_password', 'WrongPass!')
      formData.append('new_password', 'NewPass123!')
      formData.append('confirm_password', 'NewPass123!')

      const result = await changePassword(formData)

      expect(result.error).toBe('Current password is incorrect')
    })
  })

  describe('uploadAvatar', () => {
    it('uploads avatar file successfully', async () => {
      const file = new File(['content'], 'avatar.jpg', { type: 'image/jpeg' })
      const result = await uploadAvatar(file)

      expect(result.error).toBeNull()
      expect(result.data?.avatar_url).toBe('https://example.com/avatar.jpg')
    })
  })

  describe('createShippingAddress', () => {
    it('creates shipping address with valid data', async () => {
      const formData = new FormData()
      formData.append('name', 'Home')
      formData.append('address_line1', '123 Main St')
      formData.append('city', 'New York')
      formData.append('postal_code', '10001')
      formData.append('country', 'US')

      const result = await createShippingAddress(formData)

      expect(result.error).toBeNull()
    })

    it('validates invalid postal code', async () => {
      const formData = new FormData()
      formData.append('name', 'Home')
      formData.append('address_line1', '123 Main St')
      formData.append('city', 'London')
      formData.append('postal_code', 'INVALID')
      formData.append('country', 'GB')

      const result = await createShippingAddress(formData)

      expect(result.error).toBe('Invalid postal code for country')
    })
  })

   describe('setDefaultShippingAddress', () => {
     it('sets address as default', async () => {
       const result = await setDefaultShippingAddress('addr-123')

       expect(result.error).toBeNull()
     })
   })

  describe('reorderItems', () => {
    it('returns error if user is not authenticated', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      jest.mocked(createClient).mockReturnValueOnce({
        auth: {
          getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
        },
      } as any)

      const result = await reorderItems('order-123')

      expect(result).toEqual({
        error: 'Not authenticated',
        data: null,
      })
    })

    it('returns error if order not found', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      const mockSupabase = {
        auth: {
          getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'user-123' } }, error: null })),
        },
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: { message: 'Order not found' } })),
            })),
          })),
        })),
      }
      jest.mocked(createClient).mockReturnValueOnce(mockSupabase as any)

      const result = await reorderItems('order-123')

      expect(result.error).toBe('Order not found')
      expect(result.data).toBeNull()
    })

    it('adds items to cart when products are available', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      const mockSupabase = {
        auth: {
          getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'user-123' } }, error: null })),
        },
        from: jest.fn(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              maybeSingle: jest.fn(() => Promise.resolve({
                data: [{ id: 'item-1' }],
                error: null,
              })),
            })),
          })),
          insert: jest.fn(() => Promise.resolve({ error: null, data: { id: 'cart-item-1' } })),
          update: jest.fn(() => Promise.resolve({ error: null })),
        })),
      }
      jest.mocked(createClient).mockReturnValueOnce(mockSupabase as any)

       const result = await reorderItems('order-123')

      expect(result.error).toBeNull()
      expect(result.data?.itemCount).toBeGreaterThan(0)
    })
  })
})

