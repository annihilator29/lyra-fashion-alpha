/**
 * API Route: Recent Orders
 * Story 7.1c: Admin Dashboard - Real-Time Features
 * AC4: Real-Time Fallback Strategy - Polling Implementation
 *
 * GET /api/admin/orders/recent?limit=10&since=order-id
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserRole } from '@/lib/auth/roles';

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check admin role
    const role = await getUserRole();
    if (role !== 'admin' && role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const since = searchParams.get('since');

    // Validate limit
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid limit parameter' },
        { status: 400 }
      );
    }

    let orders;

    if (since) {
      // Get orders newer than the specified order ID
      const { data: referenceOrder, error: refError } = await supabase
        .from('orders')
        .select('created_at')
        .eq('id', since)
        .single();

      if (refError || !referenceOrder) {
        return NextResponse.json(
          { error: 'Reference order not found' },
          { status: 404 }
        );
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .gt('created_at', referenceOrder.created_at)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('API /orders/recent - Error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch orders' },
          { status: 500 }
        );
      }

      orders = data || [];
    } else {
      // Get most recent orders
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('API /orders/recent - Error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch orders' },
          { status: 500 }
        );
      }

      orders = data || [];
    }

    // Set cache headers for polling optimization
    // Short cache to reduce load while keeping data fresh
    const headers = new Headers();
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');

    return NextResponse.json(
      { orders },
      { headers }
    );
  } catch (error) {
    console.error('API /orders/recent - Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
