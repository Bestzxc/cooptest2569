import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MdDashboard,
  MdLocalShipping,
  MdMap,
  MdBuild,
  MdNotifications,
  MdAssignment,
  MdLogout,
  MdPerson,
} from 'react-icons/md';

const NAV = [
  { path: '/',            icon: <MdDashboard />,     label: 'Dashboard'  },
  { path: '/vehicles',    icon: <MdLocalShipping />,  label: 'Vehicles'   },
  { path: '/drivers',     icon: <MdPerson />,         label: 'Drivers'     },
  { path: '/trips',       icon: <MdMap />,            label: 'Trips'      },
  { path: '/maintenance', icon: <MdBuild />,          label: 'Maintenance'},
  { path: '/alerts',      icon: <MdNotifications />,  label: 'Alerts', badge: 0 },
  { path: '/audit-logs',  icon: <MdAssignment />,     label: 'Audit Log'  },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={s.wrapper}>
      <aside style={s.sidebar}>

        {/* Logo */}
        <div style={s.logoArea}>
          <div style={s.logoIcon}>⬡</div>
          <div>
            <div style={s.logoText}>THE DRIVER</div>
            <div style={s.logoSub}>Control Center</div>
          </div>
        </div>

        {/* User */}
        <div style={s.userArea}>
          <div style={s.avatar}>
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={s.userName}>{user?.username}</div>
            <span style={{
              ...s.roleBadge,
              background: user?.role === 'ADMIN' ? 'rgba(0,212,255,0.15)' : 'rgba(139,92,246,0.15)',
              color:      user?.role === 'ADMIN' ? '#00d4ff' : '#a78bfa',
            }}>
              {user?.role}
            </span>
          </div>
        </div>

        <div style={s.divider}/>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 0' }}>
          {NAV.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} style={{
                ...s.navItem,
                background:  isActive ? 'rgba(0,212,255,0.08)' : 'transparent',
                color:       isActive ? '#00d4ff' : '#7a8baa',
                borderLeft:  isActive ? '2px solid #00d4ff' : '2px solid transparent',
                fontWeight:  isActive ? 600 : 400,
                textDecoration: 'none',
              }}>
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge > 0 && (
                  <span style={s.navBadge}>{item.badge}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div style={s.divider}/>

        {/* Logout */}
        <button onClick={handleLogout} style={s.logoutBtn}>
          <MdLogout size={16} />
          Logout
        </button>

      </aside>

      <main style={s.main}>
        {children}
      </main>
    </div>
  );
}

const s = {
  wrapper:   { display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' },
  sidebar:   {
    width: 220, flexShrink: 0,
    background: 'var(--bg-surface)',
    borderRight: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column',
    position: 'sticky', top: 0, height: '100vh',
  },
  logoArea:  {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '1.25rem 1.25rem 1rem',
  },
  logoIcon:  {
    fontSize: 24, color: 'var(--accent)',
    filter: 'drop-shadow(0 0 8px rgba(0,212,255,0.6))',
  },
  logoText:  {
    fontFamily: 'var(--font-display)', fontWeight: 800,
    fontSize: 15, letterSpacing: 2,
    color: 'var(--text-primary)',
  },
  logoSub:   { fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1 },
  userArea:  {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '0 1.25rem 1rem',
  },
  avatar:    {
    width: 32, height: 32, borderRadius: '50%',
    background: 'var(--accent-dim)',
    border: '1px solid var(--border-accent)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 700, color: 'var(--accent)',
  },
  userName:  { fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' },
  roleBadge: { fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4 },
  divider:   { height: '1px', background: 'var(--border)', margin: '0 1rem' },
  navItem:   {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 1.25rem', fontSize: 13,
    transition: 'all .15s',
  },
  navBadge:  {
    background: 'var(--danger)', color: '#fff',
    borderRadius: 999, fontSize: 10,
    padding: '1px 5px', fontWeight: 700,
  },
  logoutBtn: {
    margin: '1rem', padding: '9px',
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    fontSize: 12,
    display: 'flex', 
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,   
    cursor: 'pointer',
    width: 'calc(100% - 2rem)',
  },
  main:      {
    flex: 1, padding: '1.75rem',
    overflowY: 'auto', minWidth: 0,
  },
};