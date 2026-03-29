export default function ConfirmModal({ title, message, onConfirm, onCancel, confirmLabel = 'ยืนยัน', danger = false }) {
  return (
    <div style={s.overlay} onClick={onCancel}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>

        {/* Icon */}
        <div style={{ ...s.icon, background: danger ? 'rgba(239,68,68,0.12)' : 'rgba(0,212,255,0.12)' }}>
          <span style={{ fontSize: 24 }}>{danger ? '⚠️' : '❓'}</span>
        </div>

        {/* Text */}
        <div style={s.title}>{title}</div>
        {message && <div style={s.message}>{message}</div>}

        {/* Buttons */}
        <div style={s.btnRow}>
          <button style={s.cancelBtn} onClick={onCancel}>ยกเลิก</button>
          <button
            style={{
              ...s.confirmBtn,
              background: danger ? '#dc2626' : 'var(--accent)',
              color: danger ? '#fff' : '#000',
            }}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal: { background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', width: 360, maxWidth: '90vw', border: '1px solid var(--border)', textAlign: 'center' },
  icon: { width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' },
  title: { fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 },
  message: { fontSize: 13, color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 },
  btnRow: { display: 'flex', gap: 8, justifyContent: 'center' },
  cancelBtn: { padding: '9px 20px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer', minWidth: 80 },
  confirmBtn: { padding: '9px 20px', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 700, cursor: 'pointer', minWidth: 80 },
};