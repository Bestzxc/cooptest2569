import { useState, useEffect } from 'react';
import { MdCheckCircle, MdError, MdWarning } from 'react-icons/md';

export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const hideToast = () => setToast(null);

  return { toast, showToast, hideToast };
}

export default function Toast({ toast, onHide }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onHide, 3000); // หายเองใน 3 วินาที
    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  const config = {
    success: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)', color: '#34d399', icon: <MdCheckCircle size={16} /> },
    error: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', color: '#f87171', icon: <MdError size={16} /> },
    warning: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)', color: '#fbbf24', icon: <MdWarning size={16} /> },
  };

  const c = config[toast.type] || config.success;

  return (
    <div style={{
      position: 'fixed', bottom: '2rem', right: '2rem',
      zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'var(--bg-elevated)',
      border: `1px solid ${c.border}`,
      borderLeft: `3px solid ${c.color}`,
      borderRadius: 'var(--radius-md)',
      padding: '12px 16px',
      minWidth: 260, maxWidth: 360,
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      animation: 'slideIn .2s ease',
    }}>
      <span style={{
        width: 24, height: 24, borderRadius: '50%',
        background: c.bg, color: c.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 700, flexShrink: 0,
      }}>
        {c.icon}
      </span>
      <span style={{ fontSize: 13, color: 'var(--text-primary)', flex: 1 }}>
        {toast.message}
      </span>
      <button onClick={onHide} style={{
        background: 'none', border: 'none',
        color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14,
      }}>✕</button>
    </div>
  );
}