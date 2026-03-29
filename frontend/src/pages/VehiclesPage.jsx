import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Toast, { useToast } from '../components/Toast';
import { MdLocalShipping, MdAirportShuttle, MdDirectionsCar, MdTwoWheeler, MdLocalGasStation, MdPerson, MdAdd } from 'react-icons/md';

const STATUS_COLOR = {
  ACTIVE: { bg: 'rgba(22,163,74,0.15)', text: '#4ade80' },
  IDLE: { bg: 'rgba(234,179,8,0.15)', text: '#facc15' },
  MAINTENANCE: { bg: 'rgba(249,115,22,0.15)', text: '#fb923c' },
  RETIRED: { bg: 'rgba(100,116,139,0.15)', text: '#94a3b8' },
};

const TYPE_ICON = {
  TRUCK: <MdLocalShipping size={20} color="#00d4ff" />,
  VAN: <MdAirportShuttle size={20} color="#a78bfa" />,
  PICKUP: <MdDirectionsCar size={20} color="#34d399" />,
  MOTORCYCLE: <MdTwoWheeler size={20} color="#fb923c" />,
};

export default function VehiclesPage() {
  const [searchParams, setSearchParams] = useSearchParams();  // ต้องมาก่อน
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || 'ALL');
  const [filterType, setFilterType] = useState(searchParams.get('type') || 'ALL');
  const { toast, showToast, hideToast } = useToast();
  const { user } = useAuth();
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [vRes, dRes] = await Promise.all([api.get('/vehicles'), api.get('/drivers')]);
      setVehicles(vRes.data);
      setDrivers(dRes.data);
    } catch (err) {
      setError('โหลดข้อมูลไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (vehicleId) => {
    setHistoryLoading(true);
    try {
      const res = await api.get(`/vehicles/${vehicleId}/history`);
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const updateFilter = (key, value) => {
    const params = Object.fromEntries(searchParams);
    if (value && value !== 'ALL' && value !== '') {
      params[key] = value;
    } else {
      delete params[key];
    }
    setSearchParams(params);
  };

  const filtered = useMemo(() => {
    const ORDER = { ACTIVE: 0, IDLE: 1, MAINTENANCE: 2, RETIRED: 3 };
    return vehicles
      .filter(v => {
        if (filterStatus !== 'ALL' && v.status !== filterStatus) return false;
        if (filterType !== 'ALL' && v.type !== filterType) return false;
        if (search) {
          const s = search.toLowerCase();
          return v.license_plate.toLowerCase().includes(s) ||
            v.brand?.toLowerCase().includes(s) ||
            v.model?.toLowerCase().includes(s);
        }
        return true;
      })
      .sort((a, b) => (ORDER[a.status] ?? 9) - (ORDER[b.status] ?? 9));
  }, [vehicles, filterStatus, filterType, search]);

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={styles.title}>Vehicles</h1>
          <p style={styles.subtitle}>จัดการยานพาหนะทั้งหมด</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button style={styles.primaryBtn} onClick={() => setShowForm(true)}>
            <MdAdd size={16} /> New Vehicle
          </button>
        )}
      </div>

      <div style={styles.filterBar}>
        <input
          style={styles.searchInput}
          placeholder="ค้นหาทะเบียน / ยี่ห้อ / รุ่น..."
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            updateFilter('search', e.target.value);
          }}
        />
        <select
          style={styles.select}
          value={filterStatus}
          onChange={e => {
            setFilterStatus(e.target.value);
            updateFilter('status', e.target.value);
          }}
        >
          <option value="ALL">Status: All</option>
          {['ACTIVE', 'IDLE', 'MAINTENANCE', 'RETIRED'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select
          style={styles.select}
          value={filterType}
          onChange={e => {
            setFilterType(e.target.value);
            updateFilter('type', e.target.value);
          }}
        >
          <option value="ALL">Type: All</option>
          {['TRUCK', 'VAN', 'PICKUP', 'MOTORCYCLE'].map(t => <option key={t}>{t}</option>)}
        </select>
        <span style={styles.count}>แสดง {filtered.length}/{vehicles.length}</span>
      </div>

      {loading && <div style={styles.center}>กำลังโหลด...</div>}
      {error && <div style={styles.errorBox}>{error}</div>}

      {!loading && !error && (
        <div style={styles.grid}>
          {filtered.length === 0
            ? <div style={styles.center}>ไม่พบข้อมูล</div>
            : filtered.map(v => {
              const sc = STATUS_COLOR[v.status] || STATUS_COLOR.IDLE;
              const pct = v.next_service_km
                ? Math.min(100, ((v.mileage_km - v.last_service_km) /
                  (v.next_service_km - v.last_service_km)) * 100)
                : 0;
              return (
                <div key={v.id} style={styles.card} onClick={() => {
                  setSelectedVehicle(v);
                  fetchHistory(v.id);
                }}>
                  <div style={styles.cardHeader}>
                    <span style={styles.typeIcon}>{TYPE_ICON[v.type]}</span>
                    <span style={styles.plate}>{v.license_plate}</span>
                    <span style={{ ...styles.badge, background: sc.bg, color: sc.text }}>
                      {v.status}
                    </span>
                  </div>
                  <div style={styles.cardBody}>
                    <div style={styles.info}>{v.brand} {v.model} ({v.year})</div>
                    <div style={styles.info}>
                      <MdLocalGasStation size={14} color="#facc15" /> {v.fuel_type}
                    </div>
                    {v.driver_name && (
                      <div style={styles.info}>
                        <MdPerson size={14} color="#00d4ff" /> {v.driver_name}
                      </div>
                    )}
                  </div>
                  <div style={styles.mileageRow}>
                    <span style={styles.mileageText}>{v.mileage_km?.toLocaleString()} km</span>
                    <div style={styles.progressBg}>
                      <div style={{
                        ...styles.progressFill,
                        width: `${pct}%`,
                        background: pct > 90 ? '#ef4444' : pct > 70 ? '#f59e0b' : '#10b981',
                      }} />
                    </div>
                    <span style={styles.mileageText}>next {v.next_service_km?.toLocaleString()}</span>
                  </div>
                </div>
              );
            })
          }
        </div>
      )}

      {showForm && (
        <VehicleForm
          drivers={drivers}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            fetchAll();
            setShowForm(false);
            showToast('เพิ่มรถสำเร็จแล้ว');
          }}
        />
      )}

      {selectedVehicle && (
        <div style={styles.modalOverlay} onClick={() => setSelectedVehicle(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2>ประวัติ {selectedVehicle.license_plate}</h2>
              <button style={styles.closeBtn} onClick={() => setSelectedVehicle(null)}>×</button>
            </div>
            <div style={styles.modalBody}>
              {historyLoading ? (
                <div style={styles.center}>กำลังโหลดประวัติ...</div>
              ) : history.length === 0 ? (
                <div style={styles.center}>ไม่มีประวัติ</div>
              ) : (
                <div style={styles.historyList}>
                  {history.map(item => {
                    const date = item.type === 'trip' ? item.started_at : item.scheduled_at;
                    const formattedDate = new Date(date).toLocaleDateString('th-TH', {
                      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    });
                    return (
                      <div key={`${item.type}-${item.id}`} style={styles.historyItem}>
                        <div style={styles.historyIcon}>
                          {item.type === 'trip' ? '🚛' : '🔧'}
                        </div>
                        <div style={styles.historyContent}>
                          {item.type === 'trip' ? (
                            <>
                              <div style={styles.historyTitle}>
                                Trip: {item.origin} → {item.destination}
                              </div>
                              <div style={styles.historySub}>
                                Status: {item.status} | Distance: {item.distance_km} km
                              </div>
                            </>
                          ) : (
                            <>
                              <div style={styles.historyTitle}>
                                Maintenance: {item.type.replace('_', ' ')}
                              </div>
                              <div style={styles.historySub}>
                                Status: {item.status} | {item.notes || 'No notes'}
                              </div>
                            </>
                          )}
                          <div style={styles.historyDate}>{formattedDate}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Toast toast={toast} onHide={hideToast} />
    </Layout>
  );
}

function VehicleForm({ drivers, onClose, onSuccess }) {
  const [form, setForm] = useState({
    license_plate: '', type: 'TRUCK', brand: '', model: '',
    year: '', fuel_type: 'DIESEL', mileage_km: '0',
    last_service_km: '0', next_service_km: '10000', driver_id: '',
  });
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const f = (key, val) => {
    setForm(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: false }));
  };

  const submit = async () => {
    setError('');
    const errs = {};
    if (!form.license_plate.trim()) errs.license_plate = true;
    if (!form.brand.trim()) errs.brand = true;
    if (!form.model.trim()) errs.model = true;
    if (!form.year) errs.year = true;
    if (!form.mileage_km) errs.mileage_km = true;
    if (!form.next_service_km) errs.next_service_km = true;

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const labels = {
        license_plate: 'ทะเบียนรถ', brand: 'ยี่ห้อ', model: 'รุ่น',
        year: 'ปี', mileage_km: 'เลขไมล์', next_service_km: 'Next Service KM',
      };
      return setError(`กรุณากรอก: ${Object.keys(errs).map(k => labels[k]).join(', ')}`);
    }

    if (Number(form.year) < 1990)
      return setError('ปีรถต้องไม่น้อยกว่า 1990');
    if (Number(form.mileage_km) < 0)
      return setError('เลขไมล์ต้องไม่ติดลบ');
    if (Number(form.next_service_km) <= Number(form.last_service_km))
      return setError('Next Service KM ต้องมากกว่า Last Service KM');

    setErrors({});
    setLoading(true);
    try {
      await api.post('/vehicles', {
        ...form,
        year: Number(form.year),
        mileage_km: Number(form.mileage_km),
        last_service_km: Number(form.last_service_km),
        next_service_km: Number(form.next_service_km),
        driver_id: form.driver_id || undefined,
      });
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
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <span style={styles.modalTitle}>NEW VEHICLE</span>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={styles.modalBody}>
          <div style={styles.formGrid}>
            {[
              ['ทะเบียน', 'license_plate', 'text', 'กข-1234'],
              ['ยี่ห้อ', 'brand', 'text', 'Isuzu'],
              ['รุ่น', 'model', 'text', 'D-Max'],
              ['ปี', 'year', 'number', '2020'],
              ['MILEAGE (KM)', 'mileage_km', 'number', '0'],
              ['LAST SERVICE (KM)', 'last_service_km', 'number', '0'],
              ['NEXT SERVICE (KM)', 'next_service_km', 'number', '10000'],
            ].map(([label, key, type, ph]) => (
              <div key={key} style={styles.field}>
                <label style={styles.label}>{label}</label>
                <input
                  type={type} placeholder={ph}
                  value={form[key]}
                  onChange={e => f(key, e.target.value)}
                  style={inputStyle(key)}
                />
              </div>
            ))}

            <div style={styles.field}>
              <label style={styles.label}>ประเภท</label>
              <select value={form.type} onChange={e => f('type', e.target.value)}
                style={inputStyle('type')}>
                {['TRUCK', 'VAN', 'PICKUP', 'MOTORCYCLE'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>เชื้อเพลิง</label>
              <select value={form.fuel_type} onChange={e => f('fuel_type', e.target.value)}
                style={inputStyle('fuel_type')}>
                {['DIESEL', 'GASOLINE', 'ELECTRIC', 'HYBRID'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div style={{ ...styles.field, gridColumn: '1 / -1' }}>
              <label style={styles.label}>คนขับ (optional)</label>
              <select value={form.driver_id} onChange={e => f('driver_id', e.target.value)}
                style={inputStyle('driver_id')}>
                <option value="">-- ยังไม่กำหนดคนขับ --</option>
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
          {error && <div style={styles.errorBox}>{error}</div>}
        </div>
        <div style={styles.modalFooter}>
          <button style={styles.cancelBtn} onClick={onClose}>ยกเลิก</button>
          <button style={styles.primaryBtn} onClick={submit} disabled={loading}>
            {loading ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  title: { margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' },
  subtitle: { margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' },
  primaryBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  filterBar: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: '1rem', background: 'var(--bg-surface)', padding: '12px', borderRadius: 8, border: '1px solid var(--border)' },
  searchInput: { padding: '7px 12px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 13, width: 220, outline: 'none', background: 'var(--bg-base)', color: 'var(--text-primary)' },
  select: { padding: '7px 10px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 13, outline: 'none', background: 'var(--bg-base)', color: 'var(--text-primary)', width: 'auto' },
  count: { marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' },
  grid: { display: 'grid', gap: 10 },
  card: { background: 'var(--bg-surface)', borderRadius: 10, padding: '14px 16px', border: '1px solid var(--border)' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  typeIcon: { fontSize: 18 },
  plate: { fontWeight: 700, fontSize: 15, fontFamily: 'monospace', flex: 1, color: 'var(--text-primary)' },
  badge: { fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999 },
  cardBody: { marginBottom: 10 },
  info: { fontSize: 12, color: 'var(--text-secondary)', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4 },
  mileageRow: { display: 'flex', alignItems: 'center', gap: 8 },
  mileageText: { fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' },
  progressBg: { flex: 1, height: 6, background: 'var(--bg-base)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3, transition: 'width .3s' },
  center: { textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' },
  errorBox: { background: 'rgba(220,38,38,0.15)', color: '#f87171', padding: '12px', borderRadius: 8, fontSize: 13, border: '1px solid rgba(220,38,38,0.3)', marginTop: 8 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal: { background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', width: 520, maxWidth: '90vw', border: '1px solid var(--border)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' },
  modalTitle: { fontSize: 14, fontWeight: 700, letterSpacing: 2, color: 'var(--accent)' },
  closeBtn: { background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: 16, cursor: 'pointer' },
  modalBody: { padding: '1.25rem 1.5rem', overflowY: 'auto' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '1rem 1.5rem', borderTop: '1px solid var(--border)' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem 1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { fontSize: 10, letterSpacing: 2, color: 'var(--text-muted)', fontWeight: 600 },
  cancelBtn: { padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal: { background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', width: 600, maxWidth: '90vw', border: '1px solid var(--border)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' },
  closeBtn: { background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: 16, cursor: 'pointer' },
  modalBody: { padding: '1.25rem 1.5rem', overflowY: 'auto' },
  historyList: { display: 'flex', flexDirection: 'column', gap: 12 },
  historyItem: { display: 'flex', gap: 12, padding: '12px', background: 'var(--bg-base)', borderRadius: 8, border: '1px solid var(--border)' },
  historyIcon: { fontSize: 20, flexShrink: 0 },
  historyContent: { flex: 1 },
  historyTitle: { fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 },
  historySub: { fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 },
  historyDate: { fontSize: 11, color: 'var(--text-muted)' },
};