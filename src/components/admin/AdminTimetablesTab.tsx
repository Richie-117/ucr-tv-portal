'use client';

import React, { useState, useEffect } from 'react';
import {
  Timetable,
  TimetableSlot,
  TimetableOverride,
  CourseType,
  SlotType,
  DayOfWeek,
  OverrideStatus,
} from '@/lib/types';
import Badge from '@/components/Badge';
import ConfirmModal from '@/components/ConfirmModal';
import Modal from '@/components/Modal';
import {
  Calendar,
  Clock,
  Upload,
  Download,
  Plus,
  Trash2,
  Edit2,
  Save,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Film,
  Camera,
  FileText,
  AlertCircle,
  ExternalLink,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { TIME_BANDS, DAYS_OF_WEEK } from '@/lib/seed-data';

interface AdminTimetablesTabProps {
  onRefresh?: () => void;
}

export default function AdminTimetablesTab({ onRefresh }: AdminTimetablesTabProps) {
  const [selectedCourse, setSelectedCourse] = useState<CourseType>('TPOPT');
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [overrides, setOverrides] = useState<TimetableOverride[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Active timetable being edited
  const activeTimetable = timetables.find(
    (t) => t.category === 'foundation' && t.course === selectedCourse
  );

  // Metadata form state
  const [metaTitle, setMetaTitle] = useState('');
  const [metaSubtitle, setMetaSubtitle] = useState('');
  const [metaBatch, setMetaBatch] = useState('');
  const [metaPublished, setMetaPublished] = useState(true);

  // Day filter for slot editor
  const [filterDay, setFilterDay] = useState<DayOfWeek>('Monday');

  // Slot Edit Modal state
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [slotSubject, setSlotSubject] = useState('');
  const [slotGroup, setSlotGroup] = useState('');
  const [slotStartTime, setSlotStartTime] = useState('');
  const [slotEndTime, setSlotEndTime] = useState('');
  const [slotType, setSlotType] = useState<SlotType>('class');
  const [slotRoom, setSlotRoom] = useState('');
  const [slotNotes, setSlotNotes] = useState('');

  // Override Create Modal state
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [overrideDate, setOverrideDate] = useState(new Date().toISOString().split('T')[0]);
  const [overrideSlotId, setOverrideSlotId] = useState<string>('');
  const [overrideStatus, setOverrideStatus] = useState<OverrideStatus>('POSTPONED');
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideReschedDate, setOverrideReschedDate] = useState('');
  const [overrideReschedStartTime, setOverrideReschedStartTime] = useState('');
  const [overrideReschedEndTime, setOverrideReschedEndTime] = useState('');

  // Delete Confirm Modal state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'override' | 'slot';
    id: string;
    title: string;
  } | null>(null);

  // PDF Upload state
  const [uploadingPdf, setUploadingPdf] = useState(false);

  // Fetch timetables & overrides
  const loadData = async () => {
    try {
      setLoading(true);
      const [tRes, oRes] = await Promise.all([
        fetch('/api/timetables?publishedOnly=false'),
        fetch('/api/timetables/overrides?activeOnly=false'),
      ]);
      const tData = await tRes.json();
      const oData = await oRes.json();

      if (tData.timetables) setTimetables(tData.timetables);
      if (oData.overrides) setOverrides(oData.overrides);
    } catch (err) {
      console.error('Failed to load timetables in admin:', err);
      showFeedback('error', 'Failed to load timetable records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sync metadata form when active timetable changes
  useEffect(() => {
    if (activeTimetable) {
      setMetaTitle(activeTimetable.title || '');
      setMetaSubtitle(activeTimetable.subtitle || '');
      setMetaBatch(activeTimetable.batchLabel || '');
      setMetaPublished(activeTimetable.isPublished !== false);
    }
  }, [activeTimetable]);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 5000);
  };

  // Save Timetable Metadata
  const handleSaveMetadata = async () => {
    if (!activeTimetable) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/timetables/${activeTimetable.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: metaTitle,
          subtitle: metaSubtitle,
          batchLabel: metaBatch,
          isPublished: metaPublished,
        }),
      });

      if (res.ok) {
        showFeedback('success', `${selectedCourse} timetable details updated successfully.`);
        await loadData();
        if (onRefresh) onRefresh();
      } else {
        const err = await res.json();
        showFeedback('error', err.error || 'Failed to update metadata.');
      }
    } catch (e: any) {
      showFeedback('error', e.message || 'Error saving metadata.');
    } finally {
      setSaving(false);
    }
  };

  // Handle PDF Upload & Replace
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeTimetable) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      showFeedback('error', 'Only PDF files can be uploaded for timetables.');
      return;
    }

    try {
      setUploadingPdf(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('timetableId', activeTimetable.id);
      formData.append('course', selectedCourse);

      const res = await fetch('/api/timetables/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showFeedback('success', `PDF for ${selectedCourse} uploaded and attached successfully.`);
        await loadData();
        if (onRefresh) onRefresh();
      } else {
        showFeedback('error', data.error || 'Failed to upload PDF.');
      }
    } catch (e: any) {
      showFeedback('error', e.message || 'Error uploading PDF.');
    } finally {
      setUploadingPdf(false);
      e.target.value = '';
    }
  };

  // Open Slot Editor
  const handleEditSlot = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setSlotSubject(slot.subject || '');
    setSlotGroup(slot.studentGroup || '');
    setSlotStartTime(slot.startTime || '');
    setSlotEndTime(slot.endTime || '');
    setSlotType(slot.slotType || 'class');
    setSlotRoom(slot.room || '');
    setSlotNotes(slot.notes || '');
    setIsSlotModalOpen(true);
  };

  // Save Slot Edit
  const handleSaveSlot = async () => {
    if (!activeTimetable || !editingSlot) return;

    const updatedSlots = (activeTimetable.slots || []).map((s) => {
      if (s.id === editingSlot.id) {
        return {
          ...s,
          subject: slotSubject.trim(),
          studentGroup: slotGroup.trim() || undefined,
          startTime: slotStartTime.trim(),
          endTime: slotEndTime.trim(),
          slotType: slotType,
          room: slotRoom.trim() || undefined,
          notes: slotNotes.trim() || undefined,
        };
      }
      return s;
    });

    try {
      setSaving(true);
      const res = await fetch(`/api/timetables/${activeTimetable.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slots: updatedSlots }),
      });

      if (res.ok) {
        showFeedback('success', 'Timetable slot updated successfully.');
        setIsSlotModalOpen(false);
        await loadData();
        if (onRefresh) onRefresh();
      } else {
        const err = await res.json();
        showFeedback('error', err.error || 'Failed to update slot.');
      }
    } catch (e: any) {
      showFeedback('error', e.message || 'Error saving slot.');
    } finally {
      setSaving(false);
    }
  };

  // Open Override Modal for a specific slot
  const handleOpenOverride = (slot?: TimetableSlot) => {
    setOverrideSlotId(slot ? slot.id : '');
    setOverrideStatus('POSTPONED');
    setOverrideReason('');
    setOverrideReschedDate('');
    setOverrideReschedStartTime('');
    setOverrideReschedEndTime('');
    setIsOverrideModalOpen(true);
  };

  // Save Override
  const handleSaveOverride = async () => {
    if (!activeTimetable) return;

    try {
      setSaving(true);
      const res = await fetch('/api/timetables/overrides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timetableId: activeTimetable.id,
          timetableSlotId: overrideSlotId || undefined,
          course: selectedCourse,
          exceptionDate: overrideDate,
          status: overrideStatus,
          reason: overrideReason,
          rescheduledDate: overrideReschedDate || undefined,
          rescheduledStartTime: overrideReschedStartTime || undefined,
          rescheduledEndTime: overrideReschedEndTime || undefined,
          isActive: true,
        }),
      });

      if (res.ok) {
        showFeedback(
          'success',
          `Class marked ${overrideStatus.toLowerCase()} for ${overrideDate}. Live status will reflect this immediately.`
        );
        setIsOverrideModalOpen(false);
        await loadData();
        if (onRefresh) onRefresh();
      } else {
        const err = await res.json();
        showFeedback('error', err.error || 'Failed to create override.');
      }
    } catch (e: any) {
      showFeedback('error', e.message || 'Error creating override.');
    } finally {
      setSaving(false);
    }
  };

  // Delete/Clear Override
  const handleDeleteOverride = async (id: string) => {
    try {
      setSaving(true);
      const res = await fetch(`/api/timetables/overrides/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        showFeedback('success', 'Override cleared. Automatic timetable status restored.');
        setDeleteConfirm(null);
        await loadData();
        if (onRefresh) onRefresh();
      } else {
        const err = await res.json();
        showFeedback('error', err.error || 'Failed to clear override.');
      }
    } catch (e: any) {
      showFeedback('error', e.message || 'Error clearing override.');
    } finally {
      setSaving(false);
    }
  };

  // Filtered slots for currently selected day
  const filteredSlots = (activeTimetable?.slots || []).filter(
    (s) => s.dayOfWeek.toLowerCase() === filterDay.toLowerCase()
  );

  // Active overrides for this course
  const courseOverrides = overrides.filter(
    (o) => !o.course || o.course === selectedCourse
  );

  return (
    <div className="space-y-8">
      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-sm font-medium flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs font-bold uppercase tracking-wider text-white/70 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Controls: Course Selector & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-surface border border-white/10">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-ucr-orange" />
            <span>Foundation Timetable Management</span>
          </h2>
          <p className="text-xs text-text-muted mt-1">
            Manage weekly schedules, time bands, source PDFs, and live lecture postponement overrides.
          </p>
        </div>

        {/* Course Tabs: TPOPT vs TPRPT */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedCourse('TPOPT')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              selectedCourse === 'TPOPT'
                ? 'bg-orange-500 text-white shadow-orange-glow'
                : 'bg-surface-lighter text-text-secondary hover:text-white border border-white/10'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>TPOPT</span>
          </button>

          <button
            onClick={() => setSelectedCourse('TPRPT')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              selectedCourse === 'TPRPT'
                ? 'bg-sky-500 text-white shadow-blue-glow'
                : 'bg-surface-lighter text-text-secondary hover:text-white border border-white/10'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>TPRPT</span>
          </button>

          <button
            onClick={loadData}
            title="Refresh database records"
            className="p-2.5 rounded-xl bg-surface-lighter hover:bg-surface-hover border border-white/10 text-text-secondary hover:text-white transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-ucr-orange' : ''}`} />
          </button>
        </div>
      </div>

      {/* Section 1: Timetable Metadata & Source PDF Upload */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Metadata Editor (Title, Subtitle, Batch, Publish state) */}
        <div className="lg:col-span-8 p-6 sm:p-7 rounded-3xl bg-surface border border-white/10 space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-ucr-orange" />
              <span>Timetable Metadata ({selectedCourse})</span>
            </h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={metaPublished}
                onChange={(e) => setMetaPublished(e.target.checked)}
                className="w-4 h-4 rounded text-ucr-orange focus:ring-ucr-orange bg-[#091728] border-white/20"
              />
              <span className="text-xs font-semibold text-slate-300">
                {metaPublished ? 'Published (Live)' : 'Unpublished (Draft)'}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-text-muted">Timetable Headline / Title</label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Academic Time Table – Foundation Programme – 11th Batch"
                className="w-full px-4 py-2.5 rounded-xl bg-[#091728] border border-white/10 text-white text-sm focus:border-ucr-orange outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-muted">Course Subtitle</label>
              <input
                type="text"
                value={metaSubtitle}
                onChange={(e) => setMetaSubtitle(e.target.value)}
                placeholder="Television & Digital Media Post Production Technology"
                className="w-full px-4 py-2.5 rounded-xl bg-[#091728] border border-white/10 text-white text-sm focus:border-ucr-orange outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-muted">Batch Label</label>
              <input
                type="text"
                value={metaBatch}
                onChange={(e) => setMetaBatch(e.target.value)}
                placeholder="11th Batch"
                className="w-full px-4 py-2.5 rounded-xl bg-[#091728] border border-white/10 text-white text-sm focus:border-ucr-orange outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSaveMetadata}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-ucr-orange hover:bg-ucr-orange-hover transition-colors shadow-orange-glow disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Headline & Settings'}</span>
            </button>
          </div>
        </div>

        {/* Right: PDF Upload & Replacement */}
        <div className="lg:col-span-4 p-6 sm:p-7 rounded-3xl bg-surface border border-white/10 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-ucr-orange" />
              <span>Source PDF Document</span>
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Upload a new official PDF schedule for <strong>{selectedCourse}</strong>. This replaces the downloadable file in student view.
            </p>

            {activeTimetable?.pdfUrl ? (
              <div className="p-3 rounded-xl bg-[#091728] border border-white/10 text-xs space-y-1">
                <span className="text-text-muted block font-mono text-[10px] truncate">
                  Current: {activeTimetable.pdfUrl}
                </span>
                <a
                  href={activeTimetable.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ucr-orange hover:underline font-semibold inline-flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview Active PDF</span>
                </a>
              </div>
            ) : (
              <div className="text-xs text-text-muted">Using default repository PDF.</div>
            )}
          </div>

          <div>
            <label className="block w-full">
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handlePdfUpload}
                disabled={uploadingPdf}
                className="hidden"
                id={`pdf-upload-${selectedCourse}`}
              />
              <span className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 border border-white/15 cursor-pointer transition-all active:scale-95 text-center">
                <Upload className="w-4 h-4 text-ucr-orange" />
                <span>{uploadingPdf ? 'Uploading PDF...' : `Replace ${selectedCourse} PDF`}</span>
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Section 2: Date-Specific Overrides (Postponements & Cancellations) */}
      <div className="p-6 sm:p-7 rounded-3xl bg-surface border border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Lecture Overrides &amp; Postponements ({selectedCourse})</span>
            </h3>
            <p className="text-xs text-text-muted mt-1">
              Mark scheduled classes Postponed or Unavailable for a specific date without modifying base timetable data.
            </p>
          </div>

          <button
            onClick={() => handleOpenOverride()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-amber-500 hover:bg-amber-600 transition-colors shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Postponement Override</span>
          </button>
        </div>

        {courseOverrides.length === 0 ? (
          <div className="text-center py-8 rounded-2xl bg-[#091728]/50 border border-dashed border-white/10 text-xs text-text-muted">
            No active postponement or cancellation overrides for {selectedCourse}. The Home page is running 100% on the automatic published timetable.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-text-muted uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Target</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Admin Reason</th>
                  <th className="py-2.5 px-3">Rescheduled Date/Time</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {courseOverrides.map((ov) => {
                  const matchingSlot = (activeTimetable?.slots || []).find(
                    (s) => s.id === ov.timetableSlotId
                  );
                  return (
                    <tr key={ov.id} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-3 font-mono font-semibold text-white">
                        {ov.exceptionDate}
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {matchingSlot ? (
                          <span>
                            {matchingSlot.subject} ({matchingSlot.dayOfWeek} {matchingSlot.startTime})
                          </span>
                        ) : (
                          <span>Entire {ov.course || 'Course'} Schedule</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            ov.status === 'POSTPONED'
                              ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          }`}
                        >
                          {ov.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-text-secondary max-w-xs truncate">
                        {ov.reason || '—'}
                      </td>
                      <td className="py-3 px-3 text-text-muted">
                        {ov.rescheduledDate
                          ? `${ov.rescheduledDate} ${ov.rescheduledStartTime || ''}`
                          : '—'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() =>
                            setDeleteConfirm({
                              type: 'override',
                              id: ov.id,
                              title: `Clear override for ${ov.exceptionDate}? Automatic timetable status will be restored immediately.`,
                            })
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-600/80 border border-rose-500/20 transition-all"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Clear Override</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 3: Slot-by-Slot Timetable Editor */}
      <div className="p-6 sm:p-7 rounded-3xl bg-surface border border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-ucr-orange" />
              <span>Weekly Time Slots Editor ({selectedCourse})</span>
            </h3>
            <p className="text-xs text-text-muted mt-1">
              Edit subject name, student group applicability (A/L, NVQ), start/end times, and breaks.
            </p>
          </div>

          {/* Day of Week Filter Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            {DAYS_OF_WEEK.map((day) => (
              <button
                key={day}
                onClick={() => setFilterDay(day)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  filterDay === day
                    ? 'bg-ucr-orange text-white'
                    : 'bg-surface-lighter text-text-secondary hover:text-white border border-white/10'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Slot Table for selected day */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-white/10 text-text-muted uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Time Band</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Subject / Activity</th>
                <th className="py-3 px-3">Target Student Group</th>
                <th className="py-3 px-3">Room / Notes</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredSlots.map((slot) => {
                const isBreak = slot.slotType === 'break' || slot.slotType === 'lunch';
                return (
                  <tr
                    key={slot.id}
                    className={`hover:bg-white/[0.02] transition-colors ${
                      isBreak ? 'bg-amber-950/15' : ''
                    }`}
                  >
                    <td className="py-3.5 px-3 font-mono text-xs text-white whitespace-nowrap">
                      {slot.startTime} – {slot.endTime}
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          slot.slotType === 'class'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : slot.slotType === 'lunch'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : slot.slotType === 'break'
                            ? 'bg-orange-500/15 text-orange-300 border border-orange-500/30'
                            : 'bg-slate-500/15 text-slate-400 border border-white/10'
                        }`}
                      >
                        {slot.slotType}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-bold text-white">
                      {slot.subject ? slot.subject : <span className="text-text-muted/40 font-normal">Blank</span>}
                    </td>

                    <td className="py-3.5 px-3 text-xs text-slate-300">
                      {slot.studentGroup ? (
                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                          {slot.studentGroup}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-xs text-text-muted">
                      {slot.room || slot.notes || '—'}
                    </td>

                    <td className="py-3.5 px-3 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleEditSlot(slot)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/15 border border-white/10 transition-colors"
                      >
                        <Edit2 className="w-3 h-3 text-ucr-orange" />
                        <span>Edit</span>
                      </button>

                      {slot.slotType === 'class' && slot.subject && (
                        <button
                          onClick={() => handleOpenOverride(slot)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-300 hover:text-white bg-amber-500/10 hover:bg-amber-500/30 border border-amber-500/20 transition-colors"
                          title="Postpone this class for today or a specific date"
                        >
                          <AlertTriangle className="w-3 h-3" />
                          <span>Postpone</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================
          MODAL: EDIT TIMETABLE SLOT
          ======================================================== */}
      {editingSlot && (
        <Modal
          isOpen={isSlotModalOpen}
          onClose={() => setIsSlotModalOpen(false)}
          title={`Edit Slot: ${editingSlot.dayOfWeek} (${slotStartTime} – ${slotEndTime})`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-muted">Start Time (24h)</label>
                <input
                  type="text"
                  value={slotStartTime}
                  onChange={(e) => setSlotStartTime(e.target.value)}
                  placeholder="08:30"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#091728] border border-white/10 text-white text-sm outline-none focus:border-ucr-orange"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-muted">End Time (24h)</label>
                <input
                  type="text"
                  value={slotEndTime}
                  onChange={(e) => setSlotEndTime(e.target.value)}
                  placeholder="09:30"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#091728] border border-white/10 text-white text-sm outline-none focus:border-ucr-orange"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-muted">Slot Category Type</label>
              <select
                value={slotType}
                onChange={(e) => setSlotType(e.target.value as SlotType)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#091728] border border-white/10 text-white text-sm outline-none focus:border-ucr-orange"
              >
                <option value="class">Class / Academic Lecture</option>
                <option value="break">Interval / Tea Break</option>
                <option value="lunch">Lunch Break</option>
                <option value="empty">Empty / Blank Slot</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-muted">Subject / Lecture Title</label>
              <input
                type="text"
                value={slotSubject}
                onChange={(e) => setSlotSubject(e.target.value)}
                placeholder="e.g. ENGLISH, Gaffer, DM7, NVQ Physics I,II"
                className="w-full px-3.5 py-2 rounded-xl bg-[#091728] border border-white/10 text-white text-sm outline-none focus:border-ucr-orange"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-muted">Target Student Group</label>
              <input
                type="text"
                value={slotGroup}
                onChange={(e) => setSlotGroup(e.target.value)}
                placeholder="e.g. A/L Students, NVQ Students, A/L & NVQ Students"
                className="w-full px-3.5 py-2 rounded-xl bg-[#091728] border border-white/10 text-white text-sm outline-none focus:border-ucr-orange"
              />
              <div className="flex gap-2 pt-1 text-[11px] text-text-muted">
                <span>Presets:</span>
                <button
                  type="button"
                  onClick={() => setSlotGroup('A/L Students')}
                  className="text-ucr-orange hover:underline"
                >
                  A/L Students
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setSlotGroup('NVQ Students')}
                  className="text-ucr-orange hover:underline"
                >
                  NVQ Students
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setSlotGroup('A/L & NVQ Students')}
                  className="text-ucr-orange hover:underline"
                >
                  A/L &amp; NVQ Students
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-muted">Studio / Room Location (Optional)</label>
              <input
                type="text"
                value={slotRoom}
                onChange={(e) => setSlotRoom(e.target.value)}
                placeholder="e.g. Studio 01, NLE Suite 2 (leave blank if unspecified)"
                className="w-full px-3.5 py-2 rounded-xl bg-[#091728] border border-white/10 text-white text-sm outline-none focus:border-ucr-orange"
              />
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsSlotModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveSlot}
                disabled={saving}
                className="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-ucr-orange hover:bg-ucr-orange-hover transition-colors shadow-orange-glow disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Update Slot'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================
          MODAL: CREATE POSTPONEMENT / UNAVAILABLE OVERRIDE
          ======================================================== */}
      {isOverrideModalOpen && (
        <Modal
          isOpen={isOverrideModalOpen}
          onClose={() => setIsOverrideModalOpen(false)}
          title={`Create Status Override (${selectedCourse})`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
              Overrides apply to the specified date without altering the permanent weekly timetable structure.
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-muted">Exception Date (YYYY-MM-DD)</label>
              <input
                type="date"
                value={overrideDate}
                onChange={(e) => setOverrideDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#091728] border border-white/10 text-white text-sm outline-none focus:border-ucr-orange"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-muted">Target Slot</label>
              <select
                value={overrideSlotId}
                onChange={(e) => setOverrideSlotId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#091728] border border-white/10 text-white text-sm outline-none focus:border-ucr-orange"
              >
                <option value="">All scheduled slots on this date</option>
                {(activeTimetable?.slots || [])
                  .filter((s) => s.slotType === 'class' && Boolean(s.subject))
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.dayOfWeek} {s.startTime}–{s.endTime}: {s.subject} ({s.studentGroup || 'All'})
                    </option>
                  ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-muted">Override Status</label>
              <select
                value={overrideStatus}
                onChange={(e) => setOverrideStatus(e.target.value as OverrideStatus)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#091728] border border-white/10 text-white text-sm outline-none focus:border-ucr-orange"
              >
                <option value="POSTPONED">Postponed</option>
                <option value="UNAVAILABLE">Unavailable / Cancelled</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-muted">Official Reason / Student Notice</label>
              <textarea
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                rows={3}
                placeholder="e.g. Studio electrical maintenance; lecturer attending university senate meeting."
                className="w-full px-3.5 py-2 rounded-xl bg-[#091728] border border-white/10 text-white text-sm outline-none focus:border-ucr-orange resize-none"
              />
            </div>

            {overrideStatus === 'POSTPONED' && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-text-muted">Rescheduled Date (Optional)</label>
                  <input
                    type="date"
                    value={overrideReschedDate}
                    onChange={(e) => setOverrideReschedDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#091728] border border-white/10 text-white text-xs outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-muted">Rescheduled Start</label>
                  <input
                    type="text"
                    value={overrideReschedStartTime}
                    onChange={(e) => setOverrideReschedStartTime(e.target.value)}
                    placeholder="10:40"
                    className="w-full px-3 py-2 rounded-xl bg-[#091728] border border-white/10 text-white text-xs outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-muted">Rescheduled End</label>
                  <input
                    type="text"
                    value={overrideReschedEndTime}
                    onChange={(e) => setOverrideReschedEndTime(e.target.value)}
                    placeholder="12:40"
                    className="w-full px-3 py-2 rounded-xl bg-[#091728] border border-white/10 text-white text-xs outline-none"
                  />
                </div>
              </div>
            )}

            <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsOverrideModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveOverride}
                disabled={saving}
                className="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-amber-500 hover:bg-amber-600 transition-colors shadow-sm disabled:opacity-50"
              >
                {saving ? 'Applying...' : 'Apply Override'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Modal */}
      {deleteConfirm && (
        <ConfirmModal
          isOpen={Boolean(deleteConfirm)}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={() => handleDeleteOverride(deleteConfirm.id)}
          title="Restore Automatic Status"
          message={deleteConfirm.title}
          confirmLabel="Yes, Clear Override"
          isDestructive={true}
        />
      )}
    </div>
  );
}
