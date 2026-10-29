'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Badge from '@/components/Badge';
import {
  Clock,
  Calendar,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Coffee,
  Utensils,
  ArrowRight,
  RefreshCw,
  Film,
  Camera,
  CalendarX2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { CourseLiveLectureStatus, CourseType } from '@/lib/types';

interface LiveStatusResponse {
  timestamp: string;
  timezone: string;
  serverTime: string;
  date: string;
  time: string;
  dayOfWeek: string;
  displayDate: string;
  displayTime: string;
  courses: {
    TPOPT: CourseLiveLectureStatus;
    TPRPT: CourseLiveLectureStatus;
  };
}

interface LiveLectureStatusProps {
  initialData?: LiveStatusResponse | null;
}

export default function LiveLectureStatus({ initialData }: LiveLectureStatusProps) {
  const [data, setData] = useState<LiveStatusResponse | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchStatus = useCallback(async (isManual = false) => {
    try {
      if (isManual) setIsRefreshing(true);
      const res = await fetch(`/api/timetables/status?t=${Date.now()}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.warn('Failed to refresh live lecture status:', err);
    } finally {
      setLoading(false);
      if (isManual) setIsRefreshing(false);
    }
  }, []);

  // Initial load if no server data
  useEffect(() => {
    if (!initialData) {
      fetchStatus();
    }
  }, [initialData, fetchStatus]);

  // Low-frequency polling (every 30 seconds) & visibility change re-evaluation
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStatus();
    }, 30000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchStatus();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [fetchStatus]);

  const courses: CourseType[] = ['TPOPT', 'TPRPT'];

  return (
    <section
      aria-label="Live Lecture Status"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-xs font-semibold text-ucr-orange uppercase tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Real-Time Foundation Schedule
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Live Lecture Status
          </h2>

          <p className="text-xs sm:text-sm text-text-secondary max-w-xl leading-relaxed">
            Automatically synchronized with the official Foundation Programme timetable based on current Sri Lanka Standard Time (<span className="text-slate-300 font-medium">Asia/Colombo</span>).
          </p>
        </div>

        {/* Live Clock & Auto-refresh Badge */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="px-3.5 py-2 rounded-2xl bg-surface border border-white/10 text-xs text-text-muted flex items-center gap-2.5 shadow-sm">
            <Clock className="w-4 h-4 text-ucr-orange" />
            <div>
              <div className="font-mono text-white text-xs font-semibold">
                {data ? `${data.displayTime} SLST` : 'Synchronizing...'}
              </div>
              <div className="text-[10px] text-text-muted">
                {data?.displayDate ? `${data.dayOfWeek}, ${data.date}` : 'Asia/Colombo'}
              </div>
            </div>
          </div>

          <button
            onClick={() => fetchStatus(true)}
            disabled={isRefreshing}
            title="Refresh status now"
            className="p-2.5 rounded-2xl bg-surface hover:bg-surface-lighter border border-white/10 hover:border-white/20 text-text-secondary hover:text-white transition-all active:scale-95 disabled:opacity-50"
            aria-label="Refresh lecture status"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-ucr-orange' : ''}`} />
          </button>
        </div>
      </div>

      {/* Two Course Cards: TPOPT & TPRPT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {courses.map((course) => {
          const courseData = data?.courses?.[course];
          const isTpopt = course === 'TPOPT';
          const accentColor = isTpopt ? 'orange' : 'sky';

          if (loading || !courseData) {
            return (
              <div
                key={course}
                className="p-8 rounded-3xl bg-surface/70 border border-white/10 space-y-6 animate-pulse min-h-[300px]"
              >
                <div className="flex items-center justify-between">
                  <div className="h-6 w-24 bg-white/10 rounded-full" />
                  <div className="h-6 w-32 bg-white/10 rounded-full" />
                </div>
                <div className="space-y-3 pt-4">
                  <div className="h-7 w-3/4 bg-white/10 rounded-lg" />
                  <div className="h-4 w-1/2 bg-white/10 rounded-lg" />
                </div>
              </div>
            );
          }

          const { status, statusLabel, currentSlot, nextSlot, override } = courseData;

          // Compute status badge visual props
          let statusBadgeVariant: 'tpopt' | 'tprpt' | 'ongoing' | 'upcoming' | 'neutral' = 'neutral';
          let statusBadgeClass = 'bg-slate-500/15 text-slate-300 border-slate-500/30';
          let statusDotClass = 'bg-slate-400';
          let borderGlowClass = isTpopt
            ? 'hover:border-orange-500/50 hover:shadow-orange-glow/30'
            : 'hover:border-sky-500/50 hover:shadow-blue-glow/30';

          if (status === 'LECTURE_ONGOING') {
            statusBadgeClass = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
            statusDotClass = 'bg-emerald-400 animate-pulse';
            borderGlowClass = isTpopt
              ? 'border-orange-500/40 shadow-orange-glow/20'
              : 'border-sky-500/40 shadow-blue-glow/20';
          } else if (status === 'BREAK' || status === 'LUNCH_BREAK') {
            statusBadgeClass = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
            statusDotClass = 'bg-amber-400';
          } else if (status === 'UPCOMING_LECTURE') {
            statusBadgeClass = 'bg-sky-500/15 text-sky-300 border-sky-500/30';
            statusDotClass = 'bg-sky-400';
          } else if (status === 'POSTPONED') {
            statusBadgeClass = 'bg-rose-500/15 text-rose-300 border-rose-500/30';
            statusDotClass = 'bg-rose-400';
          } else if (status === 'UNAVAILABLE') {
            statusBadgeClass = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
            statusDotClass = 'bg-rose-500';
          }

          return (
            <div
              key={course}
              className={`group relative rounded-3xl overflow-hidden bg-surface/90 border border-white/10 ${borderGlowClass} transition-all duration-300 flex flex-col justify-between`}
            >
              {/* Header inside Card */}
              <div className="p-6 sm:p-8 space-y-6 flex-1 flex flex-col justify-between">
                <div>
                  {/* Top Badges: Course Code & Live Status */}
                  <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                    <div className="flex items-center gap-2">
                      <Badge variant={isTpopt ? 'tpopt' : 'tprpt'} size="md">
                        {isTpopt ? <Film className="w-3.5 h-3.5 mr-1" /> : <Camera className="w-3.5 h-3.5 mr-1" />}
                        {course}
                      </Badge>
                      <span className="text-xs font-medium text-text-muted">Foundation 11th Batch</span>
                    </div>

                    {/* Status Badge */}
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${statusBadgeClass}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${statusDotClass}`} />
                      <span>{statusLabel}</span>
                    </div>
                  </div>

                  {/* Course Title */}
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
                    {courseData.courseName}
                  </h3>
                </div>

                {/* Primary Status Content Area */}
                <div className="my-5 p-5 rounded-2xl bg-[#091728]/80 border border-white/5 space-y-3.5">
                  {/* 1. LECTURE ONGOING */}
                  {status === 'LECTURE_ONGOING' && currentSlot && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          Currently in Session
                        </span>
                        <span className="text-xs font-mono text-slate-300 font-medium px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                          {currentSlot.timeRange}
                        </span>
                      </div>

                      <div className="text-2xl font-extrabold text-white">
                        {currentSlot.subject}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {currentSlot.studentGroup && (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-orange-500/15 text-orange-300 border border-orange-500/30">
                            Applicable to: {currentSlot.studentGroup}
                          </span>
                        )}
                        {currentSlot.room && (
                          <span className="text-xs text-text-muted">
                            Room: {currentSlot.room}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 2. BREAK / LUNCH BREAK */}
                  {(status === 'BREAK' || status === 'LUNCH_BREAK') && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-amber-300">
                        {status === 'LUNCH_BREAK' ? (
                          <Utensils className="w-5 h-5 text-amber-400" />
                        ) : (
                          <Coffee className="w-5 h-5 text-amber-400" />
                        )}
                        <span className="text-lg font-bold text-white">
                          {status === 'LUNCH_BREAK' ? 'Lunch Break' : 'Scheduled Tea Break'}
                        </span>
                      </div>

                      <p className="text-xs text-text-secondary">
                        {currentSlot?.timeRange ? `Time band: ${currentSlot.timeRange}. ` : ''}
                        Academic lectures resume promptly after the interval.
                      </p>

                      {nextSlot && (
                        <div className="pt-2 mt-2 border-t border-white/10 text-xs text-text-muted flex items-center justify-between">
                          <span>Next Lecture:</span>
                          <strong className="text-slate-200">
                            {nextSlot.subject} ({nextSlot.timeRange})
                          </strong>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3. UPCOMING LECTURE (later today) */}
                  {status === 'UPCOMING_LECTURE' && nextSlot && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-xs uppercase tracking-wider font-semibold text-sky-400 flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          Next Scheduled Lecture Today
                        </span>
                        <span className="text-xs font-mono text-slate-300 font-medium px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                          {nextSlot.timeRange}
                        </span>
                      </div>

                      <div className="text-2xl font-extrabold text-white">
                        {nextSlot.subject}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {nextSlot.studentGroup && (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-sky-500/15 text-sky-300 border border-sky-500/30">
                            Target: {nextSlot.studentGroup}
                          </span>
                        )}
                        {nextSlot.room && (
                          <span className="text-xs text-text-muted">
                            Room: {nextSlot.room}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 4. POSTPONED (Admin Override) */}
                  {status === 'POSTPONED' && (
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        <span>Class Session Postponed by Department</span>
                      </div>

                      {currentSlot && (
                        <div className="text-lg font-bold text-white line-through opacity-70">
                          {currentSlot.subject}
                        </div>
                      )}

                      {override?.reason && (
                        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-200 space-y-1">
                          <div className="font-semibold text-rose-300">Official Notice:</div>
                          <p>{override.reason}</p>
                        </div>
                      )}

                      {override?.rescheduledDate && (
                        <div className="text-xs text-text-muted flex items-center gap-1.5 pt-1">
                          <Calendar className="w-3.5 h-3.5 text-ucr-orange" />
                          <span>
                            Rescheduled to:{' '}
                            <strong className="text-white">
                              {override.rescheduledDate}
                              {override.rescheduledStartTime ? ` at ${override.rescheduledStartTime}` : ''}
                            </strong>
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 5. UNAVAILABLE / CANCELLED (Admin Override) */}
                  {status === 'UNAVAILABLE' && (
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                        <CalendarX2 className="w-4 h-4 text-rose-400" />
                        <span>Class Unavailable / Cancelled</span>
                      </div>

                      {currentSlot && (
                        <div className="text-lg font-bold text-white line-through opacity-70">
                          {currentSlot.subject}
                        </div>
                      )}

                      {override?.reason && (
                        <p className="text-xs text-text-secondary leading-relaxed p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                          {override.reason}
                        </p>
                      )}
                    </div>
                  )}

                  {/* 6. NO LECTURE SCHEDULED TODAY */}
                  {status === 'NO_LECTURE_SCHEDULED_TODAY' && (
                    <div className="py-2 space-y-1 text-center sm:text-left">
                      <div className="text-base font-bold text-slate-300 flex items-center gap-2 justify-center sm:justify-start">
                        <Calendar className="w-4 h-4 text-text-muted" />
                        <span>No further lectures scheduled today</span>
                      </div>
                      <p className="text-xs text-text-muted">
                        All classes for {data?.dayOfWeek} have concluded or today is an unscheduled study day.
                      </p>
                    </div>
                  )}

                  {/* 7. SCHEDULE UNAVAILABLE */}
                  {status === 'SCHEDULE_UNAVAILABLE' && (
                    <div className="py-2 space-y-1">
                      <div className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                        <Info className="w-4 h-4 text-amber-400" />
                        <span>Timetable is currently unpublished</span>
                      </div>
                      <p className="text-xs text-text-muted">
                        Department administrators are updating the syllabus schedules. Please check back shortly.
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer of Card: Quick Action to Full Timetable in Modules */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                  <div className="text-xs text-text-muted truncate max-w-[200px]" title={courseData.timetableTitle}>
                    {courseData.timetableTitle}
                  </div>

                  <Link
                    href={`/modules?category=foundation&course=${course}`}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white transition-all shadow-sm ${
                      isTpopt
                        ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-glow/30'
                        : 'bg-sky-500 hover:bg-sky-600 shadow-blue-glow/30'
                    }`}
                  >
                    <span>Full Timetable</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
