import { NextRequest } from 'next/server';
import { createPaymentIntent } from '@/lib/api/create-payment-intent';

export async function POST(request: NextRequest) {
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
        { status: statusCode }
      );
    }

    return Response.json(result);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error in payment intent API route:', error);

    return Response.json(
      { 
        error: { 
          message: errorMessage
        } 
      }, 
      { status: 500 }
    );
  }
}