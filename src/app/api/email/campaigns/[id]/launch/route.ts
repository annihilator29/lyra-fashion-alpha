// API endpoint to launch a scheduled email campaign
// POST /api/email/campaigns/[id]/launch

import { NextResponse } from 'next/server';
import { launchCampaign } from '@/lib/email-scheduler';

export const runtime = 'nodejs';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const result = await launchCampaign(id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      queuedCount: result.queuedCount,
    });
  } catch (error) {
    console.error('Error launching campaign:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to launch campaign',
      },
      { status: 500 },
    );
  }
}
