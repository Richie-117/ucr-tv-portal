import { NextRequest, NextResponse } from 'next/server';
import { updateTimetableOverride, deleteTimetableOverride } from '@/lib/db';
import { verifyAdminRequest, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdminRequest(req);
    if (!admin) {
      return unauthorizedResponse();
    }

    const body = await req.json();
    const updated = await updateTimetableOverride(params.id, {
      ...body,
      updatedBy: admin.username || admin.email,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Override not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      override: updated,
    });
  } catch (error: any) {
    console.error('Error updating timetable override:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update override' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdminRequest(req);
    if (!admin) {
      return unauthorizedResponse();
    }

    const success = await deleteTimetableOverride(params.id);
    if (!success) {
      return NextResponse.json({ error: 'Override not found or already deleted' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Override cleared. Automatic timetable status restored.',
    });
  } catch (error: any) {
    console.error('Error deleting timetable override:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete override' },
      { status: 500 }
    );
  }
}
