const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function parseDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  );
}

export function isPast(value: string | Date): boolean {
  return parseDate(value).getTime() < Date.now();
}

export function formatMonthShort(value: string | Date): string {
  return MONTHS[parseDate(value).getUTCMonth()];
}

export function formatDayNumber(value: string | Date): string {
  return String(parseDate(value).getUTCDate()).padStart(2, '0');
}

/** "14:00" */
export function formatTime(value: string | Date): string {
  const d = parseDate(value);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** "Oct 18 • 14:00 GMT+1" */
export function formatEventDateTime(value: string | Date): string {
  const d = parseDate(value);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()} • ${formatTime(d)} GMT+1`;
}

/** "Saturday, October 18" */
export function formatLongDate(value: string | Date): string {
  const d = parseDate(value);
  const monthName = d.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
  return `${DAYS[d.getUTCDay()]}, ${monthName} ${d.getUTCDate()}`;
}

export function formatRelativeTime(value: string | Date): string {
  const diff = Date.now() - parseDate(value).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return `${MONTHS[parseDate(value).getUTCMonth()]} ${parseDate(value).getUTCDate()}`;
}

/** "4 days left" / "Today" / "Deadline passed" */
export function formatCountdown(value: string | Date): string {
  const target = parseDate(value);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const days = Math.round((startOfTarget - startOfToday) / 86_400_000);
  if (days < 0) return 'Closed';
  if (days === 0) return 'Today';
  if (days === 1) return '1 day left';
  return `${days} days left`;
}

/** ISO string for the local timezone (used for calendar integration). */
export function toLocalISO(value: string | Date): string {
  return parseDate(value).toISOString();
}
