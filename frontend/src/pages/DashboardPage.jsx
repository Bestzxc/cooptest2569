import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Layout from '../components/Layout';
import api from '../services/api';

const STATUS_COLORS = {
  ACTIVE: '#16a34a', IDLE: '#ca8a04',
  MAINTENANCE: '#ea580c', RETIRED: '#6b7280',
};

export default function DashboardPage() {
  const [vehicles, setVehicles]     = useState([]);
  const [trips, setTrips]           = useState([]);
  const [alerts, setAlerts]         = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [vRes, tRes, aRes] = await Promise.all([
          api.get('/vehicles'),
          api.get('/trips'),
          api.get('/alerts'),
        ]);
        setVehicles(vRes.data);
        setTrips(tRes.data);
        setAlerts(aRes.data.alerts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // คำนวณ metric
  const activeTrips = trips.filter(t => t.status === 'IN_PROGRESS').length;
  const totalDistToday = trips
    .filter(t => {
      const today = new Date().toDateString();
      return new Date(t.started_at).toDateString() === today;
    })
    .reduce((sum, t) => sum + Number(t.distance_km), 0);
  const overdueCount = alerts.filter(a => a.rule_id === 'OVERDUE_MAINTENANCE').length;

  // ข้อมูลสำหรับ Pie chart
  const pieData = ['ACTIVE', 'IDLE', 'MAINTENANCE', 'RETIRED'].map(s => ({
    name: s,
    value: vehicles.filter(v => v.status === s).length,
  })).filter(d => d.value > 0);

  // ข้อมูลสำหรับ Bar chart (mock 7 วัน)
  const barData = [
    { day: 'จ',  km: 1240 },
    { day: 'อ',  km: 2180 },
    { day: 'พ',  km: 1890 },
    { day: 'พฤ', km: 3120 },
    { day: 'ศ',  km: 2760 },
    { day: 'ส',  km: 1480 },
    { day: 'อา', km: 2950 },
  ];

  if (loading) return <Layout><div style={styles.center}>กำลังโหลด...</div></Layout>;

  return (
    <Layout>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={styles.title}>Dashboard</h1>
        <p style={styles.subtitle}>ภาพรวมระบบ Fleet ณ ปัจจุบัน</p>
      </div>

      {/* Metric Cards */}
      <div style={styles.metricsGrid}>
        <MetricCard
          label="Total Vehicles"
          value={vehicles.length}
          sub={`${vehicles.filter(v => v.status !== 'RETIRED').length} active fleet`}
        />
        <MetricCard
          label="Active Trips"
          value={activeTrips}
          sub="IN_PROGRESS ขณะนี้"
          accent="#2563eb"
        />
        <MetricCard
          label="Distance Today"
          value={`${totalDistToday.toLocaleString()} km`}
          sub="trips วันนี้รวมกัน"
        />
        <MetricCard
          label="Maintenance Overdue"
          value={overdueCount}
          sub="เลยกำหนดมากกว่า 3 วัน"
          accent={overdueCount > 0 ? '#dc2626' : undefined}
        />
      </div>

      {/* Charts */}
      <div style={styles.chartsGrid}>

        {/* Pie Chart */}
        <div style={styles.chartCard}>
          <div style={styles.chartTitle}>Vehicles by Status</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            {pieData.map(d => (
              <span key={d.name} style={styles.legend}>
                <span style={{ ...styles.legendDot, background: STATUS_COLORS[d.name] }} />
                {d.name} ({d.value})
              </span>
            ))}
          </div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%"
                  innerRadius={50} outerRadius={80} dataKey="value">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div style={styles.chartCard}>
          <div style={styles.chartTitle}>Trip Distance — 7 วันล่าสุด (km)</div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={v => [`${v} km`, 'Distance']} />
                <Bar dataKey="km" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Alerts Panel */}
      <div style={styles.alertCard}>
        <div style={styles.chartTitle}>
          Alerts ({alerts.length})
        </div>
        {alerts.length === 0
          ? <div style={styles.noAlert}>✓ ไม่มี alert ขณะนี้</div>
          : alerts.slice(0, 5).map((a, i) => (
            <div key={i} style={styles.alertRow}>
              <span style={{
                ...styles.severityBadge,
                background: a.severity === 'CRITICAL' ? '#fee2e2' : '#fef3c7',
                color: a.severity === 'CRITICAL' ? '#dc2626' : '#d97706',
              }}>
                {a.severity}
              </span>
              <span style={styles.alertMsg}>{a.message}</span>
            </div>
          ))
        }
      </div>
    </Layout>
  );
}

// ── Metric Card Component ─────────────────────────────
function MetricCard({ label, value, sub, accent }) {
  return (
    <div style={styles.metricCard}>
      <div style={styles.metricLabel}>{label}</div>
      <div style={{ ...styles.metricValue, color: accent || '#0f172a' }}>
        {value}
      </div>
      {sub && <div style={styles.metricSub}>{sub}</div>}
    </div>
  );
}

const styles = {
  title:       { margin: 0, fontSize: 20, fontWeight: 700 },
  subtitle:    { margin: '4px 0 0', fontSize: 13, color: '#64748b' },
  center:      { textAlign: 'center', padding: '3rem', color: '#94a3b8' },
  metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: '1.25rem' },
  metricCard:  { background: '#f8fafc', borderRadius: 8, padding: '1rem' },
  metricLabel: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  metricValue: { fontSize: 26, fontWeight: 700, fontFamily: 'monospace' },
  metricSub:   { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  chartsGrid:  { display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1rem', marginBottom: '1rem' },
  chartCard:   { background: '#fff', borderRadius: 10, padding: '1rem', border: '1px solid #e2e8f0' },
  chartTitle:  { fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 },
  legend:      { display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#64748b' },
  legendDot:   { width: 8, height: 8, borderRadius: 2, display: 'inline-block' },
  alertCard:   { background: '#fff', borderRadius: 10, padding: '1rem', border: '1px solid #e2e8f0' },
  alertRow:    { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #f1f5f9' },
  severityBadge: { fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, whiteSpace: 'nowrap' },
  alertMsg:    { fontSize: 13, color: '#374151' },
  noAlert:     { fontSize: 13, color: '#16a34a', padding: '8px 0' },
};