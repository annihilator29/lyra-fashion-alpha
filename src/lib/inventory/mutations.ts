/**
 * Inventory Mutations
 *
 * Database mutations for inventory management (reservations, releases, adjustments)
 * All functions include input validation and comprehensive error handling.
 */

import { createClient } from '@/lib/supabase/client';
import type {
  InventoryReservationResult,
  InventoryReleaseResult,
  InventoryAdjustmentResult,
  StockNotificationRequest,
} from './types';

/**
 * Error code to user-friendly message mapping
 */
const ERROR_MESSAGES: Record<string, string> = {
  INSUFFICIENT_INVENTORY: 'Not enough inventory available for requested quantity',
  INVENTORY_NOT_FOUND: 'Product inventory record not found',
  RESERVATION_NOT_FOUND: 'Cart reservation not found or has expired',
  DUPLICATE_NOTIFICATION: 'Email is already registered for stock notifications',
  INVALID_INPUT: 'Invalid input parameters provided',
  INVALID_UUID: 'Invalid ID format provided',
  INVALID_QUANTITY: 'Quantity must be greater than 0',
  RESERVATION_EXPIRED: 'Reservation has expired',
  UNKNOWN_ERROR: 'An unexpected error occurred',
};

/**
 * Validates a UUID format (basic check)
 * @param uuid - String to validate
 * @returns True if valid UUID format
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validates reservation input parameters
 * @param cartId - Cart ID making the reservation
 * @param productId - Product ID to reserve inventory for
 * @param variantId - Optional variant ID
 * @param quantity - Quantity to reserve
 * @returns Validation result with optional error message
 */
function validateReservationInput(
  cartId: string,
  productId: string,
  variantId: string | null,
  quantity: number
): { valid: boolean; error: string | null } {
  // Validate required UUIDs
  if (!cartId || !isValidUUID(cartId)) {
    return { valid: false, error: ERROR_MESSAGES.INVALID_UUID + ' (cart)' };
  }

  if (!productId || !isValidUUID(productId)) {
    return { valid: false, error: ERROR_MESSAGES.INVALID_UUID + ' (product)' };
  }

  // Validate quantity
  if (!quantity || quantity <= 0) {
    return { valid: false, error: ERROR_MESSAGES.INVALID_QUANTITY };
  }

  // Validate variant UUID if provided
  if (variantId !== null && variantId !== undefined && !isValidUUID(variantId)) {
    return { valid: false, error: ERROR_MESSAGES.INVALID_UUID + ' (variant)' };
  }

  return { valid: true, error: null };
}

/**
 * Reserve inventory for a cart during checkout process
 *
 * This function atomically reserves a specified quantity of product inventory
 * for a configurable time window (default 15 minutes), preventing overselling
 * and enabling concurrent order processing.
 *
 * @example
 * ```typescript
 * const result = await reserveInventory(
 *   '550e8400-e29b-41d4-a716-446655440000', // cart ID
 *   '6ba7b810-9dad-11d1-80b4-00c04fd430c8', // product ID
 *   '6ba7b811-9dad-11d1-80b4-00c04fd430c9', // variant ID (or null)
 *   2,                                      // quantity
 *   15                                      // expires in 15 minutes
 * );
 *
 * if (result.success) {
 *   console.log(`Reserved: ${result.reservation_id}`);
 * } else {
 *   console.error(result.message);
 * }
 * ```
 *
 * @param {string} cartId - The cart ID making the reservation (valid UUID required)
 * @param {string} productId - The product ID to reserve inventory for (valid UUID required)
 * @param {string|null} variantId - Optional variant ID for products with sizes/colors (valid UUID if provided)
 * @param {number} quantity - Quantity to reserve (must be > 0)
 * @param {number} expiresInMinutes - Reservation duration in minutes (default: 15, max: 60)
 * @returns {Promise<InventoryReservationResult>} Reservation result with success status, reservation ID, or error details
 *
 * @throws Never throws - all errors are returned in the result object
 */
export async function reserveInventory(
  cartId: string,
  productId: string,
  variantId: string | null,
  quantity: number,
  expiresInMinutes: number = 15
): Promise<InventoryReservationResult> {
  // Validate input parameters
  const validation = validateReservationInput(cartId, productId, variantId, quantity);
  if (!validation.valid) {
    return {
      success: false,
      error: 'INVALID_INPUT',
      message: validation.error || ERROR_MESSAGES.INVALID_INPUT,
    };
  }

  // Validate expiresInMinutes
  if (expiresInMinutes <= 0 || expiresInMinutes > 60) {
    return {
      success: false,
      error: 'INVALID_INPUT',
      message: 'Reservation duration must be between 1 and 60 minutes',
    };
  }

  const supabase = createClient();
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString();

  const { data, error } = await supabase.rpc('reserve_inventory', {
    p_cart_id: cartId,
    p_product_id: productId,
    p_variant_id: variantId,
    p_quantity: quantity,
    p_expires_at: expiresAt,
  });

  if (error) {
    const errorCode = error.code || 'UNKNOWN_ERROR';
    return {
      success: false,
      error: errorCode,
      message: ERROR_MESSAGES[errorCode] || error.message || ERROR_MESSAGES.UNKNOWN_ERROR,
    };
  }

  return data as InventoryReservationResult;
}

/**
 * Release a reservation (cancel or expire)
 *
 * Used when a user cancels checkout or when reservations expire.
 * Returns inventory back to available pool.
 *
 * @example
 * ```typescript
 * const result = await releaseReservation(
 *   'reservation-uuid-here',
 *   'cancellation'
 * );
 *
 * if (result.success) {
 *   console.log(`Released ${result.quantity_released} items`);
 * }
 * ```
 *
 * @param {string} reservationId - The reservation ID to release (valid UUID required)
 * @param {'release'|'cancellation'} reason - Reason for release (affects analytics)
 * @returns {Promise<InventoryReleaseResult>} Release result with quantity released or error details
 */
export async function releaseReservation(
  reservationId: string,
  reason: 'release' | 'cancellation' = 'release'
): Promise<InventoryReleaseResult> {
  // Validate reservation ID
  if (!reservationId || !isValidUUID(reservationId)) {
    return {
      success: false,
      message: ERROR_MESSAGES.INVALID_UUID + ' (reservation)',
    };
  }

  const supabase = createClient();
  const { data, error } = await supabase.rpc('release_reservation', {
    p_reservation_id: reservationId,
    p_reason: reason,
  });

  if (error) {
    const errorCode = error.code || 'UNKNOWN_ERROR';
    return {
      success: false,
      message: ERROR_MESSAGES[errorCode] || `Failed to release reservation: ${error.message}`,
    };
  }

  return data as InventoryReleaseResult;
}

/**
 * Release all expired reservations (called by cron job)
 *
 * Automatically finds and releases all reservations past their expiration time.
 * Should be called periodically (e.g., every 5 minutes) by a scheduled job.
 *
 * @example
 * ```typescript
 * const { released, error } = await releaseExpiredReservations();
 * console.log(`Cleaned up ${released} expired reservations`);
 * ```
 *
 * @returns {Promise<{released: number; error: Error | null}>} Count of released reservations and any error
 */
export async function releaseExpiredReservations(): Promise<{
  released: number;
  error: Error | null;
}> {
  const supabase = createClient();

  // Get all expired reservations
  const { data: expiredReservations, error: fetchError } = await supabase
    .from('cart_reservations')
    .select('id')
    .lt('expires_at', new Date().toISOString());

  if (fetchError) {
    return { released: 0, error: new Error(fetchError.message) };
  }

  if (!expiredReservations || expiredReservations.length === 0) {
    return { released: 0, error: null };
  }

  // Release each expired reservation
  let released = 0;
  const errors: string[] = [];

  for (const reservation of expiredReservations) {
    const result = await releaseReservation(reservation.id, 'release');
    if (result.success) {
      released++;
    } else {
      errors.push(`Failed to release ${reservation.id}: ${result.message}`);
    }
  }

  if (errors.length > 0) {
    return { released, error: new Error(errors.join('; ')) };
  }

  return { released, error: null };
}

/**
 * Extend reservation expiration time
 *
 * Used during checkout to give users more time to complete their purchase.
 * Common use case: extending timer when user is actively engaged.
 *
 * @example
 * ```typescript
 * const result = await extendReservation(
 *   'reservation-uuid-here',
 *   10 // extend by 10 more minutes
 * );
 * ```
 *
 * @param {string} reservationId - The reservation ID to extend (valid UUID required)
 * @param {number} additionalMinutes - Additional time in minutes (default: 15, max: 30)
 * @returns {Promise<{success: boolean; message: string}>} Extension result
 */
export async function extendReservation(
  reservationId: string,
  additionalMinutes: number = 15
): Promise<{ success: boolean; message: string }> {
  // Validate reservation ID
  if (!reservationId || !isValidUUID(reservationId)) {
    return {
      success: false,
      message: ERROR_MESSAGES.INVALID_UUID + ' (reservation)',
    };
  }

  // Validate additional minutes
  if (additionalMinutes <= 0 || additionalMinutes > 30) {
    return {
      success: false,
      message: 'Extension time must be between 1 and 30 minutes',
    };
  }

  const supabase = createClient();
  const newExpiresAt = new Date(Date.now() + additionalMinutes * 60 * 1000).toISOString();

  const { error } = await supabase
    .from('cart_reservations')
    .update({ expires_at: newExpiresAt })
    .eq('id', reservationId);

  if (error) {
    const errorCode = error.code || 'UNKNOWN_ERROR';
    return {
      success: false,
      message: ERROR_MESSAGES[errorCode] || `Failed to extend reservation: ${error.message}`,
    };
  }

  return {
    success: true,
    message: `Reservation extended by ${additionalMinutes} minutes`,
  };
}

/**
 * Adjust inventory quantity (for admin or factory sync)
 *
 * Used to update inventory levels from various sources including:
 * - Factory production completion
 * - Manual admin adjustments
 * - System corrections
 * - Order fulfillment
 * - Returns processing
 *
 * @example
 * ```typescript
 * // Restock from factory
 * const result = await adjustInventory(
 *   'product-uuid',
 *   'variant-uuid',
 *   50,                    // add 50 units
 *   'restock',
 *   'factory_sync',
 *   'admin-user-uuid',
 *   { batch_id: 'BATCH-001', factory_order_id: 'FO-123' }
 * );
 * ```
 *
 * @param {string} productId - Product ID to adjust (valid UUID required)
 * @param {string|null} variantId - Optional variant ID (valid UUID if provided)
 * @param {number} adjustment - Quantity change (positive or negative)
 * @param {'restock'|'sync'|'adjustment'|'sale'|'return'} reason - Reason for adjustment
 * @param {'factory_sync'|'admin'|'system'|'checkout'|'return'} source - Source of adjustment
 * @param {string} [userId] - Admin user ID making the adjustment (valid UUID if provided)
 * @param {Record<string, unknown>} [metadata] - Additional context for audit trail
 * @returns {Promise<InventoryAdjustmentResult>} Adjustment result with before/after quantities
 */
export async function adjustInventory(
  productId: string,
  variantId: string | null,
  adjustment: number,
  reason: 'restock' | 'sync' | 'adjustment' | 'sale' | 'return',
  source: 'factory_sync' | 'admin' | 'system' | 'checkout' | 'return',
  userId?: string,
  metadata?: Record<string, unknown>
): Promise<InventoryAdjustmentResult> {
  // Validate product ID
  if (!productId || !isValidUUID(productId)) {
    return {
      success: false,
      message: ERROR_MESSAGES.INVALID_UUID + ' (product)',
    };
  }

  // Validate variant UUID if provided
  if (variantId !== null && variantId !== undefined && !isValidUUID(variantId)) {
    return { success: false, message: ERROR_MESSAGES.INVALID_UUID + ' (variant)' };
  }

  // Validate user ID if provided
  if (userId !== undefined && !isValidUUID(userId)) {
    return { success: false, message: ERROR_MESSAGES.INVALID_UUID + ' (user)' };
  }

  const supabase = createClient();
  const { data, error } = await supabase.rpc('adjust_inventory', {
    p_product_id: productId,
    p_variant_id: variantId,
    p_adjustment: adjustment,
    p_reason: reason,
    p_source: source,
    p_user_id: userId,
    p_metadata: metadata || {},
  });

  if (error) {
    const errorCode = error.code || 'UNKNOWN_ERROR';
    return {
      success: false,
      message: ERROR_MESSAGES[errorCode] || `Failed to adjust inventory: ${error.message}`,
    };
  }

  return data as InventoryAdjustmentResult;
}

/**
 * Convert reservations to sales (after successful checkout)
 *
 * Called when an order is successfully placed. Converts cart reservations
 * into actual sales by reducing total inventory and removing reservations.
 *
 * @example
 * ```typescript
 * const result = await convertReservationsToSales(
 *   'cart-uuid-here',
 *   'order-uuid-here'
 * );
 *
 * if (result.success && result.processed === expectedCount) {
 *   // Order fully processed
 * }
 * ```
 *
 * @param {string} cartId - Cart ID with active reservations (valid UUID required)
 * @param {string} orderId - New order ID to associate with the sale (valid UUID required)
 * @returns {Promise<{success: boolean; message: string; processed: number}>} Conversion result with count processed
 */
export async function convertReservationsToSales(
  cartId: string,
  orderId: string
): Promise<{ success: boolean; message: string; processed: number }> {
  // Validate cart ID
  if (!cartId || !isValidUUID(cartId)) {
    return {
      success: false,
      message: ERROR_MESSAGES.INVALID_UUID + ' (cart)',
      processed: 0,
    };
  }

  // Validate order ID
  if (!orderId || !isValidUUID(orderId)) {
    return {
      success: false,
      message: ERROR_MESSAGES.INVALID_UUID + ' (order)',
      processed: 0,
    };
  }

  const supabase = createClient();

  // Get all active reservations for this cart
  const { data: reservations, error: fetchError } = await supabase
    .from('cart_reservations')
    .select('*')
    .eq('cart_id', cartId)
    .gt('expires_at', new Date().toISOString());

  if (fetchError) {
    return {
      success: false,
      message: `Failed to fetch reservations: ${fetchError.message}`,
      processed: 0,
    };
  }

  if (!reservations || reservations.length === 0) {
    return {
      success: true,
      message: 'No active reservations found',
      processed: 0,
    };
  }

  // Process each reservation
  let processed = 0;
  const errors: string[] = [];

  for (const reservation of reservations) {
    // Reduce total quantity (converting reserved to sold)
    const adjustmentResult = await adjustInventory(
      reservation.product_id,
      reservation.variant_id,
      -reservation.quantity,
      'sale',
      'checkout',
      undefined,
      { order_id: orderId, reservation_id: reservation.id }
    );

    if (adjustmentResult.success) {
      // Delete the reservation
      const { error: deleteError } = await supabase
        .from('cart_reservations')
        .delete()
        .eq('id', reservation.id);

      if (deleteError) {
        errors.push(`Failed to delete reservation ${reservation.id}: ${deleteError.message}`);
      } else {
        processed++;
      }
    } else {
      errors.push(`Failed to process reservation ${reservation.id}: ${adjustmentResult.message}`);
    }
  }

  if (errors.length > 0) {
    return {
      success: processed === reservations.length,
      message: `Processed ${processed} of ${reservations.length} reservations. Errors: ${errors.join('; ')}`,
      processed,
    };
  }

  return {
    success: processed === reservations.length,
    message: `Processed ${processed} of ${reservations.length} reservations`,
    processed,
  };
}

/**
 * Create stock notification request
 *
 * Allows customers to sign up for email notifications when an out-of-stock
 * item becomes available again.
 *
 * @example
 * ```typescript
 * const result = await createStockNotification({
 *   productId: 'product-uuid',
 *   variantId: 'variant-uuid',
 *   email: 'customer@example.com'
 * });
 *
 * if (result.success) {
 *   // Customer will be notified when back in stock
 * }
 * ```
 *
 * @param {StockNotificationRequest} request - Notification request with product/variant and email
 * @returns {Promise<{success: boolean; message: string}>} Creation result
 */
export async function createStockNotification(
  request: StockNotificationRequest
): Promise<{ success: boolean; message: string }> {
  // Validate product ID
  if (!request.productId || !isValidUUID(request.productId)) {
    return {
      success: false,
      message: ERROR_MESSAGES.INVALID_UUID + ' (product)',
    };
  }

  // Validate variant UUID if provided
  if (request.variantId !== undefined && !isValidUUID(request.variantId)) {
    return {
      success: false,
      message: ERROR_MESSAGES.INVALID_UUID + ' (variant)',
    };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!request.email || !emailRegex.test(request.email)) {
    return {
      success: false,
      message: 'Invalid email format provided',
    };
  }

  const supabase = createClient();
  const { error } = await supabase.from('stock_notifications').insert({
    product_id: request.productId,
    variant_id: request.variantId,
    email: request.email,
    status: 'pending',
  });

  if (error) {
    // Handle duplicate signup
    if (error.message.includes('unique constraint') || error.code === '23505') {
      return {
        success: true,
        message: 'You are already on the notification list for this item',
      };
    }

    const errorCode = error.code || 'UNKNOWN_ERROR';
    return {
      success: false,
      message: ERROR_MESSAGES[errorCode] || `Failed to create notification: ${error.message}`,
    };
  }

  return {
    success: true,
    message: 'You will be notified when this item is back in stock',
  };
}

/**
 * Mark stock notifications as sent
 *
 * Called by notification service after sending "back in stock" emails.
 * Updates status to 'notified' and records timestamp.
 *
 * @example
 * ```typescript
 * await markNotificationsSent(['notif-uuid-1', 'notif-uuid-2']);
 * ```
 *
 * @param {string[]} notificationIds - Array of notification IDs to mark as sent (all valid UUIDs required)
 * @returns {Promise<{success: boolean; message: string}>} Update result
 */
export async function markNotificationsSent(
  notificationIds: string[]
): Promise<{ success: boolean; message: string }> {
  // Validate notification IDs
  if (!notificationIds || notificationIds.length === 0) {
    return {
      success: false,
      message: 'No notification IDs provided',
    };
  }

  // Validate all IDs are valid UUIDs
  const invalidIds = notificationIds.filter(id => !isValidUUID(id));
  if (invalidIds.length > 0) {
    return {
      success: false,
      message: `${ERROR_MESSAGES.INVALID_UUID} (notifications: ${invalidIds.join(', ')})`,
    };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from('stock_notifications')
    .update({
      status: 'notified',
      notified_at: new Date().toISOString(),
    })
    .in('id', notificationIds);

  if (error) {
    const errorCode = error.code || 'UNKNOWN_ERROR';
    return {
      success: false,
      message: ERROR_MESSAGES[errorCode] || `Failed to mark notifications: ${error.message}`,
    };
  }

  return {
    success: true,
    message: `Marked ${notificationIds.length} notifications as sent`,
  };
}
