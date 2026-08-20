// Pure date-math helpers for the hand-built Gantt chart. No external
// charting library — this keeps the bundle small and every pixel fully
// under our control (status colors, snapshot marker, sticky task column).

export function daysBetween(a: string, b: string): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const start = Date.UTC(
    new Date(a).getFullYear(),
    new Date(a).getMonth(),
    new Date(a).getDate(),
  );
  const end = Date.UTC(
    new Date(b).getFullYear(),
    new Date(b).getMonth(),
    new Date(b).getDate(),
  );
  return Math.round((end - start) / msPerDay);
}

export interface MonthSegment {
  label: string;
  days: number;
}

// Splits the [minDate, maxDate] range into per-calendar-month segments,
// each carrying how many days of that month fall inside the range —
// used to size month header cells proportionally to the day-width scale.
export function buildMonthSegments(minDate: string, maxDate: string): MonthSegment[] {
  const segments: MonthSegment[] = [];
  const start = new Date(minDate);
  const end = new Date(maxDate);

  let cursor = new Date(start.getFullYear(), start.getMonth(), 1);

  while (cursor <= end) {
    const monthStart = new Date(Math.max(cursor.getTime(), start.getTime()));
    const nextMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    const monthEnd = new Date(Math.min(nextMonth.getTime() - 1, end.getTime()));

    const days =
      daysBetween(monthStart.toISOString().slice(0, 10), monthEnd.toISOString().slice(0, 10)) + 1;

    segments.push({
      label: `${cursor.getFullYear()}/${String(cursor.getMonth() + 1).padStart(2, "0")}`,
      days,
    });

    cursor = nextMonth;
  }

  return segments;
}
