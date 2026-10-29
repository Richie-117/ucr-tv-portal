import bcrypt from 'bcryptjs';
import { DatabaseSchema, Student, CourseModule, LearningStage, GalleryItem, DivisionEvent, Lecturer } from './types';

export const INITIAL_STAGES: LearningStage[] = [
  {
    id: 'stage-1',
    title: 'Foundation',
    description: 'Orientation to media technology, camera basics, and digital audio/video fundamentals.',
    sortOrder: 1,
    published: true,
  },
  {
    id: 'stage-2',
    title: 'NVQ Level 5 — Semester 1',
    description: 'Core television studio operations, single-camera shooting, lighting techniques, and introductory non-linear editing.',
    sortOrder: 2,
    published: true,
  },
  {
    id: 'stage-3',
    title: 'NVQ Level 5 — Semester 2',
    description: 'Multi-camera television directing, vision mixing, advanced post-production, motion graphics, and audio mastering.',
    sortOrder: 3,
    published: true,
  },
  {
    id: 'stage-4',
    title: 'OJT — 6 Months',
    description: 'First intensive On-the-Job Training placement at leading national television networks and production houses.',
    sortOrder: 4,
    published: true,
  },
  {
    id: 'stage-5',
    title: 'NVQ Level 5 — Remaining Semesters',
    description: 'Specialised capstone projects, broadcast engineering, media law & ethics, and final portfolio showcase.',
    sortOrder: 5,
    published: true,
  },
  {
    id: 'stage-6',
    title: 'OJT — 3 Months',
    description: 'Final industry transition internship and professional placement leading to national diploma qualification.',
    sortOrder: 6,
    published: true,
  },
];

// 29 TPOPT students (from course_names.txt)
const tpoptStudentsData = [
  { num: 1, name: 'D.G. Dissanayaka', gender: 'Male', rep: false },
  { num: 2, name: 'T.H. Maleesha', gender: 'Male', rep: false },
  { num: 3, name: 'P. Tharushika Nethmi', gender: 'Female', rep: true, repRole: 'Female Representative', phone: '+94 71 593 1820', notes: 'Appointed batch representative for TPOPT intake 2026.' },
  { num: 4, name: 'H.K. Praveen Moshaka', gender: 'Male', rep: false },
  { num: 5, name: 'P.A. Hesan Samudika', gender: 'Male', rep: true, repRole: 'Male Representative', phone: '+94 77 482 9104', photo: 'https://i.postimg.cc/CLZ7ckhZ/hesan.png', notes: 'Appointed batch representative for TPOPT intake 2026.' },
  { num: 6, name: 'J.L.S. Rithsara', gender: 'Male', rep: false },
  { num: 7, name: 'L.W. Sandas Nethra Lankaweera', gender: 'Male', rep: false },
  { num: 8, name: 'G. Vidusa Lakmini', gender: 'Female', rep: false },
  { num: 9, name: 'H.K.S.S. Habaraduwa', gender: 'Male', rep: false },
  { num: 10, name: 'R.P. Keshani Vimansa Rajapaksha', gender: 'Female', rep: false },
  { num: 11, name: 'A.L.A. Eshan Nimsara', gender: 'Male', rep: false },
  { num: 12, name: 'U.E.A. Wickramadasa', gender: 'Male', rep: false },
  { num: 13, name: 'P.A. Shalindi Geethma Perera', gender: 'Female', rep: false },
  { num: 14, name: 'W.A. Achintha Dineth Weerasooriya', gender: 'Male', rep: false },
  { num: 15, name: 'M.D. Chiranjeewani Ransimala', gender: 'Female', rep: false },
  { num: 16, name: 'T.R. Wickramarathna', gender: 'Male', rep: false },
  { num: 17, name: 'W. Kalana Latharu', gender: 'Male', rep: false },
  { num: 18, name: 'H.M. Siluni Raveesha', gender: 'Female', rep: false },
  { num: 19, name: 'A.D. Ruchira Sahan Samarasingha', gender: 'Male', rep: false },
  { num: 20, name: 'C.A. Nisansala', gender: 'Female', rep: false },
  { num: 21, name: 'K. Prabhash Manuja Janadhi', gender: 'Male', rep: false },
  { num: 22, name: 'H.P. Sakuni Harshani Samaraweera', gender: 'Female', rep: false },
  { num: 23, name: 'R.L. Kasun Sandeepa', gender: 'Male', rep: false },
  { num: 24, name: 'Y.H.P.N.D. Yapa', gender: 'Male', rep: false },
  { num: 25, name: 'B.B. Kaveesha Chamod Jayasekara', gender: 'Male', rep: false },
  { num: 26, name: 'H.D.U.T. Kumara', gender: 'Male', rep: false },
  { num: 27, name: 'W.G.K. Kalindu Praveen Charuka', gender: 'Male', rep: false },
  { num: 28, name: 'K.G. Pasindu Dilshan', gender: 'Male', rep: false },
  { num: 29, name: 'Chamitha', gender: 'Male', rep: false },
];

// 29 TPRPT students (from course_names.txt)
const tprptStudentsData = [
  { num: 1, name: 'F.D.R. Bandara', gender: 'Male', rep: false },
  { num: 2, name: 'M. Rafidh Rizwan', gender: 'Male', rep: true, repRole: 'Male Representative', phone: '+94 76 839 2041', notes: 'Appointed batch representative for TPRPT intake 2026.' },
  { num: 3, name: 'W.A.T.L. Abesekara', gender: 'Male', rep: false },
  { num: 4, name: 'D.M.A.D. Dissanayake', gender: 'Male', rep: false },
  { num: 5, name: 'A.D.R.S. Kumara', gender: 'Male', rep: false },
  { num: 6, name: 'A.G.A.M.H. Abydeera', gender: 'Male', rep: false },
  { num: 7, name: 'R.A.D.S.P. Gunasrkara', gender: 'Male', rep: false },
  { num: 8, name: 'R.A.K.P. Basnayaka', gender: 'Male', rep: false },
  { num: 9, name: 'H.A.M. Nindu Nimsara', gender: 'Male', rep: false },
  { num: 10, name: 'S.A.S.S. Samarasinghe', gender: 'Male', rep: false },
  { num: 11, name: 'M.M.T. Sankalpana', gender: 'Male', rep: false },
  { num: 12, name: 'S.A.N.V. Sankapala', gender: 'Male', rep: false },
  { num: 13, name: 'R.R.M.K.G.T. Vimal Aweera', gender: 'Male', rep: false },
  { num: 14, name: 'K.G. Isuru Madhusanka', gender: 'Male', rep: false },
  { num: 15, name: 'Yenuki Ruhansa Atapattu', gender: 'Female', rep: true, repRole: 'Female Representative', phone: '+94 70 318 4952', notes: 'Appointed batch representative for TPRPT intake 2026.' },
  { num: 16, name: 'R.P.S.N. Sahan Rathnasiri', gender: 'Male', rep: false },
  { num: 17, name: 'G.D.M. Rubasinghe', gender: 'Male', rep: false },
  { num: 18, name: 'W.A.D.T.K. Thilakarathna', gender: 'Male', rep: false },
  { num: 19, name: 'R.A.P.G. Karunarathna', gender: 'Male', rep: false },
  { num: 20, name: 'A.G.H.P. Dayarathna', gender: 'Male', rep: false },
  { num: 21, name: 'K.B.H. Udamya', gender: 'Female', rep: false },
  { num: 22, name: 'L.T.D. Rukshan', gender: 'Male', rep: false },
  { num: 23, name: 'J.M.D.N. Mannapperuma', gender: 'Male', rep: false },
  { num: 24, name: 'P.W.N.S. Karunarathne', gender: 'Male', rep: false },
  { num: 25, name: 'N.H.N. Pubudunee', gender: 'Female', rep: false },
  { num: 26, name: 'P.A. Danindu Naveendra', gender: 'Male', rep: false },
  { num: 27, name: 'H.R.M.N.K. Prebodika', gender: 'Female', rep: false },
  { num: 28, name: 'H.A.G. Gimhani', gender: 'Female', rep: false },
  { num: 29, name: 'T. Anushiyan', gender: 'Male', rep: false },
];

export function generateInitialStudents(): Student[] {
  const students: Student[] = [];

  // TPOPT: 29 students
  tpoptStudentsData.forEach((item) => {
    const num = String(item.num).padStart(3, '0');
    students.push({
      id: `student-tpopt-${num}`,
      fullName: item.name,
      studentNumber: `UCR/TPOPT/2026/${num}`,
      course: 'TPOPT',
      batch: 'Batch 11 — 2026',
      gender: item.gender as 'Male' | 'Female',
      isRepresentative: item.rep || false,
      representativeRole: item.repRole,
      phoneNumber: (item as any).phone,
      profileImageUrl: (item as any).photo,
      notes: item.notes,
      createdAt: '2026-01-15T08:30:00.000Z',
      updatedAt: '2026-10-24T04:20:00.000Z',
    });
  });

  // TPRPT: 29 students
  tprptStudentsData.forEach((item) => {
    const num = String(item.num).padStart(3, '0');
    students.push({
      id: `student-tprpt-${num}`,
      fullName: item.name,
      studentNumber: `UCR/TPRPT/2026/${num}`,
      course: 'TPRPT',
      batch: 'Batch 11 — 2026',
      gender: item.gender as 'Male' | 'Female',
      isRepresentative: item.rep || false,
      representativeRole: item.repRole,
      phoneNumber: (item as any).phone,
      notes: item.notes,
      createdAt: '2026-01-15T08:30:00.000Z',
      updatedAt: '2026-10-24T04:20:00.000Z',
    });
  });

  return students;
}

export const INITIAL_MODULES: CourseModule[] = [
  {
    id: 'mod-1',
    title: 'Non-Linear Video Editing & Workflow Systems',
    code: 'POST-5101',
    description: 'Comprehensive study of multi-track editing, proxy workflows, metadata asset management, audio-video synchronization, and professional delivery formats.',
    courseCodes: ['TPOPT'],
    learningStageId: 'stage-2',
    status: 'ongoing',
    thumbnailUrl: '/images/tpopt_cover.jpg',
    resources: [
      { title: 'NLE Editing Workflow Guide PDF', url: '#' },
      { title: 'Project Asset Management Best Practices', url: '#' }
    ],
    sortOrder: 1,
    published: true,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'mod-2',
    title: 'Multi-Camera Television Studio Production',
    code: 'PROD-5102',
    description: 'Practical training on TV studio floor protocols, camera pedestal operation, tally intercom systems, vision mixer cut/dissolve execution, and floor management.',
    courseCodes: ['TPRPT'],
    learningStageId: 'stage-2',
    status: 'ongoing',
    thumbnailUrl: '/images/tprpt_cover.jpg',
    resources: [
      { title: 'Studio Floor Operations & Safety Manual', url: '#' },
      { title: 'Vision Switcher Control Reference', url: '#' }
    ],
    sortOrder: 2,
    published: true,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'mod-3',
    title: 'Digital Audio Post-Production & Sound Design',
    code: 'AUD-5103',
    description: 'Dialogue cleanup, Foley sound recording, ambient track design, multi-channel mixing, loudness standards, and broadcast audio compliance.',
    courseCodes: ['TPOPT', 'TPRPT'],
    learningStageId: 'stage-2',
    status: 'ongoing',
    thumbnailUrl: '/images/about_control_room.jpg',
    resources: [
      { title: 'LUFS Broadcast Loudness Standards', url: '#' }
    ],
    sortOrder: 3,
    published: true,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'mod-4',
    title: 'Cinematic Lighting Design & Camera Optics',
    code: 'PROD-5104',
    description: 'Three-point studio lighting, high-key and low-key setups, color temperature matching, depth-of-field control, and framing aesthetics.',
    courseCodes: ['TPRPT'],
    learningStageId: 'stage-2',
    status: 'upcoming',
    thumbnailUrl: '/images/gallery_field_shoot.jpg',
    resources: [],
    sortOrder: 4,
    published: true,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'mod-5',
    title: 'Color Grading & Digital Intermediate Mastering',
    code: 'POST-5105',
    description: 'Color science, primary balancing, secondary isolation, LUT generation, HDR scopes evaluation, and cinematic look development.',
    courseCodes: ['TPOPT'],
    learningStageId: 'stage-3',
    status: 'upcoming',
    thumbnailUrl: '/images/tpopt_cover.jpg',
    resources: [],
    sortOrder: 5,
    published: true,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'mod-6',
    title: 'Broadcast Media Technology & Transmission Basics',
    code: 'ENG-5100',
    description: 'Television broadcast signal path, SDI/IP video routing, master control gallery connectivity, and distribution workflows.',
    courseCodes: ['TPOPT', 'TPRPT'],
    learningStageId: 'stage-1',
    status: 'completed',
    thumbnailUrl: '/images/about_control_room.jpg',
    resources: [],
    sortOrder: 6,
    published: true,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
];

export const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: 'gal-1',
    imageUrl: '/images/hero_production.jpg',
    title: 'Main Television Studio A — Broadcast Stage & Pedestal Cameras',
    eventDate: '2026-02-15',
    showOnHome: true,
    sortOrder: 1,
    createdAt: '2026-02-15T10:00:00Z',
  },
  {
    id: 'gal-2',
    imageUrl: '/images/about_control_room.jpg',
    title: 'Television Production Gallery & Multi-Screen Monitor Wall',
    eventDate: '2026-02-20',
    showOnHome: true,
    sortOrder: 2,
    createdAt: '2026-02-20T10:00:00Z',
  },
  {
    id: 'gal-3',
    imageUrl: '/images/students_editing_suite.jpg',
    title: 'TPOPT Post-Production Color Grading & Video Editing Suite',
    eventDate: '2026-02-28',
    showOnHome: true,
    sortOrder: 3,
    createdAt: '2026-02-28T10:00:00Z',
  },
  {
    id: 'gal-4',
    imageUrl: '/images/film_set_practical.jpg',
    title: 'TPRPT Studio Camera Operator & Broadcast Transmission Workflow',
    eventDate: '2026-03-05',
    showOnHome: true,
    sortOrder: 4,
    createdAt: '2026-03-05T10:00:00Z',
  },
  {
    id: 'gal-5',
    imageUrl: '/images/gallery_field_shoot.jpg',
    title: 'Outdoor Field Production & Sound Recording Practical Session',
    eventDate: '2026-03-12',
    showOnHome: true,
    sortOrder: 5,
    createdAt: '2026-03-12T10:00:00Z',
  },
  {
    id: 'gal-6',
    imageUrl: '/images/event_screening.jpg',
    title: 'Annual Student Film & Television Showcase Screening',
    eventDate: '2026-03-18',
    showOnHome: true,
    sortOrder: 6,
    createdAt: '2026-03-18T10:00:00Z',
  },
];

export const INITIAL_EVENTS: DivisionEvent[] = [
  {
    id: 'evt-1',
    title: 'Annual Television Showcase & Short Film Festival 2026',
    description: 'An exclusive premiere and showcase of semester projects and original productions created by TPOPT and TPRPT students, attended by industry broadcast directors.',
    eventDate: '2026-11-15',
    startTime: '09:30 AM',
    endTime: '04:30 PM',
    location: 'Main Auditorium, University College of Rathmalana',
    coverImageUrl: '/images/event_screening.jpg',
    registrationUrl: 'https://ucr.ac.lk/events/showcase-2026',
    published: true,
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'evt-2',
    title: 'Broadcast Cinematography & Lighting Workshop',
    description: 'A hands-on intensive masterclass covering multi-camera studio lighting rigs, DMX consoles, and high-dynamic-range digital cinematography.',
    eventDate: '2026-11-28',
    startTime: '10:00 AM',
    endTime: '02:00 PM',
    location: 'Studio A, Division of Television Studies',
    coverImageUrl: '/images/gallery_field_shoot.jpg',
    registrationUrl: 'https://ucr.ac.lk/events/cinematography-workshop',
    published: true,
    createdAt: '2026-02-05T10:00:00Z',
    updatedAt: '2026-02-05T10:00:00Z',
  },
  {
    id: 'evt-3',
    title: 'Batch 11 Induction & Studio Orientation',
    description: 'Formal welcome ceremony and safety orientation for all newly enrolled students in TPOPT and TPRPT diplomas for the 2026 intake.',
    eventDate: '2026-01-10',
    startTime: '09:00 AM',
    endTime: '12:30 PM',
    location: 'Division Lecture Hall 2, UCR',
    coverImageUrl: '/images/about_control_room.jpg',
    published: true,
    createdAt: '2026-01-02T10:00:00Z',
    updatedAt: '2026-01-02T10:00:00Z',
  },
];

export const INITIAL_LECTURERS: Lecturer[] = [
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
    profileImageUrl: '/images/lecturers/nirmani_perera.png',
    sortOrder: 3,
  },
  {
    id: 'lec-4',
    name: 'Mr. Oshan Lakshitha',
    designation: 'Lecturer',
    roleType: 'lecturer',
    specialization: 'Digital Cinematography, Broadcast Sound Engineering & Field Production',
    profileImageUrl: '/images/lecturers/oshan_lakshitha.jpg',
    sortOrder: 4,
  },
];

// ============================================================================
// TIMETABLE SEED DATA (Extracted precisely from TPOPT.pdf and TPRPT.pdf)
// ============================================================================

export const TIME_BANDS = [
  { start: '08:30', end: '09:30', label: '8:30 a.m. – 9:30 a.m.', isBreak: false, isLunch: false },
  { start: '09:30', end: '10:30', label: '9:30 a.m. – 10:30 a.m.', isBreak: false, isLunch: false },
  { start: '10:30', end: '10:40', label: '10:30 a.m. – 10:40 a.m.', isBreak: true, isLunch: false },
  { start: '10:40', end: '11:40', label: '10:40 a.m. – 11:40 a.m.', isBreak: false, isLunch: false },
  { start: '11:40', end: '12:40', label: '11:40 a.m. – 12:40 p.m.', isBreak: false, isLunch: false },
  { start: '12:40', end: '13:20', label: '12:40 p.m. – 1:20 p.m.', isBreak: false, isLunch: true },
  { start: '13:20', end: '14:20', label: '1:20 p.m. – 2:20 p.m.', isBreak: false, isLunch: false },
  { start: '14:20', end: '15:20', label: '2:20 p.m. – 3:20 p.m.', isBreak: false, isLunch: false },
  { start: '15:20', end: '15:30', label: '3:20 p.m. – 3:30 p.m.', isBreak: true, isLunch: false },
  { start: '15:30', end: '16:30', label: '3:30 p.m. – 4:30 p.m.', isBreak: false, isLunch: false },
];

export const DAYS_OF_WEEK: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday')[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export function generateSlotsForCourse(timetableId: string, course: 'TPOPT' | 'TPRPT') {
  const slots: any[] = [];
  let sortOrder = 0;

  DAYS_OF_WEEK.forEach((day) => {
    TIME_BANDS.forEach((tb, bandIdx) => {
      sortOrder++;
      const slotId = `${timetableId}-${day.toLowerCase()}-${tb.start.replace(':', '')}`;

      // 1. Break and Lunch slots across all 7 days
      if (tb.isBreak) {
        slots.push({
          id: slotId,
          timetableId,
          dayOfWeek: day,
          startTime: tb.start,
          endTime: tb.end,
          timeLabel: tb.label,
          subject: 'Break',
          studentGroup: undefined,
          slotType: 'break',
          sortOrder,
        });
        return;
      }

      if (tb.isLunch) {
        slots.push({
          id: slotId,
          timetableId,
          dayOfWeek: day,
          startTime: tb.start,
          endTime: tb.end,
          timeLabel: tb.label,
          subject: 'Lunch Break',
          studentGroup: undefined,
          slotType: 'lunch',
          sortOrder,
        });
        return;
      }

      // 2. Day-specific class assignments
      let subject = '';
      let studentGroup: string | undefined = undefined;
      let slotType: 'class' | 'empty' = 'empty';

      if (day === 'Monday') {
        if (bandIdx === 3 || bandIdx === 4) {
          // 10:40 - 12:40
          subject = 'ENGLISH';
          studentGroup = 'A/L & NVQ Students';
          slotType = 'class';
        } else if (bandIdx === 6 || bandIdx === 7 || bandIdx === 9) {
          // 13:20 - 16:30
          subject = 'DM10';
          studentGroup = 'A/L Students';
          slotType = 'class';
        }
      } else if (day === 'Tuesday') {
        // Gaffer for all class slots
        subject = 'Gaffer';
        studentGroup = 'A/L Students';
        slotType = 'class';
      } else if (day === 'Wednesday') {
        // DM7 for all class slots
        subject = 'DM7';
        studentGroup = 'A/L Students';
        slotType = 'class';
      } else if (day === 'Thursday') {
        if (bandIdx === 0 || bandIdx === 1 || bandIdx === 3 || bandIdx === 4) {
          // 8:30 - 12:40 (except 10:30 break)
          subject = 'NVQ Physics I,II';
          studentGroup = 'NVQ Students';
          slotType = 'class';
        } else if (course === 'TPOPT' && (bandIdx === 6 || bandIdx === 7 || bandIdx === 9)) {
          // TPOPT has Computer Graphic Designer in Thursday afternoon; TPRPT is empty!
          subject = 'Computer Graphic Designer';
          studentGroup = 'A/L Students';
          slotType = 'class';
        }
      } else if (day === 'Friday') {
        if (course === 'TPRPT' && (bandIdx === 0 || bandIdx === 1)) {
          // TPRPT has Computer Graphic Designer Friday morning; TPOPT is blank!
          subject = 'Computer Graphic Designer';
          studentGroup = 'A/L Students';
          slotType = 'class';
        } else if (bandIdx === 3 || bandIdx === 4) {
          // 10:40 - 12:40 (Both courses)
          subject = 'ICT';
          studentGroup = 'A/L & NVQ Students';
          slotType = 'class';
        } else if (course === 'TPRPT' && (bandIdx === 6 || bandIdx === 7 || bandIdx === 9)) {
          // TPRPT has Computer Graphic Designer Friday afternoon; TPOPT is blank!
          subject = 'Computer Graphic Designer';
          studentGroup = 'A/L Students';
          slotType = 'class';
        }
      } else if (day === 'Saturday') {
        if (bandIdx === 0 || bandIdx === 1 || bandIdx === 3 || bandIdx === 4) {
          // 8:30 - 12:40 (Both courses)
          subject = 'Maths';
          studentGroup = 'NVQ Students';
          slotType = 'class';
        } else if (bandIdx === 6) {
          // 13:20 - 14:20
          // Note exact spelling from PDFs: TPOPT has plural "Drawings", TPRPT has singular "Drawing"
          subject = course === 'TPOPT' ? 'Engineering Drawings' : 'Engineering Drawing';
          studentGroup = 'NVQ Students';
          slotType = 'class';
        }
      } else if (day === 'Sunday') {
        if (bandIdx === 0 || bandIdx === 1 || bandIdx === 3 || bandIdx === 4) {
          // 8:30 - 12:40 (Both courses)
          subject = 'OSH';
          studentGroup = 'A/L & NVQ Students';
          slotType = 'class';
        }
      }

      slots.push({
        id: slotId,
        timetableId,
        dayOfWeek: day,
        startTime: tb.start,
        endTime: tb.end,
        timeLabel: tb.label,
        subject,
        studentGroup,
        slotType,
        sortOrder,
      });
    });
  });

  return slots;
}

export const INITIAL_TIMETABLES = [
  {
    id: 'timetable-foundation-tpopt',
    category: 'foundation' as const,
    course: 'TPOPT' as const,
    title: 'Academic Time Table – Foundation Programme – 11th Batch',
    subtitle: 'Television & Digital Media Post Production Technology',
    batchLabel: '11th Batch',
    pdfUrl: '/timetables/TPOPT.pdf',
    isPublished: true,
    slots: generateSlotsForCourse('timetable-foundation-tpopt', 'TPOPT'),
    createdAt: '2026-02-01T00:00:00.000Z',
    updatedAt: '2026-02-01T00:00:00.000Z',
  },
  {
    id: 'timetable-foundation-tprpt',
    category: 'foundation' as const,
    course: 'TPRPT' as const,
    title: 'Academic Time Table – Foundation Programme – 11th Batch',
    subtitle: 'Television & Digital Media Production Technology',
    batchLabel: '11th Batch',
    pdfUrl: '/timetables/TPRPT.pdf',
    isPublished: true,
    slots: generateSlotsForCourse('timetable-foundation-tprpt', 'TPRPT'),
    createdAt: '2026-02-01T00:00:00.000Z',
    updatedAt: '2026-02-01T00:00:00.000Z',
  },
];

export function getInitialDatabase(): DatabaseSchema {
  const username = process.env.ADMIN_USERNAME || 'ucrtvrepb11';
  const email = process.env.ADMIN_EMAIL || 'hesansamudika20@gmail.com';
  const password = process.env.ADMIN_PASSWORD || 'ucrtv@2026';
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);

  return {
    students: generateInitialStudents(),
    modules: INITIAL_MODULES,
    learningStages: INITIAL_STAGES,
    gallery: INITIAL_GALLERY,
    events: INITIAL_EVENTS,
    lecturers: INITIAL_LECTURERS,
    timetables: INITIAL_TIMETABLES,
    timetableOverrides: [],
    admins: [
      {
        id: 'admin-1',
        username,
        email,
        passwordHash,
        name: 'Television Studies Administrator',
        role: 'superadmin',
      },
    ],
  };
}

