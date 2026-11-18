const KEY = "mama-path:due-date";

export function getStoredDueDate(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setStoredDueDate(value: string | null) {
  try {
    if (value) {
      window.localStorage.setItem(KEY, value);
    } else {
      window.localStorage.removeItem(KEY);
    }
    window.dispatchEvent(new Event("mama-path:due-date"));
  } catch {
    // storage unavailable — the tracker still works for this session
  }
}

/** Parse `YYYY-MM-DD` as a local date (Date.parse would treat it as UTC). */
export function parseIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toIsoDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
