/**
 * Guest Order Lookup API Route
 * Story 6.1: Order Status Tracking System (AC-4)
 * 
 * Public endpoint for looking up orders by order number and email
 * - Validates both order number and email
 - Returns order details if match found
 * - Excludes sensitive data (payment info)
 * - Rate limited to prevent abuse
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ratelimit } from '@/lib/rate-limiter';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : '127.0.0.1';
    const { success, limit, reset, remaining } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          }
        }
      );
    }

    const body = await request.json();
    const { orderNumber, email } = body;

    // Validate input
    if (!orderNumber || !email) {
      return NextResponse.json(
        { error: 'Order number and email are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Look up order by order_number or id (order number might be partial)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        customer_email,
        status,
        total,
        shipping_address,
        ordered_at,
        production_started_at,
        quality_checked_at,
        shipped_at,
        delivered_at,
        estimated_delivery_date,
        tracking_number,
        carrier,
        created_at,
        order_items (
          id,
          quantity,
          price,
          variant,
          products (
            id,
            name,
            slug,
            category,
            images,
            price
          )
        )
      `)
      .or(`order_number.ilike.%${orderNumber}%,id.eq.${orderNumber}`)
      .single();

    if (orderError || !order) {
      console.log('Order lookup failed:', orderError);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Verify email matches (case insensitive)
    if (order.customer_email?.toLowerCase() !== email.toLowerCase()) {
      console.log('Email mismatch for order:', order.id);
      return NextResponse.json(
        { error: 'Email does not match order' },
        { status: 403 }
      );
    }

    // Return order without sensitive data
    const sanitizedOrder = {
      id: order.id,
      order_number: order.order_number,
      status: order.status,
      total: order.total,
      shipping_address: order.shipping_address,
      ordered_at: order.ordered_at,
      production_started_at: order.production_started_at,
      quality_checked_at: order.quality_checked_at,
      shipped_at: order.shipped_at,
      delivered_at: order.delivered_at,
      estimated_delivery_date: order.estimated_delivery_date,
      tracking_number: order.tracking_number,
      carrier: order.carrier,
      created_at: order.created_at,
      order_items: order.order_items,
    };

    return NextResponse.json({ order: sanitizedOrder });

  } catch (error) {
    console.error('Order lookup API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
