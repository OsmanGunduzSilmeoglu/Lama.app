
export interface Course {
  id: string;
  courseName: string;
  day: string; // e.g., "Monday"
  time: string; // e.g., "14:30"
  classroom?: string; // Optional classroom name (max 8 chars)
  allowedAbsences: number;
  currentAbsences: number;
  absenceDates: string[]; // List of dates when absence occurred (Legacy/Fallback)
  attendanceLog: { [week: number]: 'present' | 'absent' | null }; // New 16-week tracker
  isIncomplete?: boolean; // Flag to indicate if the course data (e.g. absence limit) needs to be filled manually
  isRoutine?: boolean; // New flag: If true, it won't show on the main home screen
  midtermScore?: number; // Vize Notu
  finalScore?: number; // Final Notu
}

export interface TermArchive {
  id: string;
  name: string; // User defined name (e.g., "2023 Fall")
  date: string; // ISO Date string
  courses: Course[];
  finalWeek: number;
}

export const DAYS_OF_WEEK = [
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
  "Pazar"
];

export interface NotificationState {
  isOpen: boolean;
  courseId: string | null;
  courseName: string;
}