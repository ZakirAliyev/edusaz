import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { apiErrorKey } from './apiErrorKey';
import './index.scss';

const ToastContext = createContext(null);

const ICONS = { success: CheckCircle2, error: XCircle, info: Info, warning: AlertTriangle };
// Errors stay longer: people need time to read what went wrong.
const DURATIONS = { success: 3500, info: 4500, warning: 5500, error: 6500 };
const MAX_VISIBLE = 3;
const EXIT_MS = 200;

function ToastItem({ toast, onDismiss, closeLabel }) {
  const { t } = useTranslation();
  const Icon = ICONS[toast.type] || Info;
  const [leaving, setLeaving] = useState(false);
  const remaining = useRef(toast.duration);
  const startedAt = useRef(0);
  const timer = useRef(null);

  const dismiss = useCallback(() => {
    clearTimeout(timer.current);
    setLeaving(true);
    setTimeout(() => onDismiss(toast.id), EXIT_MS);
  }, [onDismiss, toast.id]);

  const start = useCallback(() => {
    startedAt.current = Date.now();
    timer.current = setTimeout(dismiss, remaining.current);
  }, [dismiss]);

  const pause = useCallback(() => {
    clearTimeout(timer.current);
    remaining.current -= Date.now() - startedAt.current;
  }, []);

  useEffect(() => {
    start();
    return () => clearTimeout(timer.current);
  }, [start]);

  // A repeated message restarts the timer instead of stacking a duplicate.
  useEffect(() => {
    if (!toast.bump) return;
    clearTimeout(timer.current);
    remaining.current = toast.duration;
    start();
  }, [toast.bump, toast.duration, start]);

  return (
    <div
      className="et"
      data-type={toast.type}
      data-leaving={leaving || undefined}
      role={toast.type === 'error' ? 'alert' : 'status'}
      onMouseEnter={pause}
      onMouseLeave={start}
      onFocus={pause}
      onBlur={start}
      style={{ '--et-duration': `${toast.duration}ms` }}
    >
      <span className="et__icon" aria-hidden>
        <Icon />
      </span>
      <div className="et__body">
        <p className="et__title">{toast.title || t(`toast.title.${toast.type}`)}</p>
        <p className="et__message">{toast.message}</p>
      </div>
      <button type="button" className="et__close" onClick={dismiss} aria-label={closeLabel}>
        <X aria-hidden />
      </button>
      <span key={toast.bump || 0} className="et__progress" aria-hidden />
    </div>
  );
}

export function ToastProvider({ children }) {
  const { t } = useTranslation();
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => setToasts((prev) => prev.filter((x) => x.id !== id)), []);

  const push = useCallback((type, message, options = {}) => {
    if (!message) return;
    const text = String(message);
    setToasts((prev) => {
      const same = prev.find((x) => x.type === type && x.message === text);
      if (same) return prev.map((x) => (x === same ? { ...x, bump: (x.bump || 0) + 1 } : x));
      const next = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        type,
        message: text,
        title: options.title,
        duration: options.duration ?? DURATIONS[type],
      };
      return [...prev, next].slice(-MAX_VISIBLE);
    });
  }, []);

  const api = useMemo(() => {
    const success = (m, o) => push('success', m, o);
    const error = (m, o) => push('error', m, o);
    const info = (m, o) => push('info', m, o);
    const warning = (m, o) => push('warning', m, o);
    /** Shows a friendly, translated message for an API/RTK error instead of raw server text. */
    const apiError = (err, fallbackKey = 'toast.errors.generic') => error(t(apiErrorKey(err) || fallbackKey));
    return { success, error, info, warning, apiError, showSuccess: success, showError: error, showInfo: info };
  }, [push, t]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <section className="et-region" aria-label={t('toast.region')} aria-live="polite">
        {toasts.map((x) => (
          <ToastItem key={x.id} toast={x} onDismiss={remove} closeLabel={t('toast.close')} />
        ))}
      </section>
    </ToastContext.Provider>
  );
}

const noop = () => {};
const fallbackApi = {
  success: noop, error: noop, info: noop, warning: noop, apiError: noop,
  showSuccess: noop, showError: noop, showInfo: noop,
};

export function useToast() {
  return useContext(ToastContext) || fallbackApi;
}
