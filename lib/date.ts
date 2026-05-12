import { format, isToday, isThisWeek, isThisYear } from "date-fns";

export function toDateOnly(date: Date) {
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date object");
  }
  return format(date, "yyyy-MM-dd");
}

export function toTimeOnly(date: Date) {
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date object");
  }
  return format(date, "hh:mm a");
}

export function toLongDateString(date: Date): string {
  return format(date, "d MMMM yyyy");
}

export function timeAgo(input: Date | string): string {
  const date = input instanceof Date ? input : new Date(input);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60)
    return `${diffSeconds} second${diffSeconds !== 1 ? "s" : ""} ago`;
  if (diffMinutes < 60)
    return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
  if (diffHours < 24)
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
}

export function getExperienceYears(
  startDate: string | Date,
  endDate?: string | Date | null,
): number {
  const start = new Date(startDate).getTime();
  const end = endDate ? new Date(endDate).getTime() : Date.now();

  return Math.round((end - start) / (1000 * 60 * 60 * 24 * 365.25));
}

export function formatSmartDate(dateInput: Date | string | number): string {
  const date = new Date(dateInput);
  if (isToday(date)) return format(date, "HH:mm");
  if (isThisWeek(date, { weekStartsOn: 1 })) return format(date, "EEEE");
  if (isThisYear(date)) return format(date, "d MMM");
  return format(date, "d MMM yyyy");
}
