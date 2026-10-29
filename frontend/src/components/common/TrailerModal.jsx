import React from 'react';
import Modal from '../ui/Modal';
import { safeTrailerEmbed } from '../../utils/format';

export const TrailerModal = ({ isOpen, onClose, trailerUrl, movieTitle }) => {
  const embedUrl = isOpen ? safeTrailerEmbed(trailerUrl) : '';

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-4xl" labelledBy="trailer-title">
      <div className="px-6 pt-5 pb-4 pr-16">
        <p className="eyebrow">Official trailer</p>
        <h2 id="trailer-title" className="display text-3xl text-ink truncate">{movieTitle}</h2>
      </div>
      <div className="relative pt-[56.25%] bg-black rounded-b-3xl overflow-hidden">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={`${movieTitle} trailer`}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 w-full h-full border-0"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-muted">
            Trailer preview is not available for this film.
          </div>
        )}
      </div>
    </Modal>
  );
};

export default TrailerModal;
