// API endpoints for email campaign scheduling
// POST /api/email/campaigns - Create campaign
// POST /api/email/campaigns/[id]/launch - Launch campaign
// POST /api/email/campaigns/[id]/cancel - Cancel campaign

import { NextResponse } from 'next/server';
import {
  createScheduledCampaign,
  launchCampaign,
  cancelCampaign,
  getScheduledCampaigns,
} from '@/lib/email-scheduler';

export const runtime = 'nodejs';

// GET /api/email/campaigns - List campaigns
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const result = await getScheduledCampaigns(status || undefined);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      campaigns: result.campaigns,
    });
  } catch (error) {
    console.error('Error getting campaigns:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get campaigns',
      },
      { status: 500 },
    );
  }
}

// POST /api/email/campaigns - Create new campaign
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      email_type,
      subject,
      template_id,
      template_data,
      segment_criteria,
      scheduled_for,
      created_by,
    } = body;

    // Validate required fields
    if (!name || !email_type || !subject || !scheduled_for) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email_type, subject, scheduled_for' },
        { status: 400 },
      );
    }

    // Validate scheduled_for is a valid date
    const scheduledDate = new Date(scheduled_for);
    if (isNaN(scheduledDate.getTime())) {
      return NextResponse.json({ error: 'Invalid scheduled_for date' }, { status: 400 });
    }

    const result = await createScheduledCampaign({
      name,
      email_type,
      subject,
      template_id,
      template_data,
      segment_criteria,
      scheduled_for: scheduledDate,
      created_by,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(
      {
        success: true,
        id: result.id,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create campaign',
      },
      { status: 500 },
    );
  }
}
