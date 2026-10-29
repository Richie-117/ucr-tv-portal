import { NextResponse } from 'next/server';
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/supabase';
import { getStudents, getDashboardStats } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  const supabaseConfigured = isSupabaseConfigured();
  let dbStatus = 'ok';
  let storageMode = 'local';
  let details: Record<string, any> = {};

  try {
    if (supabaseConfigured) {
      storageMode = 'supabase';
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { count, error } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true });
        if (error) {
          dbStatus = `degraded (${error.message})`;
        } else {
          details.supabaseStudentCount = count;
        }
      }
    }

    const stats = await getDashboardStats();
    details.totalStudents = stats.totalStudents;
    details.totalModules = stats.totalModules;
    details.totalEvents = stats.totalEvents;
    details.totalTimetables = stats.totalTimetables || 2;

    const responseTimeMs = Date.now() - startTime;

    return NextResponse.json(
      {
        status: dbStatus === 'ok' ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        database: {
          configured: supabaseConfigured ? 'supabase' : 'local-json-fallback',
          status: dbStatus,
        },
        storage: storageMode,
        metrics: details,
        responseTimeMs,
      },
      {
        status: dbStatus === 'ok' ? 200 : 503,
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: err?.message || 'Health check failed',
      },
      { status: 500 }
    );
  }
}
