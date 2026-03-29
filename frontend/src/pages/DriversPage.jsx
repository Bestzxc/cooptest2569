import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import Toast, { useToast } from '../components/Toast';
import { MdAdd, MdPhone, MdCreditCard, MdWarning, MdCheckCircle, MdError, MdPersonAdd } from 'react-icons/md';

export default function DriversPage() {
  const [drivers, setDrivers]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => { fetchDrivers(); }, []);

  const fetchDrivers = async () => {
    try {
      const res = await api.get('/drivers');
      setDrivers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getLicenseStatus = (dateStr) => {
    const days = Math.ceil((new Date(dateStr) - Date.now()) / 86400000);
    if (days < 0)   return { label:`หมดอายุแล้ว ${Math.abs(days)} วัน`, color:'#f87171', bg:'rgba(239,68,68,0.12)',   icon:<MdError size={14}/> };
    if (days <= 30) return { label:`หมดใน ${days} วัน`,                  color:'#fbbf24', bg:'rgba(245,158,11,0.12)', icon:<MdWarning size={14}/> };
    return             { label:`อีก ${days} วัน`,                         color:'#34d399', bg:'rgba(52,211,153,0.12)', icon:<MdCheckCircle size={14}/> };
  };

  return (
    <Layout>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.5rem' }}>
        <div>
          <h1 style={s.title}>Drivers</h1>
          <p style={s.subtitle}>จัดการคนขับทั้งหมด ({drivers.length} คน)</p>
        </div>
        <button style={s.primaryBtn} onClick={() => setShowForm(true)}>
          <MdAdd size={16}/> New Driver
        </button>
      </div>

      {loading
        ? <div style={s.center}>กำลังโหลด...</div>
        : <div style={s.grid}>
            {drivers.length === 0
              ? <div style={s.center}>ยังไม่มีคนขับในระบบ</div>
              : drivers.map(d => {
                  const lic = getLicenseStatus(d.license_expires_at);
                  return (
                    <div key={d.id} style={s.card}>
                      <div style={s.cardRow}>
                        <div style={s.avatar}>{d.name?.[0]}</div>
                        <div style={{ flex:1 }}>
                          <div style={s.driverName}>{d.name}</div>
                          <div style={s.metaRow}>
                            <span style={s.meta}><MdPhone size={12} color="#7a8baa"/> {d.phone}</span>
                            <span style={s.meta}><MdCreditCard size={12} color="#7a8baa"/> {d.license_number}</span>
                          </div>
                        </div>
                        <div style={{ textAlign:'right' }}>
                          <div style={{ ...s.licBadge, background: lic.bg, color: lic.color }}>
                            {lic.icon} {lic.label}
                          </div>
                          <div style={s.licDate}>
                            {new Date(d.license_expires_at).toLocaleDateString('th-TH')}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
            }
          </div>
      }

      {showForm && (
        <DriverForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            fetchDrivers();
            setShowForm(false);
            showToast('เพิ่มคนขับสำเร็จแล้ว');
          }}
        />
      )}
      <Toast toast={toast} onHide={hideToast} />
    </Layout>
  );
}

function DriverForm({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    name:'', license_number:'', license_expires_at:'', phone:'',
  });
  const [error, setError]     = useState('');
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const f = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: false }));
  };

  const submit = async () => {
    setError('');
    const errs = {};
    if (!form.name.trim())           errs.name = true;
    if (!form.license_number.trim()) errs.license_number = true;
    if (!form.license_expires_at)    errs.license_expires_at = true;
    if (!form.phone.trim())          errs.phone = true;

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const labels = { name:'ชื่อ-นามสกุล', license_number:'เลขใบขับขี่', license_expires_at:'วันหมดอายุ', phone:'เบอร์โทร' };
      return setError(`กรุณากรอก: ${Object.keys(errs).map(k => labels[k]).join(', ')}`);
    }

    const phoneRegex = /^[0-9\-+() ]{9,15}$/;
    if (!phoneRegex.test(form.phone))
      return setError('เบอร์โทรไม่ถูกต้อง');
    if (new Date(form.license_expires_at) < new Date())
      return setError('วันหมดอายุใบขับขี่ต้องไม่เป็นอดีต');

    setErrors({});
    setLoading(true);
    try {
      await api.post('/drivers', form);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (key) => ({
    border: errors[key] ? '1px solid #f87171' : '1px solid var(--border)',
    borderRadius: 6, padding: '8px 10px', fontSize: 13,
    background: errors[key] ? 'rgba(239,68,68,0.05)' : 'var(--bg-base)',
    color: 'var(--text-primary)', outline: 'none',
    width: '100%', boxSizing: 'border-box', transition: 'border-color .2s',
  });

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        <div style={s.modalHeader}>
          <span style={s.modalTitle}>NEW DRIVER</span>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={s.modalBody}>
          {[
            ['ชื่อ-นามสกุล',       'name',               'text', 'สมชาย ใจดี'],
            ['เลขใบขับขี่',         'license_number',     'text', 'D-1234567'],
            ['วันหมดอายุใบขับขี่',  'license_expires_at', 'date', ''],
            ['เบอร์โทร',            'phone',              'text', '081-234-5678'],
          ].map(([label, key, type, ph]) => (
            <div key={key} style={{ ...s.field, marginBottom:'1rem' }}>
              <label style={s.label}>{label.toUpperCase()}</label>
              <input
                type={type} placeholder={ph}
                value={form[key]}
                onChange={e => f(key, e.target.value)}
                style={inputStyle(key)}
              />
            </div>
          ))}
          {error && <div style={s.errorBox}>{error}</div>}
        </div>
        <div style={s.modalFooter}>
          <button style={s.cancelBtn} onClick={onClose}>ยกเลิก</button>
          <button style={s.primaryBtn} onClick={submit} disabled={loading}>
            {loading ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  title:       { margin:0, fontSize:20, fontWeight:700, color:'var(--text-primary)' },
  subtitle:    { margin:'4px 0 0', fontSize:13, color:'var(--text-muted)' },
  primaryBtn:  { display:'flex', alignItems:'center', gap:6, padding:'9px 16px', background:'var(--accent)', color:'#000', border:'none', borderRadius:'var(--radius-sm)', fontSize:13, fontWeight:700, cursor:'pointer' },
  center:      { textAlign:'center', padding:'2rem', color:'var(--text-muted)' },
  grid:        { display:'grid', gap:8 },
  card:        { background:'var(--bg-surface)', borderRadius:10, padding:'14px 16px', border:'1px solid var(--border)' },
  cardRow:     { display:'flex', alignItems:'center', gap:12 },
  avatar:      { width:42, height:42, borderRadius:'50%', background:'rgba(0,212,255,0.1)', border:'1px solid rgba(0,212,255,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700, color:'var(--accent)', flexShrink:0 },
  driverName:  { fontWeight:600, fontSize:14, color:'var(--text-primary)', marginBottom:4 },
  metaRow:     { display:'flex', gap:16 },
  meta:        { display:'flex', alignItems:'center', gap:4, fontSize:12, color:'var(--text-secondary)' },
  licBadge:    { display:'inline-flex', alignItems:'center', gap:4, fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:4, marginBottom:2 },
  licDate:     { fontSize:10, color:'var(--text-muted)', fontFamily:'var(--font-mono)', textAlign:'right' },
  overlay:     { position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' },
  modal:       { background:'var(--bg-surface)', borderRadius:'var(--radius-lg)', width:420, maxWidth:'90vw', border:'1px solid var(--border)' },
  modalHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1.25rem 1.5rem', borderBottom:'1px solid var(--border)' },
  modalTitle:  { fontSize:14, fontWeight:700, letterSpacing:2, color:'var(--accent)' },
  closeBtn:    { background:'transparent', border:'none', color:'var(--text-secondary)', fontSize:16, cursor:'pointer' },
  modalBody:   { padding:'1.25rem 1.5rem' },
  modalFooter: { display:'flex', justifyContent:'flex-end', gap:8, padding:'1rem 1.5rem', borderTop:'1px solid var(--border)' },
  field:       { display:'flex', flexDirection:'column', gap:4 },
  label:       { fontSize:10, letterSpacing:2, color:'var(--text-muted)', fontWeight:600 },
  errorBox:    { background:'rgba(220,38,38,0.15)', color:'#f87171', padding:'8px 12px', borderRadius:'var(--radius-sm)', fontSize:12, border:'1px solid rgba(220,38,68,0.3)' },
  cancelBtn:   { padding:'8px 16px', background:'transparent', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', color:'var(--text-secondary)', fontSize:13, cursor:'pointer' },
};