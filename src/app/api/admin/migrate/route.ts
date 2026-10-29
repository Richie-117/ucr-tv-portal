import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest, unauthorizedResponse } from '@/lib/auth';
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/supabase';
import { getDatabase } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdminRequest(req);
    if (!admin) {
      return unauthorizedResponse();
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        {
          error:
            'Supabase credentials are not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
        },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: 'Failed to initialize Supabase client.' }, { status: 500 });
    }

    const localDb = await getDatabase();
    const stats: Record<string, number> = {};

    // 1. Admins
    if (localDb.admins.length > 0) {
      const rows = localDb.admins.map((a) => ({
        id: a.id,
        username: a.username,
        email: a.email,
        password_hash: a.passwordHash,
        name: a.name,
        role: a.role,
      }));
      await supabase.from('admins').upsert(rows, { onConflict: 'id' });
      stats.admins = rows.length;
    }

    // 2. Learning Stages
    if (localDb.learningStages.length > 0) {
      const rows = localDb.learningStages.map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description || null,
        sort_order: s.sortOrder,
        published: s.published,
      }));
      await supabase.from('learning_stages').upsert(rows, { onConflict: 'id' });
      stats.learningStages = rows.length;
    }

    // 3. Modules
    if (localDb.modules.length > 0) {
      const rows = localDb.modules.map((m) => ({
        id: m.id,
        title: m.title,
        code: m.code || null,
        description: m.description,
        course_codes: m.courseCodes,
        learning_stage_id: m.learningStageId || null,
        status: m.status,
        thumbnail_url: m.thumbnailUrl || null,
        resources: m.resources || [],
        sort_order: m.sortOrder,
        published: m.published,
        created_at: m.createdAt,
        updated_at: m.updatedAt,
      }));
      await supabase.from('modules').upsert(rows, { onConflict: 'id' });
      stats.modules = rows.length;
    }

    // 4. Students
    if (localDb.students.length > 0) {
      const rows = localDb.students.map((s) => ({
        id: s.id,
        full_name: s.fullName,
        student_number: s.studentNumber,
        course: s.course,
        batch: s.batch,
        profile_image_url: s.profileImageUrl || null,
        is_representative: s.isRepresentative,
        representative_role: s.representativeRole || null,
        gender: s.gender || null,
        phone_number: s.phoneNumber || null,
        notes: s.notes || null,
        created_at: s.createdAt,
        updated_at: s.updatedAt,
      }));
      await supabase.from('students').upsert(rows, { onConflict: 'id' });
      stats.students = rows.length;
    }

    // 5. Gallery
    if (localDb.gallery.length > 0) {
      const rows = localDb.gallery.map((g) => ({
        id: g.id,
        image_url: g.imageUrl,
        title: g.title,
        event_date: g.eventDate || null,
        show_on_home: g.showOnHome,
        sort_order: g.sortOrder,
        created_at: g.createdAt,
      }));
      await supabase.from('gallery').upsert(rows, { onConflict: 'id' });
      stats.gallery = rows.length;
    }

    // 6. Events
    if (localDb.events.length > 0) {
      const rows = localDb.events.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        event_date: e.eventDate,
        start_time: e.startTime || null,
        end_time: e.endTime || null,
        location: e.location || null,
        cover_image_url: e.coverImageUrl || null,
        registration_url: e.registrationUrl || null,
        published: e.published,
        created_at: e.createdAt,
        updated_at: e.updatedAt,
      }));
      await supabase.from('events').upsert(rows, { onConflict: 'id' });
      stats.events = rows.length;
    }

    // 7. Lecturers
    if (localDb.lecturers && localDb.lecturers.length > 0) {
      const rows = localDb.lecturers.map((l) => ({
        id: l.id,
        name: l.name,
        designation: l.designation,
        role_type: l.roleType,
        specialization: l.specialization,
        profile_image_url: l.profileImageUrl,
        sort_order: l.sortOrder,
      }));
      await supabase.from('lecturers').upsert(rows, { onConflict: 'id' });
      stats.lecturers = rows.length;
    }

    // 8. Timetables
    if (localDb.timetables && localDb.timetables.length > 0) {
      const timetableRows = localDb.timetables.map((t) => ({
        id: t.id,
        category: t.category,
        course: t.course,
        title: t.title,
        subtitle: t.subtitle,
        batch_label: t.batchLabel,
        pdf_url: t.pdfUrl || null,
        is_published: t.isPublished !== undefined ? t.isPublished : true,
        slots: t.slots || [],
        created_at: t.createdAt || new Date().toISOString(),
        updated_at: t.updatedAt || new Date().toISOString(),
        updated_by: t.updatedBy || null,
      }));
      await supabase.from('timetables').upsert(timetableRows, { onConflict: 'id' });
      stats.timetables = timetableRows.length;
    }

    // 9. Timetable Overrides
    if (localDb.timetableOverrides && localDb.timetableOverrides.length > 0) {
      const overrideRows = localDb.timetableOverrides.map((o) => ({
        id: o.id,
        timetable_id: o.timetableId,
        timetable_slot_id: o.timetableSlotId || null,
        course: o.course || null,
        exception_date: o.exceptionDate,
        status: o.status,
        reason: o.reason || null,
        rescheduled_date: o.rescheduledDate || null,
        rescheduled_start_time: o.rescheduledStartTime || null,
        rescheduled_end_time: o.rescheduledEndTime || null,
        is_active: o.isActive !== undefined ? o.isActive : true,
        created_at: o.createdAt || new Date().toISOString(),
        updated_at: o.updatedAt || new Date().toISOString(),
        updated_by: o.updatedBy || null,
      }));
      await supabase.from('timetable_overrides').upsert(overrideRows, { onConflict: 'id' });
      stats.timetableOverrides = overrideRows.length;
    }

    // 10. Site Settings
    if (localDb.lecturerSectionSettings) {
      await supabase.from('site_settings').upsert({
        key: 'lecturer_section_settings',
        value: localDb.lecturerSectionSettings,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'key' });
      stats.siteSettings = 1;
    }

    return NextResponse.json({
      success: true,
      message: 'Data successfully migrated to Supabase PostgreSQL.',
      migratedCounts: stats,
    });
  } catch (err: any) {
    console.error('Migration API error:', err);
    return NextResponse.json({ error: err?.message || 'Migration failed' }, { status: 500 });
  }
}
