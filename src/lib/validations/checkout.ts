import { z } from 'zod';

export const checkoutShippingSchema = z.object({
  // Contact Info
  email: z.string().email('Invalid email address'),
  phone: z.string()
    .min(10, 'Phone number too short')
    .max(20, 'Phone number too long')
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone format'),

  // Shipping Address
  shipping_name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long'),
  shipping_address: z.string()
    .min(10, 'Address too short')
    .max(255, 'Address too long'),
  shipping_city: z.string()
    .min(2, 'City too short')
    .max(100, 'City too long'),
  shipping_postal_code: z.string()
    .min(3, 'Postal code too short')
    .max(20, 'Postal code too long'),
  shipping_country: z.string()
    .length(2, 'Invalid country code')
    .refine(val => ['US', 'CA', 'GB', 'AU', 'DE', 'FR'].includes(val), 'Country not supported'),

  // Billing Address (conditional)
  same_as_shipping: z.boolean(),
  billing_name: z.string().optional(),
  billing_address: z.string().optional(),
  billing_city: z.string().optional(),
  billing_postal_code: z.string().optional(),
  billing_country: z.string().optional(),
}).refine(
  (data) => {
    // If not same as shipping, require billing fields
    if (!data.same_as_shipping) {
      return data.billing_name && data.billing_address && data.billing_city && 
             data.billing_postal_code && data.billing_country;
    }
    return true;
  },
  { 
    message: 'Billing address is required when different from shipping', 
    path: ['billing_name'] // Field to show error on
  }
);