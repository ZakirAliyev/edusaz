import { createContext, useContext, useState, useCallback } from 'react';
import './index.scss';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showSuccess = useCallback((msg) => addToast(msg, 'success'), [addToast]);
  const showError = useCallback((msg) => addToast(msg, 'error'), [addToast]);
  const showInfo = useCallback((msg) => addToast(msg, 'info'), [addToast]);

  const success = showSuccess;
  const error = showError;
  const info = showInfo;

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showInfo, success, error, info }}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-item toast-${t.type}`}>
            <div className="toast-icon">
              {t.type === 'success' && '✨'}
              {t.type === 'error' && '⚠️'}
              {t.type === 'info' && 'ℹ️'}
            </div>
            <div className="toast-message">{t.message}</div>
            <button className="toast-close" onClick={() => removeToast(t.id)}>&times;</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showSuccess: (msg) => alert(msg),
      showError: (msg) => alert(msg),
      showInfo: (msg) => alert(msg),
      success: (msg) => alert(msg),
      error: (msg) => alert(msg),
      info: (msg) => alert(msg)
    };
  }
  return context;
}
