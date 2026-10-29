import { NextRequest, NextResponse } from 'next/server';
import { getLecturerById, updateLecturer, deleteLecturer } from '@/lib/db';
import { verifyAdminRequest, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lecturer = await getLecturerById(params.id);
    if (!lecturer) {
      return NextResponse.json({ error: 'Lecturer not found' }, { status: 404 });
    }
    return NextResponse.json({ lecturer });
  } catch (error: any) {
    console.error('Error fetching lecturer by ID:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch lecturer' },
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
    const existing = await getLecturerById(params.id);
    if (!existing) {
      return NextResponse.json({ error: 'Lecturer not found' }, { status: 404 });
    }

    const updates: any = {};
    if (typeof body.name === 'string' && body.name.trim()) updates.name = body.name.trim();
    if (typeof body.designation === 'string' && body.designation.trim()) updates.designation = body.designation.trim();
    if (body.roleType) updates.roleType = body.roleType;
    if (typeof body.specialization === 'string') updates.specialization = body.specialization.trim();
    if (typeof body.profileImageUrl === 'string' && body.profileImageUrl.trim()) updates.profileImageUrl = body.profileImageUrl.trim();
    if (typeof body.sortOrder === 'number') updates.sortOrder = body.sortOrder;

    const updated = await updateLecturer(params.id, updates);

    return NextResponse.json({
      success: true,
      lecturer: updated,
    });
  } catch (error: any) {
    console.error('Error updating lecturer:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update lecturer' },
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

    const success = await deleteLecturer(params.id);
    if (!success) {
      return NextResponse.json({ error: 'Lecturer not found or already deleted' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Lecturer deleted successfully.',
    });
  } catch (error: any) {
    console.error('Error deleting lecturer:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete lecturer' },
      { status: 500 }
    );
  }
}
