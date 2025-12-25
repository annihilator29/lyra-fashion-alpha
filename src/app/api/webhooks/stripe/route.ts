import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

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

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return new Response('Missing stripe signature', { status: 400 });
  }

  let event: Stripe.Event;

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
    return new Response(`Webhook Error: ${errorMessage}`, { status: 400 });
  }

  // Check if this event has already been processed (idempotency)
  const { data: existingEvent, error: fetchError } = await supabase
    .from('processed_webhooks')
    .select('id')
    .eq('event_id', event.id)
    .single();

  if (existingEvent) {
    console.log(`Webhook event ${event.id} already processed, skipping`);
    return new Response('Success', { status: 200 });
  }

  try {
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
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}`);
    }

     // Record that this event has been processed
     const objectData = event.data.object as unknown as Record<string, unknown>;
     await supabase
       .from('processed_webhooks')
       .insert({
         event_id: event.id,
         event_type: event.type,
         processed_at: new Date().toISOString(),
         order_id: (objectData.id as string) || (objectData.payment_intent as string),
       });
  } catch (error) {
    console.error('Error processing webhook event:', error);
    // Don't return an error here as Stripe will retry the webhook
    // Instead, log the error and return success
  }

  // Return a 200 response to acknowledge receipt of the event
  return new Response('Success', { status: 200 });
}

async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  
  try {
    // Get the payment intent ID from the session
    const paymentIntentId = session.payment_intent as string;
    
    // Find the order by payment intent ID
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .single();
    
    if (error || !order) {
      console.error('Order not found for payment intent:', paymentIntentId);
      return;
    }
    
    // Update the order status to 'paid'
    const { error: updateError } = await supabase
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
    
    console.log(`Order ${order.id} updated to paid status`);
  } catch (error: unknown) {
    console.error('Error handling checkout session completed:', error instanceof Error ? error.message : error);
  }
}

async function handlePaymentIntentSucceeded(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  
  try {
    // Find the order by payment intent ID
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('stripe_payment_intent_id', paymentIntent.id)
      .single();
    
    if (error || !order) {
      console.error('Order not found for payment intent:', paymentIntent.id);
      return;
    }
    
    // Update the order status to 'paid'
    const { error: updateError } = await supabase
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
    
    console.log(`Order ${order.id} updated to paid status after payment intent succeeded`);
  } catch (error: unknown) {
    console.error('Error handling payment intent succeeded:', error instanceof Error ? error.message : error);
  }
}

async function handlePaymentIntentFailed(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  
  try {
    // Find the order by payment intent ID
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('stripe_payment_intent_id', paymentIntent.id)
      .single();
    
    if (error || !order) {
      console.error('Order not found for payment intent:', paymentIntent.id);
      return;
    }
    
    // Update the order status to 'failed'
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: 'failed',
        updated_at: new Date().toISOString()
      })
      .eq('id', order.id);
    
    if (updateError) {
      console.error('Error updating order status to failed:', updateError);
      return;
    }
    
    console.log(`Order ${order.id} updated to failed status after payment intent failed`);
  } catch (error) {
    console.error('Error handling payment intent failed:', error);
  }
}

async function handleChargeFailed(event: Stripe.Event) {
  const charge = event.data.object as Stripe.Charge;
  
  try {
    // Find the order by payment intent ID (charge object has payment_intent as a string)
    const paymentIntentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;
    
    if (!paymentIntentId) {
      console.error('No payment intent ID found for charge:', charge.id);
      return;
    }
    
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('stripe_payment_intent_id', paymentIntentId as string)
      .single();
    
    if (error || !order) {
      console.error('Order not found for charge:', charge.id);
      return;
    }
    
    // Update the order status to 'failed'
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: 'failed',
        updated_at: new Date().toISOString()
      })
      .eq('id', order.id);
    
    if (updateError) {
      console.error('Error updating order status to failed:', updateError);
      return;
    }
    
    console.log(`Order ${order.id} updated to failed status after charge failed`);
  } catch (error: unknown) {
    console.error('Error handling charge failed:', error instanceof Error ? error.message : error);
  }
}