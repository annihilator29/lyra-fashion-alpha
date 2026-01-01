// API endpoint to process email queue
// POST /api/email/queue/process

import { NextResponse } from 'next/server';
import { processEmailQueue, getQueueStats } from '@/lib/email-queue';

export const runtime = 'edge';
export const maxDuration = 60; // 60 seconds max

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { batchSize = 50, apiKey } = body;

    // Simple API key check for cron jobs
    if (apiKey !== process.env.EMAIL_QUEUE_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate batch size
    if (batchSize < 1 || batchSize > 500) {
      return NextResponse.json({ error: 'Batch size must be between 1 and 500' }, { status: 400 });
    }

    // Process queue
    const result = await processEmailQueue(batchSize);

    // Get stats
    const stats = await getQueueStats();

    return NextResponse.json(
      {
        success: true,
        result,
        stats,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error processing email queue:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process queue',
      },
      { status: 500 },
    );
  }
}

// GET endpoint to check queue stats
export async function GET() {
  try {
    const stats = await getQueueStats();
    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error('Error getting queue stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get stats',
      },
      { status: 500 },
    );
  }
}
