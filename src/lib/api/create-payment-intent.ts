// This file contains the API logic for creating payment intents
// It's separated from the route handler for testability and reusability

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

interface CreatePaymentIntentParams {
  amount: number;
  currency?: string;
  idempotency_key?: string;
  order_id?: string;
  user_id?: string;
  cart_items?: Array<{
    id: string;
    price: number;
    quantity: number;
  }>;
  shipping_address?: Record<string, unknown>;
  billing_address?: Record<string, unknown>;
}

interface PaymentIntentResponse {
  data?: {
    clientSecret: string;
    orderId: string;
    orderNumber: string;
  };
  error?: {
    message: string;
  };
}

// Generate order number in LF-{timestamp}-{random} format
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `LF-${timestamp}-${random}`;
}

export async function createPaymentIntent(
  params: CreatePaymentIntentParams
): Promise<PaymentIntentResponse> {
  try {
    const {
      amount,
      currency = 'usd',
      idempotency_key: providedIdempotencyKey,
      order_id,
      user_id,
      cart_items,
      shipping_address,
      billing_address
    } = params;

    // Validate required fields
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return {
        error: {
          message: 'Invalid amount provided. Amount must be a positive number in cents.'
        }
      };
    }

    // Note: We don't validate cart_items total against amount because
    // amount includes tax and shipping which aren't part of cart_items.
    // The cart_items are used for creating order_items records.
    // Future enhancement: send subtotal/tax/shipping separately for validation

    // Generate idempotency key if not provided
    const idempotencyKey = providedIdempotencyKey || randomUUID();

    // Check if an order with this idempotency key already exists
    const { data: existingOrder, error: fetchError } = await supabase
      .from('orders')
      .select('id, stripe_payment_intent_id, total, order_number')
      .eq('idempotency_key', idempotencyKey)
      .single();

    if (existingOrder) {
      // Verify that the amount matches the existing order to prevent fraud
      if (existingOrder.total !== amount) {
        return {
          error: {
            message: 'Amount mismatch for existing idempotency key. This may indicate a security issue.'
          }
        };
      }

      // If an order with this idempotency key already exists, return the existing payment intent
      try {
        const existingPaymentIntent = await stripe.paymentIntents.retrieve(
          existingOrder.stripe_payment_intent_id
        );

        return {
          data: {
            clientSecret: existingPaymentIntent.client_secret!,
            orderId: existingOrder.id,
            orderNumber: existingOrder.order_number,
          },
        };
      } catch (retrieveError) {
        // If the payment intent doesn't exist in Stripe anymore, return an error
        console.error('Existing payment intent not found in Stripe:', retrieveError);
        return {
          error: {
            message: 'Existing payment intent not found. Please try again.'
          }
        };
      }
    }

    // Create payment intent with idempotency key
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: {
        user_id: user_id || 'guest',
        order_id: order_id || 'pending',
      },
    }, {
      idempotencyKey: idempotencyKey,
    });

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Create a temporary order record in the database with pending status
    // This will be updated by the webhook when payment is confirmed
    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: user_id || null, // Map user_id to customer_id column
        order_number: orderNumber,
        total: amount,
        status: 'pending',
        idempotency_key: idempotencyKey,
        stripe_payment_intent_id: paymentIntent.id,
        shipping_address: shipping_address || null,
        billing_address: billing_address || null,
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      // If order creation fails, we need to cancel the payment intent
      try {
        await stripe.paymentIntents.cancel(paymentIntent.id);
      } catch (cancelError) {
        console.error('Error cancelling payment intent after order creation failure:', cancelError);
      }

      return {
        error: {
          message: 'Failed to create order record: ' + orderError.message
        }
      };
    }

    // Create order_items records for each cart item
    if (cart_items && cart_items.length > 0) {
      const orderItems = cart_items.map(item => ({
        order_id: newOrder.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        // Note: We don't cancel the order here as the order itself was created successfully
        // The items can be recovered from cart data in session storage if needed
      }
    }

    // Return the client secret and order info for the frontend
    return {
      data: {
        clientSecret: paymentIntent.client_secret!,
        orderId: newOrder.id,
        orderNumber: orderNumber,
      },
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error creating payment intent:', error);

    return {
      error: {
        message: errorMessage
      }
    };
  }
}