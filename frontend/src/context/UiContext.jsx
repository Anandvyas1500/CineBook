import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import Modal from '../components/ui/Modal';

const UiContext = createContext(null);

const ICONS = { success: CheckCircle2, error: AlertCircle, info: Info };
const TONES = {
  success: 'border-emerald-400/40 text-emerald-300',
  error: 'border-velvet/50 text-velvet-soft',
  info: 'border-brand/40 text-brand-soft'
};

/** Replaces window.alert / window.confirm with accessible, on-brand equivalents. */
export const UiProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);
  const nextId = useRef(1);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const push = useCallback(
    (type, message, ms = 4200) => {
      const id = nextId.current++;
      setToasts((t) => [...t.slice(-3), { id, type, message }]);
      setTimeout(() => dismiss(id), ms);
    },
    [dismiss]
  );

  const toast = useRef({
    success: (m) => push('success', m),
    error: (m) => push('error', m, 6000),
    info: (m) => push('info', m)
  }).current;
  // keep `push` fresh without changing the toast object identity
  toast.success = (m) => push('success', m);
  toast.error = (m) => push('error', m, 6000);
  toast.info = (m) => push('info', m);

  const confirm = useCallback(
    ({ title = 'Are you sure?', message = '', confirmLabel = 'Confirm', cancelLabel = 'Keep it', tone = 'default' }) =>
      new Promise((resolve) => setDialog({ title, message, confirmLabel, cancelLabel, tone, resolve })),
    []
  );

  const close = (result) => {
    dialog?.resolve(result);
    setDialog(null);
  };

  return (
    <UiContext.Provider value={{ toast, confirm }}>
      {children}

      <div
        className="fixed z-[70] bottom-4 right-4 left-4 sm:left-auto sm:w-96 flex flex-col gap-2 pointer-events-none"
        role="status"
        aria-live="polite"
      >
        {toasts.map((t) => {
          const Icon = ICONS[t.type];
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 rounded-2xl border bg-surface/95 backdrop-blur px-4 py-3 shadow-lift animate-fade-up ${TONES[t.type]}`}
            >
              <Icon className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm text-ink flex-1 leading-snug">{t.message}</p>
              <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss" className="text-faint hover:text-ink">
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      <Modal isOpen={Boolean(dialog)} onClose={() => close(false)} title={dialog?.title} hideClose maxWidth="max-w-sm">
        {dialog && (
          <div className="p-7 text-center space-y-5">
            <h2 className="display text-3xl text-ink">{dialog.title}</h2>
            {dialog.message && <p className="text-sm text-muted leading-relaxed">{dialog.message}</p>}
            <div className="flex gap-3">
              <button type="button" className="btn-ghost flex-1" onClick={() => close(false)} data-autofocus>
                {dialog.cancelLabel}
              </button>
              <button
                type="button"
                className={`${dialog.tone === 'danger' ? 'btn-danger' : 'btn-primary'} flex-1`}
                onClick={() => close(true)}
              >
                {dialog.confirmLabel}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </UiContext.Provider>
  );
};

export const useUi = () => {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error('useUi must be used within a UiProvider');
  return ctx;
};
export const useToast = () => useUi().toast;
export const useConfirm = () => useUi().confirm;
