/**
 * Returns Mutations
 *
 * Database mutations for returns management (create, update status, process refunds)
 * All functions include input validation and comprehensive error handling.
 */

import { createClient } from '@/lib/supabase/client';
import type { CreateReturnData, ReturnStatusUpdate, Return } from '@/types/returns';
import {
  sendReturnRequestedEmail,
  sendReturnApprovedEmail,
  sendReturnRefundedEmail,
  sendReturnRejectedEmail,
} from '@/lib/emails/returns';

/**
 * Error code to user-friendly message mapping
 */
const ERROR_MESSAGES: Record<string, string> = {
  RETURN_WINDOW_EXPIRED: 'The return window for this order has expired (30 days from delivery)',
  ITEM_ALREADY_RETURNED: 'This item has already been returned',
  DUPLICATE_RETURN_ITEMS: 'Items already in another return request',
  ORDER_NOT_DELIVERED: 'Cannot return items from an order that has not been delivered',
  FINAL_SALE_ITEM: 'Final sale items cannot be returned',
  INVALID_ORDER: 'Order not found or not authorized',
  INVALID_ITEMS: 'Invalid items selected for return',
  UNAUTHORIZED: 'You are not authorized to return this order',
  PGRST116: 'You are not authorized to perform this action',
  UNKNOWN_ERROR: 'An unexpected error occurred',
};

/**
 * Validates a UUID format
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Check if order is within 30-day return window
 */
function isWithinReturnWindow(deliveredAt: string | null): boolean {
  if (!deliveredAt) return false;
  const delivered = new Date(deliveredAt);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - delivered.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays <= 30;
}

/**
 * Generate RMA number
 */
function generateRMANumber(orderId: string): string {
  const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
  return `RMA-${orderId}-${timestamp}`;
}

/**
 * Calculate refund amount (100% of item price - no restocking fees)
 */
function calculateRefundAmount(
  items: Array<{ price: number; quantity: number }>
): number {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

/**
 * Create a new return request
 *
 * @example
 * ```typescript
 * const result = await createReturnRequest({
 *   orderId: 'order-uuid',
 *   itemIds: ['item-uuid-1', 'item-uuid-2'],
 *   reason: 'size_fit',
 *   conditionNotes: 'Too small'
 * });
 * ```
 */
export async function createReturnRequest(
  data: CreateReturnData
): Promise<{ success: boolean; return?: Return; error?: string; message?: string }> {
  // Validate order ID
  if (!data.orderId || !isValidUUID(data.orderId)) {
    return {
      success: false,
      error: 'INVALID_ORDER',
      message: ERROR_MESSAGES.INVALID_ORDER,
    };
  }

  // Validate item IDs
  if (!data.itemIds || data.itemIds.length === 0) {
    return {
      success: false,
      error: 'INVALID_ITEMS',
      message: ERROR_MESSAGES.INVALID_ITEMS,
    };
  }

  const invalidIds = data.itemIds.filter(id => !isValidUUID(id));
  if (invalidIds.length > 0) {
    return {
      success: false,
      error: 'INVALID_ITEMS',
      message: 'Invalid item IDs provided',
    };
  }

  const supabase = createClient();

  // Fetch order with items to validate
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        id,
        price,
        quantity,
        products (final_sale)
      )
    `)
    .eq('id', data.orderId)
    .single();

  if (orderError || !order) {
    return {
      success: false,
      error: 'INVALID_ORDER',
      message: ERROR_MESSAGES.INVALID_ORDER,
    };
  }

  // Check if order is delivered
  if (order.status !== 'delivered' || !order.delivered_at) {
    return {
      success: false,
      error: 'ORDER_NOT_DELIVERED',
      message: ERROR_MESSAGES.ORDER_NOT_DELIVERED,
    };
  }

  // Check return window
  if (!isWithinReturnWindow(order.delivered_at)) {
    return {
      success: false,
      error: 'RETURN_WINDOW_EXPIRED',
      message: ERROR_MESSAGES.RETURN_WINDOW_EXPIRED,
    };
  }

  // Validate selected items exist in order and are not final sale
  const selectedItems = order.order_items.filter((item: { id: string }) =>
    data.itemIds.includes(item.id)
  );

  if (selectedItems.length !== data.itemIds.length) {
    return {
      success: false,
      error: 'INVALID_ITEMS',
      message: 'Some selected items do not exist in this order',
    };
  }

  // Check for final sale items
  const finalSaleItems = selectedItems.filter(
    (item: { products: { final_sale: boolean } }) => item.products?.final_sale
  );
  if (finalSaleItems.length > 0) {
    return {
      success: false,
      error: 'FINAL_SALE_ITEM',
      message: ERROR_MESSAGES.FINAL_SALE_ITEM,
    };
  }

  // Calculate refund amount (100% of item price)
  const refundAmount = calculateRefundAmount(selectedItems);

  // Generate RMA number
  const rmaNumber = generateRMANumber(data.orderId);

  // Create return record
  const { data: returnRecord, error: createError } = await supabase
    .from('returns')
    .insert({
      order_id: data.orderId,
      order_item_ids: data.itemIds,
      reason: data.reason,
      condition_notes: data.conditionNotes || null,
      status: 'requested',
      rma_number: rmaNumber,
      refund_amount: refundAmount,
      requested_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (createError) {
    // Handle duplicate items error from trigger
    if (createError.message.includes('Items already in another return')) {
      return {
        success: false,
        error: 'ITEM_ALREADY_RETURNED',
        message: ERROR_MESSAGES.ITEM_ALREADY_RETURNED,
      };
    }

    // Handle RLS unauthorized error
    if (createError.code === 'PGRST116') {
      return {
        success: false,
        error: 'UNAUTHORIZED',
        message: ERROR_MESSAGES.UNAUTHORIZED,
      };
    }

    return {
      success: false,
      error: createError.code || 'UNKNOWN_ERROR',
      message: createError.message || ERROR_MESSAGES.UNKNOWN_ERROR,
    };
  }

  // Send confirmation email asynchronously (AC-2)
  if (returnRecord) {
    const { data: orderData } = await supabase
      .from('orders')
      .select('id, order_number, customer_email')
      .eq('id', data.orderId)
      .single();

    if (orderData?.customer_email) {
      sendReturnRequestedEmail({
        returnData: returnRecord as Return,
        order: orderData,
      }).catch(err => console.error('Failed to send return requested email:', err));
    }
  }

  return {
    success: true,
    return: returnRecord as Return,
  };
}

/**
 * Update return status (admin only)
 *
 * @example
 * ```typescript
 * const result = await updateReturnStatus(returnId, {
 *   status: 'approved'
 * });
 * ```
 */
export async function updateReturnStatus(
  returnId: string,
  update: ReturnStatusUpdate
): Promise<{ success: boolean; return?: Return; error?: string; message?: string }> {
  if (!returnId || !isValidUUID(returnId)) {
    return {
      success: false,
      error: 'INVALID_RETURN',
      message: 'Invalid return ID',
    };
  }

  const supabase = createClient();

  const updateData: Record<string, unknown> = {
    status: update.status,
    updated_at: new Date().toISOString(),
  };

  // Add status-specific timestamps
  switch (update.status) {
    case 'approved':
      updateData.approved_at = new Date().toISOString();
      break;
    case 'shipped':
      updateData.shipped_at = new Date().toISOString();
      break;
    case 'received':
      updateData.received_at = new Date().toISOString();
      break;
    case 'inspected':
      updateData.inspected_at = new Date().toISOString();
      updateData.inspection_notes = update.inspectionNotes || null;
      updateData.inspection_photos = update.inspectionPhotos || null;
      break;
    case 'refunded':
      updateData.refunded_at = new Date().toISOString();
      break;
    case 'rejected':
      updateData.rejected_at = new Date().toISOString();
      updateData.rejection_reason = update.rejectionReason || null;
      break;
  }

  const { data: returnRecord, error } = await supabase
    .from('returns')
    .update(updateData)
    .eq('id', returnId)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return {
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Only admins can update return status',
      };
    }

    return {
      success: false,
      error: error.code || 'UNKNOWN_ERROR',
      message: error.message || ERROR_MESSAGES.UNKNOWN_ERROR,
    };
  }

  return {
    success: true,
    return: returnRecord as Return,
  };
}

/**
 * Approve return and generate shipping label
 *
 * @example
 * ```typescript
 * const result = await approveReturn(returnId, {
 *   labelUrl: 'https://...',
 *   trackingNumber: 'TRACK123'
 * });
 * ```
 */
export async function approveReturn(
  returnId: string,
  labelData: {
    labelUrl: string;
    trackingNumber: string;
    trackingUrl?: string;
  }
): Promise<{ success: boolean; return?: Return; error?: string; message?: string }> {
  if (!returnId || !isValidUUID(returnId)) {
    return {
      success: false,
      error: 'INVALID_RETURN',
      message: 'Invalid return ID',
    };
  }

  const supabase = createClient();

  const { data: returnRecord, error } = await supabase
    .from('returns')
    .update({
      status: 'approved',
      shipping_label_url: labelData.labelUrl,
      tracking_number: labelData.trackingNumber,
      tracking_url: labelData.trackingUrl || null,
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', returnId)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return {
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Only admins can approve returns',
      };
    }

    return {
      success: false,
      error: error.code || 'UNKNOWN_ERROR',
      message: error.message || ERROR_MESSAGES.UNKNOWN_ERROR,
    };
  }

  // Send approved email with shipping label (AC-4)
  if (returnRecord) {
    const { data: orderData } = await supabase
      .from('orders')
      .select('id, order_number, customer_email')
      .eq('id', returnRecord.order_id)
      .single();

    if (orderData?.customer_email) {
      sendReturnApprovedEmail({
        returnData: returnRecord as Return,
        order: orderData,
      }).catch(err => console.error('Failed to send return approved email:', err));
    }
  }

  return {
    success: true,
    return: returnRecord as Return,
  };
}

/**
 * Process refund and store Stripe refund ID
 *
 * @example
 * ```typescript
 * const result = await processRefund(returnId, 'pi_refund_123');
 * ```
 */
export async function processRefund(
  returnId: string,
  stripeRefundId: string
): Promise<{ success: boolean; return?: Return; error?: string; message?: string }> {
  if (!returnId || !isValidUUID(returnId)) {
    return {
      success: false,
      error: 'INVALID_RETURN',
      message: 'Invalid return ID',
    };
  }

  const supabase = createClient();

  const { data: returnRecord, error } = await supabase
    .from('returns')
    .update({
      status: 'refunded',
      stripe_refund_id: stripeRefundId,
      refunded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', returnId)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return {
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Only admins can process refunds',
      };
    }

    return {
      success: false,
      error: error.code || 'UNKNOWN_ERROR',
      message: error.message || ERROR_MESSAGES.UNKNOWN_ERROR,
    };
  }

  // Send refund confirmation email (AC-4)
  if (returnRecord) {
    const { data: orderData } = await supabase
      .from('orders')
      .select('id, order_number, customer_email')
      .eq('id', returnRecord.order_id)
      .single();

    if (orderData?.customer_email) {
      sendReturnRefundedEmail({
        returnData: returnRecord as Return,
        order: orderData,
      }).catch(err => console.error('Failed to send return refunded email:', err));
    }
  }

  return {
    success: true,
    return: returnRecord as Return,
  };
}

/**
 * Reject return with reason
 *
 * @example
 * ```typescript
 * const result = await rejectReturn(returnId, 'Item shows signs of wear');
 * ```
 */
export async function rejectReturn(
  returnId: string,
  rejectionReason: string,
  inspectionNotes?: string,
  inspectionPhotos?: string[]
): Promise<{ success: boolean; return?: Return; error?: string; message?: string }> {
  if (!returnId || !isValidUUID(returnId)) {
    return {
      success: false,
      error: 'INVALID_RETURN',
      message: 'Invalid return ID',
    };
  }

  const supabase = createClient();

  const { data: returnRecord, error } = await supabase
    .from('returns')
    .update({
      status: 'rejected',
      rejection_reason: rejectionReason,
      inspection_notes: inspectionNotes || null,
      inspection_photos: inspectionPhotos || null,
      rejected_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', returnId)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return {
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Only admins can reject returns',
      };
    }

    return {
      success: false,
      error: error.code || 'UNKNOWN_ERROR',
      message: error.message || ERROR_MESSAGES.UNKNOWN_ERROR,
    };
  }

  // Send rejection email (AC-4)
  if (returnRecord) {
    const { data: orderData } = await supabase
      .from('orders')
      .select('id, order_number, customer_email')
      .eq('id', returnRecord.order_id)
      .single();

    if (orderData?.customer_email) {
      sendReturnRejectedEmail({
        returnData: returnRecord as Return,
        order: orderData,
      }).catch(err => console.error('Failed to send return rejected email:', err));
    }
  }

  return {
    success: true,
    return: returnRecord as Return,
  };
}
