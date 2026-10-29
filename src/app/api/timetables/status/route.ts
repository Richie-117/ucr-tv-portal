import { NextRequest, NextResponse } from 'next/server';
import { getLiveLectureStatus } from '@/lib/timetableService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');
    const timeParam = searchParams.get('time');

    let simulatedDate: string | undefined = undefined;
    if (dateParam && timeParam) {
      simulatedDate = `${dateParam}T${timeParam}:00+05:30`;
    } else if (dateParam) {
      simulatedDate = `${dateParam}T12:00:00+05:30`;
    }

    const status = await getLiveLectureStatus(simulatedDate);
    return NextResponse.json(status);
  } catch (error: any) {
    console.error('Error fetching live lecture status:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to determine live lecture status' },
      { status: 500 }
    );
  }
}
