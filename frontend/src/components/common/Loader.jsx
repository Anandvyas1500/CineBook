import React from 'react';

/** Spinning film reel. `fullScreen` overlays the page, otherwise it sits inline. */
export const Loader = ({ message = 'Loading...', fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-10 gap-4 text-center" role="status" aria-live="polite">
      <svg viewBox="0 0 48 48" className="w-14 h-14 text-brand animate-spin" style={{ animationDuration: '2.2s' }} aria-hidden="true">
        <circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="24" cy="24" r="4" fill="currentColor" />
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <circle key={deg} cx="24" cy="11" r="4.2" fill="currentColor" opacity="0.9" transform={`rotate(${deg} 24 24)`} />
        ))}
      </svg>
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted">{message}</p>
    </div>
  );

  if (fullScreen) {
    return <div className="fixed inset-0 z-50 flex items-center justify-center bg-canvas/90 backdrop-blur-sm">{content}</div>;
  }
  return content;
};

export default Loader;
