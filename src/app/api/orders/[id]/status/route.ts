/**
 * Admin Order Status Update API Route
 * Story 6.1: Order Status Tracking System (Task 6)
 * 
 * Protected endpoint for admins to update order status
 * - Verifies admin role
 * - Updates order status and corresponding timestamps
 * - Handles tracking information for shipped/delivered statuses
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/roles';
import type { OrderStatus } from '@/types/order';

interface StatusUpdateRequest {
  status: OrderStatus;
  trackingNumber?: string;
  carrier?: string;
  estimatedDeliveryDate?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin access
    await requireAdmin();

    const { id: orderId } = await params;
    const body: StatusUpdateRequest = await request.json();
    const { status, trackingNumber, carrier, estimatedDeliveryDate } = body;

    // Validate status
    const validStatuses: OrderStatus[] = ['pending', 'production', 'quality_check', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Build update object
    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };

    // Set timestamp based on status
    const now = new Date().toISOString();
    switch (status) {
      case 'production':
        updateData.production_started_at = now;
        break;
      case 'quality_check':
        updateData.quality_checked_at = now;
        break;
      case 'shipped':
        updateData.shipped_at = now;
        if (trackingNumber) updateData.tracking_number = trackingNumber;
        if (carrier) updateData.carrier = carrier;
        break;
      case 'delivered':
        updateData.delivered_at = now;
        if (trackingNumber) updateData.tracking_number = trackingNumber;
        if (carrier) updateData.carrier = carrier;
        break;
    }

    // Update estimated delivery date if provided
    if (estimatedDeliveryDate) {
      updateData.estimated_delivery_date = estimatedDeliveryDate;
    }

    // Update order
    const { data: order, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Error updating order status:', error);
      return NextResponse.json(
        { error: 'Failed to update order status' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      order,
      message: `Order status updated to ${status}` 
    });

  } catch (error) {
    console.error('Order status update error:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized: Admin access required') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
