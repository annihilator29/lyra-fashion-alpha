/**
 * Unsubscribe API Route
 * Story 4.5: Email Notifications & Marketing Preferences
 * GET /api/email/unsubscribe/[tokenType]/[token] - Process unsubscribe request
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server';
import {
  processUnsubscribeRequest,
  generateUnsubscribeToken,
  generateUnsubscribeUrl,
} from '@/lib/unsubscribe-utils';

// Valid token types
const VALID_TOKEN_TYPES = ['marketing', 'all', 'transactional'] as const;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tokenType: string; token: string }> }
) {
  try {
    const { tokenType, token } = await params;

    // Validate token type
    if (!VALID_TOKEN_TYPES.includes(tokenType as 'marketing' | 'all' | 'transactional')) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Invalid token type',
            code: 'INVALID_TOKEN_TYPE',
            validTypes: VALID_TOKEN_TYPES,
          },
        },
        { status: 400 }
      );
    }

    // Validate token format (UUID-like string)
    const tokenRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!tokenRegex.test(token)) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Invalid token format',
            code: 'INVALID_TOKEN_FORMAT',
          },
        },
        { status: 400 }
      );
    }

    // Process unsubscribe request
    const result = await processUnsubscribeRequest(token);

    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error: unknown) {
    console.error('Unsubscribe API error:', error);

    return NextResponse.json(
      {
        data: null,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint for generating unsubscribe tokens
 * Used by email templates to include unsubscribe links
 */
 export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          data: null,
          error: { message: 'Unauthorized. Please log in.', code: 'UNAUTHORIZED' },
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { tokenType = 'marketing' } = body;

    if (!VALID_TOKEN_TYPES.includes(tokenType as 'marketing' | 'all' | 'transactional')) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Invalid token type',
            code: 'INVALID_TOKEN_TYPE',
            validTypes: VALID_TOKEN_TYPES,
          },
        },
        { status: 400 }
      );
    }

    // Get user's email from customers table
    const { data: customer } = await supabase
      .from('customers')
      .select('email')
      .eq('id', user.id)
      .single();

    if (!customer) {
      return NextResponse.json(
        {
          data: null,
          error: { message: 'Customer not found', code: 'NOT_FOUND' },
        },
        { status: 404 }
      );
    }

    // Generate unsubscribe token
    const token = await generateUnsubscribeToken(customer.email, tokenType);

    return NextResponse.json(
      {
        data: {
          token,
          tokenType,
          unsubscribeUrl: generateUnsubscribeUrl(customer.email, tokenType),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        error: null,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Generate unsubscribe token error:', error);

    return NextResponse.json(
      {
        data: null,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
