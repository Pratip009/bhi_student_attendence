// Shared types, default times and date helpers for the attendance form.

export type Times = {
  start: string;
  lunchOut: string;
  lunchIn: string;
  end: string;
};

export const DEFAULT_TIMES: Times = {
  start: "9:00 AM",
  lunchOut: "12:00 PM",
  lunchIn: "12:30 PM",
  end: "4:00 PM",
};

export type Entry = Times & {
  studentSigned: boolean;
  staffSigned: boolean;
  holiday: boolean;
};

export function emptyEntry(): Entry {
  return { start: "", lunchOut: "", lunchIn: "", end: "", studentSigned: false, staffSigned: false, holiday: false };
}

const DAY_NAMES = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const MONTH_NAMES = [
  "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER",
];

export type Day = { iso: string; dayName: string; label: string };

const pad = (n: number) => String(n).padStart(2, "0");

export function toIso(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function currentMonth() {
  return toIso(new Date()).slice(0, 7);
}

export function monthName(month: string) {
  return MONTH_NAMES[Number(month.slice(5, 7)) - 1];
}

/** Monday–Friday dates of a month (YYYY-MM). */
export function weekdaysOfMonth(month: string): Day[] {
  const [y, m] = month.split("-").map(Number);
  const days: Day[] = [];
  const d = new Date(y, m - 1, 1);
  while (d.getMonth() === m - 1) {
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) {
      days.push({ iso: toIso(d), dayName: DAY_NAMES[dow], label: `${pad(m)}/${pad(d.getDate())}/${y}` });
    }
    d.setDate(d.getDate() + 1);
  }
  return days;
}
