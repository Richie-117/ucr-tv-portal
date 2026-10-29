'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Student,
  CourseModule,
  LearningStage,
  GalleryItem,
  DivisionEvent,
  DashboardStats,
  AdminUser,
} from '@/lib/types';
import AdminStudentsTab from '@/components/admin/AdminStudentsTab';
import AdminTimetablesTab from '@/components/admin/AdminTimetablesTab';
import AdminLecturersTab from '@/components/admin/AdminLecturersTab';
import AdminModulesTab from '@/components/admin/AdminModulesTab';
import AdminStagesTab from '@/components/admin/AdminStagesTab';
import AdminGalleryTab from '@/components/admin/AdminGalleryTab';
import AdminEventsTab from '@/components/admin/AdminEventsTab';
import AdminSettingsTab from '@/components/admin/AdminSettingsTab';
import {
  Shield,
  Users,
  BookOpen,
  Calendar,
  Clock,
  Image as ImageIcon,
  Layers,
  Settings,
  LogOut,
  ArrowUpRight,
  Loader2,
  Tv,
  Film,
  Camera,
  Home,
  GraduationCap,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'students' | 'timetables' | 'lecturers' | 'modules' | 'stages' | 'gallery' | 'events' | 'settings'
  >('students');

  // Live Database Records
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [stages, setStages] = useState<LearningStage[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [events, setEvents] = useState<DivisionEvent[]>([]);

  // Check auth and load data
  const loadAllData = async () => {
    try {
      // 1. Verify Auth
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (!meData.authenticated) {
        window.location.href = '/admin/login';
        return;
      }
      setCurrentUser(meData.user);

      // 2. Fetch all collections & stats
      const [statsRes, studentsRes, modulesRes, stagesRes, galleryRes, eventsRes] =
        await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/students'),
          fetch('/api/modules'),
          fetch('/api/stages'),
          fetch('/api/gallery'),
          fetch('/api/events'),
        ]);

      const [statsData, sData, mData, stData, gData, eData] = await Promise.all([
        statsRes.json(),
        studentsRes.json(),
        modulesRes.json(),
        stagesRes.json(),
        galleryRes.json(),
        eventsRes.json(),
      ]);

      if (statsData.stats) setStats(statsData.stats);
      if (sData.students) setStudents(sData.students);
      if (mData.modules) setModules(mData.modules);
      if (stData.stages) setStages(stData.stages);
      if (gData.gallery) setGallery(gData.gallery);
      if (eData.events) setEvents(eData.events);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-ucr-orange" />
        <p className="text-xs text-text-muted">Verifying administrator session...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Admin Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-surface border border-white/10 shadow-card">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-orange-500/10 text-ucr-orange border border-orange-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white tracking-tight">
                Division Administration
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Live Server
              </span>
            </div>
            <p className="text-xs text-text-muted">
              Signed in as <strong className="text-slate-300">{currentUser?.name || 'Administrator'}</strong> ({currentUser?.email})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Link
            href="/"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-surface-lighter hover:bg-surface-hover border border-white/10 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Public Site</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-600/80 border border-rose-500/20 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Live Dashboard Summary Metrics Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-5 rounded-2xl bg-surface border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>Total Students</span>
              <Users className="w-4 h-4 text-white" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              {stats.totalStudents}
            </div>
            <div className="text-[11px] text-text-muted">Combined 2026 Intake</div>
          </div>

          <div className="p-5 rounded-2xl bg-surface border border-orange-500/30 space-y-1">
            <div className="flex items-center justify-between text-xs text-orange-400 font-semibold">
              <span>TPOPT Students</span>
              <Film className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-orange-400">
              {stats.tpoptStudents}
            </div>
            <div className="text-[11px] text-text-muted">Post Production</div>
          </div>

          <div className="p-5 rounded-2xl bg-surface border border-sky-500/30 space-y-1">
            <div className="flex items-center justify-between text-xs text-sky-400 font-semibold">
              <span>TPRPT Students</span>
              <Camera className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-sky-400">
              {stats.tprptStudents}
            </div>
            <div className="text-[11px] text-text-muted">Studio Production</div>
          </div>

          <div className="p-5 rounded-2xl bg-surface border border-emerald-500/30 space-y-1">
            <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
              <span>Ongoing Modules</span>
              <BookOpen className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
              {stats.ongoingModules}
            </div>
            <div className="text-[11px] text-text-muted">Featured on Home</div>
          </div>

          <div className="p-5 rounded-2xl bg-surface border border-amber-500/30 space-y-1 col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-xs text-amber-400 font-semibold">
              <span>Upcoming Events</span>
              <Calendar className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">
              {stats.upcomingEvents}
            </div>
            <div className="text-[11px] text-text-muted">On division calendar</div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-white/10 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'students'
              ? 'bg-ucr-orange text-white shadow-orange-glow'
              : 'text-text-secondary hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Students ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('timetables')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'timetables'
              ? 'bg-ucr-orange text-white shadow-orange-glow'
              : 'text-text-secondary hover:text-white hover:bg-white/5'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Timetables &amp; Status</span>
        </button>

        <button
          onClick={() => setActiveTab('lecturers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'lecturers'
              ? 'bg-ucr-orange text-white shadow-orange-glow'
              : 'text-text-secondary hover:text-white hover:bg-white/5'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Lecturers</span>
        </button>

        <button
          onClick={() => setActiveTab('modules')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'modules'
              ? 'bg-ucr-orange text-white shadow-orange-glow'
              : 'text-text-secondary hover:text-white hover:bg-white/5'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Modules ({modules.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('stages')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'stages'
              ? 'bg-ucr-orange text-white shadow-orange-glow'
              : 'text-text-secondary hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Learning Stages ({stages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('gallery')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'gallery'
              ? 'bg-ucr-orange text-white shadow-orange-glow'
              : 'text-text-secondary hover:text-white hover:bg-white/5'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Gallery ({gallery.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'events'
              ? 'bg-ucr-orange text-white shadow-orange-glow'
              : 'text-text-secondary hover:text-white hover:bg-white/5'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Events ({events.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-ucr-orange text-white shadow-orange-glow'
              : 'text-text-secondary hover:text-white hover:bg-white/5'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings &amp; Reset</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="pt-2">
        {activeTab === 'students' && (
          <AdminStudentsTab students={students} onRefresh={loadAllData} />
        )}
        {activeTab === 'timetables' && (
          <AdminTimetablesTab onRefresh={loadAllData} />
        )}
        {activeTab === 'lecturers' && (
          <AdminLecturersTab onRefresh={loadAllData} />
        )}
        {activeTab === 'modules' && (
          <AdminModulesTab modules={modules} stages={stages} onRefresh={loadAllData} />
        )}
        {activeTab === 'stages' && (
          <AdminStagesTab stages={stages} onRefresh={loadAllData} />
        )}
        {activeTab === 'gallery' && (
          <AdminGalleryTab gallery={gallery} onRefresh={loadAllData} />
        )}
        {activeTab === 'events' && (
          <AdminEventsTab events={events} onRefresh={loadAllData} />
        )}
        {activeTab === 'settings' && (
          <AdminSettingsTab onResetDatabase={loadAllData} />
        )}
      </div>
    </div>
  );
}
