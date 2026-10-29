import { NextRequest, NextResponse } from 'next/server';
import { getTimetableOverrides, createTimetableOverride } from '@/lib/db';
import { verifyAdminRequest, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const timetableId = searchParams.get('timetableId') || undefined;
    const course = (searchParams.get('course') as any) || undefined;
    const date = searchParams.get('date') || undefined;
    const activeOnly = searchParams.get('activeOnly') !== 'false';

    const overrides = await getTimetableOverrides({
      timetableId,
      course,
      date,
      activeOnly,
    });

    return NextResponse.json({ overrides });
  } catch (error: any) {
    console.error('Error in GET /api/timetables/overrides:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch overrides' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdminRequest(req);
    if (!admin) {
      return unauthorizedResponse();
    }

    const body = await req.json();

    if (!body.timetableId || !body.exceptionDate || !body.status) {
      return NextResponse.json(
        { error: 'timetableId, exceptionDate (YYYY-MM-DD), and status (POSTPONED or UNAVAILABLE) are required.' },
        { status: 400 }
      );
    }

    if (!['POSTPONED', 'UNAVAILABLE'].includes(body.status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be POSTPONED or UNAVAILABLE.' },
        { status: 400 }
      );
    }

    const override = await createTimetableOverride({
      timetableId: body.timetableId,
      timetableSlotId: body.timetableSlotId || undefined,
      course: body.course,
      exceptionDate: body.exceptionDate,
      status: body.status,
      reason: body.reason?.trim() || undefined,
      rescheduledDate: body.rescheduledDate || undefined,
      rescheduledStartTime: body.rescheduledStartTime || undefined,
      rescheduledEndTime: body.rescheduledEndTime || undefined,
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
      updatedBy: admin.username || admin.email,
    });

    return NextResponse.json({
      success: true,
      override,
    });
  } catch (error: any) {
    console.error('Error creating timetable override:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create override' },
      { status: 500 }
    );
  }
}
