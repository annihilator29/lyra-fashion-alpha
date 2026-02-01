/**
 * Inventory Mutations
 *
 * Database mutations for inventory management (reservations, releases, adjustments)
 */

import { createClient } from '@/lib/supabase/client';
import type {
  InventoryReservationResult,
  InventoryReleaseResult,
  InventoryAdjustmentResult,
  StockNotificationRequest,
} from './types';

/**
 * Reserve inventory for a cart (15-minute hold during checkout)
 */
export async function reserveInventory(
  cartId: string,
  productId: string,
  variantId: string | null,
  quantity: number,
  expiresInMinutes: number = 15
): Promise<InventoryReservationResult> {
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
    return {
      success: false,
      error: error.message,
      message: 'Failed to reserve inventory',
    };
  }

  return data as InventoryReservationResult;
}

/**
 * Release a reservation (cancel or expire)
 */
export async function releaseReservation(
  reservationId: string,
  reason: 'release' | 'cancellation' = 'release'
): Promise<InventoryReleaseResult> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('release_reservation', {
    p_reservation_id: reservationId,
    p_reason: reason,
  });

  if (error) {
    return {
      success: false,
      message: `Failed to release reservation: ${error.message}`,
    };
  }

  return data as InventoryReleaseResult;
}

/**
 * Release all expired reservations (called by cron job)
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
  for (const reservation of expiredReservations) {
    const result = await releaseReservation(reservation.id, 'release');
    if (result.success) {
      released++;
    }
  }

  return { released, error: null };
}

/**
 * Extend reservation expiration time
 */
export async function extendReservation(
  reservationId: string,
  additionalMinutes: number = 15
): Promise<{ success: boolean; message: string }> {
  const supabase = createClient();
  const newExpiresAt = new Date(Date.now() + additionalMinutes * 60 * 1000).toISOString();

  const { error } = await supabase
    .from('cart_reservations')
    .update({ expires_at: newExpiresAt })
    .eq('id', reservationId);

  if (error) {
    return {
      success: false,
      message: `Failed to extend reservation: ${error.message}`,
    };
  }

  return {
    success: true,
    message: `Reservation extended by ${additionalMinutes} minutes`,
  };
}

/**
 * Adjust inventory quantity (for admin or factory sync)
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
    return {
      success: false,
      message: `Failed to adjust inventory: ${error.message}`,
    };
  }

  return data as InventoryAdjustmentResult;
}

/**
 * Convert reservations to sales (after successful checkout)
 */
export async function convertReservationsToSales(
  cartId: string,
  orderId: string
): Promise<{ success: boolean; message: string; processed: number }> {
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
      await supabase.from('cart_reservations').delete().eq('id', reservation.id);
      processed++;
    }
  }

  return {
    success: processed === reservations.length,
    message: `Processed ${processed} of ${reservations.length} reservations`,
    processed,
  };
}

/**
 * Create stock notification request
 */
export async function createStockNotification(
  request: StockNotificationRequest
): Promise<{ success: boolean; message: string }> {
  const supabase = createClient();
  const { error } = await supabase.from('stock_notifications').insert({
    product_id: request.productId,
    variant_id: request.variantId,
    email: request.email,
    status: 'pending',
  });

  if (error) {
    // Handle duplicate signup
    if (error.message.includes('unique constraint')) {
      return {
        success: true,
        message: 'You are already on the notification list for this item',
      };
    }

    return {
      success: false,
      message: `Failed to create notification: ${error.message}`,
    };
  }

  return {
    success: true,
    message: 'You will be notified when this item is back in stock',
  };
}

/**
 * Mark stock notifications as sent
 */
export async function markNotificationsSent(
  notificationIds: string[]
): Promise<{ success: boolean; message: string }> {
  const supabase = createClient();
  const { error } = await supabase
    .from('stock_notifications')
    .update({
      status: 'notified',
      notified_at: new Date().toISOString(),
    })
    .in('id', notificationIds);

  if (error) {
    return {
      success: false,
      message: `Failed to mark notifications: ${error.message}`,
    };
  }

  return {
    success: true,
    message: `Marked ${notificationIds.length} notifications as sent`,
  };
}
