/**
 * Email Preferences API Route
 * Story 4.5: Email Notifications & Marketing Preferences
 * PUT /api/email/preferences - Update user email marketing preferences
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Validate email preferences object structure
 */
interface EmailPreferences {
  order_updates?: boolean;
  new_products?: boolean;
  sales?: boolean;
  blog?: boolean;
}

const EMAIL_PREFERENCES_KEYS = [
  'order_updates',
  'new_products',
  'sales',
  'blog',
] as const;

export async function PUT(request: NextRequest) {
  try {
    // Get authenticated user session
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

    const userId = user.id;

    // Parse and validate request body
    const body = await request.json();
    const preferences: EmailPreferences = body.preferences;

    if (!preferences || typeof preferences !== 'object') {
      return NextResponse.json(
        {
          data: null,
          error: { message: 'Preferences object is required', code: 'INVALID_INPUT' },
        },
        { status: 400 }
      );
    }

    // Validate all preference keys are boolean values
    const validationErrors: string[] = [];
    for (const key of EMAIL_PREFERENCES_KEYS) {
      if (key in preferences && typeof preferences[key as keyof EmailPreferences] !== 'boolean') {
        validationErrors.push(`${key} must be a boolean value`);
      }
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Invalid preferences values',
            code: 'VALIDATION_ERROR',
            details: validationErrors,
          },
        },
        { status: 400 }
      );
    }

    // Build updated preferences object (merge with existing)
    // First fetch current preferences
    const { data: currentCustomer } = await supabase
      .from('customers')
      .select('email_preferences')
      .eq('id', userId)
      .single();

    if (!currentCustomer) {
      return NextResponse.json(
        {
          data: null,
          error: { message: 'Customer profile not found', code: 'NOT_FOUND' },
        },
        { status: 404 }
      );
    }

    // Merge new preferences with existing ones
    const existingPreferences = (currentCustomer.email_preferences as Record<string, boolean>) || {
      order_updates: true,
      new_products: false,
      sales: false,
      blog: false,
    };

    const updatedPreferences: Record<string, boolean> = { ...existingPreferences };

    // Only update provided preferences
    for (const key of EMAIL_PREFERENCES_KEYS) {
      if (key in preferences) {
        updatedPreferences[key] = preferences[key as keyof EmailPreferences] as boolean;
      }
    }

    // Update customer email preferences
    const { error: updateError } = await supabase
      .from('customers')
      .update({ email_preferences: updatedPreferences })
      .eq('id', userId);

    if (updateError) {
      console.error('Failed to update email preferences:', updateError);
      return NextResponse.json(
        {
          data: null,
          error: {
            message: 'Failed to update preferences',
            code: 'UPDATE_FAILED',
            details: updateError.message,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        data: {
          preferences: updatedPreferences,
          updatedAt: new Date().toISOString(),
        },
        error: null,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Email preferences API error:', error);

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
