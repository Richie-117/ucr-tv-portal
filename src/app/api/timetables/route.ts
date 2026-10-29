import { NextRequest, NextResponse } from 'next/server';
import { getTimetables, getTimetableOverrides } from '@/lib/db';
import { verifyAdminRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') as any;
    const course = searchParams.get('course') as any;
    const admin = await verifyAdminRequest(req);

    // If not admin, only return published
    const publishedOnly = !admin && searchParams.get('publishedOnly') !== 'false';

    const [timetables, overrides] = await Promise.all([
      getTimetables({ category, course, publishedOnly }),
      getTimetableOverrides({ activeOnly: true }),
    ]);

    return NextResponse.json({
      timetables,
      overrides,
    });
  } catch (error: any) {
    console.error('Error in GET /api/timetables:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch timetables' },
      { status: 500 }
    );
  }
}
