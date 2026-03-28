import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { path: '/',          icon: '▦',  label: 'Dashboard'   },
  { path: '/vehicles',  icon: '🚚', label: 'Vehicles'     },
  { path: '/trips',     icon: '🗺️', label: 'Trips'        },
  { path: '/alerts',    icon: '🔔', label: 'Alerts'       },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.wrapper}>

      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarTop}>
          <div style={styles.logo}>🚛 Fleet HQ</div>
          <div style={styles.userInfo}>
            <div style={styles.userName}>{user?.username}</div>
            <span style={{
              ...styles.badge,
              background: user?.role === 'ADMIN' ? '#dbeafe' : '#f5f3ff',
              color: user?.role === 'ADMIN' ? '#1e40af' : '#6d28d9',
            }}>
              {user?.role}
            </span>
          </div>
        </div>

        <nav style={styles.nav}>
          {NAV.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  ...styles.navItem,
                  background: isActive ? '#eff6ff' : 'transparent',
                  color: isActive ? '#1d4ed8' : '#475569',
                  borderLeft: isActive ? '3px solid #1d4ed8' : '3px solid transparent',
                  fontWeight: isActive ? 600 : 400,
                  textDecoration: 'none',
                }}
              >
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main style={styles.main}>
        {children}
      </main>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f8fafc',
  },
  sidebar: {
    width: 200,
    background: '#fff',
    borderRight: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    position: 'sticky',
    top: 0,
    height: '100vh',
  },
  sidebarTop: {
    padding: '1.25rem 1rem',
    borderBottom: '1px solid #e2e8f0',
  },
  logo: {
    fontWeight: 700,
    fontSize: 15,
    marginBottom: 8,
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 12,
    color: '#475569',
  },
  badge: {
    fontSize: 10,
    fontWeight: 600,
    padding: '2px 6px',
    borderRadius: 999,
  },
  nav: {
    flex: 1,
    padding: '8px 0',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '9px 16px',
    fontSize: 13,
    cursor: 'pointer',
    transition: 'all .1s',
  },
  logoutBtn: {
    margin: '1rem',
    padding: '8px',
    border: '1px solid #e2e8f0',
    borderRadius: 6,
    background: 'transparent',
    cursor: 'pointer',
    fontSize: 13,
    color: '#475569',
  },
  main: {
    flex: 1,
    padding: '1.5rem',
    overflowY: 'auto',
  },
};