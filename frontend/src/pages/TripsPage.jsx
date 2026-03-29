import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { MdPerson } from 'react-icons/md';

const STATUS_COLOR = {
  SCHEDULED:   { bg: 'rgba(109,40,217,0.15)',  text: '#a78bfa' },
  IN_PROGRESS: { bg: 'rgba(37,99,235,0.15)',   text: '#60a5fa' },
  COMPLETED:   { bg: 'rgba(22,163,74,0.15)',   text: '#4ade80' },
  CANCELLED:   { bg: 'rgba(220,38,38,0.15)',   text: '#f87171' },
};

const CHECKPOINT_COLOR = {
  PENDING:  '#94a3b8',
  ARRIVED:  '#2563eb',
  DEPARTED: '#16a34a',
  SKIPPED:  '#6b7280',
};

export default function TripsPage() {
  const [view, setView] = useState('list'); // list | create | tracker
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackerTrip, setTrackerTrip] = useState(null);
  const [checkpoints, setCheckpoints] = useState([]);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const res = await api.get('/trips');
      setTrips(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openTracker = async (trip) => {
    try {
      const res = await api.get(`/trips/${trip.id}/checkpoints`);
      setCheckpoints(res.data);
      setTrackerTrip(trip);
      setView('tracker');
    } catch (err) {
      console.error(err);
    }
  };

  if (view === 'create') {
    return (
      <Layout>
        <TripForm
          onSuccess={() => { fetchTrips(); setView('list'); }}
          onCancel={() => setView('list')}
        />
      </Layout>
    );
  }

  if (view === 'tracker' && trackerTrip) {
    return (
      <Layout>
        <CheckpointTracker
          trip={trackerTrip}
          checkpoints={checkpoints}
          setCheckpoints={setCheckpoints}
          onBack={() => setView('list')}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={styles.title}>Trips</h1>
          <p style={styles.subtitle}>ติดตามและจัดการเส้นทาง</p>
        </div>
        <button style={styles.primaryBtn} onClick={() => setView('create')}>
          + New Trip
        </button>
      </div>

      {loading
        ? <div style={styles.center}>กำลังโหลด...</div>
        : <div style={styles.list}>
            {trips.length === 0
              ? <div style={styles.center}>ยังไม่มี trip</div>
              : trips.map(t => {
                  const sc = STATUS_COLOR[t.status] || STATUS_COLOR.SCHEDULED;
                  return (
                    <div key={t.id} style={styles.card}>
                      <div style={styles.cardRow}>
                        <span style={{ ...styles.badge, background: sc.bg, color: sc.text }}>
                          {t.status}
                        </span>
                        <span style={styles.route}>
                          {t.origin} → {t.destination}
                        </span>
                        <span style={styles.km}>{Number(t.distance_km).toLocaleString()} km</span>
                        <span style={styles.plate}>{t.license_plate}</span>
                        {(t.status === 'IN_PROGRESS' || t.status === 'SCHEDULED') && (
                          <button
                            style={styles.trackBtn}
                            onClick={() => openTracker(t)}
                          >
                            Track
                          </button>
                        )}
                      </div>
                      <div style={styles.cardSub}>
                        <MdPerson size={12} style={{ verticalAlign: 'middle' }} />
                        {t.driver_name} · {new Date(t.started_at).toLocaleDateString('th-TH')} · {t.cargo_type}
                      </div>
                    </div>
                  );
                })
            }
          </div>
      }
    </Layout>
  );
}

// ── Trip Form (3 Steps) ───────────────────────────────
function TripForm({ onSuccess, onCancel }) {
  const [step, setStep] = useState(1);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [form, setForm] = useState({
    vehicle_id: '', driver_id: '',
    origin: '', destination: '', distance_km: '',
    cargo_type: 'GENERAL', cargo_weight_kg: '',
    checkpoints: [{ location_name: '', purpose: 'DELIVERY', notes: '' }],
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/vehicles'), api.get('/drivers')])
      .then(([vRes, dRes]) => {
        setVehicles(vRes.data.filter(v => v.status !== 'RETIRED'));
        setDrivers(dRes.data);
      });
  }, []);

  const validateStep = () => {
    if (step === 1) return form.vehicle_id && form.driver_id;
    if (step === 2) return form.origin && form.destination && form.distance_km && form.cargo_weight_kg;
    if (step === 3) return form.checkpoints.every(c => c.location_name);
    return true;
  };

  const submit = async () => {
    setSubmitting(true);
    setError('');
    try {
      await api.post('/trips', {
        ...form,
        distance_km: Number(form.distance_km),
        cargo_weight_kg: Number(form.cargo_weight_kg),
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'เกิดข้อผิดพลาด');
      setSubmitting(false);
    }
  };

  const updateChk = (i, field, value) => {
    const updated = [...form.checkpoints];
    updated[i] = { ...updated[i], [field]: value };
    setForm({ ...form, checkpoints: updated });
  };

  return (
    <div>
      <h1 style={styles.title}>Create New Trip</h1>

      {/* Step indicator */}
      <div style={styles.stepRow}>
        {[1, 2, 3].map(s => (
          <div key={s} style={{ flex: 1 }}>
            <div style={{
              ...styles.stepDot,
              background: s <= step ? '#1d4ed8' : '#e2e8f0',
              color: s <= step ? '#fff' : '#94a3b8',
            }}>{s}</div>
            <div style={{ height: 4, background: s < step ? '#1d4ed8' : '#e2e8f0', marginTop: 4 }} />
          </div>
        ))}
      </div>

      <div style={styles.formCard}>
        {/* Step 1 */}
        {step === 1 && (
          <div>
            <h3 style={styles.stepTitle}>1. เลือก Vehicle & Driver</h3>
            <div style={styles.field}>
              <label style={styles.label}>Vehicle</label>
              <select style={styles.select}
                value={form.vehicle_id}
                onChange={e => setForm({ ...form, vehicle_id: e.target.value })}>
                <option value="">-- เลือกรถ --</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.license_plate} — {v.brand} {v.model} ({v.status})
                  </option>
                ))}
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Driver</label>
              <select style={styles.select}
                value={form.driver_id}
                onChange={e => setForm({ ...form, driver_id: e.target.value })}>
                <option value="">-- เลือกคนขับ --</option>
                {drivers.map(d => {
                  const expired = new Date(d.license_expires_at) < new Date();
                  return (
                    <option key={d.id} value={d.id} disabled={expired}>
                      {d.name} {expired ? '(ใบขับขี่หมดอายุ)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div>
            <h3 style={styles.stepTitle}>2. กำหนด Origin & Destination</h3>
            {[
              ['origin', 'ต้นทาง'],
              ['destination', 'ปลายทาง'],
              ['distance_km', 'ระยะทาง (km)'],
              ['cargo_weight_kg', 'น้ำหนักสินค้า (kg)'],
            ].map(([key, label]) => (
              <div key={key} style={styles.field}>
                <label style={styles.label}>{label}</label>
                <input style={styles.input}
                  value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  placeholder={label} />
              </div>
            ))}
            <div style={styles.field}>
              <label style={styles.label}>Cargo Type</label>
              <select style={styles.select}
                value={form.cargo_type}
                onChange={e => setForm({ ...form, cargo_type: e.target.value })}>
                {['GENERAL', 'FRAGILE', 'HAZARDOUS', 'REFRIGERATED'].map(t => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div>
            <h3 style={styles.stepTitle}>3. เพิ่ม Checkpoints (อย่างน้อย 1 จุด)</h3>
            {form.checkpoints.map((c, i) => (
              <div key={i} style={styles.chkBox}>
                <div style={styles.chkHeader}>
                  <span style={styles.chkNum}>Checkpoint {i + 1}</span>
                  {form.checkpoints.length > 1 && (
                    <button style={styles.removeBtn}
                      onClick={() => setForm({
                        ...form,
                        checkpoints: form.checkpoints.filter((_, j) => j !== i)
                      })}>
                      ลบ
                    </button>
                  )}
                </div>
                <input style={{ ...styles.input, marginBottom: 6 }}
                  placeholder="ชื่อสถานที่"
                  value={c.location_name}
                  onChange={e => updateChk(i, 'location_name', e.target.value)} />
                <select style={styles.select}
                  value={c.purpose}
                  onChange={e => updateChk(i, 'purpose', e.target.value)}>
                  {['FUEL', 'REST', 'DELIVERY', 'PICKUP', 'INSPECTION'].map(p => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>
            ))}
            <button style={styles.addChkBtn}
              onClick={() => setForm({
                ...form,
                checkpoints: [...form.checkpoints, { location_name: '', purpose: 'DELIVERY', notes: '' }]
              })}>
              + Add Checkpoint
            </button>
          </div>
        )}

        {error && <div style={styles.errorBox}>{error}</div>}

        {/* Buttons */}
        <div style={styles.btnRow}>
          <div style={{ display: 'flex', gap: 8 }}>
            {step > 1 && (
              <button style={styles.secondaryBtn} onClick={() => setStep(s => s - 1)}>
                ← Back
              </button>
            )}
            <button style={styles.secondaryBtn} onClick={onCancel}>Cancel</button>
          </div>
          {step < 3
            ? <button style={styles.primaryBtn}
                disabled={!validateStep()}
                onClick={() => setStep(s => s + 1)}>
                Next →
              </button>
            : <button style={styles.primaryBtn}
                disabled={!validateStep() || submitting}
                onClick={submit}>
                {submitting ? 'กำลังสร้าง...' : 'Create Trip'}
              </button>
          }
        </div>
      </div>
    </div>
  );
}

// ── Checkpoint Tracker ────────────────────────────────
function CheckpointTracker({ trip, checkpoints, setCheckpoints, onBack }) {
  const [updating, setUpdating] = useState(null);

  const purposeIcon = {
    FUEL: '⛽', REST: '😴', DELIVERY: '📦', PICKUP: '🔼', INSPECTION: '🔍',
  };

  const updateStatus = async (chk, newStatus) => {
    setUpdating(chk.id);
    const prev = [...checkpoints];

    // optimistic update
    setCheckpoints(c => c.map(x => x.id === chk.id ? { ...x, status: newStatus } : x));

    // simulate delay 300-800ms
    await new Promise(r => setTimeout(r, 300 + Math.random() * 500));

    // fail 30%
    if (Math.random() < 0.3) {
      setCheckpoints(prev); // rollback
      alert(`❌ อัปเดตล้มเหลว — กรุณาลองใหม่อีกครั้ง\n(สถานะถูก rollback กลับเป็น ${chk.status})`);
      setUpdating(null);
      return;
    }

    try {
      await api.patch(`/trips/checkpoints/${chk.id}/status`, { status: newStatus });
    } catch (err) {
      setCheckpoints(prev);
      alert(err.response?.data?.error?.message || 'เกิดข้อผิดพลาด');
    }
    setUpdating(null);
  };

  const sorted = [...checkpoints].sort((a, b) => a.sequence - b.sequence);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
        <button style={styles.secondaryBtn} onClick={onBack}>← Back</button>
        <div>
          <h1 style={styles.title}>{trip.origin} → {trip.destination}</h1>
          <p style={styles.subtitle}>{trip.license_plate} · {Number(trip.distance_km).toLocaleString()} km</p>
        </div>
      </div>

      <div style={styles.tracker}>
        {sorted.map((c, i) => (
          <div key={c.id} style={styles.trackerItem}>
            {/* Line */}
            {i < sorted.length - 1 && <div style={styles.trackerLine} />}

            {/* Dot */}
            <div style={{ ...styles.trackerDot, background: CHECKPOINT_COLOR[c.status] }} />

            {/* Content */}
            <div style={styles.trackerContent}>
              <div style={styles.trackerHeader}>
                <span style={{ fontSize: 18 }}>{purposeIcon[c.purpose] || '📍'}</span>
                <span style={styles.trackerName}>{c.location_name}</span>
                <span style={{
                  ...styles.badge,
                  background: 'var(--bg-surface)',
                  color: CHECKPOINT_COLOR[c.status],
                  fontWeight: 700,
                }}>
                  {c.status}
                </span>
                <span style={{ ...styles.badge, background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}>
                  {c.purpose}
                </span>
              </div>

              {c.arrived_at && (
                <div style={styles.trackerTime}>
                  Arrived: {new Date(c.arrived_at).toLocaleString('th-TH')}
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                {c.status === 'PENDING' && (
                  <button
                    style={{ ...styles.trackBtn, background: '#2563eb', color: '#fff' }}
                    disabled={updating === c.id}
                    onClick={() => updateStatus(c, 'ARRIVED')}>
                    {updating === c.id ? '...' : 'Mark Arrived'}
                  </button>
                )}
                {c.status === 'ARRIVED' && (
                  <button
                    style={{ ...styles.trackBtn, background: '#16a34a', color: '#fff' }}
                    disabled={updating === c.id}
                    onClick={() => updateStatus(c, 'DEPARTED')}>
                    {updating === c.id ? '...' : 'Mark Departed'}
                  </button>
                )}
                {c.status === 'PENDING' && (
                  <button
                    style={styles.secondaryBtn}
                    disabled={updating === c.id}
                    onClick={() => updateStatus(c, 'SKIPPED')}>
                    Skip
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  title:        { margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' },
  subtitle:     { margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' },
  center:       { textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' },
  list:         { display: 'grid', gap: 8 },

  card:         { background: 'var(--bg-surface)', borderRadius: 10, padding: '12px 16px', border: '1px solid var(--border)' },
  cardRow:      { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  cardSub: { 
    fontSize: 11, color: 'var(--text-muted)', marginTop: 4,
    display: 'flex', alignItems: 'center', gap: 4,
  },
  badge:        { fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, whiteSpace: 'nowrap' },
  route:        { fontWeight: 600, fontSize: 14, flex: 1, color: 'var(--text-primary)' },
  km:           { fontSize: 12, color: 'var(--text-secondary)' },
  plate:        { fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'monospace' },

  primaryBtn:   { padding: '8px 16px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  secondaryBtn: { padding: '8px 16px', background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13, cursor: 'pointer' },
  trackBtn:     { padding: '4px 12px', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: '#1d4ed8', color: '#fff' },

  stepRow:      { display: 'flex', gap: 4, marginBottom: '1.5rem' },
  stepDot:      { width: 28, height: 28, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, margin: '0 auto' },
  stepTitle:    { margin: '0 0 1rem', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' },

  formCard:     { background: 'var(--bg-surface)', borderRadius: 10, padding: '1.5rem', border: '1px solid var(--border)', maxWidth: 520 },
  field:        { marginBottom: '1rem' },
  label:        { display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 },
  input:        { width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 13, boxSizing: 'border-box', outline: 'none', background: 'var(--bg-base)', color: 'var(--text-primary)' },
  select:       { width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 13, outline: 'none', background: 'var(--bg-base)', color: 'var(--text-primary)' },

  chkBox:       { background: 'var(--bg-base)', borderRadius: 8, padding: '10px 12px', marginBottom: 8, border: '1px solid var(--border)' },
  chkHeader:    { display: 'flex', justifyContent: 'space-between', marginBottom: 6 },
  chkNum:       { fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' },
  removeBtn:    { fontSize: 11, color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' },
  addChkBtn:    { width: '100%', padding: '8px', border: '1px dashed var(--border)', borderRadius: 6, background: 'transparent', fontSize: 13, cursor: 'pointer', color: 'var(--text-muted)', marginTop: 4 },

  errorBox:     { background: 'rgba(220,38,38,0.15)', color: '#f87171', padding: '8px 12px', borderRadius: 6, fontSize: 13, margin: '1rem 0', border: '1px solid rgba(220,38,38,0.3)' },
  btnRow:       { display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' },

  tracker:        { background: 'var(--bg-surface)', borderRadius: 10, padding: '1.5rem', border: '1px solid var(--border)', position: 'relative' },
  trackerItem:    { display: 'flex', gap: 12, position: 'relative', marginBottom: 24 },
  trackerLine:    { position: 'absolute', left: 10, top: 24, bottom: -24, width: 2, background: 'var(--border)', zIndex: 0 },
  trackerDot:     { width: 20, height: 20, borderRadius: 10, flexShrink: 0, marginTop: 2, zIndex: 1 },
  trackerContent: { flex: 1, background: 'var(--bg-base)', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--border)' },
  trackerHeader:  { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 },
  trackerName:    { fontWeight: 600, fontSize: 14, flex: 1, color: 'var(--text-primary)' },
  trackerTime:    { fontSize: 11, color: 'var(--text-muted)' },
};