import React, { useState } from 'react';
import { SlidersHorizontal, RotateCcw, ChevronDown } from 'lucide-react';

const Group = ({ label, options, value, onChange }) => (
  <fieldset className="space-y-2.5">
    <legend className="label !mb-0">{label}</legend>
    <div className="flex flex-wrap gap-2">
      {['All', ...options].map((opt) => (
        <button
          key={opt}
          type="button"
          aria-pressed={value === opt}
          onClick={() => onChange(opt)}
          className={`chip ${value === opt ? 'chip-active' : ''}`}
        >
          {opt}
        </button>
      ))}
    </div>
  </fieldset>
);

/** Filter panel. Options come from the real catalogue (facets), not a hard-coded list. */
export const MovieFilter = ({
  facets = { genres: [], languages: [], formats: [] },
  selectedGenre, onGenreChange,
  selectedLanguage, onLanguageChange,
  selectedFormat, onFormatChange,
  onReset
}) => {
  const [open, setOpen] = useState(false);
  const activeCount = [selectedGenre, selectedLanguage, selectedFormat].filter((v) => v !== 'All').length;

  return (
    <aside className="card p-5 lg:sticky lg:top-24">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex items-center gap-2 font-extrabold text-ink lg:cursor-default"
        >
          <SlidersHorizontal className="w-4 h-4 text-brand" />
          Filters
          {activeCount > 0 && <span className="rounded-full bg-brand text-on-brand text-[10px] font-extrabold px-1.5 py-0.5">{activeCount}</span>}
          <ChevronDown className={`w-4 h-4 text-faint lg:hidden transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {activeCount > 0 && (
          <button type="button" onClick={onReset} className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:underline">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        )}
      </div>

      <div className={`${open ? 'block' : 'hidden'} lg:block mt-5 space-y-6`}>
        <Group label="Genre" options={facets.genres} value={selectedGenre} onChange={onGenreChange} />
        <Group label="Format" options={facets.formats} value={selectedFormat} onChange={onFormatChange} />
        <Group label="Language" options={facets.languages} value={selectedLanguage} onChange={onLanguageChange} />
      </div>
    </aside>
  );
};

export default MovieFilter;
