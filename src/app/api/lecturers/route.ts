import { NextRequest, NextResponse } from 'next/server';
import {
  getLecturers,
  createLecturer,
  getLecturersSectionSettings,
  updateLecturersSectionSettings,
} from '@/lib/db';
import { verifyAdminRequest, unauthorizedResponse } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [lecturers, settings] = await Promise.all([
      getLecturers(),
      getLecturersSectionSettings(),
    ]);

    return NextResponse.json({
      success: true,
      count: lecturers.length,
      lecturers,
      settings,
    });
  } catch (error: any) {
    console.error('Error fetching lecturers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch lecturers' },
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

    if (!body.name || !body.designation || !body.specialization) {
      return NextResponse.json(
        { error: 'Name, designation, and specialization are required.' },
        { status: 400 }
      );
    }

    const newLecturer = await createLecturer({
      name: body.name.trim(),
      designation: body.designation.trim(),
      roleType: body.roleType || 'lecturer',
      specialization: body.specialization.trim(),
      profileImageUrl: body.profileImageUrl?.trim() || '/images/lecturers/teroshani_dahanayake.jpg',
      sortOrder: typeof body.sortOrder === 'number' ? body.sortOrder : 99,
    });

    return NextResponse.json({
      success: true,
      lecturer: newLecturer,
    });
  } catch (error: any) {
    console.error('Error creating lecturer:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create lecturer' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await verifyAdminRequest(req);
    if (!admin) {
      return unauthorizedResponse();
    }

    const body = await req.json();
    const updatedSettings = await updateLecturersSectionSettings({
      badgeText: body.badgeText,
      title: body.title,
      description: body.description,
    });

    return NextResponse.json({
      success: true,
      settings: updatedSettings,
    });
  } catch (error: any) {
    console.error('Error updating lecturer section settings:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update section settings' },
      { status: 500 }
    );
  }
}
