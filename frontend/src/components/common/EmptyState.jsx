import React from 'react';

export const EmptyState = ({ icon: Icon, title, children, action }) => (
  <div className="text-center py-16 px-6 card space-y-3">
    {Icon && (
      <div className="w-14 h-14 mx-auto rounded-2xl bg-white/5 border border-line flex items-center justify-center">
        <Icon className="w-7 h-7 text-faint" />
      </div>
    )}
    <h3 className="display text-3xl text-ink">{title}</h3>
    {children && <p className="text-sm text-muted max-w-md mx-auto leading-relaxed">{children}</p>}
    {action}
  </div>
);

export default EmptyState;
