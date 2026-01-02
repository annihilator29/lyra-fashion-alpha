/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  updateProfile,
  changePassword,
  uploadAvatar,
  createShippingAddress,
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
        update: jest.fn((data) => ({
          eq: jest.fn((field) => {
            // First update (unset defaults) - return promise directly
            if (field === 'customer_id') {
              return Promise.resolve({ error: null });
            }
            // Second update (set new default) - return chain
            return {
              eq: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              single: jest.fn(() => Promise.resolve({ data: { ...data, id: 'addr-123' }, error: null })),
            };
          }),
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
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(() => Promise.resolve({ data: {}, error: null })),
        maybeSingle: jest.fn(() => Promise.resolve({ data: {}, error: null })),
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
  parsePhoneNumber: jest.fn(() => ({
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
        from: jest.fn((table: string) => {
          if (table === 'order_items') {
            const builder: any = {};
            builder.select = jest.fn().mockReturnThis();
            builder.eq = jest.fn().mockReturnThis();
            builder.eq = jest.fn().mockReturnThis();
            builder.maybeSingle = jest.fn(() => Promise.resolve({ data: null, error: { message: 'Order not found' } }));
            return builder;
          }
          return {};
        }),
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
        from: jest.fn((table: string) => {
          if (table === 'order_items') {
            let eqCalls = 0;
            const builder: any = {};
            builder.select = jest.fn().mockReturnThis();
            builder.eq = jest.fn().mockImplementation(() => {
              eqCalls++;
              // After two eq() calls, return the data directly
              // This mimics Supabase auto-executing the query
              if (eqCalls === 2) {
                return Promise.resolve({
                  data: [{ id: 'item-1', quantity: 1, product_id: 'prod-1', products: { id: 'prod-1' } }],
                  error: null,
                });
              }
              return builder;
            });
            return builder;
          }
          if (table === 'inventory') {
             return {
               select: jest.fn(() => ({
                 eq: jest.fn(() => ({
                   single: jest.fn(() => Promise.resolve({ data: { quantity: 10, reserved: 0 }, error: null })),
                 })),
               })),
             };
          }
          if (table === 'cart_items') {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  eq: jest.fn(() => ({
                    maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null })),
                  })),
                })),
              })),
              insert: jest.fn(() => Promise.resolve({ error: null, data: { id: 'cart-item-1' } })),
              update: jest.fn(() => Promise.resolve({ error: null })),
            };
          }
          return {};
        }),
      }
      jest.mocked(createClient).mockReturnValueOnce(mockSupabase as any)

       const result = await reorderItems('order-123')

      expect(result.error).toBeNull()
      expect(result.data?.itemCount).toBeGreaterThan(0)
    })
  })
})

