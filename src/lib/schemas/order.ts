/**
 * Order Validation Schemas (Zod)
 * Story 7.3: Order Management & Fulfillment Tools
 * 
 * Comprehensive validation schemas for order management forms
 */

import { z } from 'zod';

// Order status enum
export const orderStatusSchema = z.enum([
  'pending',
  'production',
  'quality_check',
  'shipped',
  'delivered',
  'cancelled',
]);

// Tracking information schema
export const trackingInfoSchema = z.object({
  carrier: z.enum(['fedex', 'ups', 'usps', 'dhl', 'other']),
  trackingNumber: z
    .string()
    .min(5, 'Tracking number must be at least 5 characters')
    .max(50, 'Tracking number is too long'),
});

// Refund data schema
export const refundSchema = z.object({
  amount: z
    .number()
    .positive('Refund amount must be greater than 0')
    .max(1000000, 'Refund amount exceeds maximum'), // $10,000 max
  reason: z.enum(['defective', 'wrong_item', 'changed_mind', 'other']),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
});

// Internal note schema
export const internalNoteSchema = z.object({
  note: z
    .string()
    .min(1, 'Note cannot be empty')
    .max(1000, 'Note must be less than 1000 characters'),
});

// Bulk status update schema
export const bulkStatusUpdateSchema = z.object({
  orderIds: z.array(z.string().uuid()).min(1, 'Select at least one order'),
  newStatus: orderStatusSchema,
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
});

// Order filter schema
export const orderFilterSchema = z.object({
  status: z.enum(['all', 'pending', 'production', 'quality_check', 'shipped', 'delivered', 'cancelled']).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().max(100, 'Search term is too long').optional(),
  paymentStatus: z.enum(['all', 'paid', 'pending', 'failed', 'refunded']).optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(25),
});

// Shipping address schema
export const shippingAddressSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address_line1: z.string().min(1, 'Address is required'),
  address_line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  postal_code: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  phone: z.string().optional(),
});

// Status update with notes schema
export const statusUpdateSchema = z.object({
  newStatus: orderStatusSchema,
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
});

// Type exports
export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type TrackingInfo = z.infer<typeof trackingInfoSchema>;
export type RefundData = z.infer<typeof refundSchema>;
export type InternalNote = z.infer<typeof internalNoteSchema>;
export type BulkStatusUpdate = z.infer<typeof bulkStatusUpdateSchema>;
export type OrderFilters = z.infer<typeof orderFilterSchema>;
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
export type StatusUpdate = z.infer<typeof statusUpdateSchema>;
