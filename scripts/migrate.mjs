/**
 * Idempotent Data Migration Script: Local JSON (data/db.json) -> Supabase PostgreSQL
 *
 * Usage:
 *   node scripts/migrate.mjs
 *   npm run migrate
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Simple .env parser for standalone script execution
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const fullPath = path.join(rootDir, file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnv();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

console.log('================================================================');
console.log('🚀 UCR Student Portal -> Supabase Data Migration');
console.log('================================================================');

if (!SUPABASE_URL || !SUPABASE_KEY || SUPABASE_URL.includes('your-project-ref')) {
  console.error('\n❌ Missing Supabase Configuration!');
  console.error('Please configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local or your environment.');
  console.error('\nExample:');
  console.error('  SUPABASE_URL=https://xyzcompany.supabase.co');
  console.error('  SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsIn...\n');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

const DB_PATH = path.join(rootDir, 'data', 'db.json');
if (!fs.existsSync(DB_PATH)) {
  console.error(`❌ Source database file not found at: ${DB_PATH}`);
  process.exit(1);
}

const raw = fs.readFileSync(DB_PATH, 'utf-8');
const localDb = JSON.parse(raw);

async function runMigration() {
  console.log(`\n📂 Reading local data from ${DB_PATH}...`);
  console.log(`- Students:        ${localDb.students?.length || 0}`);
  console.log(`- Modules:         ${localDb.modules?.length || 0}`);
  console.log(`- Learning Stages: ${localDb.learningStages?.length || 0}`);
  console.log(`- Gallery Items:   ${localDb.gallery?.length || 0}`);
  console.log(`- Events:          ${localDb.events?.length || 0}`);
  console.log(`- Lecturers:       ${localDb.lecturers?.length || 0}`);
  console.log(`- Admins:          ${localDb.admins?.length || 0}`);

  // 1. Admins
  if (localDb.admins && localDb.admins.length > 0) {
    console.log('\n⏳ Migrating Admins...');
    const adminRows = localDb.admins.map((a) => ({
      id: a.id,
      username: a.username,
      email: a.email,
      password_hash: a.passwordHash,
      name: a.name,
      role: a.role || 'admin',
    }));
    const { error } = await supabase.from('admins').upsert(adminRows, { onConflict: 'id' });
    if (error) console.error('  ⚠️ Admins error:', error.message);
    else console.log(`  ✅ ${adminRows.length} Admins migrated.`);
  }

  // 2. Learning Stages
  if (localDb.learningStages && localDb.learningStages.length > 0) {
    console.log('\n⏳ Migrating Learning Stages...');
    const stageRows = localDb.learningStages.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description || null,
      sort_order: s.sortOrder ?? 0,
      published: s.published !== undefined ? s.published : true,
    }));
    const { error } = await supabase.from('learning_stages').upsert(stageRows, { onConflict: 'id' });
    if (error) console.error('  ⚠️ Stages error:', error.message);
    else console.log(`  ✅ ${stageRows.length} Stages migrated.`);
  }

  // 3. Modules
  if (localDb.modules && localDb.modules.length > 0) {
    console.log('\n⏳ Migrating Course Modules...');
    const moduleRows = localDb.modules.map((m) => ({
      id: m.id,
      title: m.title,
      code: m.code || null,
      description: m.description || '',
      course_codes: m.courseCodes || [],
      learning_stage_id: m.learningStageId || null,
      status: m.status || 'upcoming',
      thumbnail_url: m.thumbnailUrl || null,
      resources: m.resources || [],
      sort_order: m.sortOrder ?? 0,
      published: m.published !== undefined ? m.published : true,
      created_at: m.createdAt || new Date().toISOString(),
      updated_at: m.updatedAt || new Date().toISOString(),
    }));
    const { error } = await supabase.from('modules').upsert(moduleRows, { onConflict: 'id' });
    if (error) console.error('  ⚠️ Modules error:', error.message);
    else console.log(`  ✅ ${moduleRows.length} Modules migrated.`);
  }

  // 4. Students
  if (localDb.students && localDb.students.length > 0) {
    console.log('\n⏳ Migrating Students...');
    const studentRows = localDb.students.map((s) => ({
      id: s.id,
      full_name: s.fullName,
      student_number: s.studentNumber,
      course: s.course,
      batch: s.batch,
      profile_image_url: s.profileImageUrl || null,
      is_representative: Boolean(s.isRepresentative),
      representative_role: s.representativeRole || null,
      gender: s.gender || null,
      phone_number: s.phoneNumber || null,
      notes: s.notes || null,
      created_at: s.createdAt || new Date().toISOString(),
      updated_at: s.updatedAt || new Date().toISOString(),
    }));
    const { error } = await supabase.from('students').upsert(studentRows, { onConflict: 'id' });
    if (error) console.error('  ⚠️ Students error:', error.message);
    else console.log(`  ✅ ${studentRows.length} Students migrated.`);
  }

  // 5. Gallery
  if (localDb.gallery && localDb.gallery.length > 0) {
    console.log('\n⏳ Migrating Gallery Items...');
    const galleryRows = localDb.gallery.map((g) => ({
      id: g.id,
      image_url: g.imageUrl,
      title: g.title,
      event_date: g.eventDate || null,
      show_on_home: Boolean(g.showOnHome),
      sort_order: g.sortOrder ?? 0,
      created_at: g.createdAt || new Date().toISOString(),
    }));
    const { error } = await supabase.from('gallery').upsert(galleryRows, { onConflict: 'id' });
    if (error) console.error('  ⚠️ Gallery error:', error.message);
    else console.log(`  ✅ ${galleryRows.length} Gallery items migrated.`);
  }

  // 6. Events
  if (localDb.events && localDb.events.length > 0) {
    console.log('\n⏳ Migrating Events...');
    const eventRows = localDb.events.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description || '',
      event_date: e.eventDate,
      start_time: e.startTime || null,
      end_time: e.endTime || null,
      location: e.location || null,
      cover_image_url: e.coverImageUrl || null,
      registration_url: e.registrationUrl || null,
      published: e.published !== undefined ? e.published : true,
      created_at: e.createdAt || new Date().toISOString(),
      updated_at: e.updatedAt || new Date().toISOString(),
    }));
    const { error } = await supabase.from('events').upsert(eventRows, { onConflict: 'id' });
    if (error) console.error('  ⚠️ Events error:', error.message);
    else console.log(`  ✅ ${eventRows.length} Events migrated.`);
  }

  // 7. Lecturers
  if (localDb.lecturers && localDb.lecturers.length > 0) {
    console.log('\n⏳ Migrating Faculty / Lecturers...');
    const lecturerRows = localDb.lecturers.map((l) => ({
      id: l.id,
      name: l.name,
      designation: l.designation,
      role_type: l.roleType,
      specialization: l.specialization,
      profile_image_url: l.profileImageUrl,
      sort_order: l.sortOrder ?? 0,
    }));
    const { error } = await supabase.from('lecturers').upsert(lecturerRows, { onConflict: 'id' });
    if (error) console.error('  ⚠️ Lecturers error:', error.message);
    else console.log(`  ✅ ${lecturerRows.length} Lecturers migrated.`);
  }

  // 8. Timetables
  if (localDb.timetables && localDb.timetables.length > 0) {
    console.log('\n⏳ Migrating Timetables...');
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
    const { error } = await supabase.from('timetables').upsert(timetableRows, { onConflict: 'id' });
    if (error) console.error('  ⚠️ Timetables error:', error.message);
    else console.log(`  ✅ ${timetableRows.length} Timetables migrated.`);
  }

  // 9. Timetable Overrides
  if (localDb.timetableOverrides && localDb.timetableOverrides.length > 0) {
    console.log('\n⏳ Migrating Timetable Overrides...');
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
    const { error } = await supabase.from('timetable_overrides').upsert(overrideRows, { onConflict: 'id' });
    if (error) console.error('  ⚠️ Timetable Overrides error:', error.message);
    else console.log(`  ✅ ${overrideRows.length} Timetable Overrides migrated.`);
  }

  // 10. Site Settings (Lecturer Section Settings)
  if (localDb.lecturerSectionSettings) {
    console.log('\n⏳ Migrating Site Settings...');
    const { error } = await supabase.from('site_settings').upsert({
      key: 'lecturer_section_settings',
      value: localDb.lecturerSectionSettings,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'key' });
    if (error) console.error('  ⚠️ Site Settings error:', error.message);
    else console.log('  ✅ Lecturer Section Settings migrated.');
  }

  console.log('\n================================================================');
  console.log('🎉 Migration Completed Successfully!');
  console.log('Original backup retained in data/db.json.');
  console.log('================================================================\n');
}


runMigration().catch((err) => {
  console.error('\n❌ Fatal Migration Error:', err);
  process.exit(1);
});
