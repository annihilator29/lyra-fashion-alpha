import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/roles';
import { ProductionStageName, ProductionStageStatus } from '@/types/order';

interface ProductionStageUpdateRequest {
  stage: ProductionStageName;
  status: ProductionStageStatus;
  timestamp?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin access
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { id: orderId } = await params;
    const body: ProductionStageUpdateRequest = await request.json();
    const { stage, status, timestamp } = body;

    // Validate required fields
    if (!stage || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: stage and status' },
        { status: 400 }
      );
    }

    // Validate stage
    const validStages: ProductionStageName[] = ['cutting', 'sewing', 'finishing', 'qc'];
    if (!validStages.includes(stage)) {
      return NextResponse.json(
        { error: `Invalid stage: ${stage}` },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses: ProductionStageStatus[] = ['not_started', 'in_progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status: ${status}` },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Build update data
    const updateData: Record<string, unknown> = {
      [`production_stages.${stage}.status`]: status,
      updated_at: new Date().toISOString()
    };

    const ts = timestamp || new Date().toISOString();

    if (status === 'in_progress') {
      updateData[`production_stages.${stage}.started_at`] = ts;
    } else if (status === 'completed') {
      updateData[`production_stages.${stage}.completed_at`] = ts;
    }

    // Update order
    const { data: order, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) {
      console.error('Production stage update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update production stage', details: updateError.message },
        { status: 500 }
      );
    }

    // TODO: Trigger email notification (Task 7)
    // This will be implemented when the email queue is set up
    // await queueProductionStageEmail(orderId, stage, status);

    return NextResponse.json({
      success: true,
      message: `Production stage ${stage} updated to ${status}`,
      order
    });

  } catch (error) {
    console.error('Production stage update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
