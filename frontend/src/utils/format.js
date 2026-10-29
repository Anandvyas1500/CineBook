const pad = (n) => String(n).padStart(2, '0');

/** YYYY-MM-DD in the visitor's LOCAL time zone (toISOString() would give the UTC day). */
export const toLocalDateStr = (d = new Date()) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const formatDuration = (minutes) =>
  minutes ? `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m` : '';

export const formatINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

/** "2026-10-21" -> "Wed, 21 Oct" */
export const formatDateShort = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(`${dateStr}T00:00:00`);
  return Number.isNaN(d.getTime())
    ? dateStr
    : d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
};

/** Parse "06:30 PM" into hours/minutes (24h). */
const parseTime = (t) => {
  const m = /^\s*(\d{1,2}):(\d{2})\s*(AM|PM)?\s*$/i.exec(t || '');
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const mer = m[3]?.toUpperCase();
  if (mer === 'AM') h = h === 12 ? 0 : h;
  if (mer === 'PM') h = h === 12 ? 12 : h + 12;
  return { h, min };
};

/** Start of a booking's screening as a Date (uses the stored timestamp, falls back to date + time text). */
export const bookingStart = (booking) => {
  const snap = booking?.showSnapshot || {};
  if (snap.startTime) return new Date(snap.startTime);
  const t = parseTime(snap.showTime);
  if (!snap.showDate || !t) return null;
  return new Date(`${snap.showDate}T${pad(t.h)}:${pad(t.min)}:00`);
};

export const hasBookingStarted = (booking) => {
  const start = bookingStart(booking);
  return start ? start.getTime() <= Date.now() : false;
};

/** Only allow https YouTube / Vimeo trailers inside the iframe. Returns '' for anything else. */
export const safeTrailerEmbed = (url) => {
  if (!url || typeof url !== 'string') return '';
  const yt = url.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0`;
  const vimeo = url.match(/^https:\/\/(?:www\.)?vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1`;
  return '';
};

/** Build an .ics calendar file for a confirmed booking and trigger a download. */
export const downloadBookingICS = (booking) => {
  const start = bookingStart(booking);
  if (!start) return;
  const end = new Date(start.getTime() + 2.75 * 60 * 60 * 1000);
  const fmt = (d) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
  const esc = (s) => String(s || '').replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
  const m = booking.movieSnapshot || {};
  const t = booking.theatreSnapshot || {};
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//CineBook//Tickets//EN', 'BEGIN:VEVENT',
    `UID:${booking.bookingReference}@cinebook`,
    `DTSTAMP:${fmt(new Date())}`, `DTSTART:${fmt(start)}`, `DTEND:${fmt(end)}`,
    `SUMMARY:${esc(`${m.title} (${m.format || '2D'})`)}`,
    `LOCATION:${esc(`${t.name}, ${t.city} - ${t.screenName || ''}`)}`,
    `DESCRIPTION:${esc(`Booking ${booking.bookingReference}. Seats: ${(booking.seats || []).map((s) => s.seatId).join(', ')}`)}`,
    'END:VEVENT', 'END:VCALENDAR'
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `cinebook-${booking.bookingReference}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
