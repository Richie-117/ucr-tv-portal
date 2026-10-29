import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest, unauthorizedResponse } from '@/lib/auth';
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdminRequest(req);
    if (!admin) {
      return unauthorizedResponse();
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'uploads';

    if (!file) {
      return NextResponse.json({ error: 'No file provided in form data.' }, { status: 400 });
    }

    // Validate MIME type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WEBP, GIF images and PDF documents are allowed.' },
        { status: 400 }
      );
    }

    // Maximum 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File size exceeds maximum allowed size (10MB).' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name) || '.jpg';
    const cleanBase = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${folder}/${cleanBase}-${Date.now()}${ext}`;

    // 1. If Supabase Storage is configured, upload to cloud storage
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('portal-media')
        .upload(filename, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (!uploadError && uploadData) {
        const { data: publicUrlData } = supabase.storage
          .from('portal-media')
          .getPublicUrl(uploadData.path);

        return NextResponse.json({
          success: true,
          url: publicUrlData.publicUrl,
          filename: uploadData.path,
          storage: 'supabase',
        });
      }

      console.warn('Supabase storage upload failed, falling back to local storage:', uploadError);
    }

    // 2. Fallback to local filesystem storage
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const localFilename = `${cleanBase}-${Date.now()}${ext}`;
    const filePath = path.join(uploadsDir, localFilename);
    await fs.promises.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${localFilename}`;
    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: localFilename,
      storage: 'local',
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'File upload failed' }, { status: 500 });
  }
}
