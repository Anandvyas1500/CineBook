import React from 'react';
import { Link } from 'react-router-dom';

/** Ticket-stub mark + wordmark. */
export const Logo = ({ className = '', compact = false }) => (
  <Link to="/" className={`group inline-flex items-center gap-2.5 ${className}`} aria-label="CineBook home">
    <svg viewBox="0 0 40 40" className="w-9 h-9 drop-shadow-[0_0_10px_rgba(255,178,36,0.45)] transition-transform group-hover:-rotate-6" aria-hidden="true">
      <path
        d="M4 9a3 3 0 0 1 3-3h26a3 3 0 0 1 3 3v6a5 5 0 0 0 0 10v6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-6a5 5 0 0 0 0-10z"
        fill="#FFB224"
      />
      <path d="M15 12v16M15 14.5h0M15 20h0M15 25.5h0" stroke="#1A1204" strokeWidth="0" />
      <path d="M17 13l11 7-11 7z" fill="#1A1204" />
      <path d="M13 11v18" stroke="#1A1204" strokeWidth="1.6" strokeDasharray="2.2 2.6" strokeLinecap="round" />
    </svg>
    {!compact && (
      <span className="display text-[28px] leading-none text-ink tracking-[0.06em]">
        Cine<span className="text-brand">Book</span>
      </span>
    )}
  </Link>
);

export default Logo;
