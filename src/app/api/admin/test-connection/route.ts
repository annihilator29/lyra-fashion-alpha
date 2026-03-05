/**
 * API Route: Test Supabase Connection
 * Story 7.2: Product Management Interface
 * Diagnostic endpoint for checking backend connectivity
 */

import { NextResponse } from 'next/server';
import { testSupabaseConnection } from '@/lib/supabase/connection-test';

export async function GET() {
  try {
    const result = await testSupabaseConnection();
    
    return NextResponse.json({
      success: result.success,
      timestamp: result.timestamp,
      tests: result.tests,
      errors: result.errors,
      summary: {
        passed: Object.values(result.tests).filter(Boolean).length,
        total: Object.keys(result.tests).length,
        percentage: Math.round((Object.values(result.tests).filter(Boolean).length / Object.keys(result.tests).length) * 100),
      },
      sampleData: result.data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
