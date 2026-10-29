import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest, unauthorizedResponse } from '@/lib/auth';
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/supabase';
import { updateTimetable, getTimetableById } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdminRequest(req);
    if (!admin) {
      return unauthorizedResponse();
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const timetableId = (formData.get('timetableId') as string) || '';
    const course = (formData.get('course') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'No PDF file provided in request.' }, { status: 400 });
    }

    // Validate type
    const isPdf =
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf');

    if (!isPdf) {
      return NextResponse.json(
        { error: 'Invalid file format. Only PDF files are permitted for timetables.' },
        { status: 400 }
      );
    }

    // Maximum 15MB
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds maximum allowed size (15MB).' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const cleanCourse = (course || 'timetable').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `timetables/${cleanCourse}-${Date.now()}.pdf`;

    let finalPdfUrl = '';

    // 1. Supabase Cloud Storage (Production Durable Storage)
    const supabase = getSupabaseAdmin();
    if (supabase) {
      try {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('portal-media')
          .upload(filename, buffer, {
            contentType: 'application/pdf',
            upsert: true,
          });

        if (!uploadError && uploadData) {
          const { data: publicUrlData } = supabase.storage
            .from('portal-media')
            .getPublicUrl(uploadData.path);

          finalPdfUrl = publicUrlData.publicUrl;
        } else {
          console.warn('Supabase storage PDF upload failed, falling back to local storage:', uploadError);
        }
      } catch (storageErr) {
        console.warn('Supabase storage threw error, falling back:', storageErr);
      }
    }

    // 2. Local Filesystem Storage Fallback
    if (!finalPdfUrl) {
      const timetablesDir = path.join(process.cwd(), 'public', 'timetables');
      if (!fs.existsSync(timetablesDir)) {
        fs.mkdirSync(timetablesDir, { recursive: true });
      }

      const localFilename = `${cleanCourse}-${Date.now()}.pdf`;
      const filePath = path.join(timetablesDir, localFilename);
      await fs.promises.writeFile(filePath, buffer);
      finalPdfUrl = `/timetables/${localFilename}`;
    }

    // 3. Update timetable record if timetableId provided
    if (timetableId) {
      await updateTimetable(timetableId, {
        pdfUrl: finalPdfUrl,
        updatedBy: admin.username || admin.email,
      });
    }

    return NextResponse.json({
      success: true,
      pdfUrl: finalPdfUrl,
      filename,
      message: 'Timetable PDF successfully uploaded and published.',
    });
  } catch (error: any) {
    console.error('PDF upload error:', error);
    return NextResponse.json({ error: error.message || 'PDF upload failed' }, { status: 500 });
  }
}
