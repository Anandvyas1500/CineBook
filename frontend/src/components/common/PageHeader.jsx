import React from 'react';

export const PageHeader = ({ eyebrow, title, children, actions }) => (
  <header className="flex flex-col md:flex-row md:items-end justify-between gap-5 pb-7 mb-8 border-b border-line">
    <div className="space-y-2 min-w-0">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 className="display text-5xl sm:text-6xl text-ink">{title}</h1>
      {children && <p className="text-sm text-muted max-w-xl leading-relaxed">{children}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
  </header>
);

export default PageHeader;
