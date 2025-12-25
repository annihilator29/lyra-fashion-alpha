import { NextRequest } from 'next/server';
import { createPaymentIntent } from '@/lib/api/create-payment-intent';

// CORS and security headers configuration
const SECURITY_HEADERS = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

export async function POST(request: NextRequest) {
  // Enforce HTTPS in production
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  if (process.env.NODE_ENV === 'production' && protocol !== 'https') {
    return Response.json(
      { error: { message: 'HTTPS required for payment processing' } },
      { status: 400, headers: SECURITY_HEADERS }
    );
  }

  // Handle CORS preflight request
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: SECURITY_HEADERS });
  }

  try {
    const body = await request.json();
    const result = await createPaymentIntent(body);

    if (result.error) {
      // Determine status code based on error type
      let statusCode = 500;
      if (result.error.message.includes('Invalid amount')) {
        statusCode = 400;
      } else if (result.error.message.includes('Amount mismatch')) {
        statusCode = 400;
      } else if (result.error.message.includes('security issue')) {
        statusCode = 409; // Conflict
      }

      return Response.json(
        { error: result.error },
        { status: statusCode, headers: SECURITY_HEADERS }
      );
    }

    return Response.json(result, { headers: SECURITY_HEADERS });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error in payment intent API route:', error);

    return Response.json(
      {
        error: {
          message: errorMessage
        }
      },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}