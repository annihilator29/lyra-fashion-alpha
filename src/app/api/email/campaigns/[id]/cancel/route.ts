// API endpoint to cancel a scheduled email campaign
// POST /api/email/campaigns/[id]/cancel

import { NextResponse } from 'next/server';
import { cancelCampaign } from '@/lib/email-scheduler';

export const runtime = 'nodejs';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const result = await cancelCampaign(id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error cancelling campaign:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel campaign',
      },
      { status: 500 },
    );
  }
}
