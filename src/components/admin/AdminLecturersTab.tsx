'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Lecturer, LecturerSectionSettings } from '@/lib/types';
import Modal from '@/components/Modal';
import ConfirmModal from '@/components/ConfirmModal';
import {
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Save,
  CheckCircle2,
  AlertCircle,
  Award,
  Tv,
  Video,
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
  ArrowUpDown,
} from 'lucide-react';

interface AdminLecturersTabProps {
  onRefresh?: () => void;
}

export default function AdminLecturersTab({ onRefresh }: AdminLecturersTabProps) {
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [settings, setSettings] = useState<LecturerSectionSettings>({
    badgeText: 'Academic Faculty',
    title: 'Academic Lecturers',
    description:
      'Distinguished television industry practitioners, directors, and academic scholars of the Division of Television Studies at University College of Rathmalana.',
  });
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingLecturer, setSavingLecturer] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Section header form state
  const [badgeText, setBadgeText] = useState('');
  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionDescription, setSectionDescription] = useState('');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLecturer, setEditingLecturer] = useState<Lecturer | null>(null);

  // Lecturer Form State
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [roleType, setRoleType] = useState<'head' | 'senior_lecturer' | 'lecturer'>('lecturer');
  const [specialization, setSpecialization] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [sortOrder, setSortOrder] = useState<number>(1);

  // Delete Confirm State
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 5000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/lecturers');
      const data = await res.json();
      if (data.lecturers) {
        setLecturers(data.lecturers);
      }
      if (data.settings) {
        setSettings(data.settings);
        setBadgeText(data.settings.badgeText || 'Academic Faculty');
        setSectionTitle(data.settings.title || 'Academic Lecturers');
        setSectionDescription(data.settings.description || '');
      }
    } catch (err) {
      console.error('Failed to load lecturers in admin:', err);
      showFeedback('error', 'Failed to load lecturers from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save Section Settings (Headline, Badge, Description)
  const handleSaveSectionSettings = async () => {
    try {
      setSavingSettings(true);
      const res = await fetch('/api/lecturers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          badgeText,
          title: sectionTitle,
          description: sectionDescription,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSettings(data.settings);
        showFeedback('success', 'Lecture section headline and description updated successfully.');
        if (onRefresh) onRefresh();
      } else {
        showFeedback('error', data.error || 'Failed to update section settings.');
      }
    } catch (e: any) {
      showFeedback('error', e.message || 'Error updating section settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  // Open modal for new lecturer
  const handleOpenAdd = () => {
    setEditingLecturer(null);
    setName('');
    setDesignation('Lecturer');
    setRoleType('lecturer');
    setSpecialization('');
    setProfileImageUrl('/images/lecturers/teroshani_dahanayake.jpg');
    setSortOrder(lecturers.length + 1);
    setIsModalOpen(true);
  };

  // Open modal for editing existing lecturer
  const handleOpenEdit = (l: Lecturer) => {
    setEditingLecturer(l);
    setName(l.name);
    setDesignation(l.designation);
    setRoleType(l.roleType);
    setSpecialization(l.specialization);
    setProfileImageUrl(l.profileImageUrl);
    setSortOrder(l.sortOrder);
    setIsModalOpen(true);
  };

  // Handle Photo Upload via /api/upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'lecturers');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setProfileImageUrl(data.url);
        showFeedback('success', 'Profile photo uploaded successfully.');
      } else {
        showFeedback('error', data.error || 'Photo upload failed.');
      }
    } catch (err: any) {
      showFeedback('error', err.message || 'Photo upload error.');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  // Save Lecturer (Create or Update)
  const handleSaveLecturer = async () => {
    if (!name.trim()) {
      showFeedback('error', 'Lecturer name is required.');
      return;
    }
    if (!designation.trim()) {
      showFeedback('error', 'Designation is required.');
      return;
    }
    if (!specialization.trim()) {
      showFeedback('error', 'Specialization details are required.');
      return;
    }

    try {
      setSavingLecturer(true);
      const payload = {
        name: name.trim(),
        designation: designation.trim(),
        roleType,
        specialization: specialization.trim(),
        profileImageUrl: profileImageUrl.trim() || '/images/lecturers/teroshani_dahanayake.jpg',
        sortOrder: Number(sortOrder) || 1,
      };

      let res: Response;
      if (editingLecturer) {
        res = await fetch(`/api/lecturers/${editingLecturer.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/lecturers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (res.ok && data.success) {
        showFeedback(
          'success',
          editingLecturer
            ? `Updated ${name} details successfully.`
            : `Added ${name} to academic faculty successfully.`
        );
        setIsModalOpen(false);
        await loadData();
        if (onRefresh) onRefresh();
      } else {
        showFeedback('error', data.error || 'Failed to save lecturer.');
      }
    } catch (e: any) {
      showFeedback('error', e.message || 'Error saving lecturer.');
    } finally {
      setSavingLecturer(false);
    }
  };

  // Delete Lecturer
  const handleDeleteLecturer = async (id: string) => {
    try {
      const res = await fetch(`/api/lecturers/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showFeedback('success', 'Lecturer removed successfully.');
        setDeleteConfirm(null);
        await loadData();
        if (onRefresh) onRefresh();
      } else {
        showFeedback('error', data.error || 'Failed to delete lecturer.');
      }
    } catch (e: any) {
      showFeedback('error', e.message || 'Error deleting lecturer.');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'head':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <Award className="w-3 h-3" />
            <span>Division Head</span>
          </span>
        );
      case 'senior_lecturer':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-orange-500/15 text-orange-300 border border-orange-500/30 flex items-center gap-1">
            <Tv className="w-3 h-3" />
            <span>Senior Lecturer</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-sky-500/15 text-sky-300 border border-sky-500/30 flex items-center gap-1">
            <Video className="w-3 h-3" />
            <span>Lecturer</span>
          </span>
        );
    }
  };

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

      {/* Top Banner & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-surface border border-white/10">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-ucr-orange" />
            <span>Academic Faculty &amp; Lecturers Administration</span>
          </h2>
          <p className="text-xs text-text-muted mt-1">
            Manage the Home page Academic Lecturers section, specializations, profile photos, designations, and display ordering.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-ucr-orange hover:bg-ucr-orange-hover transition-colors shadow-orange-glow active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lecturer</span>
          </button>

          <button
            onClick={loadData}
            title="Refresh records from database"
            className="p-2.5 rounded-xl bg-surface-lighter hover:bg-surface-hover border border-white/10 text-text-secondary hover:text-white transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-ucr-orange' : ''}`} />
          </button>
        </div>
      </div>

      {/* ========================================================
          1. SECTION HEADLINE & SUBTITLE EDITOR
          ======================================================== */}
      <div className="p-6 sm:p-7 rounded-3xl bg-surface border border-white/10 space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-ucr-orange" />
              <span>Home Page Lecture Section Header</span>
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Customize the section badge, headline, and descriptive intro rendered on the public Home page.
            </p>
          </div>

          <button
            onClick={handleSaveSectionSettings}
            disabled={savingSettings}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-all shadow-sm disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5 text-ucr-orange" />
            <span>{savingSettings ? 'Saving...' : 'Save Section Header'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-muted">Top Badge Text</label>
            <input
              type="text"
              value={badgeText}
              onChange={(e) => setBadgeText(e.target.value)}
              placeholder="Academic Faculty"
              className="w-full px-4 py-2.5 rounded-xl bg-[#091728] border border-white/10 text-white text-sm outline-none focus:border-ucr-orange"
            />
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-semibold text-text-muted">Main Section Headline</label>
            <input
              type="text"
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              placeholder="Academic Lecturers"
              className="w-full px-4 py-2.5 rounded-xl bg-[#091728] border border-white/10 text-white text-sm outline-none focus:border-ucr-orange"
            />
          </div>

          <div className="md:col-span-3 space-y-1">
            <label className="text-xs font-semibold text-text-muted">Introductory Description</label>
            <textarea
              value={sectionDescription}
              onChange={(e) => setSectionDescription(e.target.value)}
              rows={2}
              placeholder="Distinguished television industry practitioners, directors, and academic scholars..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#091728] border border-white/10 text-white text-sm outline-none focus:border-ucr-orange resize-none"
            />
          </div>
        </div>
      </div>

      {/* ========================================================
          2. LECTURERS CARDS GRID
          ======================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Current Faculty Lecturers ({lecturers.length})
          </h3>
          <span className="text-xs text-text-muted">Ordered by display priority</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {lecturers.map((lecturer) => (
            <div
              key={lecturer.id}
              className="group rounded-3xl bg-surface border border-white/10 overflow-hidden flex flex-col justify-between hover:border-white/20 transition-all shadow-card hover:-translate-y-1"
            >
              <div>
                {/* Photo Header */}
                <div className="relative aspect-square w-full bg-black/40 overflow-hidden border-b border-white/10">
                  <img
                    src={lecturer.profileImageUrl}
                    alt={lecturer.name}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3">
                    {getRoleBadge(lecturer.roleType)}
                  </div>
                  <div className="absolute bottom-2 left-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-mono text-slate-300 border border-white/10">
                    Order #{lecturer.sortOrder}
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 space-y-3">
                  <div>
                    <h4 className="text-base font-bold text-white group-hover:text-ucr-orange transition-colors">
                      {lecturer.name}
                    </h4>
                    <p className="text-xs font-semibold text-slate-300 mt-0.5">
                      {lecturer.designation}
                    </p>
                  </div>

                  {/* Specialization Box */}
                  <div className="p-3 rounded-2xl bg-[#091728] border border-white/5 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                      Specialization
                    </span>
                    <p className="text-xs text-text-secondary leading-snug">
                      {lecturer.specialization}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 bg-[#06111F]/50 border-t border-white/5 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleOpenEdit(lecturer)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 text-ucr-orange" />
                  <span>Edit Details</span>
                </button>

                <button
                  onClick={() =>
                    setDeleteConfirm({
                      id: lecturer.id,
                      name: lecturer.name,
                    })
                  }
                  title={`Delete ${lecturer.name}`}
                  className="p-2 rounded-xl text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-600/80 border border-rose-500/20 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================
          3. ADD / EDIT LECTURER MODAL
          ======================================================== */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingLecturer ? `Edit Lecturer: ${editingLecturer.name}` : 'Add New Academic Lecturer'}
          maxWidth="xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-text-muted">Full Name &amp; Title *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ms. Teroshani Dahanayake"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#091728] border border-white/10 text-white text-sm outline-none focus:border-ucr-orange"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-muted">Designation Label *</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Division Head, Senior Lecturer, Lecturer"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#091728] border border-white/10 text-white text-sm outline-none focus:border-ucr-orange"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-muted">Role Category Type *</label>
                <select
                  value={roleType}
                  onChange={(e) => setRoleType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#091728] border border-white/10 text-white text-sm outline-none focus:border-ucr-orange"
                >
                  <option value="head">Division Head (Amber Accent)</option>
                  <option value="senior_lecturer">Senior Lecturer (Orange Accent)</option>
                  <option value="lecturer">Lecturer (Blue Accent)</option>
                </select>
              </div>

              {/* Specialization Textarea */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-text-muted">
                  Academic &amp; Professional Specialization *
                </label>
                <textarea
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  rows={2}
                  placeholder="e.g. Media Studies, Television Programming & Broadcast Management"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#091728] border border-white/10 text-white text-sm outline-none focus:border-ucr-orange resize-none"
                />
                {/* Quick Preset Buttons */}
                <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] text-text-muted">
                  <span>Quick Presets:</span>
                  <button
                    type="button"
                    onClick={() =>
                      setSpecialization('Media Studies, Television Programming & Broadcast Management')
                    }
                    className="text-ucr-orange hover:underline"
                  >
                    Broadcast Management
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() =>
                      setSpecialization('Television Studio Production, Multi-Camera Directing & Vision Mixing')
                    }
                    className="text-ucr-orange hover:underline"
                  >
                    Studio Directing
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() =>
                      setSpecialization('Digital Post-Production, Non-Linear Editing & Motion Graphics')
                    }
                    className="text-ucr-orange hover:underline"
                  >
                    Post-Production / NLE
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() =>
                      setSpecialization('Digital Cinematography, Broadcast Sound Engineering & Field Production')
                    }
                    className="text-ucr-orange hover:underline"
                  >
                    Cinematography & Sound
                  </button>
                </div>
              </div>

              {/* Profile Image URL & Upload */}
              <div className="sm:col-span-2 space-y-2">
                <label className="text-xs font-semibold text-text-muted">Profile Photo</label>
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-2xl bg-black/40 overflow-hidden border border-white/10 flex-shrink-0">
                    {profileImageUrl ? (
                      <img
                        src={profileImageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-muted">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <input
                      type="text"
                      value={profileImageUrl}
                      onChange={(e) => setProfileImageUrl(e.target.value)}
                      placeholder="/images/lecturers/name.jpg or cloud URL"
                      className="w-full px-3 py-2 rounded-xl bg-[#091728] border border-white/10 text-white text-xs outline-none focus:border-ucr-orange font-mono"
                    />

                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors">
                        <Upload className="w-3.5 h-3.5 text-ucr-orange" />
                        <span>{uploadingImage ? 'Uploading...' : 'Upload Image File'}</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handlePhotoUpload}
                          disabled={uploadingImage}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[11px] text-text-muted">Supports JPG, PNG, WEBP</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sort Order */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-muted">Display Sort Order</label>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#091728] border border-white/10 text-white text-sm outline-none focus:border-ucr-orange"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveLecturer}
                disabled={savingLecturer}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-ucr-orange hover:bg-ucr-orange-hover transition-colors shadow-orange-glow disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingLecturer ? 'Saving...' : editingLecturer ? 'Update Lecturer' : 'Save Lecturer'}</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <ConfirmModal
          isOpen={Boolean(deleteConfirm)}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={() => handleDeleteLecturer(deleteConfirm.id)}
          title="Remove Faculty Member"
          message={`Are you sure you want to remove ${deleteConfirm.name} from the academic faculty? This action cannot be undone.`}
          confirmLabel="Yes, Delete Lecturer"
          isDestructive={true}
        />
      )}
    </div>
  );
}
