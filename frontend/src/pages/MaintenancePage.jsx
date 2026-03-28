import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

const TYPE_ICON = {
  OIL_CHANGE: '🛢️', TIRE: '🔵', BRAKE: '🔴',
  ENGINE: '⚙️', INSPECTION: '🔍', REPAIR: '🔨',
};

const STATUS_COLOR = {
  SCHEDULED: { bg: '#f5f3ff', text: '#6d28d9' },
  IN_PROGRESS: { bg: '#dbeafe', text: '#1e40af' },
  COMPLETED: { bg: '#dcfce7', text: '#166534' },
  OVERDUE: { bg: '#fee2e2', text: '#dc2626' },
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
    overdue: { border: '1.5px solid #fca5a5', background: '#fee2e2' },
    soon: { border: '1.5px solid #fde68a', background: '#fefce8' },
    inprog: { border: '1.5px solid #93c5fd', background: '#eff6ff' },
    ok: { border: '1px solid #e2e8f0', background: '#fff' },
    done: { border: '1px solid #e2e8f0', background: '#f8fafc', opacity: .7 },
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
                      <span style={{ fontSize: 22 }}>
                        {TYPE_ICON[m.type] || '🔧'}
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
                border: `1px solid ${a.severity === 'CRITICAL' ? '#fca5a5' : '#fde68a'}`,
                background: a.severity === 'CRITICAL' ? '#fee2e2' : '#fefce8',
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
  title: { margin: 0, fontSize: 20, fontWeight: 700 },
  subtitle: { margin: '4px 0 0', fontSize: 13, color: '#64748b' },
  center: { textAlign: 'center', padding: '2rem', color: '#94a3b8' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.25rem' },
  sectionTitle: { fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 10 },
  list: { display: 'grid', gap: 8 },
  card: { borderRadius: 10, padding: '12px 14px' },
  cardRow: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  cardTitle: { fontWeight: 600, fontSize: 13, color: '#0f172a' },
  cardSub: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  badge: { fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, whiteSpace: 'nowrap' },
  dateText: { fontSize: 12, fontFamily: 'monospace', color: '#374151' },
  notes: { fontSize: 11, color: '#64748b', marginTop: 6, paddingTop: 6, borderTop: '1px solid rgba(0,0,0,.06)' },
  alertCard: { borderRadius: 8, padding: '10px 12px', marginBottom: 8 },
  alertTop: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 },
  alertType: { fontSize: 11, color: '#64748b' },
  alertMsg: { fontSize: 12, color: '#374151', lineHeight: 1.5 },
  alertId: { fontSize: 10, color: '#94a3b8', fontFamily: 'monospace', marginTop: 4 },
};