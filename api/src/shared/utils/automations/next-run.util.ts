import { DateTime } from 'luxon';
import { AutomationFrequency } from 'generated/prisma';

export interface NextRunParams {
  frequency: AutomationFrequency;
  days_of_week: number[];
  time_of_day: string; // "HH:mm"
  timezone: string;
  after?: Date;
}

// Computes the next occurrence strictly after `after` (default: now) in the
// automation's own timezone. `days_of_week` uses JS Date convention
// (0 = Sunday .. 6 = Saturday) and only applies when frequency is WEEKLY.
export function computeNextRun(params: NextRunParams): Date {
  const [hour, minute] = params.time_of_day.split(':').map(Number);
  const after = params.after
    ? DateTime.fromJSDate(params.after).setZone(params.timezone)
    : DateTime.now().setZone(params.timezone);

  const candidateDays =
    params.frequency === 'DAILY'
      ? [0, 1, 2, 3, 4, 5, 6]
      : params.frequency === 'WEEKDAYS'
        ? [1, 2, 3, 4, 5]
        : params.days_of_week.length > 0
          ? params.days_of_week
          : [after.weekday % 7];

  for (let i = 0; i < 8; i++) {
    const candidate = after.plus({ days: i }).set({ hour, minute, second: 0, millisecond: 0 });
    const candidateDow = candidate.weekday % 7;
    if (candidateDays.includes(candidateDow) && candidate > after) {
      return candidate.toJSDate();
    }
  }

  return after.plus({ weeks: 1 }).set({ hour, minute, second: 0, millisecond: 0 }).toJSDate();
}
