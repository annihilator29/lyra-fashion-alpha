/**
 * Support System Zod Validation Schemas
 * Story 7.4b: Support Ticket System
 */

import { z } from 'zod';

// ============================================================
// Enum Schemas
// ============================================================

export const ticketStatusSchema = z.enum([
  'open',
  'in_progress',
  'pending_customer',
  'resolved',
  'closed',
]);

export const ticketPrioritySchema = z.enum([
  'low',
  'medium',
  'high',
  'urgent',
]);

export const templateCategorySchema = z.enum([
  'shipping',
  'returns',
  'product',
  'billing',
  'general',
]);

// ============================================================
// Ticket Schemas
// ============================================================

export const createTicketSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID'),
  subject: z
    .string()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must be at most 200 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(10000, 'Description is too long')
    .optional(),
  priority: ticketPrioritySchema.default('medium'),
});

export const updateTicketStatusSchema = z.object({
  ticketId: z.string().uuid('Invalid ticket ID'),
  status: ticketStatusSchema,
  notes: z.string().max(2000).optional(),
});

export const assignTicketSchema = z.object({
  ticketId: z.string().uuid('Invalid ticket ID'),
  assignedTo: z.string().uuid('Invalid user ID').nullable(),
});

// ============================================================
// Message Schema
// ============================================================

export const ticketMessageSchema = z.object({
  ticketId: z.string().uuid('Invalid ticket ID'),
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(5000, 'Message is too long'),
  isInternal: z.boolean().default(false),
});

// ============================================================
// Template Schema
// ============================================================

export const supportTemplateSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be at most 100 characters'),
  subject: z
    .string()
    .min(1, 'Subject is required')
    .max(200, 'Subject must be at most 200 characters'),
  body: z
    .string()
    .min(1, 'Body is required')
    .max(5000, 'Body must be at most 5000 characters'),
  category: templateCategorySchema,
});

// ============================================================
// Email Schema
// ============================================================

export const sendEmailSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID'),
  templateId: z.string().uuid().optional(),
  subject: z.string().min(1, 'Subject is required').max(200),
  body: z.string().min(1, 'Body is required').max(10000),
  replyToTicketId: z.string().uuid().optional(),
});

// ============================================================
// Support Notes Schema
// ============================================================

export const supportNoteSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID'),
  content: z
    .string()
    .min(1, 'Note cannot be empty')
    .max(2000, 'Note is too long'),
});

// Inferred types
export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketStatusInput = z.infer<typeof updateTicketStatusSchema>;
export type AssignTicketInput = z.infer<typeof assignTicketSchema>;
export type TicketMessageInput = z.infer<typeof ticketMessageSchema>;
export type SupportTemplateInput = z.infer<typeof supportTemplateSchema>;
export type SendEmailInput = z.infer<typeof sendEmailSchema>;
