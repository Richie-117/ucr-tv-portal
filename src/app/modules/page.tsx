'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Timetable,
  TimetableSlot,
  CourseType,
  TimetableCategory,
  CourseModule,
  LearningStage,
} from '@/lib/types';
import Badge from '@/components/Badge';
import Modal from '@/components/Modal';
import {
  BookOpen,
  Calendar,
  Clock,
  Download,
  Film,
  Camera,
  Layers,
  Sparkles,
  Info,
  Search,
  CheckCircle2,
  Coffee,
  Utensils,
  ChevronRight,
  ExternalLink,
  FileText,
  Filter,
  Eye,
  GraduationCap,
  AlertCircle,
} from 'lucide-react';
import { TIME_BANDS, DAYS_OF_WEEK } from '@/lib/seed-data';

function ModulesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Selected Category: 'foundation' | 'academic_1' | 'academic_2'
  const initialCategory = (searchParams.get('category') as TimetableCategory) || 'foundation';
  const [selectedCategory, setSelectedCategory] = useState<TimetableCategory>(initialCategory);

  // Selected Course for Foundation: 'TPOPT' | 'TPRPT'
  const initialCourse = (searchParams.get('course') as CourseType) || 'TPOPT';
  const [selectedCourse, setSelectedCourse] = useState<CourseType>(
    initialCourse === 'TPRPT' ? 'TPRPT' : 'TPOPT'
  );

  // Active View Toggle: 'timetable' | 'syllabus'
  const initialView = searchParams.get('view') === 'syllabus' || searchParams.get('search') ? 'syllabus' : 'timetable';
  const [activeView, setActiveView] = useState<'timetable' | 'syllabus'>(initialView);

  // Timetables Data
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [loadingTimetables, setLoadingTimetables] = useState(true);

  // Mobile selected day filter
  const [mobileSelectedDay, setMobileSelectedDay] = useState<string>('Monday');

  // Syllabus Modules (Preserving existing curriculum feature)
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [stages, setStages] = useState<LearningStage[]>([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null);

  // Load Timetables
  useEffect(() => {
    async function loadTimetables() {
      try {
        setLoadingTimetables(true);
        const res = await fetch('/api/timetables');
        const data = await res.json();
        if (data.timetables) {
          setTimetables(data.timetables);
        }
      } catch (err) {
        console.error('Failed to load timetables:', err);
      } finally {
        setLoadingTimetables(false);
      }
    }
    loadTimetables();
  }, []);

  // Load Syllabus Modules
  useEffect(() => {
    async function loadSyllabus() {
      try {
        setLoadingModules(true);
        const [modRes, stageRes] = await Promise.all([
          fetch('/api/modules?publishedOnly=true'),
          fetch('/api/stages'),
        ]);
        const modData = await modRes.json();
        const stageData = await stageRes.json();
        if (modData.modules) setModules(modData.modules);
        if (stageData.stages) setStages(stageData.stages);
      } catch (err) {
        console.error('Failed to load syllabus modules:', err);
      } finally {
        setLoadingModules(false);
      }
    }
    loadSyllabus();
  }, []);

  // Update query params when course or category changes
  const handleCategorySelect = (cat: TimetableCategory) => {
    setSelectedCategory(cat);
    const params = new URLSearchParams(window.location.search);
    params.set('category', cat);
    router.replace(`/modules?${params.toString()}`, { scroll: false });
  };

  const handleCourseSelect = (c: CourseType) => {
    setSelectedCourse(c);
    const params = new URLSearchParams(window.location.search);
    params.set('course', c);
    router.replace(`/modules?${params.toString()}`, { scroll: false });
  };

  // Find active timetable
  const activeTimetable = useMemo(() => {
    if (selectedCategory !== 'foundation') return null;
    return timetables.find(
      (t) => t.category === 'foundation' && t.course === selectedCourse
    );
  }, [timetables, selectedCategory, selectedCourse]);

  // Current Day & Active Slot Highlight (Sri Lanka Time)
  const [todayWeekday, setTodayWeekday] = useState<string>('');
  const [currentTimeMins, setCurrentTimeMins] = useState<number>(0);

  useEffect(() => {
    const updateCurrentTime = () => {
      const d = new Date();
      const weekday = d.toLocaleDateString('en-US', {
        timeZone: 'Asia/Colombo',
        weekday: 'long',
      });
      const parts = d.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Colombo',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
      }).split(':');
      const mins = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
      setTodayWeekday(weekday);
      setCurrentTimeMins(mins);
      setMobileSelectedDay(weekday);
    };

    updateCurrentTime();
    const timer = setInterval(updateCurrentTime, 60000);
    return () => clearInterval(timer);
  }, []);

  // Resolve PDF Download URL
  const pdfDownloadUrl = useMemo(() => {
    if (activeTimetable?.pdfUrl) {
      return activeTimetable.pdfUrl;
    }
    return selectedCourse === 'TPOPT' ? '/timetables/TPOPT.pdf' : '/timetables/TPRPT.pdf';
  }, [activeTimetable, selectedCourse]);

  const pdfDownloadName = `${selectedCourse}_Foundation_Timetable_11th_Batch.pdf`;

  // Filter slot by day and time band
  const getSlot = (day: string, startTime: string) => {
    if (!activeTimetable || !activeTimetable.slots) return null;
    return activeTimetable.slots.find(
      (s) => s.dayOfWeek.toLowerCase() === day.toLowerCase() && s.startTime === startTime
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-10">
      {/* ========================================================
          1. HEADER BANNER
          ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-xs font-semibold text-ucr-orange uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            Division Modules &amp; Timetables
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Academic Modules &amp; Timetables
          </h1>

          <p className="text-sm sm:text-base text-text-secondary max-w-2xl leading-relaxed">
            Official academic weekly timetables, lecture slots, break schedules, and syllabus modules for the Division of Television Studies.
          </p>
        </div>

        {/* View Switcher: Weekly Timetable vs Curriculum Syllabus */}
        <div className="flex items-center p-1 rounded-2xl bg-surface border border-white/10 self-start md:self-auto">
          <button
            onClick={() => setActiveView('timetable')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeView === 'timetable'
                ? 'bg-ucr-orange text-white shadow-orange-glow'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Weekly Timetable</span>
          </button>

          <button
            onClick={() => setActiveView('syllabus')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeView === 'syllabus'
                ? 'bg-ucr-orange text-white shadow-orange-glow'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Syllabus Modules</span>
          </button>
        </div>
      </div>

      {activeView === 'timetable' && (
        <div className="space-y-10">
          {/* ========================================================
              2. THREE CATEGORY CARDS (Foundation, Academic 1, Academic 2)
              ======================================================== */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Select Timetable Programme Category
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Card 1: Foundation (Available Now) */}
              <button
                type="button"
                onClick={() => handleCategorySelect('foundation')}
                className={`text-left p-6 rounded-3xl border transition-all duration-300 relative flex flex-col justify-between group focus:outline-none focus:ring-2 focus:ring-ucr-orange ${
                  selectedCategory === 'foundation'
                    ? 'bg-surface border-ucr-orange shadow-orange-glow/30 -translate-y-1'
                    : 'bg-surface/60 border-white/10 hover:border-white/20 hover:bg-surface'
                }`}
                aria-pressed={selectedCategory === 'foundation'}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-ucr-orange">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      Available Now
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-ucr-orange transition-colors">
                      Foundation
                    </h3>
                    <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                      Foundation Programme timetable for Batch 11. Complete schedules for TPOPT and TPRPT.
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-ucr-orange">
                  <span>View Schedules</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>

              {/* Card 2: Academic 1 (Upcoming / Empty State) */}
              <button
                type="button"
                onClick={() => handleCategorySelect('academic_1')}
                className={`text-left p-6 rounded-3xl border transition-all duration-300 relative flex flex-col justify-between group focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                  selectedCategory === 'academic_1'
                    ? 'bg-surface border-sky-500 shadow-blue-glow/30 -translate-y-1'
                    : 'bg-surface/60 border-white/10 hover:border-white/20 hover:bg-surface'
                }`}
                aria-pressed={selectedCategory === 'academic_1'}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                      <Layers className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-500/15 text-slate-400 border border-white/10">
                      Academic Year 1
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-sky-400 transition-colors">
                      Academic 1
                    </h3>
                    <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                      Higher National Diploma Level 5 semester schedules and studio practical rotations.
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span>Check Status</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>

              {/* Card 3: Academic 2 (Upcoming / Empty State) */}
              <button
                type="button"
                onClick={() => handleCategorySelect('academic_2')}
                className={`text-left p-6 rounded-3xl border transition-all duration-300 relative flex flex-col justify-between group focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  selectedCategory === 'academic_2'
                    ? 'bg-surface border-emerald-500 shadow-emerald-500/20 -translate-y-1'
                    : 'bg-surface/60 border-white/10 hover:border-white/20 hover:bg-surface'
                }`}
                aria-pressed={selectedCategory === 'academic_2'}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-500/15 text-slate-400 border border-white/10">
                      Academic Year 2
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                      Academic 2
                    </h3>
                    <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                      Higher National Diploma Level 6 specialization units and industry internship tracks.
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span>Check Status</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          </div>

          {/* ========================================================
              3. CATEGORY CONTENT: FOUNDATION TIMETABLE VIEWER
              ======================================================== */}
          {selectedCategory === 'foundation' && (
            <div className="space-y-8 animate-fadeIn">
              {/* Course Selector Tabs: TPOPT & TPRPT */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-surface border border-white/10">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCourseSelect('TPOPT')}
                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all ${
                      selectedCourse === 'TPOPT'
                        ? 'bg-orange-500 text-white shadow-orange-glow'
                        : 'text-text-secondary hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Film className="w-4 h-4" />
                    <span>TPOPT (Post-Production)</span>
                  </button>

                  <button
                    onClick={() => handleCourseSelect('TPRPT')}
                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all ${
                      selectedCourse === 'TPRPT'
                        ? 'bg-sky-500 text-white shadow-blue-glow'
                        : 'text-text-secondary hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Camera className="w-4 h-4" />
                    <span>TPRPT (Production)</span>
                  </button>
                </div>

                {/* PDF Download Button */}
                <a
                  href={pdfDownloadUrl}
                  download={pdfDownloadName}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-all shadow-sm active:scale-95"
                >
                  <Download className="w-4 h-4 text-ucr-orange" />
                  <span>Download PDF ({selectedCourse})</span>
                </a>
              </div>

              {/* Editable Headline & Metadata Block */}
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-surface to-[#0d2238] border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ucr-orange">
                  <span>Batch: {activeTimetable?.batchLabel || '11th Batch'}</span>
                  <span>•</span>
                  <span>Pathway: {selectedCourse}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {activeTimetable?.title || 'Academic Time Table – Foundation Programme – 11th Batch'}
                </h2>

                <p className="text-sm text-text-secondary font-medium">
                  {activeTimetable?.subtitle ||
                    (selectedCourse === 'TPOPT'
                      ? 'Television & Digital Media Post Production Technology'
                      : 'Television & Digital Media Production Technology')}
                </p>
              </div>

              {/* Mobile Day Selector Bar */}
              <div className="lg:hidden space-y-2">
                <span className="text-xs text-text-muted font-semibold">Select Day View:</span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                  {DAYS_OF_WEEK.map((day) => {
                    const isToday = day.toLowerCase() === todayWeekday.toLowerCase();
                    const isSelected = day === mobileSelectedDay;
                    return (
                      <button
                        key={day}
                        onClick={() => setMobileSelectedDay(day)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-ucr-orange text-white'
                            : 'bg-surface text-slate-300 border border-white/10'
                        }`}
                      >
                        <span>{day.substring(0, 3)}</span>
                        {isToday && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ========================================================
                  DATA-DRIVEN WEEKLY TIMETABLE TABLE
                  ======================================================== */}
              <div className="rounded-3xl border border-white/10 overflow-hidden bg-surface shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-[#06111F] border-b border-white/10">
                        <th className="p-4 sm:p-5 font-extrabold text-slate-300 uppercase tracking-wider text-xs w-40 min-w-[130px] border-r border-white/10">
                          Time
                        </th>
                        {DAYS_OF_WEEK.map((day) => {
                          const isToday = day.toLowerCase() === todayWeekday.toLowerCase();
                          return (
                            <th
                              key={day}
                              className={`p-4 sm:p-5 font-extrabold text-xs uppercase tracking-wider min-w-[140px] border-r border-white/5 last:border-r-0 ${
                                isToday ? 'bg-orange-500/10 text-ucr-orange' : 'text-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                <span>{day}</span>
                                {isToday && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-orange-500 text-white font-bold">
                                    Today
                                  </span>
                                )}
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-white/5">
                      {TIME_BANDS.map((tb, rowIdx) => {
                        // Check if break or lunch row
                        if (tb.isBreak || tb.isLunch) {
                          const isLunch = tb.isLunch;
                          return (
                            <tr
                              key={tb.start}
                              className={isLunch ? 'bg-amber-950/20' : 'bg-orange-950/20'}
                            >
                              <td className="p-3.5 sm:p-4 font-mono text-xs text-text-muted font-medium border-r border-white/10 bg-[#06111F]/70">
                                {tb.label}
                              </td>
                              <td
                                colSpan={7}
                                className="p-3 text-center border-r border-white/5 last:border-r-0"
                              >
                                <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                  {isLunch ? (
                                    <>
                                      <Utensils className="w-3.5 h-3.5" />
                                      <span>Lunch Break (12:40 p.m. – 1:20 p.m.)</span>
                                    </>
                                  ) : (
                                    <>
                                      <Coffee className="w-3.5 h-3.5" />
                                      <span>Interval / Tea Break</span>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        }

                        // Regular lecture slot row
                        return (
                          <tr key={tb.start} className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-3.5 sm:p-4 font-mono text-xs text-slate-300 font-medium border-r border-white/10 bg-[#06111F]/50 whitespace-nowrap">
                              {tb.label}
                            </td>

                            {DAYS_OF_WEEK.map((day) => {
                              const slot = getSlot(day, tb.start);
                              const isToday = day.toLowerCase() === todayWeekday.toLowerCase();
                              const hasClass = slot && slot.slotType === 'class' && Boolean(slot.subject?.trim());

                              return (
                                <td
                                  key={day}
                                  className={`p-3 sm:p-3.5 border-r border-white/5 last:border-r-0 align-top ${
                                    isToday ? 'bg-orange-500/[0.03]' : ''
                                  }`}
                                >
                                  {hasClass ? (
                                    <div className="p-2.5 rounded-xl bg-[#091728] border border-white/10 hover:border-ucr-orange/40 transition-all space-y-1.5 shadow-sm">
                                      <div className="font-bold text-white text-xs leading-snug">
                                        {slot.subject}
                                      </div>

                                      {slot.studentGroup && (
                                        <div className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white/5 text-slate-300 border border-white/10">
                                          {slot.studentGroup}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="h-full min-h-[50px] flex items-center justify-center text-text-muted/20 text-xs">
                                      —
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Footer notes on timetable differences */}
                <div className="p-4 sm:p-5 bg-[#06111F] border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-text-muted">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-ucr-orange" />
                    <span>
                      Schedule extracted directly from official {selectedCourse} Foundation PDF. Course-specific differences are preserved.
                    </span>
                  </div>

                  <a
                    href={pdfDownloadUrl}
                    download={pdfDownloadName}
                    className="text-ucr-orange hover:underline font-semibold"
                  >
                    Download Source PDF
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              4. EMPTY STATES FOR ACADEMIC 1 & ACADEMIC 2
              ======================================================== */}
          {(selectedCategory === 'academic_1' || selectedCategory === 'academic_2') && (
            <div className="py-20 px-6 rounded-3xl bg-surface/70 border border-dashed border-white/15 text-center space-y-5 animate-fadeIn">
              <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-text-muted">
                <Calendar className="w-8 h-8" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-2xl font-extrabold text-white">
                  No data found
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  The academic schedule for{' '}
                  <strong className="text-slate-200">
                    {selectedCategory === 'academic_1' ? 'Academic 1' : 'Academic 2'}
                  </strong>{' '}
                  has not been published by the television department yet. Check back soon for semester curriculum updates.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => handleCategorySelect('foundation')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-ucr-orange hover:bg-ucr-orange-hover transition-colors shadow-orange-glow"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>View Foundation Timetable</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          5. SYLLABUS MODULES VIEW (Curriculum Units)
          ======================================================== */}
      {activeView === 'syllabus' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="p-6 rounded-3xl bg-surface border border-white/10 space-y-4">
            <h3 className="text-lg font-bold text-white">
              Curriculum Syllabus Units
            </h3>
            <p className="text-xs text-text-secondary">
              Browse academic units across studio directing, digital camera operations, lighting setups, non-linear video editing, and sound design.
            </p>
          </div>

          {loadingModules ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-6 rounded-2xl bg-surface/50 border border-white/5 animate-pulse h-64" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((m) => (
                <div
                  key={m.id}
                  className="rounded-2xl border border-white/10 bg-surface p-6 flex flex-col justify-between hover:border-white/20 transition-all hover:shadow-card"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        {m.courseCodes.map((c) => (
                          <Badge key={c} variant={c === 'TPOPT' ? 'tpopt' : 'tprpt'}>
                            {c}
                          </Badge>
                        ))}
                      </div>
                      <Badge variant={m.status as any}>{m.status}</Badge>
                    </div>

                    <div>
                      {m.code && <div className="text-[11px] font-mono text-text-muted">{m.code}</div>}
                      <h4 className="text-base font-bold text-white">{m.title}</h4>
                    </div>

                    <p className="text-xs text-text-secondary line-clamp-3">
                      {m.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs text-text-muted">
                      {stages.find((s) => s.id === m.learningStageId)?.title || 'Curriculum Stage'}
                    </span>
                    <button
                      onClick={() => setSelectedModule(m)}
                      className="text-xs font-semibold text-ucr-orange hover:text-white transition-colors"
                    >
                      Syllabus Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Module Details Modal */}
      {selectedModule && (
        <Modal
          isOpen={Boolean(selectedModule)}
          onClose={() => setSelectedModule(null)}
          title={selectedModule.title}
          maxWidth="2xl"
        >
          <div className="space-y-5">
            <div className="flex items-center gap-2 flex-wrap">
              {selectedModule.courseCodes.map((c) => (
                <Badge key={c} variant={c === 'TPOPT' ? 'tpopt' : 'tprpt'} size="md">
                  {c} Pathway
                </Badge>
              ))}
              <Badge variant={selectedModule.status as any} size="md">
                Status: {selectedModule.status}
              </Badge>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Description &amp; Course Content
              </h4>
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                {selectedModule.description}
              </p>
            </div>

            {selectedModule.resources && selectedModule.resources.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-white/10">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Attached Learning Resources
                </h4>
                <div className="space-y-2">
                  {selectedModule.resources.map((res, i) => (
                    <a
                      key={i}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl bg-surface-lighter hover:bg-surface-hover border border-white/5 transition-colors text-xs text-slate-200"
                    >
                      <span className="flex items-center gap-2 font-medium">
                        <FileText className="w-4 h-4 text-ucr-orange" />
                        {res.title}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-text-muted" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

export default function ModulesPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto p-12 text-center text-text-muted">
          Loading academic modules and timetables...
        </div>
      }
    >
      <ModulesContent />
    </Suspense>
  );
}
