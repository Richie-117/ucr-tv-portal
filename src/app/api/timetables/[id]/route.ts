import { NextRequest, NextResponse } from 'next/server';
import { getTimetableById, updateTimetable } from '@/lib/db';
import { verifyAdminRequest, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const timetable = await getTimetableById(params.id);
    if (!timetable) {
      return NextResponse.json({ error: 'Timetable not found' }, { status: 404 });
    }

    const admin = await verifyAdminRequest(req);
    if (!timetable.isPublished && !admin) {
      return NextResponse.json({ error: 'Timetable is unpublished' }, { status: 403 });
    }

    return NextResponse.json({ timetable });
  } catch (error: any) {
    console.error('Error fetching timetable by ID:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch timetable' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdminRequest(req);
    if (!admin) {
      return unauthorizedResponse();
    }

    const body = await req.json();
    const existing = await getTimetableById(params.id);
    if (!existing) {
      return NextResponse.json({ error: 'Timetable not found' }, { status: 404 });
    }

    // Server-side validation
    const updates: any = {};
    if (typeof body.title === 'string' && body.title.trim()) updates.title = body.title.trim();
    if (typeof body.subtitle === 'string') updates.subtitle = body.subtitle.trim();
    if (typeof body.batchLabel === 'string') updates.batchLabel = body.batchLabel.trim();
    if (typeof body.pdfUrl === 'string') updates.pdfUrl = body.pdfUrl.trim();
    if (typeof body.isPublished === 'boolean') updates.isPublished = body.isPublished;
    if (Array.isArray(body.slots)) updates.slots = body.slots;
    updates.updatedBy = admin.username || admin.email;

    const updated = await updateTimetable(params.id, updates);

    return NextResponse.json({
      success: true,
      timetable: updated,
    });
  } catch (error: any) {
    console.error('Error updating timetable:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update timetable' },
      { status: 500 }
    );
  }
}
