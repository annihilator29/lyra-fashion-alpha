import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { sendOrderConfirmation } from '@/lib/resend';

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

// Structured logging helper
function log(level: 'error' | 'warn' | 'info' | 'debug', message: string, context?: Record<string, unknown>) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  }));
}

// Webhook security headers
const WEBHOOK_HEADERS = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

export async function POST(request: NextRequest) {
  // Enforce HTTPS in production
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  if (process.env.NODE_ENV === 'production' && protocol !== 'https') {
    return Response.json(
      { error: { message: 'HTTPS required for webhooks' } },
      { status: 400, headers: WEBHOOK_HEADERS }
    );
  }

  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return new Response('Missing stripe signature', { status: 400, headers: WEBHOOK_HEADERS });
  }

  let event: Stripe.Event;
  const stripe = getStripe();

  try {
    // Verify the webhook signature to ensure it's from Stripe
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification failed:', err);
    log('error', `Webhook signature verification failed`, { error: err instanceof Error ? err.message : 'Unknown error' });
    return new Response(`Webhook Error: ${errorMessage}`, { status: 400 });
  }

  // Check if this event has already been processed (idempotency)
  const { data: existingEvent } = await getSupabase()
    .from('processed_webhooks')
    .select('id')
    .eq('event_id', event.id)
    .single();

   if (existingEvent) {
    log('info', `Webhook event ${event.id} already processed, skipping`);
    return new Response('Success', { status: 200, headers: WEBHOOK_HEADERS });
  }

   try {
    // Mark event as processing BEFORE handling (prevents race conditions)
    const { error: markError } = await getSupabase()
      .from('processed_webhooks')
      .insert({
        event_id: event.id,
        event_type: event.type,
        processed_at: new Date().toISOString(),
      })
      .select();

    if (markError && markError.code !== '23505') {
      // 23505 is unique constraint violation - means already processed (success case)
      log('error', 'Error marking webhook as processing', { code: markError.code });
      // Continue processing even if mark failed (to ensure order is updated)
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        // This event is fired when a checkout session is completed
        // This includes successful payments
        await handleCheckoutSessionCompleted(event);
        break;

      case 'payment_intent.succeeded':
        // This event is fired when a payment intent is successful
        await handlePaymentIntentSucceeded(event);
        break;

      case 'payment_intent.payment_failed':
        // This event is fired when a payment intent fails
        await handlePaymentIntentFailed(event);
        break;

      case 'charge.failed':
        // This event is fired when a charge fails
        await handleChargeFailed(event);
        break;

      default:
         // Unexpected event type - log for monitoring but return success
        log('warn', `Unhandled event type`, { event_type: event.type });
    }

    // Event was marked as processing at the start, so no need to insert here
   } catch (error) {
     console.error('Error processing webhook event:', error);
     // Don't return an error here as Stripe will retry the webhook
     // Instead, log the error and return success
   }

  // Return a 200 response to acknowledge receipt of event
  return new Response('Success', { status: 200, headers: WEBHOOK_HEADERS });
}

async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;

  try {
    // Get the payment intent ID from session
    const paymentIntentId = session.payment_intent as string;

    // Find the order by payment intent ID, including items
    const { data: order, error } = await getSupabase()
      .from('orders')
      .select('*, order_items(*, product:products(*))')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .single();

    if (error || !order) {
      log('error', 'Order not found for payment intent', { payment_intent_id: paymentIntentId });
      return;
    }

    const { error: updateError } = await getSupabase()
      .from('orders')
      .update({
        status: 'paid',
        updated_at: new Date().toISOString()
      })
      .eq('id', order.id);

    if (updateError) {
      console.error('Error updating order status:', updateError);
      return;
    }

    log('info', 'Order updated to paid status', { order_id: order.id, order_number: order.order_number, customer_id: order.customer_id });

    // Send order confirmation email
    if (!order.email_sent) {
      try {
        const emailResult = await sendOrderConfirmation(order, getSupabase());
        if (emailResult) {
          log('info', 'Order confirmation email sent', { email_id: emailResult.emailId, order_id: order.id });
        }
      } catch (emailError) {
        log('error', 'Failed to send order confirmation email from webhook', { 
          order_id: order.id, 
          error: emailError instanceof Error ? emailError.message : 'Unknown error' 
        });
      }
    }
  } catch (error: unknown) {
    log('error', 'Error handling checkout session completed', { error: error instanceof Error ? error.message : 'Unknown error' });
  }
}

async function handlePaymentIntentSucceeded(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  try {
    // Find the order by payment intent ID
    // Find the order by payment intent ID, including items
    const { data: order, error } = await getSupabase()
      .from('orders')
      .select('*, order_items(*, product:products(*))')
      .eq('stripe_payment_intent_id', paymentIntent.id)
      .single();

    console.log('*** WEBHOOK DEBUG: PaymentIntent Succeeded ***');
    console.log('Payment Intent ID:', paymentIntent.id);
    console.log('Order Lookup Result:', order ? `Found Order #${order.order_number}` : 'Order Not Found');
    if (error) console.log('Order Lookup Error:', error.message);

    if (error || !order) {
      log('error', 'Order not found for payment intent', { payment_intent_id: paymentIntent.id });
      return;
    }

    // Update the order status to 'paid'
    const { error: updateError } = await getSupabase()
      .from('orders')
      .update({ 
        status: 'paid',
        updated_at: new Date().toISOString()
      })
      .eq('id', order.id);
    
    if (updateError) {
      log('error', 'Error updating order status', { error: updateError.message });
      return;
    }

    log('info', 'Order updated to paid status after payment intent succeeded', { order_id: order.id, payment_intent_id: paymentIntent.id });

    // Send order confirmation email
    console.log('*** WEBHOOK DEBUG: Attempting Email ***');
    console.log('Order Email Sent Flag:', order.email_sent);
    
    if (!order.email_sent) {
      try {
        const emailResult = await sendOrderConfirmation(order, getSupabase());
        console.log('*** WEBHOOK DEBUG: Email Result ***', emailResult);
        if (emailResult) {
          log('info', 'Order confirmation email sent', { email_id: emailResult.emailId, order_id: order.id });
        }
      } catch (emailError) {
        console.error('*** WEBHOOK DEBUG: Email Failed ***', emailError);
        log('error', 'Failed to send order confirmation email from webhook', { 
          order_id: order.id, 
          error: emailError instanceof Error ? emailError.message : 'Unknown error' 
        });
      }
    }
  } catch (error: unknown) {
    log('error', 'Error handling payment intent succeeded', { error: error instanceof Error ? error.message : 'Unknown error' });
  }
}

async function handlePaymentIntentFailed(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;

  try {
    // Find the order by payment intent ID
    const { data: order, error } = await getSupabase()
      .from('orders')
      .select('*')
      .eq('stripe_payment_intent_id', paymentIntent.id)
      .single();

    if (error || !order) {
      log('error', 'Order not found for payment intent', { payment_intent_id: paymentIntent.id });
      return;
    }

    // Update the order status to 'failed'
    const { error: updateError } = await getSupabase()
      .from('orders')
      .update({ 
        status: 'failed',
        updated_at: new Date().toISOString()
      })
      .eq('id', order.id);
    
    if (updateError) {
      log('error', 'Error updating order status to failed', { error: updateError.message });
      return;
    }

    log('info', 'Order updated to failed status after payment intent failed', { order_id: order.id, payment_intent_id: paymentIntent.id });
  } catch (error) {
    log('error', 'Error handling payment intent failed', { error: error instanceof Error ? error.message : 'Unknown error' });
  }
}

async function handleChargeFailed(event: Stripe.Event) {
  const charge = event.data.object as Stripe.Charge;

  try {
    // Find the order by payment intent ID (charge object has payment_intent as a string)
    const paymentIntentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;

    if (!paymentIntentId) {
      log('error', 'No payment intent ID found for charge', { charge_id: charge.id });
      return;
    }

    const { data: order, error } = await getSupabase()
      .from('orders')
      .select('*')
      .eq('stripe_payment_intent_id', paymentIntentId as string)
      .single();

    if (error || !order) {
      log('error', 'Order not found for charge', { charge_id: charge.id });
      return;
    }

    // Update the order status to 'failed'
    const { error: updateError } = await getSupabase()
      .from('orders')
      .update({ 
        status: 'failed',
        updated_at: new Date().toISOString()
      })
      .eq('id', order.id);
    
    if (updateError) {
      log('error', 'Error updating order status to failed', { error: updateError.message });
      return;
    }

    log('info', 'Order updated to failed status after charge failed', { order_id: order.id, charge_id: charge.id });
  } catch (error: unknown) {
    log('error', 'Error handling charge failed', { error: error instanceof Error ? error.message : 'Unknown error' });
  }
}