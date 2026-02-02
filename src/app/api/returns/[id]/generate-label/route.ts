import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Shippo API configuration
const SHIPPO_API_KEY = process.env.SHIPPO_API_KEY;
const SHIPPO_API_URL = 'https://api.goshippo.com';

interface ShippoAddress {
  name: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
}

interface ShippoParcel {
  length: number;
  width: number;
  height: number;
  distance_unit: 'in' | 'cm';
  weight: number;
  mass_unit: 'lb' | 'kg';
}

/**
 * POST /api/returns/[id]/generate-label
 * 
 * Generate a return shipping label using Shippo API
 * Requires admin authentication
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;

    // Verify admin authentication
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Fetch return with order details
    const { data: returnData, error: returnError } = await supabase
      .from('returns')
      .select(`
        *,
        order:orders (
          shipping_address,
          customer_email
        )
      `)
      .eq('id', id)
      .single();

    if (returnError || !returnData) {
      return NextResponse.json(
        { error: 'Return not found' },
        { status: 404 }
      );
    }

    // Check if label already exists
    if (returnData.shipping_label_url) {
      return NextResponse.json(
        { error: 'Label already generated for this return' },
        { status: 400 }
      );
    }

    // Get warehouse address from environment variables
    const warehouseAddress: ShippoAddress = {
      name: process.env.WAREHOUSE_NAME || 'Lyra Fashion Returns',
      street1: process.env.WAREHOUSE_STREET || '123 Return St',
      city: process.env.WAREHOUSE_CITY || 'New York',
      state: process.env.WAREHOUSE_STATE || 'NY',
      zip: process.env.WAREHOUSE_ZIP || '10001',
      country: process.env.WAREHOUSE_COUNTRY || 'US',
      phone: process.env.WAREHOUSE_PHONE,
    };

    // Parse customer address from order
    const customerShipping = returnData.order.shipping_address;
    const customerAddress: ShippoAddress = {
      name: customerShipping.name,
      street1: customerShipping.address_line1,
      street2: customerShipping.address_line2,
      city: customerShipping.city,
      state: customerShipping.state || '',
      zip: customerShipping.postal_code,
      country: customerShipping.country,
      phone: customerShipping.phone,
    };

    // Default parcel dimensions for clothing returns
    const parcel: ShippoParcel = {
      length: 12,
      width: 9,
      height: 3,
      distance_unit: 'in',
      weight: 1,
      mass_unit: 'lb',
    };

    // Create shipment and get rates
    const shipmentResponse = await fetch(`${SHIPPO_API_URL}/shipments/`, {
      method: 'POST',
      headers: {
        'Authorization': `ShippoToken ${SHIPPO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address_to: warehouseAddress,
        address_from: customerAddress,
        parcels: [parcel],
        extra: {
          reference_1: returnData.rma_number,
          reference_2: returnData.order_id,
        },
        async: false,
      }),
    });

    if (!shipmentResponse.ok) {
      const errorData = await shipmentResponse.json();
      console.error('Shippo shipment creation failed:', errorData);
      return NextResponse.json(
        { error: 'Failed to create shipment', details: errorData },
        { status: 500 }
      );
    }

    const shipment = await shipmentResponse.json();

    // Find the cheapest rate
    const rates = shipment.rates || [];
    if (rates.length === 0) {
      return NextResponse.json(
        { error: 'No shipping rates available' },
        { status: 500 }
      );
    }

    const cheapestRate = rates.reduce((prev: { amount: string }, curr: { amount: string }) =>
      parseFloat(curr.amount) < parseFloat(prev.amount) ? curr : prev
    );

    // Purchase label with the cheapest rate
    const transactionResponse = await fetch(`${SHIPPO_API_URL}/transactions/`, {
      method: 'POST',
      headers: {
        'Authorization': `ShippoToken ${SHIPPO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rate: cheapestRate.object_id,
        label_file_type: 'PDF',
        async: false,
      }),
    });

    if (!transactionResponse.ok) {
      const errorData = await transactionResponse.json();
      console.error('Shippo label purchase failed:', errorData);
      return NextResponse.json(
        { error: 'Failed to purchase label', details: errorData },
        { status: 500 }
      );
    }

    const transaction = await transactionResponse.json();

    // Update return record with label information
    const { error: updateError } = await supabase
      .from('returns')
      .update({
        shipping_label_url: transaction.label_url,
        tracking_number: transaction.tracking_number,
        tracking_url: transaction.tracking_url_provider,
        status: 'approved',
        approved_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      console.error('Failed to update return record:', updateError);
      // Don't fail the request - the label was purchased successfully
    }

    return NextResponse.json({
      success: true,
      label_url: transaction.label_url,
      tracking_number: transaction.tracking_number,
      tracking_url: transaction.tracking_url_provider,
      carrier: cheapestRate.provider,
      service_level: cheapestRate.servicelevel.name,
      cost: cheapestRate.amount,
      currency: cheapestRate.currency,
    });

  } catch (error) {
    console.error('Error generating return label:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/returns/[id]/generate-label
 * 
 * Get label status or regenerate label if needed
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;

    // Verify authentication
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch return (user can only see their own returns)
    const { data: returnData, error: returnError } = await supabase
      .from('returns')
      .select(`
        *,
        order:orders (customer_id)
      `)
      .eq('id', id)
      .single();

    if (returnError || !returnData) {
      return NextResponse.json(
        { error: 'Return not found' },
        { status: 404 }
      );
    }

    // Verify ownership or admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin';
    const isOwner = returnData.order.customer_id === user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      label_url: returnData.shipping_label_url,
      tracking_number: returnData.tracking_number,
      tracking_url: returnData.tracking_url,
    });

  } catch (error) {
    console.error('Error fetching label:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
