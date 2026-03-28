import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

const STATUS_COLOR = {
  SCHEDULED:   { bg: '#f5f3ff', text: '#6d28d9' },
  IN_PROGRESS: { bg: '#dbeafe', text: '#1e40af' },
  COMPLETED:   { bg: '#dcfce7', text: '#166534' },
  CANCELLED:   { bg: '#fee2e2', text: '#dc2626' },
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
                        👤 {t.driver_name} · {new Date(t.started_at).toLocaleDateString('th-TH')} · {t.cargo_type}
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
                  background: '#f1f5f9',
                  color: CHECKPOINT_COLOR[c.status],
                  fontWeight: 700,
                }}>
                  {c.status}
                </span>
                <span style={{ ...styles.badge, background: '#f1f5f9', color: '#475569' }}>
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
  title:       { margin: 0, fontSize: 20, fontWeight: 700 },
  subtitle:    { margin: '4px 0 0', fontSize: 13, color: '#64748b' },
  center:      { textAlign: 'center', padding: '2rem', color: '#94a3b8' },
  list:        { display: 'grid', gap: 8 },
  card:        { background: '#fff', borderRadius: 10, padding: '12px 16px', border: '1px solid #e2e8f0' },
  cardRow:     { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  cardSub:     { fontSize: 11, color: '#94a3b8', marginTop: 4 },
  badge:       { fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, whiteSpace: 'nowrap' },
  route:       { fontWeight: 600, fontSize: 14, flex: 1 },
  km:          { fontSize: 12, color: '#64748b' },
  plate:       { fontSize: 12, color: '#64748b', fontFamily: 'monospace' },
  primaryBtn:  { padding: '8px 16px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  secondaryBtn:{ padding: '8px 16px', background: '#fff', color: '#475569', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13, cursor: 'pointer' },
  trackBtn:    { padding: '4px 12px', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: '#1d4ed8', color: '#fff' },
  stepRow:     { display: 'flex', gap: 4, marginBottom: '1.5rem' },
  stepDot:     { width: 28, height: 28, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, margin: '0 auto' },
  stepTitle:   { margin: '0 0 1rem', fontSize: 15, fontWeight: 600 },
  formCard:    { background: '#fff', borderRadius: 10, padding: '1.5rem', border: '1px solid #e2e8f0', maxWidth: 520 },
  field:       { marginBottom: '1rem' },
  label:       { display: 'block', fontSize: 12, color: '#475569', marginBottom: 4 },
  input:       { width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13, boxSizing: 'border-box', outline: 'none' },
  select:      { width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', background: '#fff' },
  chkBox:      { background: '#f8fafc', borderRadius: 8, padding: '10px 12px', marginBottom: 8 },
  chkHeader:   { display: 'flex', justifyContent: 'space-between', marginBottom: 6 },
  chkNum:      { fontSize: 12, fontWeight: 600, color: '#475569' },
  removeBtn:   { fontSize: 11, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' },
  addChkBtn:   { width: '100%', padding: '8px', border: '1px dashed #cbd5e1', borderRadius: 6, background: 'transparent', fontSize: 13, cursor: 'pointer', color: '#64748b', marginTop: 4 },
  errorBox:    { background: '#fee2e2', color: '#dc2626', padding: '8px 12px', borderRadius: 6, fontSize: 13, margin: '1rem 0' },
  btnRow:      { display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' },
  tracker:     { background: '#fff', borderRadius: 10, padding: '1.5rem', border: '1px solid #e2e8f0', position: 'relative' },
  trackerItem: { display: 'flex', gap: 12, position: 'relative', marginBottom: 24 },
  trackerLine: { position: 'absolute', left: 10, top: 24, bottom: -24, width: 2, background: '#e2e8f0', zIndex: 0 },
  trackerDot:  { width: 20, height: 20, borderRadius: 10, flexShrink: 0, marginTop: 2, zIndex: 1 },
  trackerContent:{ flex: 1, background: '#f8fafc', borderRadius: 8, padding: '10px 12px' },
  trackerHeader: { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 },
  trackerName: { fontWeight: 600, fontSize: 14, flex: 1 },
  trackerTime: { fontSize: 11, color: '#94a3b8' },
};