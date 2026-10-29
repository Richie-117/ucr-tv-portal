import {
  Timetable,
  TimetableSlot,
  TimetableOverride,
  CourseType,
  DayOfWeek,
  LectureStatusType,
  CourseLiveLectureStatus,
  ActiveSlotDetails,
} from './types';
import { getTimetables, getTimetableOverrides } from './db';

const TIMEZONE = 'Asia/Colombo';

export interface SriLankaTimeContext {
  now: Date;
  dateStr: string;   // "YYYY-MM-DD"
  timeStr: string;   // "HH:MM"
  timeWithSeconds: string; // "HH:MM:SS"
  minutesNow: number;
  dayOfWeek: DayOfWeek;
  displayDate: string; // "Thursday, October 29, 2026"
  displayTime: string; // "12:37 PM"
}

/**
 * Accurately extracts Sri Lanka (Asia/Colombo) date and time.
 * Never relies on the visitor's device time zone.
 */
export function getSriLankaDateTime(simulatedDate?: Date | string): SriLankaTimeContext {
  const d = simulatedDate ? new Date(simulatedDate) : new Date();

  // Format parts in Asia/Colombo timezone
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = dtf.formatToParts(d);
  const partMap: Record<string, string> = {};
  parts.forEach((p) => {
    partMap[p.type] = p.value;
  });

  const year = partMap.year || '2026';
  const month = partMap.month || '01';
  const day = partMap.day || '01';
  const weekday = (partMap.weekday || 'Monday') as DayOfWeek;
  const hour = parseInt(partMap.hour || '0', 10);
  const minute = parseInt(partMap.minute || '0', 10);
  const second = parseInt(partMap.second || '0', 10);

  const dateStr = `${year}-${month}-${day}`;
  const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  const timeWithSeconds = `${timeStr}:${second.toString().padStart(2, '0')}`;
  const minutesNow = hour * 60 + minute;

  // Formatted displays
  const displayDate = d.toLocaleDateString('en-US', {
    timeZone: TIMEZONE,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const displayTime = d.toLocaleTimeString('en-US', {
    timeZone: TIMEZONE,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return {
    now: d,
    dateStr,
    timeStr,
    timeWithSeconds,
    minutesNow,
    dayOfWeek: weekday,
    displayDate,
    displayTime,
  };
}

/**
 * Convert time string (e.g., "08:30", "13:20", "8:30 a.m.") to total minutes from midnight.
 */
export function parseTimeToMinutes(t: string): number {
  if (!t) return 0;
  const clean = t.trim().toLowerCase();

  // If format like "8:30 a.m." or "1:20 p.m."
  const isPM = clean.includes('p.m') || clean.includes('pm');
  const isAM = clean.includes('a.m') || clean.includes('am');

  const match = clean.match(/(\d{1,2})[:.](\d{2})/);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);

    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;

    return hours * 60 + minutes;
  }

  return 0;
}

export function formatTimeSlot(start: string, end: string, label?: string): string {
  if (label) return label;
  const formatSingle = (timeStr: string) => {
    const mins = parseTimeToMinutes(timeStr);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const period = h >= 12 ? 'p.m.' : 'a.m.';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    const displayM = m === 0 ? '00' : m.toString().padStart(2, '0');
    return `${displayH}:${displayM} ${period}`;
  };

  return `${formatSingle(start)} – ${formatSingle(end)}`;
}

/**
 * Independently evaluate live lecture status for a specific course
 */
export function evaluateCourseStatus(
  course: CourseType,
  timetable: Timetable | null,
  allOverrides: TimetableOverride[],
  context: SriLankaTimeContext
): CourseLiveLectureStatus {
  const isTpopt = course === 'TPOPT';
  const courseName = isTpopt
    ? 'Television & Digital Media Post Production Technology'
    : 'Television & Digital Media Production Technology';
  const shortName = isTpopt ? 'TPOPT (Post-Prod)' : 'TPRPT (Production)';
  const badge = isTpopt ? 'TPOPT' : 'TPRPT';

  // 1. Check if timetable exists and is published
  if (!timetable || !timetable.isPublished) {
    return {
      course,
      courseName,
      shortName,
      badge,
      status: 'SCHEDULE_UNAVAILABLE',
      statusLabel: 'Schedule unavailable',
      currentSlot: null,
      nextSlot: null,
      override: null,
      timetableTitle: timetable?.title || 'Foundation Programme Timetable',
      timetablePdfUrl: timetable?.pdfUrl,
    };
  }

  // 2. Filter slots for current weekday
  const todaySlots = (timetable.slots || [])
    .filter((s) => s.dayOfWeek.toLowerCase() === context.dayOfWeek.toLowerCase())
    .map((s) => ({
      ...s,
      startMins: parseTimeToMinutes(s.startTime),
      endMins: parseTimeToMinutes(s.endTime),
    }))
    .sort((a, b) => a.startMins - b.startMins);

  // 3. Find active slot for right now
  const activeSlot = todaySlots.find(
    (s) => s.startMins <= context.minutesNow && context.minutesNow < s.endMins
  );

  // 4. Find active overrides for today for this course or slot
  const todayOverrides = allOverrides.filter(
    (o) =>
      o.isActive &&
      o.exceptionDate === context.dateStr &&
      (!o.course || o.course === course) &&
      (!o.timetableId || o.timetableId === timetable.id)
  );

  // Helper to map slot to details
  const toSlotDetails = (s: typeof todaySlots[0]): ActiveSlotDetails => ({
    id: s.id,
    subject: s.subject,
    studentGroup: s.studentGroup,
    timeRange: s.timeLabel || formatTimeSlot(s.startTime, s.endTime),
    startTime: s.startTime,
    endTime: s.endTime,
    slotType: s.slotType,
    room: s.room,
    notes: s.notes,
  });

  // Find next upcoming class slot today
  const upcomingClassSlot = todaySlots.find(
    (s) => s.startMins > context.minutesNow && s.slotType === 'class' && Boolean(s.subject?.trim())
  );
  const nextSlotDetails = upcomingClassSlot ? toSlotDetails(upcomingClassSlot) : null;

  // 5. Evaluate status when an active slot is found
  if (activeSlot) {
    // Check override for this active slot
    const slotOverride = todayOverrides.find(
      (o) => !o.timetableSlotId || o.timetableSlotId === activeSlot.id
    );

    if (slotOverride) {
      if (slotOverride.status === 'POSTPONED') {
        return {
          course,
          courseName,
          shortName,
          badge,
          status: 'POSTPONED',
          statusLabel: 'Postponed',
          currentSlot: toSlotDetails(activeSlot),
          nextSlot: nextSlotDetails,
          override: slotOverride,
          timetableTitle: timetable.title,
          timetablePdfUrl: timetable.pdfUrl,
        };
      }

      if (slotOverride.status === 'UNAVAILABLE') {
        return {
          course,
          courseName,
          shortName,
          badge,
          status: 'UNAVAILABLE',
          statusLabel: 'Unavailable / Cancelled',
          currentSlot: toSlotDetails(activeSlot),
          nextSlot: nextSlotDetails,
          override: slotOverride,
          timetableTitle: timetable.title,
          timetablePdfUrl: timetable.pdfUrl,
        };
      }
    }

    // Break slot
    if (activeSlot.slotType === 'break') {
      return {
        course,
        courseName,
        shortName,
        badge,
        status: 'BREAK',
        statusLabel: 'Break',
        currentSlot: toSlotDetails(activeSlot),
        nextSlot: nextSlotDetails,
        override: null,
        timetableTitle: timetable.title,
        timetablePdfUrl: timetable.pdfUrl,
      };
    }

    // Lunch slot
    if (activeSlot.slotType === 'lunch') {
      return {
        course,
        courseName,
        shortName,
        badge,
        status: 'LUNCH_BREAK',
        statusLabel: 'Lunch Break',
        currentSlot: toSlotDetails(activeSlot),
        nextSlot: nextSlotDetails,
        override: null,
        timetableTitle: timetable.title,
        timetablePdfUrl: timetable.pdfUrl,
      };
    }

    // Class slot with actual subject
    if (activeSlot.slotType === 'class' && activeSlot.subject?.trim()) {
      return {
        course,
        courseName,
        shortName,
        badge,
        status: 'LECTURE_ONGOING',
        statusLabel: 'Lecture Ongoing',
        currentSlot: toSlotDetails(activeSlot),
        nextSlot: nextSlotDetails,
        override: null,
        timetableTitle: timetable.title,
        timetablePdfUrl: timetable.pdfUrl,
      };
    }

    // If activeSlot is empty (blank cell in PDF)
    // Fall through to checking next class!
  }

  // 6. When no active class/break slot is happening right now:
  if (upcomingClassSlot) {
    // Check if the upcoming slot has an override
    const upcomingOverride = todayOverrides.find(
      (o) => !o.timetableSlotId || o.timetableSlotId === upcomingClassSlot.id
    );

    if (upcomingOverride) {
      if (upcomingOverride.status === 'POSTPONED') {
        return {
          course,
          courseName,
          shortName,
          badge,
          status: 'POSTPONED',
          statusLabel: 'Postponed',
          currentSlot: null,
          nextSlot: nextSlotDetails,
          override: upcomingOverride,
          timetableTitle: timetable.title,
          timetablePdfUrl: timetable.pdfUrl,
        };
      }
      if (upcomingOverride.status === 'UNAVAILABLE') {
        return {
          course,
          courseName,
          shortName,
          badge,
          status: 'UNAVAILABLE',
          statusLabel: 'Unavailable / Cancelled',
          currentSlot: null,
          nextSlot: nextSlotDetails,
          override: upcomingOverride,
          timetableTitle: timetable.title,
          timetablePdfUrl: timetable.pdfUrl,
        };
      }
    }

    return {
      course,
      courseName,
      shortName,
      badge,
      status: 'UPCOMING_LECTURE',
      statusLabel: 'Upcoming Lecture',
      currentSlot: null,
      nextSlot: nextSlotDetails,
      override: null,
      timetableTitle: timetable.title,
      timetablePdfUrl: timetable.pdfUrl,
    };
  }

  // 7. No active lecture and no more lectures scheduled today
  return {
    course,
    courseName,
    shortName,
    badge,
    status: 'NO_LECTURE_SCHEDULED_TODAY',
    statusLabel: 'No lecture scheduled today',
    currentSlot: null,
    nextSlot: null,
    override: null,
    timetableTitle: timetable.title,
    timetablePdfUrl: timetable.pdfUrl,
  };
}

/**
 * Fetch and evaluate live lecture statuses for both TPOPT and TPRPT
 */
export async function getLiveLectureStatus(simulatedDate?: Date | string) {
  const context = getSriLankaDateTime(simulatedDate);

  const [timetables, overrides] = await Promise.all([
    getTimetables({ category: 'foundation' }),
    getTimetableOverrides({ activeOnly: true }),
  ]);

  const tpoptTimetable = timetables.find((t) => t.course === 'TPOPT') || null;
  const tprptTimetable = timetables.find((t) => t.course === 'TPRPT') || null;

  const tpoptStatus = evaluateCourseStatus('TPOPT', tpoptTimetable, overrides, context);
  const tprptStatus = evaluateCourseStatus('TPRPT', tprptTimetable, overrides, context);

  return {
    timestamp: context.now.toISOString(),
    timezone: TIMEZONE,
    serverTime: context.timeWithSeconds,
    date: context.dateStr,
    time: context.timeStr,
    dayOfWeek: context.dayOfWeek,
    displayDate: context.displayDate,
    displayTime: context.displayTime,
    courses: {
      TPOPT: tpoptStatus,
      TPRPT: tprptStatus,
    },
  };
}
