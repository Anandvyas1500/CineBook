/**
 * Small shared helpers used across controllers and services.
 */

/** Escape user input so it can be safely embedded inside a RegExp. */
const escapeRegex = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Case-insensitive, whole-string match for an arbitrary (user supplied) value. */
const exactCI = (value) => new RegExp(`^${escapeRegex(String(value).trim())}$`, 'i');

const pad = (n) => String(n).padStart(2, '0');

/**
 * YYYY-MM-DD for the given date in the SERVER'S LOCAL TIME ZONE.
 * (toISOString() is UTC and returns the wrong day for several hours every day in e.g. India.)
 */
const localDateString = (date = new Date()) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const isValidDateString = (value) => {
  if (typeof value !== 'string' || !DATE_RE.test(value)) return false;
  const d = new Date(`${value}T00:00:00`);
  return !Number.isNaN(d.getTime()) && localDateString(d) === value;
};

/**
 * Parse "06:30 PM" / "12:15 AM" / "18:30" into 24h { hours, minutes }.
 * Returns null when the value is not a valid time.
 */
const parseShowTime = (showTime) => {
  const m = /^\s*(\d{1,2}):(\d{2})\s*(AM|PM)?\s*$/i.exec(String(showTime || ''));
  if (!m) return null;
  let hours = parseInt(m[1], 10);
  const minutes = parseInt(m[2], 10);
  const meridiem = m[3] ? m[3].toUpperCase() : null;
  if (minutes > 59) return null;
  if (meridiem) {
    if (hours < 1 || hours > 12) return null;
    if (meridiem === 'AM') hours = hours === 12 ? 0 : hours;
    else hours = hours === 12 ? 12 : hours + 12;
  } else if (hours > 23) {
    return null;
  }
  return { hours, minutes };
};

/** Build the absolute start Date for a show from its date + time strings (server local time). */
const buildShowStart = (showDate, showTime) => {
  if (!isValidDateString(showDate)) return null;
  const t = parseShowTime(showTime);
  if (!t) return null;
  return new Date(`${showDate}T${pad(t.hours)}:${pad(t.minutes)}:00`);
};

/** Format back to a canonical "hh:mm AM/PM" label. */
const formatShowTime = (showTime) => {
  const t = parseShowTime(showTime);
  if (!t) return showTime;
  const meridiem = t.hours >= 12 ? 'PM' : 'AM';
  const h12 = t.hours % 12 === 0 ? 12 : t.hours % 12;
  return `${pad(h12)}:${pad(t.minutes)} ${meridiem}`;
};

const clampInt = (value, { min, max, fallback }) => {
  const n = parseInt(value, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
};

module.exports = {
  escapeRegex,
  exactCI,
  localDateString,
  isValidDateString,
  parseShowTime,
  buildShowStart,
  formatShowTime,
  clampInt
};
