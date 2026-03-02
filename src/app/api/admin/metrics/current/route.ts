/**
 * API Route: Current Metrics
 * Story 7.1c: Admin Dashboard - Real-Time Features
 * AC4: Real-Time Fallback Strategy - Polling Implementation
 *
 * GET /api/admin/metrics/current
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserRole } from '@/lib/auth/roles';

export async function GET() {
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

    const today = new Date().toISOString().split('T')[0];
    const todayStart = `${today}T00:00:00Z`;
    const todayEnd = `${today}T23:59:59Z`;

    // Fetch all metrics in parallel
    const [
      revenueResult,
      orderCountsResult,
      newSignupsResult,
      activeUsersResult,
    ] = await Promise.all([
      // Today's revenue (excluding cancelled/refunded)
      supabase
        .from('orders')
        .select('total')
        .gte('created_at', todayStart)
        .lt('created_at', todayEnd)
        .not('status', 'in', '(cancelled,refunded)'),

      // Order counts by status for today
      supabase
        .from('orders')
        .select('status')
        .gte('created_at', todayStart)
        .lt('created_at', todayEnd),

      // New signups today
      supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayStart)
        .lt('created_at', todayEnd),

      // Active users (logged in within last 30 days)
      (async () => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return supabase
          .from('customers')
          .select('*', { count: 'exact', head: true })
          .gte('last_login', thirtyDaysAgo.toISOString());
      })(),
    ]);

    // Calculate revenue
    const todaysRevenue =
      revenueResult.data?.reduce((sum, order) => sum + (order.total || 0), 0) ||
      0;

    // Count orders by status
    const orderCounts = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      refunded: 0,
    };

    orderCountsResult.data?.forEach((order) => {
      // Map 'production' and 'quality_check' to 'processing' for metrics display
      if (order.status === 'production' || order.status === 'quality_check') {
        orderCounts.processing++;
      } else if (order.status in orderCounts) {
        orderCounts[order.status as keyof typeof orderCounts]++;
      }
    });

    // Set cache headers for polling optimization
    const headers = new Headers();
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');

    return NextResponse.json(
      {
        todaysRevenue,
        newOrders: orderCounts.pending,
        processingOrders: orderCounts.processing,
        shippedOrders: orderCounts.shipped,
        newSignups: newSignupsResult.count || 0,
        activeUsers: activeUsersResult.count || 0,
        errors: [
          revenueResult.error?.message,
          orderCountsResult.error?.message,
          newSignupsResult.error?.message,
          activeUsersResult.error?.message,
        ].filter(Boolean),
      },
      { headers }
    );
  } catch (error) {
    console.error('API /metrics/current - Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
