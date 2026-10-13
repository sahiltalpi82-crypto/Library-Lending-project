import { useCallback, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';

function ToastItem({ toast, onClose }) {
  // each toast removes itself after 3.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => onClose(toast.id), 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  return (
    <div className={`toast toast-${toast.type}`} onClick={() => onClose(toast.id)}>
      {toast.message}
    </div>
  );
}

export default function Toast() {
  const { toasts, dispatch } = useApp();
  const close = useCallback((id) => dispatch({ type: 'REMOVE_TOAST', payload: id }), [dispatch]);

  return (
    <div className="toast-box">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={close} />
      ))}
    </div>
  );
}
