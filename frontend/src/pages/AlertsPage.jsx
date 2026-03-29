import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { MdLocalShipping, MdBuild, MdPerson, MdMap, MdRefresh } from 'react-icons/md';

const SEVERITY_STYLE = {
  CRITICAL: { bg: 'rgba(220,38,38,0.15)', text: '#f87171', dot: '#f87171' },
  WARNING: { bg: 'rgba(234,179,8,0.15)', text: '#facc15', dot: '#facc15' },
};

const RESOURCE_ICON = {
  vehicle: <MdLocalShipping size={20} color="#00d4ff" />,
  maintenance: <MdBuild size={20} color="#fb923c" />,
  driver: <MdPerson size={20} color="#a78bfa" />,
  trip: <MdMap size={20} color="#34d399" />,
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fSeverity, setFSeverity] = useState('ALL');
  const [fType, setFType] = useState('ALL');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/alerts');
      setAlerts(res.data.alerts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // filter บน client-side
  const filtered = alerts.filter(a => {
    if (fSeverity !== 'ALL' && a.severity !== fSeverity) return false;
    if (fType !== 'ALL' && a.affected_resource_type !== fType) return false;
    return true;
  });

  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL').length;
  const warningCount = alerts.filter(a => a.severity === 'WARNING').length;

  return (
    <Layout>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={styles.title}>Alerts</h1>
        <p style={styles.subtitle}>ระบบแจ้งเตือนอัตโนมัติ</p>
      </div>

      {/* Summary */}
      <div style={styles.summaryRow}>
        <div style={{ ...styles.summaryCard, background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.25)' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#f87171' }}>{criticalCount}</div>
          <div style={{ fontSize: 12, color: '#f87171' }}>CRITICAL</div>
        </div>
        <div style={{ ...styles.summaryCard, background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.25)' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#facc15' }}>{warningCount}</div>
          <div style={{ fontSize: 12, color: '#facc15' }}>WARNING</div>
        </div>
        <div style={{ ...styles.summaryCard, background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>{alerts.length}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>TOTAL</div>
        </div>
      </div>

      {/* Filter */}
      <div style={styles.filterBar}>
        <select style={styles.select}
          value={fSeverity}
          onChange={e => setFSeverity(e.target.value)}>
          <option value="ALL">Severity: All</option>
          <option value="CRITICAL">CRITICAL</option>
          <option value="WARNING">WARNING</option>
        </select>

        <select style={styles.select}
          value={fType}
          onChange={e => setFType(e.target.value)}>
          <option value="ALL">Resource: All</option>
          <option value="vehicle">Vehicle</option>
          <option value="maintenance">Maintenance</option>
          <option value="driver">Driver</option>
          <option value="trip">Trip</option>
        </select>

        <span style={styles.count}>
          แสดง {filtered.length}/{alerts.length} alerts
        </span>

        <button style={styles.refreshBtn} onClick={fetchAlerts}>
          <MdRefresh size={14} />
          Refresh
        </button>
      </div>

      {/* Alerts List */}
      {loading
        ? <div style={styles.center}>กำลังโหลด...</div>
        : filtered.length === 0
          ? (
            <div style={styles.emptyBox}>
              ✓ ไม่มี alert ที่ตรงกับ filter
            </div>
          )
          : (
            <div style={styles.list}>
              {filtered.map((a, i) => {
                const ss = SEVERITY_STYLE[a.severity] || SEVERITY_STYLE.WARNING;
                return (
                  <div key={i} style={{
                    ...styles.card,
                    borderLeft: `4px solid ${ss.dot}`,
                  }}>
                    <div style={styles.cardRow}>

                      {/* Icon */}
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        {RESOURCE_ICON[a.affected_resource_type] || <MdBuild size={20} color="#94a3b8" />}
                      </span>

                      {/* Message */}
                      <div style={{ flex: 1 }}>
                        <div style={styles.message}>{a.message}</div>
                        <div style={styles.meta}>
                          Resource: {a.affected_resource_type} ·{' '}
                          <span style={{ fontFamily: 'monospace', fontSize: 11 }}>
                            {a.affected_resource_id}
                          </span>
                        </div>
                      </div>

                      {/* Severity badge */}
                      <span style={{
                        ...styles.badge,
                        background: ss.bg,
                        color: ss.text,
                      }}>
                        {a.severity}
                      </span>

                    </div>
                  </div>
                );
              })}
            </div>
          )
      }

      {/* Rules info */}
      <div style={styles.rulesBox}>
        <div style={styles.rulesTitle}>Active Alert Rules</div>
        {[
          'mileage_km ≥ next_service_km → CRITICAL: Vehicle Due for Service',
          'maintenance SCHEDULED เลยมา > 3 วัน → CRITICAL: Overdue Maintenance',
          'driver license หมดอายุภายใน 30 วัน → WARNING: License Expiring Soon',
          'trip IN_PROGRESS นานเกิน 150% → WARNING: Trip Delayed',
        ].map((r, i) => (
          <div key={i} style={styles.ruleItem}>
            <span style={styles.ruleNum}>Rule {i + 1}</span> {r}
          </div>
        ))}
      </div>
    </Layout>
  );
}

const styles = {
  title: { margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' },
  subtitle: { margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' },
  center: { textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' },

  summaryRow: { display: 'flex', gap: 10, marginBottom: '1rem' },
  summaryCard: { borderRadius: 8, padding: '12px 20px', textAlign: 'center', minWidth: 80 },

  filterBar: {
    display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap',
    background: 'var(--bg-surface)', padding: '12px', borderRadius: 8,
    border: '1px solid var(--border)', marginBottom: '1rem',
  },
  select: {
    padding: '7px 10px', borderRadius: 6,
    border: '1px solid var(--border)', fontSize: 13,
    outline: 'none', background: 'var(--bg-base)', color: 'var(--text-primary)',
  },
  count: { fontSize: 12, color: 'var(--text-muted)' },
  refreshBtn: {
    marginLeft: 'auto', padding: '6px 12px',
    border: '1px solid var(--border)', borderRadius: 6,
    background: 'var(--bg-base)', fontSize: 12,
    cursor: 'pointer', color: 'var(--text-secondary)',
    display: 'flex', alignItems: 'center', gap: 4,
  },

  list: { display: 'grid', gap: 8, marginBottom: '1rem' },
  card: {
    background: 'var(--bg-surface)', borderRadius: 8,
    padding: '12px 16px', border: '1px solid var(--border)',
  },
  cardRow: { display: 'flex', alignItems: 'center', gap: 12 },
  message: { fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 },
  meta: { fontSize: 11, color: 'var(--text-muted)' },
  badge: { fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999, whiteSpace: 'nowrap' },

  emptyBox: {
    background: 'rgba(22,163,74,0.08)', color: '#4ade80',
    padding: '1.5rem', borderRadius: 8, fontSize: 13,
    textAlign: 'center', border: '1px solid rgba(22,163,74,0.2)',
    marginBottom: '1rem',
  },

  rulesBox: {
    background: 'var(--bg-surface)', borderRadius: 8,
    padding: '12px 16px', border: '1px solid var(--border)',
    marginTop: '1rem',
  },
  rulesTitle: { fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 },
  ruleItem: { fontSize: 12, color: 'var(--text-muted)', padding: '4px 0', borderBottom: '1px solid var(--border)' },
  ruleNum: { fontWeight: 600, color: 'var(--text-secondary)' },
};