// This file contains API logic for creating payment intents
// It's separated from the route handler for testability and reusability

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not defined');
  }
  return new Stripe(key, {
    apiVersion: '2025-12-15.clover',
  });
};

const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase environment variables are not defined');
  }
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

interface CreatePaymentIntentParams {
  amount: number;
  currency?: string;
  idempotency_key?: string;
  order_id?: string;
  user_id?: string;
  cart_items?: Array<{
    id: string;
    productId?: string;
    price: number;
    quantity: number;
  }>;
  shipping_address?: Record<string, unknown>;
  billing_address?: Record<string, unknown>;
  customer_email?: string;
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
      billing_address,
      customer_email
    } = params;

    console.log('*** PAYMENT INTENT DEBUG: Creating payment intent ***');
    console.log('Amount (cents):', amount);
    console.log('User ID:', user_id);
    console.log('Cart items count:', cart_items?.length);

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return {
        error: {
          message: 'Invalid amount provided. Amount must be a positive number in cents.'
        }
      };
    }

    const idempotencyKey = providedIdempotencyKey || randomUUID();
    const orderNumber = generateOrderNumber();
    const totalInDollars = amount / 100;

    console.log('Generated order number:', orderNumber);
    console.log('Idempotency key:', idempotencyKey);

    const { data: existingOrder } = await getSupabase()
      .from('orders')
      .select('id, order_number, stripe_payment_intent_id, status')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle();

    if (existingOrder) {
      console.log('*** PAYMENT INTENT DEBUG: Order already exists with this idempotency key ***');
      console.log('Existing order ID:', existingOrder.id);
      console.log('Existing order number:', existingOrder.order_number);
      console.log('Existing payment intent ID:', existingOrder.stripe_payment_intent_id);
      console.log('Existing status:', existingOrder.status);

      return {
        data: {
          clientSecret: 'REUSED_ORDER',
          orderId: existingOrder.id,
          orderNumber: existingOrder.order_number!,
        },
      };
    }

    console.log('*** PAYMENT INTENT DEBUG: Creating new order ***');
    console.log('Total (cents):', amount);
    console.log('Total (dollars):', totalInDollars);

    const paymentIntent = await getStripe().paymentIntents.create({
      amount,
      currency,
      metadata: {
        user_id: user_id || 'guest',
        order_id: order_id || 'pending',
      },
    }, {
      idempotencyKey,
    });

    console.log('*** PAYMENT INTENT DEBUG: Payment intent created ***');
    console.log('Payment Intent ID:', paymentIntent.id);

    const { data: newOrder, error: orderError } = await getSupabase()
      .from('orders')
      .insert({
        customer_id: user_id || null,
        order_number: orderNumber,
        total: totalInDollars,
        status: 'pending',
        idempotency_key: idempotencyKey,
        stripe_payment_intent_id: paymentIntent.id,
        shipping_address: shipping_address || null,
        billing_address: billing_address || null,
        customer_email: customer_email || null,
      })
      .select()
      .single();

    console.log('*** PAYMENT INTENT DEBUG: Order created ***');
    console.log('Order ID:', newOrder?.id);
    console.log('Order number:', newOrder?.order_number);

    if (orderError) {
      console.error('Error creating order:', orderError);
      try {
        await getStripe().paymentIntents.cancel(paymentIntent.id);
      } catch (cancelError) {
        console.error('Error cancelling payment intent after order creation failure:', cancelError);
      }

      return {
        error: {
          message: 'Failed to create order record: ' + orderError.message
        }
      };
    }

    console.log('*** PAYMENT INTENT DEBUG: Creating order items ***');

    if (cart_items && cart_items.length > 0) {
      const orderItems = cart_items.map((item, index) => {
        // Convert price from dollars to cents for Stripe (database stores dollars)
        const priceInCents = Math.round(item.price * 100);
        console.log(`Mapping item ${index + 1} (${item.productId || item.id}):`, {
          productId: item.productId || item.id,
          priceDollars: item.price,
          priceCents: priceInCents,
          quantity: item.quantity
        });

        return {
          order_id: newOrder.id,
          product_id: item.productId || item.id,
          quantity: item.quantity,
          price: item.price, // Store in dollars as expected by database schema (DECIMAL(10,2))
        };
      });

      const { error: itemsError } = await getSupabase()
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
      }

      console.log('*** PAYMENT INTENT DEBUG: Order items created ***');
      console.log('Items created:', orderItems.length);
    }

    const response = {
      data: {
        clientSecret: paymentIntent.client_secret!,
        orderId: newOrder.id,
        orderNumber: orderNumber,
      },
    };

    console.log('*** PAYMENT INTENT DEBUG: Returning response ***');
    console.log('Client Secret:', response.data.clientSecret);
    console.log('Order ID:', response.data.orderId);
    console.log('Order Number:', response.data.orderNumber);

    return response;
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
