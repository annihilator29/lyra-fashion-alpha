'use server';

import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import type { Return } from '@/types/returns';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

interface RefundResult {
  success: boolean;
  message: string;
  refundId?: string;
  error?: string;
}

/**
 * Process Stripe refund for a return
 * 
 * @example
 * ```typescript
 * const result = await processStripeRefund('return-uuid');
 * if (result.success) {
 *   console.log('Refund processed:', result.refundId);
 * }
 * ```
 */
export async function processStripeRefund(returnId: string): Promise<RefundResult> {
  try {
    const supabase = await createClient();

    // Fetch return with order details
    const { data: returnData, error: returnError } = await supabase
      .from('returns')
      .select(`
        *,
        order:orders (
          id,
          payment_intent_id,
          customer_id,
          customer_email
        )
      `)
      .eq('id', returnId)
      .single();

    if (returnError || !returnData) {
      return {
        success: false,
        message: 'Return not found',
        error: 'RETURN_NOT_FOUND',
      };
    }

    // Verify return is in correct status
    if (returnData.status !== 'inspected') {
      return {
        success: false,
        message: 'Return must be inspected before processing refund',
        error: 'INVALID_STATUS',
      };
    }

    // Check if already refunded
    if (returnData.stripe_refund_id) {
      return {
        success: false,
        message: 'Refund already processed for this return',
        error: 'ALREADY_REFUNDED',
      };
    }

    const order = returnData.order;

    // Check for payment intent
    if (!order.payment_intent_id) {
      return {
        success: false,
        message: 'No payment intent found for this order',
        error: 'NO_PAYMENT_INTENT',
      };
    }

    // Check if this is a guest order (no customer_id)
    const isGuestOrder = !order.customer_id;

    try {
      // Create refund in Stripe
      const refund = await stripe.refunds.create({
        payment_intent: order.payment_intent_id,
        amount: Math.round(returnData.refund_amount * 100), // Convert to cents
        reason: 'requested_by_customer',
        metadata: {
          return_id: returnId,
          rma_number: returnData.rma_number,
          order_id: order.id,
          is_guest: isGuestOrder.toString(),
        },
      });

      // Update return record with refund ID
      const { error: updateError } = await supabase
        .from('returns')
        .update({
          stripe_refund_id: refund.id,
          status: 'refunded',
          refunded_at: new Date().toISOString(),
        })
        .eq('id', returnId);

      if (updateError) {
        console.error('Failed to update return record after refund:', updateError);
        // Continue - the refund was successful, we'll update the record manually if needed
      }

      // Restock inventory for each returned item
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('product_id, quantity')
        .in('id', returnData.order_item_ids);

      if (orderItems) {
        for (const item of orderItems) {
          // Update inventory - add back the returned quantity
          const { error: inventoryError } = await supabase.rpc('adjust_inventory', {
            p_product_id: item.product_id,
            p_variant_id: null,
            p_adjustment: item.quantity,
            p_reason: 'return',
            p_source: 'return',
            p_user_id: null,
            p_metadata: { return_id: returnId, order_id: order.id },
          });

          if (inventoryError) {
            console.error('Failed to restock inventory for product:', item.product_id, inventoryError);
          }
        }
      }

      return {
        success: true,
        message: 'Refund processed successfully',
        refundId: refund.id,
      };

    } catch (stripeError) {
      console.error('Stripe refund error:', stripeError);

      // Handle specific Stripe errors
      if (stripeError instanceof Stripe.errors.StripeCardError) {
        return {
          success: false,
          message: 'The card used for this order is no longer valid. Consider offering store credit.',
          error: 'CARD_ERROR',
        };
      }

      if (stripeError instanceof Stripe.errors.StripeInvalidRequestError) {
        return {
          success: false,
          message: 'Invalid payment reference. Please contact support.',
          error: 'INVALID_REQUEST',
        };
      }

      return {
        success: false,
        message: 'Payment processor error. Please try again or contact support.',
        error: 'STRIPE_ERROR',
      };
    }

  } catch (error) {
    console.error('Error processing refund:', error);
    return {
      success: false,
      message: 'Internal server error',
      error: 'INTERNAL_ERROR',
    };
  }
}

/**
 * Get refund status for a return
 */
export async function getRefundStatus(returnId: string): Promise<{
  status: string;
  refundId: string | null;
  refundedAt: string | null;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('returns')
      .select('status, stripe_refund_id, refunded_at')
      .eq('id', returnId)
      .single();

    if (error || !data) {
      return {
        status: 'unknown',
        refundId: null,
        refundedAt: null,
        error: 'Return not found',
      };
    }

    return {
      status: data.status,
      refundId: data.stripe_refund_id,
      refundedAt: data.refunded_at,
    };

  } catch (error) {
    console.error('Error getting refund status:', error);
    return {
      status: 'unknown',
      refundId: null,
      refundedAt: null,
      error: 'Internal error',
    };
  }
}

/**
 * Handle partial refund for items not previously refunded
 */
export async function validatePartialRefund(
  orderId: string,
  itemIds: string[]
): Promise<{
  valid: boolean;
  alreadyRefunded: string[];
  refundAmount: number;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Check if any items are already in a refunded return
    const { data: existingReturns } = await supabase
      .from('returns')
      .select('order_item_ids, status')
      .eq('order_id', orderId)
      .eq('status', 'refunded');

    const refundedItemIds = new Set<string>();
    existingReturns?.forEach((ret) => {
      ret.order_item_ids.forEach((id: string) => refundedItemIds.add(id));
    });

    const alreadyRefunded = itemIds.filter((id) => refundedItemIds.has(id));

    if (alreadyRefunded.length > 0) {
      return {
        valid: false,
        alreadyRefunded,
        refundAmount: 0,
        error: 'Some items have already been refunded',
      };
    }

    // Calculate refund amount
    const { data: items } = await supabase
      .from('order_items')
      .select('price, quantity')
      .in('id', itemIds);

    const refundAmount = items?.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    ) || 0;

    return {
      valid: true,
      alreadyRefunded: [],
      refundAmount,
    };

  } catch (error) {
    console.error('Error validating partial refund:', error);
    return {
      valid: false,
      alreadyRefunded: [],
      refundAmount: 0,
      error: 'Validation error',
    };
  }
}
