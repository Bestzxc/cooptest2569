import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { MdOilBarrel, MdTireRepair, MdBuild, MdSettings, MdSearch, MdHandyman } from 'react-icons/md';

const TYPE_ICON = {
  OIL_CHANGE:  <MdOilBarrel  size={22} color="#facc15" />,
  TIRE:        <MdTireRepair size={22} color="#60a5fa" />,
  BRAKE:       <MdBuild      size={22} color="#f87171" />,
  ENGINE:      <MdSettings   size={22} color="#a78bfa" />,
  INSPECTION:  <MdSearch     size={22} color="#34d399" />,
  REPAIR:      <MdHandyman   size={22} color="#fb923c" />,
};

const STATUS_COLOR = {
  SCHEDULED:   { bg: 'rgba(109,40,217,0.15)',  text: '#a78bfa' },
  IN_PROGRESS: { bg: 'rgba(37,99,235,0.15)',   text: '#60a5fa' },
  COMPLETED:   { bg: 'rgba(22,163,74,0.15)',   text: '#4ade80' },
  OVERDUE:     { bg: 'rgba(220,38,38,0.15)',   text: '#f87171' },
};

export default function MaintenancePage() {
  const [maintenance, setMaintenance] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [mRes, aRes] = await Promise.all([
          api.get('/maintenance'),
          api.get('/alerts'),
        ]);
        setMaintenance(mRes.data);
        setAlerts(aRes.data.alerts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // คำนวณ urgency ของแต่ละ maintenance
  const getUrgency = (m) => {
    if (m.status === 'COMPLETED') return 'done';
    if (m.status === 'IN_PROGRESS') return 'inprog';
    const diff = new Date(m.scheduled_at) - Date.now();
    if (diff < 0) return 'overdue';           // เลยกำหนดแล้ว
    if (diff < 7 * 86400000) return 'soon';   // ใน 7 วัน
    return 'ok';
  };

  const urgencyStyle = {
  overdue: { border: '1.5px solid rgba(220,38,38,0.4)',  background: 'rgba(220,38,38,0.08)'  },
  soon:    { border: '1.5px solid rgba(234,179,8,0.4)',  background: 'rgba(234,179,8,0.08)'  },
  inprog:  { border: '1.5px solid rgba(37,99,235,0.4)',  background: 'rgba(37,99,235,0.08)'  },
  ok:      { border: '1px solid var(--border)',          background: 'var(--bg-surface)'     },
  done:    { border: '1px solid var(--border)',          background: 'var(--bg-surface)',  opacity: .5 },
};

  if (loading) {
    return <Layout><div style={styles.center}>กำลังโหลด...</div></Layout>;
  }

  return (
    <Layout>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={styles.title}>Maintenance</h1>
        <p style={styles.subtitle}>ตารางบำรุงรักษายานพาหนะ</p>
      </div>

      <div style={styles.grid}>

        {/* ── ตาราง Maintenance ── */}
        <div>
          <div style={styles.sectionTitle}>
            Schedule ({maintenance.length})
          </div>
          <div style={styles.list}>
            {maintenance.length === 0
              ? <div style={styles.center}>ไม่มีข้อมูล</div>
              : maintenance.map(m => {
                const urg = getUrgency(m);
                const sc = STATUS_COLOR[m.status] || STATUS_COLOR.SCHEDULED;
                const diff = (new Date(m.scheduled_at) - Date.now()) / 86400000;

                return (
                  <div key={m.id} style={{ ...styles.card, ...urgencyStyle[urg] }}>
                    <div style={styles.cardRow}>

                      {/* Icon + type */}
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        {TYPE_ICON[m.type] || <MdBuild size={22} color="#94a3b8" />}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={styles.cardTitle}>
                          {m.type.replace('_', ' ')}
                        </div>
                        <div style={styles.cardSub}>
                          {m.license_plate} — {m.brand} {m.model}
                        </div>
                      </div>

                      {/* Status badge */}
                      <span style={{ ...styles.badge, background: sc.bg, color: sc.text }}>
                        {m.status}
                      </span>

                      {/* Urgency tag */}
                      {urg === 'overdue' && (
                        <span style={{ ...styles.badge, background: '#fee2e2', color: '#dc2626' }}>
                          ⚠ เลยมา {Math.abs(Math.floor(diff))} วัน
                        </span>
                      )}
                      {urg === 'soon' && (
                        <span style={{ ...styles.badge, background: '#fef3c7', color: '#d97706' }}>
                          ใน {Math.ceil(diff)} วัน
                        </span>
                      )}

                      {/* Date + technician */}
                      <div style={{ textAlign: 'right' }}>
                        <div style={styles.dateText}>
                          {new Date(m.scheduled_at).toLocaleDateString('th-TH')}
                        </div>
                        {m.technician && (
                          <div style={styles.cardSub}>{m.technician}</div>
                        )}
                        {m.cost_thb && (
                          <div style={{ ...styles.cardSub, color: '#16a34a', fontWeight: 600 }}>
                            ฿{Number(m.cost_thb).toLocaleString()}
                          </div>
                        )}
                      </div>

                    </div>

                    {m.notes && (
                      <div style={styles.notes}>{m.notes}</div>
                    )}
                  </div>
                );
              })
            }
          </div>
        </div>

        {/* ── Alerts Panel ── */}
        <div>
          <div style={styles.sectionTitle}>
            Alerts ({alerts.length})
          </div>
          {alerts.length === 0
            ? (
              <div style={{ ...styles.card, border: '1px solid #e2e8f0' }}>
                <div style={{ color: '#16a34a', fontSize: 13 }}>✓ ไม่มี alert ขณะนี้</div>
              </div>
            )
            : alerts.map((a, i) => (
              <div key={i} style={{
                ...styles.alertCard,
                border: `1px solid ${a.severity === 'CRITICAL' ? 'rgba(220,38,38,0.3)' : 'rgba(234,179,8,0.3)'}`,
                background: a.severity === 'CRITICAL' ? 'rgba(220,38,38,0.05)' : 'rgba(234,179,8,0.05)',
              }}>
                <div style={styles.alertTop}>
                  <span style={{
                    ...styles.badge,
                    background: a.severity === 'CRITICAL' ? '#dc2626' : '#d97706',
                    color: '#fff',
                  }}>
                    {a.severity}
                  </span>
                  <span style={styles.alertType}>{a.affected_resource_type}</span>
                </div>
                <div style={styles.alertMsg}>{a.message}</div>
                <div style={styles.alertId}>{a.affected_resource_id}</div>
              </div>
            ))
          }
        </div>

      </div>
    </Layout>
  );
}

const styles = {
  title:        { margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' },
  subtitle:     { margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' },
  center:       { textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' },
  grid:         { display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.25rem' },
  sectionTitle: { fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 },
  list:         { display: 'grid', gap: 8 },
  card:         { borderRadius: 10, padding: '12px 14px' },
  cardRow:      { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  cardTitle:    { fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' },
  cardSub:      { fontSize: 11, color: 'var(--text-muted)', marginTop: 2 },
  badge:        { fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, whiteSpace: 'nowrap' },
  dateText:     { fontSize: 12, fontFamily: 'monospace', color: 'var(--text-secondary)' },
  notes:        { fontSize: 11, color: 'var(--text-muted)', marginTop: 6, paddingTop: 6, borderTop: '1px solid var(--border)' },

  alertCard:  { borderRadius: 8, padding: '10px 12px', marginBottom: 8 },
  alertTop:   { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 },
  alertType: { fontSize: 11, color: 'var(--text-muted)' },
  alertMsg:  { fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.5 },
  alertId:   { fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: 4 },
};