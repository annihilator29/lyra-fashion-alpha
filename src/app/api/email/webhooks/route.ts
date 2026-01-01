// Resend webhook handler for email analytics
// Story 4.5: Email Notifications & Marketing Preferences
// POST /api/email/webhooks - Process Resend webhook events

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

interface ResendWebhookEvent {
  type: string;
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    html?: string;
    text?: string;
    created_at: string;
    delivered_at?: string;
    opened_at?: string;
    clicked_at?: string;
    bounced?: {
      reason: string;
      type: string;
      email?: string;
    };
    unsubscribed?: boolean;
    link?: string;
    click_tracking?: boolean;
    tags?: Array<{ name: string; value: string }>;
  };
}

export const runtime = 'nodejs';

// Verify webhook signature
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  try {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    const digest = hmac.digest('base64');

    // Format: "t=timestamp,v1=signature"
    const [timestamp, signatureValue] = signature.split(',');
    if (!timestamp || !signatureValue) return false;

    // Check timestamp (reject if > 15 minutes old)
    const webhookTime = parseInt(timestamp.split('=')[1], 10);
    const now = Math.floor(Date.now() / 1000);
    if (now - webhookTime > 15 * 60) return false;

    return crypto.timingSafeEqual(
      Buffer.from(`v1=${digest}`),
      Buffer.from(signatureValue),
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    // Get webhook signature
    const signature = request.headers.get('resend-signature');
    const resendWebhookSecret = process.env.RESEND_WEBHOOK_SECRET;

    if (!resendWebhookSecret) {
      console.warn('RESEND_WEBHOOK_SECRET not set, skipping signature verification');
    } else if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    // Get raw body for signature verification
    const rawBody = await request.text();
    const payload = JSON.parse(rawBody);

    // Verify signature if secret is configured
    if (resendWebhookSecret && signature) {
      if (!verifyWebhookSignature(rawBody, signature, resendWebhookSecret)) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    // Process events
    const events = Array.isArray(payload) ? payload : [payload];
    const results = [];

    for (const event of events as ResendWebhookEvent[]) {
      try {
        const result = await processWebhookEvent(event);
        results.push({ success: result, type: event.type });
      } catch (error) {
        console.error(`Error processing event ${event.type}:`, error);
        results.push({
          success: false,
          type: event.type,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process webhook',
      },
      { status: 500 },
    );
  }
}

async function processWebhookEvent(event: ResendWebhookEvent): Promise<boolean> {
  const supabase = await createClient();

  // Update sent_emails table based on event type
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const updates: any = {};

  switch (event.type) {
    case 'email.delivery_delayed':
    case 'email.delivered':
      updates.delivered_at = event.data.delivered_at || event.data.created_at;
      updates.status = 'delivered';
      break;

    case 'email.opened':
      updates.opened_at = event.data.opened_at;
      updates.status = 'opened';
      break;

    case 'email.clicked':
      updates.clicked_at = event.data.clicked_at;
      updates.status = 'clicked';
      break;

    case 'email.bounced':
      updates.status = 'bounced';
      updates.error_message = `Bounced: ${event.data.bounced?.reason} (${event.data.bounced?.type})`;
      break;

    case 'email.complained':
      updates.status = 'bounced';
      updates.error_message = 'User marked as spam';
      break;

    case 'email.unsubscribed':
      updates.status = 'clicked'; // Track as clicked for analytics
      // Note: Unsubscribe token processing is handled by separate endpoint
      break;

    default:
      console.warn(`Unhandled event type: ${event.type}`);
      return true;
  }

  // Update sent_emails table
  if (Object.keys(updates).length > 0) {
    const { error } = await supabase
      .from('sent_emails')
      .update(updates)
      .eq('email_id', event.data.email_id);

    if (error) {
      console.error('Error updating sent_emails:', error);
      return false;
    }
  }

  return true;
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    status: 'webhook-active',
    timestamp: new Date().toISOString(),
  });
}
