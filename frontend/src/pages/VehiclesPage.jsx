import { useState, useEffect, useMemo } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { MdLocalShipping, MdAirportShuttle, MdDirectionsCar, MdTwoWheeler, MdLocalGasStation, MdPerson } from 'react-icons/md';

const STATUS_COLOR = {
  ACTIVE:      { bg: 'rgba(22,163,74,0.15)',   text: '#4ade80' },
  IDLE:        { bg: 'rgba(234,179,8,0.15)',   text: '#facc15' },
  MAINTENANCE: { bg: 'rgba(249,115,22,0.15)',  text: '#fb923c' },
  RETIRED:     { bg: 'rgba(100,116,139,0.15)', text: '#94a3b8' },
};

const TYPE_ICON = {
  TRUCK:      <MdLocalShipping size={20} color="#00d4ff" />,
  VAN:        <MdAirportShuttle size={20} color="#a78bfa" />,
  PICKUP:     <MdDirectionsCar size={20} color="#34d399" />,
  MOTORCYCLE: <MdTwoWheeler size={20} color="#fb923c" />,
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // filter state
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');

  // โหลดข้อมูลจาก API
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await api.get('/vehicles');
        setVehicles(res.data);
      } catch (err) {
        setError('โหลดข้อมูลไม่สำเร็จ');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  // filter ทำงานบน client-side
  const filtered = useMemo(() => {
    return vehicles.filter(v => {
      if (filterStatus !== 'ALL' && v.status !== filterStatus) return false;
      if (filterType !== 'ALL' && v.type !== filterType) return false;
      if (search) {
        const s = search.toLowerCase();
        return (
          v.license_plate.toLowerCase().includes(s) ||
          v.brand?.toLowerCase().includes(s) ||
          v.model?.toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [vehicles, filterStatus, filterType, search]);

  return (
    <Layout>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={styles.title}>Vehicles</h1>
        <p style={styles.subtitle}>จัดการยานพาหนะทั้งหมด</p>
      </div>

      {/* Filter Bar */}
      <div style={styles.filterBar}>
        <input
          style={styles.searchInput}
          placeholder="ค้นหาทะเบียน / ยี่ห้อ / รุ่น..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select
          style={styles.select}
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="ALL">Status: All</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="IDLE">IDLE</option>
          <option value="MAINTENANCE">MAINTENANCE</option>
          <option value="RETIRED">RETIRED</option>
        </select>

        <select
          style={styles.select}
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
        >
          <option value="ALL">Type: All</option>
          <option value="TRUCK">TRUCK</option>
          <option value="VAN">VAN</option>
          <option value="PICKUP">PICKUP</option>
          <option value="MOTORCYCLE">MOTORCYCLE</option>
        </select>

        <span style={styles.count}>
          แสดง {filtered.length}/{vehicles.length}
        </span>
      </div>

      {/* Content */}
      {loading && <div style={styles.center}>กำลังโหลด...</div>}
      {error  && <div style={styles.errorBox}>{error}</div>}

      {!loading && !error && (
        <div style={styles.grid}>
          {filtered.length === 0 ? (
            <div style={styles.center}>ไม่พบข้อมูล</div>
          ) : (
            filtered.map(v => {
              const sc = STATUS_COLOR[v.status] || STATUS_COLOR.IDLE;
              const pct = v.next_service_km
                ? Math.min(100, ((v.mileage_km - v.last_service_km) /
                    (v.next_service_km - v.last_service_km)) * 100)
                : 0;

              return (
                <div key={v.id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <span style={styles.typeIcon}>{TYPE_ICON[v.type]}</span>
                    <span style={styles.plate}>{v.license_plate}</span>
                    <span style={{
                    ...styles.badge,
                    background: sc.bg,
                    color: sc.text,
                  }}>
                    {v.status}
                  </span>
                  </div>

                  <div style={styles.cardBody}>
                    <div style={styles.info}>
                      {v.brand} {v.model} ({v.year})
                    </div>
                    <div style={styles.info}>
                      <MdLocalGasStation size={14} color="#facc15" /> {v.fuel_type}
                    </div>
                    {v.driver_name && (
                      <div style={styles.info}>
                        <MdPerson size={14} color="#00d4ff" /> {v.driver_name}
                      </div>
                    )}
                  </div>

                  {/* Mileage progress bar */}
                  <div style={styles.mileageRow}>
                    <span style={styles.mileageText}>
                      {v.mileage_km?.toLocaleString()} km
                    </span>
                    <div style={styles.progressBg}>
                      <div style={{
                        ...styles.progressFill,
                        width: `${pct}%`,
                        background: pct > 90 ? '#dc2626'
                                  : pct > 70 ? '#d97706'
                                  : '#16a34a',
                      }} />
                    </div>
                    <span style={styles.mileageText}>
                      next {v.next_service_km?.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </Layout>
  );
}

const styles = {
  title: { margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' },
  subtitle: { margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' },

  filterBar: {
    display: 'flex', gap: 8, alignItems: 'center',
    flexWrap: 'wrap', marginBottom: '1rem',
    background: 'var(--bg-surface)',       // เปลี่ยนจาก #fff
    padding: '12px',
    borderRadius: 8,
    border: '1px solid var(--border)',     // เปลี่ยนจาก #e2e8f0
  },
  searchInput: {
    padding: '7px 12px', borderRadius: 6,
    border: '1px solid var(--border)',     // เปลี่ยน
    fontSize: 13, width: 220, outline: 'none',
    background: 'var(--bg-base)',          // เปลี่ยน
    color: 'var(--text-primary)',          // เพิ่ม
  },
  select: {
    padding: '7px 10px', borderRadius: 6,
    border: '1px solid var(--border)',     // เปลี่ยน
    fontSize: 13, outline: 'none',
    background: 'var(--bg-base)',          // เปลี่ยนจาก #fff
    color: 'var(--text-primary)',          // เพิ่ม
  },
  count: { marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' },
  grid: { display: 'grid', gap: 10 },

  card: {
    background: 'var(--bg-surface)',       // เปลี่ยนจาก #fff
    borderRadius: 10,
    padding: '14px 16px',
    border: '1px solid var(--border)',     // เปลี่ยน
  },
  cardHeader: {
    display: 'flex', alignItems: 'center',
    gap: 8, marginBottom: 8,
  },
  typeIcon: { fontSize: 18 },
  plate: {
    fontWeight: 700, fontSize: 15,
    fontFamily: 'monospace', flex: 1,
    color: 'var(--text-primary)',          // เพิ่ม
  },
  badge: {
    fontSize: 11, fontWeight: 600,
    padding: '2px 8px', borderRadius: 999,
  },
  cardBody: { marginBottom: 10 },
  info: { 
    fontSize: 12, color: 'var(--text-secondary)', marginBottom: 2,
    display: 'flex', alignItems: 'center', gap: 4,  // เพิ่ม
  },
  mileageRow: { display: 'flex', alignItems: 'center', gap: 8 },
  mileageText: { fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' },
  progressBg: {
    flex: 1, height: 6,
    background: 'var(--bg-base)',          // เปลี่ยนจาก #f1f5f9
    borderRadius: 3, overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3, transition: 'width .3s' },
  center: { textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' },
  errorBox: {
    background: 'rgba(220,38,38,0.15)',    // เปลี่ยนให้เข้ากับ dark theme
    color: '#f87171',
    padding: '12px', borderRadius: 8, fontSize: 13,
    border: '1px solid rgba(220,38,38,0.3)',
  },
};