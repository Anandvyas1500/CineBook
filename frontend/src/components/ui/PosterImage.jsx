import React, { useState } from 'react';
import { Film } from 'lucide-react';

/** <img> that falls back to a tasteful placeholder when a poster/avatar URL is missing or broken. */
export const PosterImage = ({ src, alt, className = '', fallbackLabel, ...rest }) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-raised-hover to-surface text-faint ${className}`}
      >
        <Film className="w-1/4 h-1/4 min-w-5 min-h-5 opacity-60" />
        {fallbackLabel && <span className="px-3 text-center text-xs font-semibold text-muted line-clamp-2">{fallbackLabel}</span>}
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} loading="lazy" {...rest} />;
};

export default PosterImage;
