import { useEffect, useRef } from 'react';
import { addDays, isAfter, isBefore, setHours, setMilliseconds, setMinutes, setSeconds } from 'date-fns';
import { Course, DAYS_OF_WEEK } from '../types';

// DAYS_OF_WEEK[0] = "Pazartesi" (Monday) ... DAYS_OF_WEEK[6] = "Pazar" (Sunday),
// matching the app's existing (now.getDay() === 0 ? 6 : now.getDay() - 1) convention.
const nextOccurrence = (from: Date, dayIndex: number, timeStr: string): Date => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const fromDayIndex = from.getDay() === 0 ? 6 : from.getDay() - 1;

  let dayDelta = dayIndex - fromDayIndex;
  if (dayDelta < 0) dayDelta += 7;

  let candidate = setMilliseconds(
    setSeconds(setMinutes(setHours(addDays(from, dayDelta), hours), minutes), 0),
    0
  );

  // Today's slot already passed (or is this exact instant) — push to next week.
  if (dayDelta === 0 && !isAfter(candidate, from)) {
    candidate = addDays(candidate, 7);
  }

  return candidate;
};

/**
 * Wakes up exactly once at the next scheduled course start, instead of polling
 * a fixed interval. Recomputes on course changes and on tab refocus, since a
 * backgrounded tab's timers can be throttled/delayed by the browser.
 */
export function useNextClassTimer(
  courses: Course[],
  enabled: boolean,
  onClassStart: (course: Course) => void
) {
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const clear = () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const schedule = () => {
      clear();

      const trackedCourses = courses.filter(c => !c.isRoutine && c.time);
      if (trackedCourses.length === 0) return;

      const now = new Date();
      let soonest: { course: Course; at: Date } | null = null;

      for (const course of trackedCourses) {
        const dayIndex = DAYS_OF_WEEK.indexOf(course.day);
        if (dayIndex === -1) continue;
        const at = nextOccurrence(now, dayIndex, course.time);
        if (!soonest || isBefore(at, soonest.at)) {
          soonest = { course, at };
        }
      }

      if (!soonest) return;

      const delayMs = Math.max(soonest.at.getTime() - now.getTime(), 0);

      timeoutRef.current = window.setTimeout(() => {
        onClassStart(soonest!.course);
        schedule();
      }, delayMs);
    };

    schedule();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') schedule();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clear();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [courses, enabled, onClassStart]);
}
