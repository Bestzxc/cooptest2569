import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Layout from '../components/Layout';
import api from '../services/api';

const STATUS_COLORS = {
  ACTIVE:      '#4ade80',
  IDLE:        '#facc15',
  MAINTENANCE: '#fb923c',
  RETIRED:     '#94a3b8',
};

export default function DashboardPage() {
  const [vehicles, setVehicles]   = useState([]);
  const [trips, setTrips]         = useState([]);
  const [alerts, setAlerts]       = useState([]);
  const [barData, setBarData]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchAll = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [vRes, tRes, aRes, sRes] = await Promise.all([
        api.get('/vehicles'),
        api.get('/trips'),
        api.get('/alerts'),
        api.get('/dashboard/stats'),
      ]);
      setVehicles(vRes.data);
      setTrips(tRes.data);
      setAlerts(aRes.data.alerts);
      setBarData(sRes.data.distance7days);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const activeTrips = trips.filter(t => t.status === 'IN_PROGRESS').length;

  const totalDistToday = barData.length > 0
    ? barData[barData.length - 1].km
    : trips
      .filter(t => {
        if (t.status !== 'COMPLETED') return false;
        if (!t.ended_at) return false;
        const today = new Date().toDateString();
        return new Date(t.ended_at).toDateString() === today;
      })
      .reduce((sum, t) => sum + Number(t.distance_km || 0), 0);

  const overdueCount = alerts.filter(a => a.rule_id === 'OVERDUE_MAINTENANCE').length;

  const pieData = ['ACTIVE','IDLE','MAINTENANCE','RETIRED']
    .map(s => ({ name: s, value: vehicles.filter(v => v.status === s).length }))
    .filter(d => d.value > 0);

  if (loading) return <Layout><div style={styles.center}>กำลังโหลด...</div></Layout>;

  return (
    <Layout>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.5rem' }}>
        <div>
          <h1 style={styles.title}>Dashboard</h1>
          <p style={styles.subtitle}>ภาพรวมระบบ Fleet ณ ปัจจุบัน</p>
        </div>
        <button
          onClick={() => fetchAll(true)}
          disabled={refreshing}
          style={{
            padding:'7px 14px',
            background:'var(--bg-surface)',
            border:'1px solid var(--border)',
            borderRadius:'var(--radius-sm)',
            color:'var(--text-secondary)',
            fontSize:12, cursor:'pointer',
            opacity: refreshing ? .5 : 1,
          }}
        >
          {refreshing ? '⏳ กำลังโหลด...' : '🔄 Refresh'}
        </button>
      </div>

      {/* Metric Cards */}
      <div style={styles.metricsGrid}>
        <MetricCard
          label="Total Vehicles"
          value={vehicles.length}
          sub={`${vehicles.filter(v => v.status !== 'RETIRED').length} active fleet`}
          onClick={() => navigate('/vehicles')}
        />
        <MetricCard
          label="Active Trips"
          value={activeTrips}
          sub="IN_PROGRESS ขณะนี้"
          accent="#2563eb"
          onClick={() => navigate('/trips')}
        />
        <MetricCard
          label="Distance Today"
          value={`${totalDistToday.toLocaleString()} km`}
          sub="trips ที่เสร็จวันนี้รวมกัน"
          onClick={() => navigate('/trips')}
        />
        <MetricCard
          label="Maintenance Overdue"
          value={overdueCount}
          sub="เลยกำหนดมากกว่า 3 วัน"
          accent={overdueCount > 0 ? '#dc2626' : undefined}
          onClick={() => navigate('/maintenance')}
        />
      </div>

      {/* Charts */}
      <div style={styles.chartsGrid}>
        <div style={styles.chartCard}>
          <div style={styles.chartTitle}>Vehicles by Status</div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:8 }}>
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

        <div style={styles.chartCard}>
          <div style={styles.chartTitle}>Trip Distance — 7 วันล่าสุด (km)</div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top:0, right:0, left:-20, bottom:0 }}>
                <XAxis dataKey="day" tick={{ fontSize:11, fill:'#7a8baa' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11, fill:'#7a8baa' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={v => [`${v} km`, 'Distance']} />
                <Bar dataKey="km" fill="#00d4ff" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Alerts Panel */}
      <div style={styles.alertCard}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <div style={styles.chartTitle}>Alerts ({alerts.length})</div>
          {alerts.length > 0 && (
            <button
              onClick={() => navigate('/alerts')}
              style={{ fontSize:11, color:'var(--accent)', background:'none', border:'none', cursor:'pointer' }}
            >
              ดูทั้งหมด →
            </button>
          )}
        </div>
        {alerts.length === 0
          ? <div style={styles.noAlert}>✓ ไม่มี alert ขณะนี้</div>
          : alerts.slice(0, 5).map((a, i) => (
            <div key={i} style={styles.alertRow}>
              <span style={{
                ...styles.severityBadge,
                background: a.severity === 'CRITICAL' ? 'rgba(220,38,38,0.15)' : 'rgba(234,179,8,0.15)',
                color:      a.severity === 'CRITICAL' ? '#f87171' : '#facc15',
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

function MetricCard({ label, value, sub, accent, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        ...styles.metricCard,
        cursor: 'pointer',
        borderColor: hovered ? (accent || '#00d4ff') : 'var(--border)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? `0 4px 20px ${accent ? accent + '33' : 'rgba(0,212,255,0.15)'}` : 'none',
        transition: 'border-color .2s, transform .2s, box-shadow .2s',
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={styles.metricLabel}>{label}</div>
      <div style={{ ...styles.metricValue, color: accent || 'var(--text-primary)' }}>
        {value}
      </div>
      {sub && <div style={styles.metricSub}>{sub}</div>}
    </div>
  );
}

const styles = {
  title:         { margin:0, fontSize:22, fontWeight:800, fontFamily:'var(--font-display)', letterSpacing:1 },
  subtitle:      { margin:'4px 0 0', fontSize:12, color:'var(--text-secondary)' },
  center:        { textAlign:'center', padding:'3rem', color:'var(--text-muted)' },
  metricsGrid:   { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:'1.25rem' },
  metricCard:    { background:'var(--bg-surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'1.1rem 1.25rem' },
  metricLabel:   { fontSize:12, letterSpacing:1, color:'var(--text-muted)', marginBottom:6, fontWeight:600 },
  metricValue:   { fontSize:32, fontWeight:700, fontFamily:'var(--font-mono)', letterSpacing:-1 },
  metricSub:     { fontSize:12, color:'var(--text-muted)', marginTop:4 },
  chartsGrid:    { display:'grid', gridTemplateColumns:'1fr 1.5fr', gap:'1rem', marginBottom:'1rem' },
  chartCard:     { background:'var(--bg-surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'1.1rem 1.25rem' },
  chartTitle:    { fontSize:13, fontWeight:600, letterSpacing:1, color:'var(--text-secondary)', marginBottom:0 },
  legend:        { display:'flex', alignItems:'center', gap:4, fontSize:12, color:'var(--text-secondary)' },
  legendDot:     { width:8, height:8, borderRadius:2, display:'inline-block' },
  alertCard:     { background:'var(--bg-surface)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'1.1rem 1.25rem' },
  alertRow:      { display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid var(--border)' },
  severityBadge: { fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:4, letterSpacing:1, whiteSpace:'nowrap' },
  alertMsg:      { fontSize:13, color:'var(--text-primary)' },
  noAlert:       { fontSize:14, color:'var(--success)', padding:'8px 0' },
};