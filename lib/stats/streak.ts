import { addDays } from "@/lib/dates";

export function calculateStudyStreak(dates: string[], today: string) {
  const studiedDates = new Set(dates);
  let streak = 0;
  let current = today;
  while (studiedDates.has(current)) {
    streak += 1;
    current = addDays(current, -1);
  }
  return streak;
}
