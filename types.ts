export interface Course {
  id: string;
  courseName: string;
  day: string; // e.g., "Monday"
  time: string; // e.g., "14:30"
  classroom?: string; // Optional classroom name (max 8 chars)
  weeklyHours?: number; // e.g. 2, 3, 4 (günde kaç saat/oturum ders var)
  absencePercentage?: number; // e.g. 30 (%30)
  allowedAbsences: number; // Toplam izin verilen devamsızlık saati (veya gün)
  currentAbsences: number; // Toplam yapılan devamsızlık saati (veya gün)
  absenceDates: string[]; // List of dates when absence occurred (Legacy/Fallback)
  attendanceLog: { [week: number]: number | 'present' | 'absent' | null }; // number = kaç saat devamsızlık yapıldı (0 = tam katılım)
  isIncomplete?: boolean; // Flag to indicate if the course data needs to be filled manually
  isRoutine?: boolean; // New flag: If true, it won't show on the main home screen
  midtermScore?: number; // Vize Notu
  finalScore?: number; // Final Notu
  weeklyNotes?: { [week: number]: string }; // Hafta hafta ders notları
}

export interface TermArchive {
  id: string;
  name: string; // User defined name (e.g., "2023 Fall")
  date: string; // ISO Date string
  courses: Course[];
  finalWeek: number;
  termWeeks?: number;
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

// Devamsızlık İzin Verilen Saat Hesaplama: (Haftalık Ders Saati * Dönem Haftası * Yüzde) / 100
export const calculateAllowedAbsenceHours = (
  weeklyHours: number = 3,
  percentage: number = 30,
  termWeeks: number = 14
): number => {
  const totalCourseHours = (weeklyHours || 3) * (termWeeks || 14);
  return Math.max(1, Math.floor((totalCourseHours * (percentage || 30)) / 100));
};

// Dersin Toplam Yapılan Devamsızlık Saatini Hesaplama
export const calculateCourseAbsentHours = (course: Course): number => {
  if (!course.attendanceLog) return course.currentAbsences || 0;
  const weeklyHours = course.weeklyHours || 3;
  let total = 0;
  let hasNumericLog = false;

  Object.values(course.attendanceLog).forEach(status => {
    if (typeof status === 'number') {
      total += status;
      hasNumericLog = true;
    } else if (status === 'absent') {
      total += weeklyHours;
      hasNumericLog = true;
    } else if (status === 'present') {
      hasNumericLog = true;
    }
  });

  return hasNumericLog ? total : (course.currentAbsences || 0);
};