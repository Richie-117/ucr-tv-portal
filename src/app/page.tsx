import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  getStudents,
  getModules,
  getStages,
  getGallery,
  getEvents,
  getDashboardStats,
  getLecturers,
  getLecturersSectionSettings,
} from '@/lib/db';
import Badge from '@/components/Badge';
import HomeGalleryLightbox from '@/components/HomeGalleryLightbox';
import HomeContactRepsButton from '@/components/HomeContactRepsButton';
import LecturersSection from '@/components/LecturersSection';
import LiveLectureStatus from '@/components/LiveLectureStatus';
import { getLiveLectureStatus } from '@/lib/timetableService';
import {
  ArrowRight,
  Tv,
  Film,
  Camera,
  Layers,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  BookOpen,
  Users,
  Compass,
  MonitorPlay,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [stats, ongoingModules, stages, galleryItems, upcomingEvents, lecturers, lecturerSettings, liveLectureData] = await Promise.all([
    getDashboardStats(),
    getModules({ status: 'ongoing', publishedOnly: true }),
    getStages(),
    getGallery({ homeOnly: true }),
    getEvents({ type: 'upcoming', publishedOnly: true }),
    getLecturers(),
    getLecturersSectionSettings(),
    getLiveLectureStatus(),
  ]);

  return (
    <div className="space-y-24 md:space-y-32 pb-24">
      {/* ========================================================
          1. HERO SECTION
          ======================================================== */}
      <section className="relative min-h-[85vh] sm:min-h-[88vh] flex items-center justify-center overflow-hidden border-b border-white/10">
        {/* Background Image with Deep Navy Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero_production.jpg"
            alt="Broadcast Television Production Studio"
            fill
            className="object-cover object-center scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#06111F] via-[#06111F]/85 to-[#06111F]/65" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center flex flex-col items-center">
          
          {/* Institutional Top Badges */}
          <div className="inline-flex items-center gap-2 sm:gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/15 backdrop-blur-md mb-6">
            <span className="text-xs uppercase tracking-widest font-semibold text-ucr-orange">
              Student Community Portal
            </span>
            <span className="w-1 h-1 rounded-full bg-white/40" />
            <span className="text-xs text-slate-300 font-medium">Intake 2026</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.1] mb-6">
            Division of <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400 bg-clip-text text-transparent">Television Studies</span>
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-xl text-text-secondary max-w-2xl leading-relaxed mb-6 font-normal">
            Bringing together aspiring creators, broadcast directors, cinematographers, and post-production specialists in a collaborative, practical studio environment.
          </p>

          {/* Institutional Affiliation Labels */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-text-muted mb-10">
            <span className="text-slate-300 font-medium">University College of Rathmalana (UCR)</span>
            <span className="hidden sm:inline text-white/20">•</span>
            <span>Powered by University of Vocational Technology (UoVT)</span>
          </div>

          {/* CTAs: View TPOPT Students, View TPRPT Students, & Contact Course Reps */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
            <Link
              href="/students?course=TPOPT"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-orange-glow transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Film className="w-4 h-4" />
              <span>View TPOPT Students ({stats.tpoptStudents})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/students?course=TPRPT"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 shadow-blue-glow transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Camera className="w-4 h-4" />
              <span>View TPRPT Students ({stats.tprptStudents})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <HomeContactRepsButton />
          </div>

          {/* Quick metric bar */}
          <div className="mt-14 pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-10 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">{stats.totalStudents}</div>
              <div className="text-xs text-text-muted uppercase tracking-wider mt-1">Total Registered</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-orange-400">{stats.tpoptStudents}</div>
              <div className="text-xs text-text-muted uppercase tracking-wider mt-1">TPOPT Post-Prod</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-sky-400">{stats.tprptStudents}</div>
              <div className="text-xs text-text-muted uppercase tracking-wider mt-1">TPRPT Studio-Prod</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{stats.ongoingModules}</div>
              <div className="text-xs text-text-muted uppercase tracking-wider mt-1">Ongoing Modules</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          LIVE LECTURE STATUS (Calculated from Foundation Timetables)
          ======================================================== */}
      <LiveLectureStatus initialData={liveLectureData} />

      {/* ========================================================
          2. ABOUT THE DIVISION
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Text & Core Values */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-xs font-semibold text-ucr-orange uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Academic Excellence & Creative Practice
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              About the Division
            </h2>

            <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
              The <strong>Division of Television Studies</strong> at University College of Rathmalana delivers hands-on, practical education focused on television broadcast operations, studio direction, digital cinematography, and advanced non-linear post-production.
            </p>

            <p className="text-sm sm:text-base text-text-muted leading-relaxed">
              Learners gain practical mastery across multi-camera studio workflows, lighting rigs, audio mixing consoles, color grading suites, and motion graphics workflows. Through collaborative team productions and real-world project delivery, students cultivate creative storytelling, technical discipline, and industry readiness.
            </p>

            {/* Core Value Points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-surface/80 border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-orange-400 font-semibold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-ucr-orange" />
                  <span>Practical Learning</span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Extensive studio and control room sessions with broadcast cameras, vision mixers, and pro lighting rigs.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface/80 border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-sky-400 font-semibold text-sm">
                  <Film className="w-4 h-4 text-uovt-blue" />
                  <span>Creative Development</span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Crafting narrative documentaries, broadcast promos, live studio transmissions, and short films.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface/80 border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>Teamwork & Collaboration</span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Experiencing live crew dynamics — directors, technical operators, sound recordists, and floor managers working in sync.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface/80 border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                  <Compass className="w-4 h-4 text-amber-400" />
                  <span>Industry Readiness</span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Curriculum aligned with national television stations and post-production studios for smooth industry transitions.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: High-End Production Imagery */}
          <div className="lg:col-span-5">
            <div className="relative h-[380px] sm:h-[450px] rounded-3xl overflow-hidden border border-white/10 shadow-card group">
              <Image
                src="/images/about_control_room.jpg"
                alt="Television Production Control Gallery"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
              <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10">
                <div className="text-xs font-semibold text-ucr-orange uppercase tracking-wider mb-1">
                  Television Production Gallery
                </div>
                <div className="text-sm font-medium text-white">
                  Multi-feed monitor wall, switcher control, and live broadcast transmission workflows.
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================
          3. PROGRAMME CARDS (TPOPT & TPRPT)
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-ucr-orange uppercase tracking-wider mb-1">
              Higher National Diplomas
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Academic Programmes
            </h2>
          </div>
          <p className="text-sm text-text-secondary max-w-md">
            Two specialized NVQ Level 5 & 6 pathways preparing learners for high-impact media production and post-production careers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* TPOPT Card (Orange Accent) */}
          <div className="group relative rounded-3xl overflow-hidden border border-orange-500/30 bg-surface/90 hover:border-orange-500/60 transition-all duration-300 hover:shadow-orange-glow hover:-translate-y-1 flex flex-col justify-between">
            <div className="relative h-60 w-full overflow-hidden">
              <Image
                src="/images/tpopt_cover.jpg"
                alt="Television Post Production Technology"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B2D] via-[#0B1B2D]/60 to-transparent" />
              
              <div className="absolute top-4 left-4">
                <Badge variant="tpopt" size="md">
                  TPOPT
                </Badge>
              </div>

              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-orange-500/30 text-xs font-semibold text-orange-400">
                {stats.tpoptStudents} Registered Students
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white group-hover:text-orange-400 transition-colors">
                  Television & Digital Media Post Production Technology
                </h3>
                <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                  Focusing on non-linear editing (NLE), color grading, visual effects composition, digital intermediate mastering, dialogue editing, and broadcast sound design.
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs font-medium text-text-muted">Batch 11 — 2026 Intake</span>
                <Link
                  href="/students?course=TPOPT"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-orange-500 hover:bg-orange-600 transition-colors shadow-sm"
                >
                  <span>View Students</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* TPRPT Card (Blue Accent) */}
          <div className="group relative rounded-3xl overflow-hidden border border-sky-500/30 bg-surface/90 hover:border-sky-500/60 transition-all duration-300 hover:shadow-blue-glow hover:-translate-y-1 flex flex-col justify-between">
            <div className="relative h-60 w-full overflow-hidden">
              <Image
                src="/images/tprpt_cover.jpg"
                alt="Television Production Technology"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B2D] via-[#0B1B2D]/60 to-transparent" />

              <div className="absolute top-4 left-4">
                <Badge variant="tprpt" size="md">
                  TPRPT
                </Badge>
              </div>

              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-sky-500/30 text-xs font-semibold text-sky-400">
                {stats.tprptStudents} Registered Students
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white group-hover:text-sky-400 transition-colors">
                  Television & Digital Media Production Technology
                </h3>
                <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                  Focusing on multi-camera studio production, studio camera operation, lighting design, audio tracking, live vision mixing, television directing, and outside broadcast (OB) setups.
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs font-medium text-text-muted">Batch 11 — 2026 Intake</span>
                <Link
                  href="/students?course=TPRPT"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-sky-500 hover:bg-sky-600 transition-colors shadow-sm"
                >
                  <span>View Students</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          ACADEMIC FACULTY / LECTURERS SECTION
          ======================================================== */}
      <LecturersSection lecturers={lecturers} settings={lecturerSettings} />

      {/* ========================================================
          4. LEARNING JOURNEY (Horizontal on wide, vertical on mobile)
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-ucr-orange uppercase tracking-wider mb-1">
              Diploma Progression Path
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Learning Journey
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-text-muted max-w-md">
            Dynamic learning pathway overview managed through the portal administration. Stages reflect the academic and internship progression structure.
          </p>
        </div>

        {/* Desktop Horizontal Timeline / Mobile Vertical Cards */}
        <div className="relative">
          {/* Subtle connecting line for desktop */}
          <div className="hidden lg:block absolute top-7 left-12 right-12 h-0.5 bg-gradient-to-r from-orange-500 via-sky-500 to-emerald-500 opacity-40 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 relative z-10">
            {stages.map((stage, idx) => (
              <div
                key={stage.id}
                className="p-5 rounded-2xl bg-surface border border-white/10 hover:border-ucr-orange/40 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-9 h-9 rounded-full bg-white/5 border border-white/15 flex items-center justify-center font-bold text-sm text-white mb-4 group-hover:bg-ucr-orange group-hover:border-ucr-orange transition-colors">
                    {idx + 1}
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2 leading-tight">
                    {stage.title}
                  </h3>
                  {stage.description && (
                    <p className="text-xs text-text-secondary leading-relaxed line-clamp-4">
                      {stage.description}
                    </p>
                  )}
                </div>
                <div className="pt-3 mt-3 border-t border-white/5 text-[11px] text-text-muted font-medium">
                  Stage {idx + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          5. CURRENTLY LEARNING / LATEST MODULES (Ongoing)
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Active Academic Units
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Currently Learning
            </h2>
          </div>
          <Link
            href="/modules"
            className="inline-flex items-center gap-2 text-sm font-semibold text-ucr-orange hover:text-white transition-colors"
          >
            <span>View All Modules</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {ongoingModules.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-surface/50 border border-white/10 text-text-muted text-sm">
            No modules are currently marked as ongoing. Check back shortly as new modules are activated.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ongoingModules.map((module) => (
              <div
                key={module.id}
                className="group p-6 rounded-2xl bg-surface border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-card flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      {module.courseCodes.map((c) => (
                        <Badge key={c} variant={c === 'TPOPT' ? 'tpopt' : 'tprpt'}>
                          {c}
                        </Badge>
                      ))}
                    </div>
                    <Badge variant="ongoing">Ongoing</Badge>
                  </div>

                  <div>
                    {module.code && (
                      <div className="text-[11px] font-mono text-text-muted mb-1">{module.code}</div>
                    )}
                    <h3 className="text-lg font-bold text-white group-hover:text-ucr-orange transition-colors">
                      {module.title}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed line-clamp-3">
                    {module.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-text-muted">
                    {stages.find((s) => s.id === module.learningStageId)?.title || 'Semester Unit'}
                  </span>
                  <Link
                    href={`/modules?search=${encodeURIComponent(module.title)}`}
                    className="text-xs font-semibold text-white/80 hover:text-white inline-flex items-center gap-1"
                  >
                    <span>Details</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ========================================================
          6. GALLERY PREVIEW
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-ucr-orange uppercase tracking-wider mb-1">
              Production Environment
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Media Gallery Preview
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-text-muted max-w-sm">
            Click any frame to view high-resolution studio setups, live broadcast galleries, and field shoots.
          </p>
        </div>

        {/* Interactive Lightbox Grid Component */}
        <HomeGalleryLightbox items={galleryItems} />
      </section>

      {/* ========================================================
          7. EVENTS PREVIEW
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-ucr-orange uppercase tracking-wider mb-1">
              Division Calendar
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Upcoming Events
            </h2>
          </div>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-sm font-semibold text-ucr-orange hover:text-white transition-colors"
          >
            <span>View All Events</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {upcomingEvents.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-surface/50 border border-white/10 text-text-muted text-sm">
            No upcoming events are currently scheduled. Please check back soon or browse past event archives.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingEvents.slice(0, 2).map((event) => (
              <div
                key={event.id}
                className="group rounded-2xl overflow-hidden border border-white/10 bg-surface transition-all duration-300 hover:border-white/20 hover:shadow-card flex flex-col"
              >
                {event.coverImageUrl && (
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={event.coverImageUrl}
                      alt={event.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B2D] via-transparent to-transparent" />
                  </div>
                )}

                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-xs text-ucr-orange font-semibold">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{event.eventDate}</span>
                      </div>
                      {event.startTime && (
                        <div className="flex items-center gap-1.5 text-text-muted">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{event.startTime}</span>
                        </div>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-white group-hover:text-ucr-orange transition-colors">
                      {event.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed line-clamp-2">
                      {event.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    {event.location ? (
                      <div className="flex items-center gap-1.5 text-xs text-text-muted">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate max-w-[200px]">{event.location}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-text-muted">Division Event</span>
                    )}

                    <Link
                      href="/events"
                      className="text-xs font-semibold text-white/90 hover:text-white inline-flex items-center gap-1"
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
