'use client';

import React from 'react';
import { Lecturer, LecturerSectionSettings } from '@/lib/types';
import { Award, Sparkles, Tv, Video, GraduationCap } from 'lucide-react';

interface LecturersSectionProps {
  lecturers?: Lecturer[];
  settings?: LecturerSectionSettings;
}

const DEFAULT_LECTURERS: Lecturer[] = [
  {
    id: 'lec-1',
    name: 'Ms. Teroshani Dahanayake',
    designation: 'Division Head',
    roleType: 'head',
    specialization: 'Media Studies, Television Programming & Broadcast Management',
    profileImageUrl: '/images/lecturers/teroshani_dahanayake.jpg',
    sortOrder: 1,
  },
  {
    id: 'lec-2',
    name: 'Mr. H.R.P. Lal',
    designation: 'Lecturer',
    roleType: 'lecturer',
    specialization: 'Television Studio Production, Multi-Camera Directing & Vision Mixing',
    profileImageUrl: '/images/lecturers/hrp_lal.jpg',
    sortOrder: 2,
  },
  {
    id: 'lec-3',
    name: 'Ms. Nirmani Perera',
    designation: 'Lecturer',
    roleType: 'lecturer',
    specialization: 'Digital Post-Production, Non-Linear Editing & Motion Graphics',
    profileImageUrl: '/images/lecturers/nirmani_perera.jpg',
    sortOrder: 3,
  },
  {
    id: 'lec-4',
    name: 'Mr. Oshan Lakshitha',
    designation: 'Lecturer',
    roleType: 'lecturer',
    specialization: 'Digital Cinematography, Sound Engineering & Field Production',
    profileImageUrl: '/images/lecturers/oshan_lakshitha.jpg',
    sortOrder: 4,
  },
];

export default function LecturersSection({
  lecturers = DEFAULT_LECTURERS,
  settings,
}: LecturersSectionProps) {
  const getSpecializationIcon = (roleType: string) => {
    switch (roleType) {
      case 'head':
        return <Award className="w-3.5 h-3.5 text-amber-400" />;
      case 'senior_lecturer':
        return <Tv className="w-3.5 h-3.5 text-ucr-orange" />;
      default:
        return <Video className="w-3.5 h-3.5 text-sky-400" />;
    }
  };

  const getCardTheme = (roleType: string) => {
    if (roleType === 'head') {
      return {
        badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        badgeText: 'Division Head',
        border: 'border-amber-500/30 hover:border-amber-500/60',
        glow: 'hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.25)]',
        accentText: 'text-amber-400',
        gradient: 'from-amber-500/10 via-transparent to-transparent',
      };
    }
    if (roleType === 'senior_lecturer') {
      return {
        badgeBg: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
        badgeText: 'Senior Lecturer',
        border: 'border-orange-500/25 hover:border-orange-500/50',
        glow: 'hover:shadow-orange-glow/30',
        accentText: 'text-ucr-orange',
        gradient: 'from-orange-500/10 via-transparent to-transparent',
      };
    }
    return {
      badgeBg: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
      badgeText: 'Lecturer',
      border: 'border-sky-500/25 hover:border-sky-500/50',
      glow: 'hover:shadow-blue-glow/30',
      accentText: 'text-sky-400',
      gradient: 'from-sky-500/10 via-transparent to-transparent',
    };
  };

  return (
    <section id="lecturers" className="py-20 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-ucr-orange/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <GraduationCap className="w-4 h-4 text-ucr-orange" />
            <span>{settings?.badgeText || 'Academic Faculty'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {settings?.title || 'Academic Lecturers'}
          </h2>

          <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
            {settings?.description ||
              'Distinguished television industry practitioners, directors, and academic scholars of the Division of Television Studies at University College of Rathmalana.'}
          </p>
        </div>

        {/* Lecturers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {lecturers.map((lecturer) => {
            const theme = getCardTheme(lecturer.roleType);
            return (
              <div
                key={lecturer.id}
                className={`group rounded-3xl bg-[#091728] border ${theme.border} ${theme.glow} transition-all duration-300 flex flex-col justify-between overflow-hidden relative shadow-card`}
              >
                {/* Subtle top gradient accent */}
                <div className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-b ${theme.gradient} pointer-events-none`} />

                <div>
                  {/* Photo Container */}
                  <div className="relative aspect-square w-full overflow-hidden bg-black/40 border-b border-white/10">
                    <img
                      src={lecturer.profileImageUrl}
                      alt={lecturer.name}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Role Badge pill overlaid */}
                    <div className="absolute top-3 right-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border backdrop-blur-md shadow-lg ${theme.badgeBg}`}>
                        <Sparkles className="w-3 h-3" />
                        <span>{theme.badgeText}</span>
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-white transition-colors leading-tight">
                        {lecturer.name}
                      </h3>
                      <p className={`text-xs font-semibold mt-1 ${theme.accentText}`}>
                        {lecturer.designation}
                      </p>
                    </div>

                    {/* Specialization Box */}
                    <div className="p-3 rounded-xl bg-surface/80 border border-white/5 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-text-muted">
                        {getSpecializationIcon(lecturer.roleType)}
                        <span>Specialization</span>
                      </div>
                      <p className="text-xs font-medium text-slate-200 leading-snug">
                        {lecturer.specialization}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
