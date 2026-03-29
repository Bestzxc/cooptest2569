import { useState, useEffect, useMemo } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import ProvinceInput from '../components/ProvinceInput';
import Toast, { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';
import { MdPerson, MdLocalGasStation, MdLocalShipping, MdAirportShuttle, MdDirectionsCar, MdTwoWheeler, MdHotel, MdInventory, MdMoveToInbox, MdSearch } from 'react-icons/md';

const STATUS_COLOR = {
  SCHEDULED: { bg: 'rgba(109,40,217,0.15)', text: '#a78bfa' },
  IN_PROGRESS: { bg: 'rgba(37,99,235,0.15)', text: '#60a5fa' },
  COMPLETED: { bg: 'rgba(22,163,74,0.15)', text: '#4ade80' },
  CANCELLED: { bg: 'rgba(220,38,38,0.15)', text: '#f87171' },
};

const CHECKPOINT_COLOR = {
  PENDING: '#94a3b8',
  ARRIVED: '#2563eb',
  DEPARTED: '#16a34a',
  SKIPPED: '#6b7280',
};

export default function TripsPage() {
  const [view, setView] = useState('list');
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackerTrip, setTrackerTrip] = useState(null);
  const [checkpoints, setCheckpoints] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const { toast, showToast, hideToast } = useToast();
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const { user } = useAuth();

  const VEHICLE_ICONS = {
    TRUCK: <MdLocalShipping size={14} color="#00d4ff" />,
    VAN: <MdAirportShuttle size={14} color="#a78bfa" />,
    PICKUP: <MdDirectionsCar size={14} color="#34d399" />,
    MOTORCYCLE: <MdTwoWheeler size={14} color="#fb923c" />,
  };

  const driverVehicleMap = useMemo(() => {
    const map = {};
    trips.forEach(t => {
      if (!t.driver_name || !t.license_plate) return;
      if (!map[t.driver_name]) map[t.driver_name] = new Set();
      map[t.driver_name].add(t.license_plate);
    });
    return Object.entries(map).map(([driver, plates]) => ({
      driver,
      plates: Array.from(plates),
    }));
  }, [trips]);

  useEffect(() => { fetchTrips(); }, []);

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

  const completeTrip = async (tripId) => {
    try {
      await api.patch(`/trips/${tripId}/complete`);
      showToast('Trip Complete อัตโนมัติ ✓');
      fetchTrips();
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'เกิดข้อผิดพลาด', 'error');
    }
  };

  const deleteTrip = async () => {
    try {
      await api.delete(`/trips/${deleteConfirmId}`);
      showToast('ลบ trip สำเร็จ');
      fetchTrips();
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'เกิดข้อผิดพลาด', 'error');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  // sort: IN_PROGRESS → SCHEDULED → COMPLETED → CANCELLED
  const sortedTrips = [...trips].sort((a, b) => {
    const order = { IN_PROGRESS: 0, SCHEDULED: 1, COMPLETED: 2, CANCELLED: 3 };
    return (order[a.status] ?? 9) - (order[b.status] ?? 9);
  });

  const filteredTrips = sortedTrips.filter(t =>
    filterStatus === 'ALL' ? true : t.status === filterStatus
  );

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
      <>
        <Layout>
          <CheckpointTracker
            trip={trackerTrip}
            checkpoints={checkpoints}
            setCheckpoints={setCheckpoints}
            onBack={() => setView('list')}
            showToast={showToast}
            onComplete={async () => {
              await completeTrip(trackerTrip.id);
              setView('list');
            }}
          />
        </Layout>
        <Toast toast={toast} onHide={hideToast} />
      </>
    );
  }

  return (
    <>
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

        {/* Filter Bar */}
        <div style={styles.filterBar}>
          {['ALL', 'IN_PROGRESS', 'SCHEDULED', 'COMPLETED', 'CANCELLED'].map(s => (
            <button
              key={s}
              style={{
                ...styles.filterBtn,
                background: filterStatus === s ? 'rgba(0,212,255,0.15)' : 'transparent',
                color: filterStatus === s ? 'var(--accent)' : 'var(--text-muted)',
                border: filterStatus === s ? '1px solid var(--accent)' : '1px solid var(--border)',
              }}
              onClick={() => setFilterStatus(s)}
            >
              {s === 'ALL' ? 'ทั้งหมด' : s}
              {s !== 'ALL' && (
                <span style={{ marginLeft: 4, fontSize: 10, opacity: .7 }}>
                  ({trips.filter(t => t.status === s).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {loading
          ? <div style={styles.center}>กำลังโหลด...</div>
          : <div style={styles.list}>
            {filteredTrips.length === 0
              ? <div style={styles.center}>ไม่พบ trip</div>
              : filteredTrips.map(t => {
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

                      {(t.status === 'IN_PROGRESS' || t.status === 'SCHEDULED') && (
                        <button style={styles.trackBtn} onClick={() => openTracker(t)}>
                          Track
                        </button>
                      )}

                      {user?.role === 'ADMIN' && t.status !== 'IN_PROGRESS' && (
                        <button
                          style={{ ...styles.trackBtn, background: 'rgba(220,38,38,0.15)', color: '#f87171', border: '1px solid rgba(220,38,38,0.3)' }}
                          onClick={() => setDeleteConfirmId(t.id)}
                        >
                          ✕ ลบ
                        </button>
                      )}
                    </div>
                    <div style={styles.cardSub}>
                      <MdPerson size={12} style={{ verticalAlign: 'middle' }} />
                      {t.driver_name || 'ไม่ระบุคนขับ'} ·
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        {VEHICLE_ICONS[t.type] || <MdDirectionsCar size={14} color="#94a3b8" />} {t.license_plate || '-'}
                      </span> · {t.cargo_type} · {new Date(t.started_at).toLocaleDateString('th-TH')}
                    </div>
                  </div>
                );
              })
            }
          </div>
        }
      </Layout>

      {deleteConfirmId && (
        <ConfirmModal
          title="ลบ Trip นี้?"
          message="การลบจะไม่สามารถกู้คืนได้ และ checkpoints ทั้งหมดจะถูกลบด้วย"
          confirmLabel="✕ ลบ"
          danger={true}
          onConfirm={deleteTrip}
          onCancel={() => setDeleteConfirmId(null)}
        />
      )}

      <Toast toast={toast} onHide={hideToast} />
    </>
  );
}

// ── Trip Form (3 Steps) ───────────────────────────────
function TripForm({ onSuccess, onCancel }) {
  const [step, setStep] = useState(1);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [busyVehicleIds, setBusyVehicleIds] = useState([]);
  const [busyDriverIds, setBusyDriverIds] = useState([]);
  const [form, setForm] = useState({
    vehicle_id: '', driver_id: '',
    origin: '', destination: '', distance_km: '',
    cargo_type: 'GENERAL', cargo_weight_kg: '',
    checkpoints: [{ location_name: '', purpose: 'DELIVERY', notes: '' }],
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/vehicles'), api.get('/drivers'), api.get('/trips')])
      .then(([vRes, dRes, tRes]) => {
        setVehicles(vRes.data.filter(v => v.status !== 'RETIRED'));
        setDrivers(dRes.data);
        const active = tRes.data.filter(t => t.status === 'IN_PROGRESS');
        setBusyVehicleIds(active.map(t => t.vehicle_id));
        setBusyDriverIds(active.map(t => t.driver_id));
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

      <div style={styles.stepRow}>
        {[1, 2, 3].map(s => (
          <div key={s} style={{ flex: 1 }}>
            <div style={{
              ...styles.stepDot,
              background: s <= step ? '#1d4ed8' : 'var(--border)',
              color: s <= step ? '#fff' : '#94a3b8',
            }}>{s}</div>
            <div style={{ height: 4, background: s < step ? '#1d4ed8' : 'var(--border)', marginTop: 4 }} />
          </div>
        ))}
      </div>

      <div style={styles.formCard}>
        {step === 1 && (
          <div>
            <h3 style={styles.stepTitle}>1. เลือก Vehicle & Driver</h3>
            <div style={styles.field}>
              <label style={styles.label}>Vehicle</label>
              <select style={styles.select}
                value={form.vehicle_id}
                onChange={e => setForm({ ...form, vehicle_id: e.target.value })}>
                <option value="">-- เลือกรถ --</option>
                {vehicles.map(v => {
                  const busy = busyVehicleIds.includes(v.id);
                  const maintenance = v.status === 'MAINTENANCE';
                  return (
                    <option
                      key={v.id}
                      value={v.id}
                      disabled={busy || maintenance}
                      style={{ color: maintenance ? '#f59e0b' : undefined }}
                    >
                      {v.license_plate} — {v.brand} {v.model} ({v.status})
                      {busy ? ' 🔴 กำลังวิ่งอยู่' : ''}
                      {maintenance ? ' 🟠 กำลังบำรุงรักษา' : ''}
                    </option>
                  );
                })}
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
                  const busy = busyDriverIds.includes(d.id);
                  return (
                    <option key={d.id} value={d.id} disabled={expired || busy}>
                      {d.name}
                      {expired ? ' (ใบขับขี่หมดอายุ)' : ''}
                      {busy ? ' 🔴 กำลังวิ่งอยู่' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 style={styles.stepTitle}>2. กำหนด Origin & Destination</h3>
            <div style={styles.field}>
              <label style={styles.label}>ต้นทาง</label>
              <ProvinceInput
                value={form.origin}
                onChange={val => setForm({ ...form, origin: val })}
                placeholder="พิมพ์จังหวัดต้นทาง..."
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>ปลายทาง</label>
              <ProvinceInput
                value={form.destination}
                onChange={val => setForm({ ...form, destination: val })}
                placeholder="พิมพ์จังหวัดปลายทาง..."
              />
            </div>
            {[
              ['ระยะทาง (km)', 'distance_km'],
              ['น้ำหนักสินค้า (kg)', 'cargo_weight_kg'],
            ].map(([label, key]) => (
              <div key={key} style={styles.field}>
                <label style={styles.label}>{label}</label>
                <input style={styles.input} type="number"
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
                      })}>ลบ</button>
                  )}
                </div>
                <div style={{ marginBottom: 6 }}>
                  <ProvinceInput
                    value={c.location_name}
                    onChange={val => updateChk(i, 'location_name', val)}
                    placeholder="เลือกจังหวัด..."
                  />
                </div>
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

        <div style={styles.btnRow}>
          <div style={{ display: 'flex', gap: 8 }}>
            {step > 1 && (
              <button style={styles.secondaryBtn} onClick={() => setStep(s => s - 1)}>← Back</button>
            )}
            <button style={styles.secondaryBtn} onClick={onCancel}>Cancel</button>
          </div>
          {step < 3
            ? <button style={styles.primaryBtn} disabled={!validateStep()}
              onClick={() => setStep(s => s + 1)}>Next →</button>
            : <button style={styles.primaryBtn} disabled={!validateStep() || submitting}
              onClick={submit}>{submitting ? 'กำลังสร้าง...' : 'Create Trip'}</button>
          }
        </div>
      </div>
    </div>
  );
}

// ── Checkpoint Tracker ────────────────────────────────
function CheckpointTracker({ trip, checkpoints, setCheckpoints, onBack, showToast, onComplete }) {
  const [updating, setUpdating] = useState(null);

  const purposeIcon = {
    FUEL: <MdLocalGasStation size={18} color="#facc15" />,
    REST: <MdHotel size={18} color="#a78bfa" />,
    DELIVERY: <MdInventory size={18} color="#34d399" />,
    PICKUP: <MdMoveToInbox size={18} color="#60a5fa" />,
    INSPECTION: <MdSearch size={18} color="#fb923c" />,
  };

  const updateStatus = async (chk, newStatus) => {
    setUpdating(chk.id);
    const prev = [...checkpoints];

    setCheckpoints(c => c.map(x => x.id === chk.id ? { ...x, status: newStatus } : x));
    await new Promise(r => setTimeout(r, 300 + Math.random() * 500));

    if (Math.random() < 0.3) {
      setCheckpoints(prev);
      showToast('อัปเดตล้มเหลว กรุณาลองใหม่อีกครั้ง', 'error');
      setUpdating(null);
      return;
    }

    try {
      await api.patch(`/trips/checkpoints/${chk.id}/status`, { status: newStatus });
      showToast('อัปเดตสถานะสำเร็จ ✓');

      if (newStatus === 'DEPARTED') {
        const updated = checkpoints.map(x => x.id === chk.id ? { ...x, status: 'DEPARTED' } : x);
        const sorted = [...updated].sort((a, b) => a.sequence - b.sequence);
        const lastChk = sorted[sorted.length - 1];
        const allDone = sorted.every(x => x.status === 'DEPARTED' || x.status === 'SKIPPED');

        if (lastChk.id === chk.id && allDone) {
          showToast('ถึง checkpoint สุดท้ายแล้ว — กำลัง Complete Trip...');
          await new Promise(r => setTimeout(r, 800));
          await onComplete();
        }
      }
    } catch (err) {
      setCheckpoints(prev);
      showToast(err.response?.data?.error?.message || 'เกิดข้อผิดพลาด', 'error');
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
            {i < sorted.length - 1 && <div style={styles.trackerLine} />}
            <div style={{ ...styles.trackerDot, background: CHECKPOINT_COLOR[c.status] }} />
            <div style={styles.trackerContent}>
              <div style={styles.trackerHeader}>
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  {purposeIcon[c.purpose] || '📍'}
                </span>
                <span style={styles.trackerName}>{c.location_name}</span>
                <span style={{ ...styles.badge, background: 'var(--bg-surface)', color: CHECKPOINT_COLOR[c.status], fontWeight: 700 }}>
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

              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                {c.status === 'PENDING' && (
                  <button style={{ ...styles.trackBtn, background: '#2563eb', color: '#fff' }}
                    disabled={updating === c.id}
                    onClick={() => updateStatus(c, 'ARRIVED')}>
                    {updating === c.id ? '...' : 'Mark Arrived'}
                  </button>
                )}
                {c.status === 'ARRIVED' && (
                  <button style={{ ...styles.trackBtn, background: '#16a34a', color: '#fff' }}
                    disabled={updating === c.id}
                    onClick={() => updateStatus(c, 'DEPARTED')}>
                    {updating === c.id ? '...' : 'Mark Departed'}
                  </button>
                )}
                {c.status === 'PENDING' && (
                  <button style={styles.secondaryBtn}
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
  title: { margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' },
  subtitle: { margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' },
  center: { textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' },
  list: { display: 'grid', gap: 8 },
  card: { background: 'var(--bg-surface)', borderRadius: 10, padding: '12px 16px', border: '1px solid var(--border)' },
  cardRow: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  cardSub: { fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 },
  badge: { fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, whiteSpace: 'nowrap' },
  route: { fontWeight: 600, fontSize: 14, flex: 1, color: 'var(--text-primary)' },
  km: { fontSize: 12, color: 'var(--text-secondary)' },
  plate: { fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'monospace' },
  primaryBtn: { padding: '8px 16px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  secondaryBtn: { padding: '8px 16px', background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13, cursor: 'pointer' },
  trackBtn: { padding: '4px 12px', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: '#1d4ed8', color: '#fff' },
  filterBar: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '1rem' },
  filterBtn: { padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all .15s' },
  mappingBox: { border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-base)', padding: '10px 12px', marginBottom: '1rem' },
  mappingList: { marginTop: 6, display: 'grid', gap: 4 },
  mappingItem: { fontSize: 12, display: 'flex', gap: 6, alignItems: 'center' },
  mappingDriver: { color: 'var(--text-primary)', fontWeight: 600 },
  mappingSeparator: { color: 'var(--text-muted)' },
  mappingPlate: { color: 'var(--text-secondary)' },
  stepRow: { display: 'flex', gap: 4, marginBottom: '1.5rem' },
  stepDot: { width: 28, height: 28, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, margin: '0 auto' },
  stepTitle: { margin: '0 0 1rem', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' },
  formCard: { background: 'var(--bg-surface)', borderRadius: 10, padding: '1.5rem', border: '1px solid var(--border)', maxWidth: 520 },
  field: { marginBottom: '1rem' },
  label: { display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 },
  input: { width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 13, boxSizing: 'border-box', outline: 'none', background: 'var(--bg-base)', color: 'var(--text-primary)' },
  select: { width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 13, outline: 'none', background: 'var(--bg-base)', color: 'var(--text-primary)' },
  chkBox: { background: 'var(--bg-base)', borderRadius: 8, padding: '10px 12px', marginBottom: 8, border: '1px solid var(--border)' },
  chkHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: 6 },
  chkNum: { fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' },
  removeBtn: { fontSize: 11, color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' },
  addChkBtn: { width: '100%', padding: '8px', border: '1px dashed var(--border)', borderRadius: 6, background: 'transparent', fontSize: 13, cursor: 'pointer', color: 'var(--text-muted)', marginTop: 4 },
  errorBox: { background: 'rgba(220,38,38,0.15)', color: '#f87171', padding: '8px 12px', borderRadius: 6, fontSize: 13, margin: '1rem 0', border: '1px solid rgba(220,38,38,0.3)' },
  btnRow: { display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' },
  tracker: { background: 'var(--bg-surface)', borderRadius: 10, padding: '1.5rem', border: '1px solid var(--border)', position: 'relative' },
  trackerItem: { display: 'flex', gap: 12, position: 'relative', marginBottom: 24 },
  trackerLine: { position: 'absolute', left: 10, top: 24, bottom: -24, width: 2, background: 'var(--border)', zIndex: 0 },
  trackerDot: { width: 20, height: 20, borderRadius: 10, flexShrink: 0, marginTop: 2, zIndex: 1 },
  trackerContent: { flex: 1, background: 'var(--bg-base)', borderRadius: 8, padding: '10px 12px', border: '1px solid var(--border)' },
  trackerHeader: { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 },
  trackerName: { fontWeight: 600, fontSize: 14, flex: 1, color: 'var(--text-primary)' },
  trackerTime: { fontSize: 11, color: 'var(--text-muted)' },
};