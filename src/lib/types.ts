export type CourseType = 'TPOPT' | 'TPRPT';

export interface Student {
  id: string;
  fullName: string;
  studentNumber: string;
  course: CourseType;
  batch: string;
  profileImageUrl?: string;
  isRepresentative: boolean;
  representativeRole?: string; // e.g., 'Male Representative', 'Female Representative'
  gender?: 'Male' | 'Female';
  phoneNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ModuleStatus = 'ongoing' | 'upcoming' | 'completed';

export interface ModuleResource {
  title: string;
  url: string;
}

export interface CourseModule {
  id: string;
  title: string;
  code?: string;
  description: string;
  courseCodes: CourseType[];
  learningStageId: string;
  status: ModuleStatus;
  thumbnailUrl?: string;
  resources?: ModuleResource[];
  sortOrder: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LearningStage {
  id: string;
  title: string;
  description?: string;
  sortOrder: number;
  published: boolean;
}

export interface GalleryItem {
  id: string;
  imageUrl: string;
  title: string;
  eventDate?: string;
  showOnHome: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface DivisionEvent {
  id: string;
  title: string;
  description: string;
  eventDate: string; // YYYY-MM-DD
  startTime?: string;
  endTime?: string;
  location?: string;
  coverImageUrl?: string;
  registrationUrl?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'superadmin' | 'admin';
}

export interface Lecturer {
  id: string;
  name: string;
  designation: string;
  roleType: 'head' | 'senior_lecturer' | 'lecturer';
  specialization: string;
  profileImageUrl: string;
  sortOrder: number;
}

export interface LecturerSectionSettings {
  badgeText: string;
  title: string;
  description: string;
}


export type TimetableCategory = 'foundation' | 'academic_1' | 'academic_2';
export type SlotType = 'class' | 'break' | 'lunch' | 'empty';
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
export type OverrideStatus = 'POSTPONED' | 'UNAVAILABLE';

export interface TimetableSlot {
  id: string;
  timetableId: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // "08:30"
  endTime: string;   // "09:30"
  timeLabel?: string; // "8:30 a.m. – 9:30 a.m."
  subject: string;   // "ENGLISH", "Gaffer", "DM7", etc.
  studentGroup?: string; // "A/L Students", "NVQ Students", "A/L & NVQ Students"
  slotType: SlotType; // "class" | "break" | "lunch" | "empty"
  room?: string;
  notes?: string;
  sortOrder: number;
}

export interface TimetableOverride {
  id: string;
  timetableId: string;
  timetableSlotId?: string;
  course: CourseType;
  exceptionDate: string; // "YYYY-MM-DD"
  status: OverrideStatus; // "POSTPONED" | "UNAVAILABLE"
  reason?: string;
  rescheduledDate?: string;
  rescheduledStartTime?: string;
  rescheduledEndTime?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface Timetable {
  id: string;
  category: TimetableCategory;
  course: CourseType;
  title: string;
  subtitle: string;
  batchLabel: string;
  pdfUrl?: string;
  isPublished: boolean;
  slots: TimetableSlot[];
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
}

export type LectureStatusType =
  | 'LECTURE_ONGOING'
  | 'UPCOMING_LECTURE'
  | 'BREAK'
  | 'LUNCH_BREAK'
  | 'NO_LECTURE_SCHEDULED_TODAY'
  | 'SCHEDULE_UNAVAILABLE'
  | 'POSTPONED'
  | 'UNAVAILABLE';

export interface ActiveSlotDetails {
  id?: string;
  subject: string;
  studentGroup?: string;
  timeRange: string;
  startTime: string;
  endTime: string;
  slotType: SlotType;
  room?: string;
  notes?: string;
}

export interface CourseLiveLectureStatus {
  course: CourseType;
  courseName: string;
  shortName: string;
  badge: string;
  status: LectureStatusType;
  statusLabel: string;
  currentSlot: ActiveSlotDetails | null;
  nextSlot: ActiveSlotDetails | null;
  override: TimetableOverride | null;
  timetableTitle: string;
  timetablePdfUrl?: string;
}

export interface DatabaseSchema {
  students: Student[];
  modules: CourseModule[];
  learningStages: LearningStage[];
  gallery: GalleryItem[];
  events: DivisionEvent[];
  admins: AdminUser[];
  lecturers: Lecturer[];
  lecturerSectionSettings?: LecturerSectionSettings;
  timetables: Timetable[];
  timetableOverrides: TimetableOverride[];
}

export interface DashboardStats {
  totalStudents: number;
  tpoptStudents: number;
  tprptStudents: number;
  ongoingModules: number;
  upcomingEvents: number;
  totalModules: number;
  totalEvents: number;
  totalTimetables?: number;
  totalLecturers?: number;
}

