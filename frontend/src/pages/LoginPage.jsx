import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await api.post('/auth/login', { username, password });
      login(res.data.user, res.data.accessToken, res.data.refreshToken);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      {/* Background grid */}
      <div style={s.grid} />

      <div style={s.card}>
        {/* Logo */}
        <div style={s.logoRow}>
          <span style={s.logoIcon}>⬡</span>
          <div>
            <div style={s.logoText}>THE DRIVER</div>
            <div style={s.logoSub}>Fleet Management Platform</div>
          </div>
        </div>

        <div style={s.divider} />

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={s.field}>
            <label style={s.label}>USERNAME</label>
            <input value={username} onChange={e => setUsername(e.target.value)}
              placeholder="กรอก username" required autoFocus />
          </div>
          <div style={s.field}>
            <label style={s.label}>PASSWORD</label>
            <input type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required />
          </div>

          {error && <div style={s.error}>{error}</div>}

          <button type="submit" style={s.btn} disabled={loading}>
            {loading ? 'AUTHENTICATING...' : 'ENTER SYSTEM →'}
          </button>
        </form>

        <div style={s.hint}>demo: admin / admin123</div>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg-base)',
    position: 'relative', overflow: 'hidden',
  },
  grid: {
    position: 'absolute', inset: 0,
    backgroundImage: `
      linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px',
  },
  card: {
    position: 'relative', zIndex: 1,
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '2rem', width: 380,
    boxShadow: '0 0 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,212,255,0.05)',
  },
  logoRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' },
  logoIcon: { fontSize: 28, color: 'var(--accent)', filter: 'drop-shadow(0 0 10px rgba(0,212,255,0.7))' },
  logoText: { fontWeight: 800, fontSize: 18, letterSpacing: 3, fontFamily: 'var(--font-display)' },
  logoSub: { fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1 },
  divider: { height: 1, background: 'var(--border)', margin: '0 0 1.5rem' },
  field: { marginBottom: '1rem' },
  label: { display: 'block', fontSize: 10, letterSpacing: 2, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 },
  error: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    color: '#f87171', padding: '8px 12px',
    borderRadius: 'var(--radius-sm)',
    fontSize: 12, marginBottom: '1rem',
  },
  btn: {
    width: '100%', padding: '11px',
    background: 'var(--accent)', color: '#000',
    border: 'none', borderRadius: 'var(--radius-sm)',
    fontSize: 12, fontWeight: 800,
    letterSpacing: 2, fontFamily: 'var(--font-display)',
    boxShadow: 'var(--accent-glow)',
  },
  hint: { textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: '1rem' },
};