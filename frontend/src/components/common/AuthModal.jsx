import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import AuthForm from './AuthForm';
import Logo from './Logo';

export const AuthModal = ({ isOpen, onClose, initialTab = 'login', onSuccess }) => {
  const [mode, setMode] = useState(initialTab);

  // start from the requested tab every time the modal opens (this also discards any typed credentials)
  useEffect(() => {
    if (isOpen) setMode(initialTab);
  }, [isOpen, initialTab]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} labelledBy="auth-modal-title">
      <div className="h-2 marquee-lights rounded-t-3xl" aria-hidden="true" />
      <div className="p-7 sm:p-9">
        <div className="flex flex-col items-center text-center mb-6 gap-3">
          <Logo compact />
          <h2 id="auth-modal-title" className="display text-4xl text-ink">
            {mode === 'login' ? 'Welcome back' : 'Join the audience'}
          </h2>
          <p className="text-sm text-muted">
            {mode === 'login' ? 'Sign in to see your tickets and book faster.' : 'Create an account to book seats and keep every ticket in one place.'}
          </p>
        </div>

        <div className="grid grid-cols-2 p-1 mb-6 rounded-xl bg-canvas border border-line" role="tablist">
          {[['login', 'Sign in'], ['register', 'Create account']].map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={mode === key}
              onClick={() => setMode(key)}
              className={`py-2.5 text-sm font-bold rounded-lg transition-colors ${mode === key ? 'bg-brand text-on-brand' : 'text-muted hover:text-ink'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {isOpen && (
          <AuthForm
            key={mode}
            mode={mode}
            idPrefix="modal"
            onModeChange={setMode}
            onSuccess={() => {
              onClose();
              onSuccess?.();
            }}
          />
        )}
      </div>
    </Modal>
  );
};

export default AuthModal;
