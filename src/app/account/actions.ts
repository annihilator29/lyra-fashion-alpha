'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { parsePhoneNumber, CountryCode } from 'libphonenumber-js'
import { z } from 'zod'

// ==========================
// Validation Schemas
// ==========================

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone_number: z.string().optional().transform((value, ctx) => {
    if (!value) return undefined

    try {
      // Try to parse as US phone (can be enhanced to detect country code)
      const phoneNumber = parsePhoneNumber(value, 'US' as CountryCode)
      if (!phoneNumber.isValid()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid phone number',
        })
        return z.NEVER
      }
      return phoneNumber.format('E.164')
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid phone number format',
      })
      return z.NEVER
    }
  }),
  avatar_url: z.string().url().optional(),
})

const updatePreferencesSchema = z.object({
  email_marketing: z.boolean(),
  order_updates: z.boolean(),
  new_products: z.boolean(),
  favorite_categories: z.array(z.string()),
  size_profile: z.string().optional(),
})

const passwordChangeSchema = z.object({
  current_password: z.string().min(1, 'Current password required'),
  new_password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least 1 uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least 1 lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least 1 digit')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least 1 special character'),
  confirm_password: z.string(),
}).refine(data => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
})

const shippingAddressSchema = z.object({
  name: z.string().min(1, 'Address name required'),
  address_line1: z.string().min(1, 'Address line 1 required'),
  address_line2: z.string().optional(),
  city: z.string().min(1, 'City required'),
  state: z.string().optional(),
  postal_code: z.string().min(1, 'Postal code required'),
  country: z.string().default('US'),
  phone: z.string().optional().transform((value, ctx) => {
    if (!value) return undefined

    try {
      const phoneNumber = parsePhoneNumber(value, 'US' as CountryCode)
      if (!phoneNumber.isValid()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid phone number',
        })
        return z.NEVER
      }
      return phoneNumber.format('E.164')
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid phone number format',
      })
      return z.NEVER
    }
  }),
  is_default: z.boolean().default(false),
})

// Postal code validation by country
const postalCodePatterns: Record<string, RegExp> = {
  US: /^\d{5}(-\d{4})?$/,
  GB: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z\d]? ?\d{2}$/,
  CA: /^[A-Z]\d[A-Z]\d ?\d{4}$/,
  AU: /^\d{4}$/,
  // Add more countries as needed
}

function validatePostalCode(postalCode: string, country: string): boolean {
  const pattern = postalCodePatterns[country] || /^\d{3,10}$/
  return pattern.test(postalCode)
}

// ==========================
// Profile Actions
// ==========================

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  try {
    const validatedData = updateProfileSchema.parse({
      name: formData.get('name'),
      email: formData.get('email'),
      phone_number: formData.get('phone_number'),
      avatar_url: formData.get('avatar_url'),
    })

    const { data, error } = await supabase
      .from('customers')
      .update(validatedData)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      return { error: error.message, data: null }
    }

    revalidatePath('/account')
    revalidatePath('/account/profile')

    return { error: null, data }
  } catch (err) {
    if (err instanceof z.ZodError) {
      const firstError = err.issues[0]
      return { error: firstError?.message || 'Validation error', data: null }
    }
    return { error: 'Failed to update profile', data: null }
  }
}

export async function updatePreferences(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  try {
    const validatedData = updatePreferencesSchema.parse({
      email_marketing: formData.get('email_marketing') === 'true',
      order_updates: formData.get('order_updates') === 'true',
      new_products: formData.get('new_products') === 'true',
      favorite_categories: JSON.parse(formData.get('favorite_categories') as string || '[]'),
      size_profile: formData.get('size_profile') || undefined,
    })

    const preferences = {
      email: {
        order_updates: validatedData.order_updates,
        marketing: validatedData.email_marketing,
        new_products: validatedData.new_products,
      },
      style: {
        favorite_categories: validatedData.favorite_categories,
        size_profile: validatedData.size_profile,
      },
    }

    const { data, error } = await supabase
      .from('customers')
      .update({ preferences })
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      return { error: error.message, data: null }
    }

    revalidatePath('/account')

    return { error: null, data }
  } catch (err) {
    if (err instanceof z.ZodError) {
      const firstError = err.issues[0]
      return { error: firstError?.message || 'Validation error', data: null }
    }
    return { error: 'Failed to update preferences', data: null }
  }
}

export async function changePassword(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  try {
    const validatedData = passwordChangeSchema.parse({
      current_password: formData.get('current_password'),
      new_password: formData.get('new_password'),
      confirm_password: formData.get('confirm_password'),
    })

    // Verify current password by signing in
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: user.email || '',
      password: validatedData.current_password,
    })

    if (authError) {
      return { error: 'Current password is incorrect', data: null }
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: validatedData.new_password,
    })

    if (updateError) {
      return { error: updateError.message, data: null }
    }

    return { error: null, data: { success: true } }
  } catch (err) {
    if (err instanceof z.ZodError) {
      const firstError = err.issues[0]
      return { error: firstError?.message || 'Validation error', data: null }
    }
    return { error: 'Failed to change password', data: null }
  }
}

export async function deleteAccount(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  try {
    const confirmation = formData.get('confirmation') as string

    if (confirmation !== 'DELETE_ACCOUNT') {
      return { error: 'Invalid confirmation', data: null }
    }

    // Note: For full account deletion, you need to use the service role key
    // This is a placeholder - you'll need to implement an API route with service role
    // to actually delete the user via adminDeleteUser

    // For now, we'll implement soft delete by updating the customer record
    const { error } = await supabase
      .from('customers')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', user.id)

    if (error) {
      return { error: error.message, data: null }
    }

    // Sign out user
    await supabase.auth.signOut()

    revalidatePath('/')

    return { error: null, data: { success: true } }
  } catch {
    return { error: 'Failed to delete account', data: null }
  }
}

export async function uploadAvatar(file: File) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Math.random()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file)

    if (uploadError) {
      return { error: uploadError.message, data: null }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    // Update customer profile with new avatar URL
    const { error: updateError } = await supabase
      .from('customers')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      return { error: updateError.message, data: null }
    }

    revalidatePath('/account')
    revalidatePath('/account/profile')

    return { error: null, data: { avatar_url: publicUrl } }
  } catch {
    return { error: 'Failed to upload avatar', data: null }
  }
}

export async function deleteAvatar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  try {
    const { data: customer } = await supabase
      .from('customers')
      .select('avatar_url')
      .eq('id', user.id)
      .single()

    if (customer?.avatar_url) {
      // Extract file path from URL
      const urlParts = customer.avatar_url.split('/')
      const fileName = urlParts[urlParts.length - 1]
      const filePath = `avatars/${user.id}/${fileName}`

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([filePath])

      if (deleteError) {
        console.error('Failed to delete avatar from storage:', deleteError)
      }
    }

    // Update customer record
    const { data, error: updateError } = await supabase
      .from('customers')
      .update({ avatar_url: null })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      return { error: updateError.message, data: null }
    }

    revalidatePath('/account')
    revalidatePath('/account/profile')

    return { error: null, data }
  } catch {
    return { error: 'Failed to delete avatar', data: null }
  }
}

// ==========================
// Shipping Address Actions
// ==========================

export async function createShippingAddress(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  try {
    const validatedData = shippingAddressSchema.parse({
      name: formData.get('name'),
      address_line1: formData.get('address_line1'),
      address_line2: formData.get('address_line2'),
      city: formData.get('city'),
      state: formData.get('state'),
      postal_code: formData.get('postal_code'),
      country: formData.get('country'),
      phone: formData.get('phone'),
      is_default: formData.get('is_default') === 'true',
    })

    // Validate postal code
    if (!validatePostalCode(validatedData.postal_code, validatedData.country)) {
      return { error: 'Invalid postal code for country', data: null }
    }

    // If setting as default, unset other defaults first
    if (validatedData.is_default) {
      await supabase
        .from('shipping_addresses')
        .update({ is_default: false })
        .eq('customer_id', user.id)
    }

    const { data, error } = await supabase
      .from('shipping_addresses')
      .insert({
        ...validatedData,
        customer_id: user.id,
      })
      .select()
      .single()

    if (error) {
      return { error: error.message, data: null }
    }

    revalidatePath('/account')
    revalidatePath('/account/addresses')

    return { error: null, data }
  } catch (err) {
    if (err instanceof z.ZodError) {
      const firstError = err.issues[0]
      return { error: firstError?.message || 'Validation error', data: null }
    }
    return { error: 'Failed to create shipping address', data: null }
  }
}

export async function updateShippingAddress(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  try {
    const validatedData = shippingAddressSchema.parse({
      name: formData.get('name'),
      address_line1: formData.get('address_line1'),
      address_line2: formData.get('address_line2'),
      city: formData.get('city'),
      state: formData.get('state'),
      postal_code: formData.get('postal_code'),
      country: formData.get('country'),
      phone: formData.get('phone'),
      is_default: formData.get('is_default') === 'true',
    })

    // Validate postal code
    if (!validatePostalCode(validatedData.postal_code, validatedData.country)) {
      return { error: 'Invalid postal code for country', data: null }
    }

    // If setting as default, unset other defaults first
    if (validatedData.is_default) {
      await supabase
        .from('shipping_addresses')
        .update({ is_default: false })
        .eq('customer_id', user.id)
    }

    const { data, error } = await supabase
      .from('shipping_addresses')
      .update(validatedData)
      .eq('id', id)
      .eq('customer_id', user.id)
      .select()
      .single()

    if (error) {
      return { error: error.message, data: null }
    }

    revalidatePath('/account')
    revalidatePath('/account/addresses')

    return { error: null, data }
  } catch (err) {
    if (err instanceof z.ZodError) {
      const firstError = err.issues[0]
      return { error: firstError?.message || 'Validation error', data: null }
    }
    return { error: 'Failed to update shipping address', data: null }
  }
}

export async function deleteShippingAddress(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  try {
    const { error } = await supabase
      .from('shipping_addresses')
      .delete()
      .eq('id', id)
      .eq('customer_id', user.id)

    if (error) {
      return { error: error.message, data: null }
    }

    revalidatePath('/account')
    revalidatePath('/account/addresses')

    return { error: null, data: { success: true } }
  } catch {
    return { error: 'Failed to delete shipping address', data: null }
  }
}

export async function setDefaultShippingAddress(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  try {
    // Unset all other defaults first
    await supabase
      .from('shipping_addresses')
      .update({ is_default: false })
      .eq('customer_id', user.id)

    // Set new default
    const { data, error } = await supabase
      .from('shipping_addresses')
      .update({ is_default: true })
      .eq('id', id)
      .eq('customer_id', user.id)
      .select()
      .single()

    if (error) {
      return { error: error.message, data: null }
    }

    revalidatePath('/account')
    revalidatePath('/account/addresses')

    return { error: null, data }
  } catch {
    return { error: 'Failed to set default address', data: null }
  }
}

export async function getShippingAddresses() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data, error } = await supabase
    .from('shipping_addresses')
    .select('*')
    .eq('customer_id', user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: true })

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}
