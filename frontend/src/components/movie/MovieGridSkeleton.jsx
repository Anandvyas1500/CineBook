import React from 'react';

export const MovieGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8" aria-hidden="true">
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="space-y-3">
        <div className="skeleton aspect-[2/3] rounded-2xl" />
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
      </div>
    ))}
  </div>
);

export default MovieGridSkeleton;
