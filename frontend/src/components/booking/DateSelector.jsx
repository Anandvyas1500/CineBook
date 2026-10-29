import React, { useMemo } from 'react';
import { toLocalDateStr } from '../../utils/format';

/** Next 7 days (local time). Each tile is a tiny calendar leaf. */
export const DateSelector = ({ selectedDate, onSelectDate, days = 7 }) => {
  const dates = useMemo(
    () =>
      Array.from({ length: days }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return {
          dateStr: toLocalDateStr(d),
          label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-IN', { weekday: 'short' }),
          day: d.getDate(),
          month: d.toLocaleDateString('en-IN', { month: 'short' })
        };
      }),
    [days]
  );

  return (
    <div className="flex gap-2.5 overflow-x-auto py-2 scrollbar-none -mx-1 px-1" role="radiogroup" aria-label="Choose a date">
      {dates.map((d) => {
        const active = d.dateStr === selectedDate;
        return (
          <button
            key={d.dateStr}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onSelectDate(d.dateStr)}
            className={`shrink-0 w-[78px] rounded-2xl border py-2.5 text-center transition-all duration-200 ${
              active
                ? 'bg-brand text-on-brand border-brand shadow-glow-sm -translate-y-0.5'
                : 'bg-raised text-muted border-line hover:border-white/25 hover:text-ink'
            }`}
          >
            <span className={`block text-[10px] font-extrabold uppercase tracking-[0.14em] ${active ? 'text-on-brand/80' : 'text-faint'}`}>{d.label}</span>
            <span className="display block text-4xl leading-none mt-1">{d.day}</span>
            <span className={`block text-[10px] font-bold uppercase tracking-widest mt-0.5 ${active ? 'text-on-brand/80' : 'text-faint'}`}>{d.month}</span>
          </button>
        );
      })}
    </div>
  );
};

export default DateSelector;
