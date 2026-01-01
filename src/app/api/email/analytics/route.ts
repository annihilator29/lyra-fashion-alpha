// API endpoint to get email analytics
// GET /api/email/analytics - Get overall metrics
// GET /api/email/analytics/performance - Get recent performance
// GET /api/email/analytics/by-type - Get metrics by type

import { NextResponse } from 'next/server';
import {
  getOverallEmailMetrics,
  getMetricsByType,
  getRecentEmailPerformance,
  getUserEmailMetrics,
} from '@/lib/email-analytics';

export const runtime = 'nodejs';

// GET /api/email/analytics - Overall metrics
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30', 10);
    const type = searchParams.get('type');
    const userId = searchParams.get('userId');

    if (type === 'performance') {
      const limit = parseInt(searchParams.get('limit') || '50', 10);
      const performance = await getRecentEmailPerformance(limit);
      return NextResponse.json({ success: true, performance });
    }

    if (type === 'by-type') {
      const metrics = await getMetricsByType(days);
      return NextResponse.json({ success: true, metrics });
    }

    if (userId && type === 'user') {
      const metrics = await getUserEmailMetrics(userId);
      return NextResponse.json({ success: true, metrics });
    }

    // Default: overall metrics
    const metrics = await getOverallEmailMetrics(days);
    return NextResponse.json({ success: true, metrics });
  } catch (error) {
    console.error('Error getting analytics:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get analytics',
      },
      { status: 500 },
    );
  }
}
