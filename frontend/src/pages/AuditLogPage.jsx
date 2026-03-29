import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MdLock, MdLocalShipping, MdMap, MdLocationOn, MdPerson, MdBuild } from 'react-icons/md';

const ACTION_COLOR = {
  LOGIN:               '#2563eb',
  LOGIN_SUCCESS:       '#16a34a',
  LOGIN_FAILED:        '#dc2626',
  CREATE_VEHICLE:      '#7c3aed',
  DELETE_VEHICLE:      '#dc2626',
  CREATE_TRIP:         '#2563eb',
  COMPLETE_TRIP:       '#16a34a',
  UPDATE_CHECKPOINT:   '#d97706',
  CREATE_DRIVER:       '#7c3aed',
  CHANGE_VEHICLE_STATUS: '#d97706',
};

const RESOURCE_ICON = {
  auth:        <MdLock          size={18} color="#facc15" />,
  vehicle:     <MdLocalShipping size={18} color="#00d4ff" />,
  trip:        <MdMap           size={18} color="#34d399" />,
  checkpoint:  <MdLocationOn    size={18} color="#f87171" />,
  driver:      <MdPerson        size={18} color="#a78bfa" />,
  maintenance: <MdBuild         size={18} color="#fb923c" />,
};

export default function AuditLogPage() {
  const { user } = useAuth();
  const [logs, setLogs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [fAction, setFAction]     = useState('ALL');
  const [fType, setFType]         = useState('ALL');
  const [fUserId, setFUserId]     = useState('ALL');
  const [fDateFrom, setFDateFrom] = useState('');
  const [fDateTo, setFDateTo]     = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (fAction   !== 'ALL') params.action        = fAction;
      if (fType     !== 'ALL') params.resource_type = fType;
      if (fUserId   !== 'ALL') params.user_id       = fUserId;
      if (fDateFrom)           params.date_from     = fDateFrom;
      if (fDateTo)             params.date_to       = fDateTo;

      const res = await api.get('/auth/audit-logs', { params });
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // unique actions สำหรับ filter dropdown
  const uniqueActions   = [...new Set(logs.map(l => l.action))];
  const uniqueUserIds   = [...new Set(logs.map(l => l.user_id).filter(Boolean))];

  return (
    <Layout>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={styles.title}>Audit Log</h1>
        <p style={styles.subtitle}>
          {user?.role === 'DISPATCHER'
            ? 'แสดงเฉพาะ log ของคุณ'
            : 'ประวัติการใช้งานทั้งหมด (Admin view)'}
        </p>
      </div>

      {/* Filter Bar */}
      <div style={styles.filterBar}>

        {/* ADMIN เท่านั้นที่ filter by user ได้ */}
        {user?.role === 'ADMIN' && (
          <select style={styles.select}
            value={fUserId}
            onChange={e => setFUserId(e.target.value)}>
            <option value="ALL">User: All</option>
            {uniqueUserIds.map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        )}

        <select style={styles.select}
          value={fAction}
          onChange={e => setFAction(e.target.value)}>
          <option value="ALL">Action: All</option>
          {uniqueActions.map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        <select style={styles.select}
          value={fType}
          onChange={e => setFType(e.target.value)}>
          <option value="ALL">Resource: All</option>
          {['auth','vehicle','trip','checkpoint','driver','maintenance'].map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <input style={styles.dateInput}
          type="date"
          value={fDateFrom}
          onChange={e => setFDateFrom(e.target.value)}
          title="From date"
        />
        <input style={styles.dateInput}
          type="date"
          value={fDateTo}
          onChange={e => setFDateTo(e.target.value)}
          title="To date"
        />

        <button style={styles.searchBtn} onClick={fetchLogs}>
          ค้นหา
        </button>

        <span style={styles.count}>{logs.length} records</span>
      </div>

      {/* Table */}
      {loading
        ? <div style={styles.center}>กำลังโหลด...</div>
        : logs.length === 0
          ? <div style={styles.emptyBox}>ไม่พบ records</div>
          : (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thead}>
                    {['Timestamp','User','Action','Resource','ID','Detail'].map(h => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map(l => (
                    <tr key={l.id} style={styles.tr}>
                      <td style={styles.td}>
                        <div style={styles.timestamp}>
                          {new Date(l.created_at).toLocaleString('th-TH')}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.userId}>{l.user_id || '—'}</div>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.actionBadge,
                          color: ACTION_COLOR[l.action] || '#475569',
                        }}>
                          {l.action}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          {RESOURCE_ICON[l.resource_type] || <MdBuild size={18} color="#94a3b8" />}
                          {l.resource_type}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.resourceId}>
                          {l.resource_id
                            ? l.resource_id.substring(0, 8) + '...'
                            : '—'}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.detail}>
                          {l.result && (
                            <span style={{
                              ...styles.resultBadge,
                              background: l.result === 'SUCCESS' ? 'rgba(22,163,74,0.15)' : 'rgba(220,38,38,0.15)',
                              color:      l.result === 'SUCCESS' ? '#4ade80'               : '#f87171',
                            }}>
                              {l.result}
                            </span>
                          )}
                          {l.ip_address && (
                            <span style={styles.ip}>{l.ip_address}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
      }
    </Layout>
  );
}

const styles = {
  title:      { margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' },
  subtitle:   { margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' },
  center:     { textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' },

  filterBar:  {
    display: 'flex', gap: 8, alignItems: 'center',
    flexWrap: 'wrap', background: 'var(--bg-surface)',
    padding: '12px', borderRadius: 8,
    border: '1px solid var(--border)', marginBottom: '1rem',
  },
  select:     {
    padding: '7px 10px', borderRadius: 6,
    border: '1px solid var(--border)', fontSize: 13,
    outline: 'none', background: 'var(--bg-base)',
    color: 'var(--text-primary)',
  },
  dateInput:  {
    padding: '7px 10px', borderRadius: 6,
    border: '1px solid var(--border)', fontSize: 13,
    outline: 'none', background: 'var(--bg-base)',
    color: 'var(--text-primary)',
    colorScheme: 'dark',                          // ทำให้ date picker เป็น dark
  },
  searchBtn:  {
    padding: '7px 14px', background: '#1d4ed8',
    color: '#fff', border: 'none', borderRadius: 6,
    fontSize: 13, cursor: 'pointer',
  },
  count:      { marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' },

  emptyBox:   {
    textAlign: 'center', padding: '2rem',
    color: 'var(--text-muted)', background: 'var(--bg-surface)',
    borderRadius: 8, border: '1px solid var(--border)',
  },
  tableWrap:  {
    background: 'var(--bg-surface)', borderRadius: 10,
    border: '1px solid var(--border)', overflow: 'hidden',
  },
  table:      { width: '100%', borderCollapse: 'collapse', fontSize: 12 },
  thead:      { background: 'var(--bg-base)' },
  th:         {
    padding: '10px 12px', textAlign: 'left',
    fontWeight: 600, color: 'var(--text-secondary)',
    whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)',
  },
  tr:         { borderBottom: '1px solid var(--border)' },
  td:         { padding: '10px 12px', verticalAlign: 'middle' },

  timestamp:   { fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' },
  userId:      { fontFamily: 'monospace', fontSize: 11, color: 'var(--text-secondary)' },
  actionBadge: { fontSize: 11, fontWeight: 600 },
  resource:    { fontSize: 12, color: 'var(--text-secondary)' },
  resourceId:  { fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' },
  detail:      { display: 'flex', alignItems: 'center', gap: 6 },
  resultBadge: { fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 999 },
  ip:          { fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' },
};