/**
 * Admin Reviews Export API Route
 * 
 * GET /api/admin/reviews/export
 * Exports reviews to CSV format for admin download.
 * 
 * @module app/api/admin/reviews/export/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth/roles';
import { exportReviewsToCSV } from '@/lib/reviews/queries';

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || undefined;

    const filters = {
      status: status as 'pending' | 'approved' | 'rejected' | 'all',
      search,
    };

    // Generate CSV
    const csv = await exportReviewsToCSV(filters);

    // Return CSV response
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="reviews-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting reviews:', error);
    return NextResponse.json(
      { error: 'Failed to export reviews' },
      { status: 500 }
    );
  }
}
