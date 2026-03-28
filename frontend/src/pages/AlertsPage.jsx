import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

const SEVERITY_STYLE = {
  CRITICAL: { bg: '#fee2e2', text: '#dc2626', dot: '#dc2626' },
  WARNING:  { bg: '#fef3c7', text: '#d97706', dot: '#d97706' },
};

const RESOURCE_ICON = {
  vehicle:     '🚚',
  maintenance: '🔧',
  driver:      '👤',
  trip:        '🗺️',
};

export default function AlertsPage() {
  const [alerts, setAlerts]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [fSeverity, setFSeverity] = useState('ALL');
  const [fType, setFType]         = useState('ALL');

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
  const warningCount  = alerts.filter(a => a.severity === 'WARNING').length;

  return (
    <Layout>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={styles.title}>Alerts</h1>
        <p style={styles.subtitle}>ระบบแจ้งเตือนอัตโนมัติ</p>
      </div>

      {/* Summary */}
      <div style={styles.summaryRow}>
        <div style={{ ...styles.summaryCard, background: '#fee2e2' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#dc2626' }}>
            {criticalCount}
          </div>
          <div style={{ fontSize: 12, color: '#dc2626' }}>CRITICAL</div>
        </div>
        <div style={{ ...styles.summaryCard, background: '#fef3c7' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#d97706' }}>
            {warningCount}
          </div>
          <div style={{ fontSize: 12, color: '#d97706' }}>WARNING</div>
        </div>
        <div style={{ ...styles.summaryCard, background: '#f1f5f9' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#475569' }}>
            {alerts.length}
          </div>
          <div style={{ fontSize: 12, color: '#475569' }}>TOTAL</div>
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
          🔄 Refresh
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
                      <span style={{ fontSize: 20 }}>
                        {RESOURCE_ICON[a.affected_resource_type] || '⚠️'}
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
  title:       { margin: 0, fontSize: 20, fontWeight: 700 },
  subtitle:    { margin: '4px 0 0', fontSize: 13, color: '#64748b' },
  center:      { textAlign: 'center', padding: '2rem', color: '#94a3b8' },
  summaryRow:  { display: 'flex', gap: 10, marginBottom: '1rem' },
  summaryCard: { borderRadius: 8, padding: '12px 20px', textAlign: 'center', minWidth: 80 },
  filterBar:   {
    display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap',
    background: '#fff', padding: '12px', borderRadius: 8,
    border: '1px solid #e2e8f0', marginBottom: '1rem',
  },
  select:      {
    padding: '7px 10px', borderRadius: 6,
    border: '1px solid #e2e8f0', fontSize: 13,
    outline: 'none', background: '#fff',
  },
  count:       { fontSize: 12, color: '#94a3b8' },
  refreshBtn:  {
    marginLeft: 'auto', padding: '6px 12px',
    border: '1px solid #e2e8f0', borderRadius: 6,
    background: '#fff', fontSize: 12, cursor: 'pointer',
  },
  list:        { display: 'grid', gap: 8, marginBottom: '1rem' },
  card:        {
    background: '#fff', borderRadius: 8,
    padding: '12px 16px', border: '1px solid #e2e8f0',
  },
  cardRow:     { display: 'flex', alignItems: 'center', gap: 12 },
  message:     { fontSize: 13, fontWeight: 500, color: '#0f172a', marginBottom: 4 },
  meta:        { fontSize: 11, color: '#94a3b8' },
  badge:       { fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999, whiteSpace: 'nowrap' },
  emptyBox:    {
    background: '#f0fdf4', color: '#16a34a',
    padding: '1.5rem', borderRadius: 8,
    fontSize: 13, textAlign: 'center',
    border: '1px solid #bbf7d0', marginBottom: '1rem',
  },
  rulesBox:    {
    background: '#f8fafc', borderRadius: 8,
    padding: '12px 16px', border: '1px solid #e2e8f0',
    marginTop: '1rem',
  },
  rulesTitle:  { fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 8 },
  ruleItem:    { fontSize: 12, color: '#64748b', padding: '4px 0', borderBottom: '1px solid #f1f5f9' },
  ruleNum:     { fontWeight: 600, color: '#374151' },
};