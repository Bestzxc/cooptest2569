import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages (จะสร้างทีละหน้าใน Phase ถัดไป)
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import VehiclesPage from './pages/VehiclesPage';
import TripsPage from './pages/TripsPage';
import MaintenancePage from './pages/MaintenancePage';
import AlertsPage from './pages/AlertsPage';
import AuditLogPage from './pages/AuditLogPage';

// ป้องกัน route ที่ต้อง login ก่อน
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/" element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          } />

          <Route path="/vehicles" element={
            <PrivateRoute>
              <VehiclesPage />
            </PrivateRoute>
          } />
          <Route path="/trips" element={
            <PrivateRoute>
              <TripsPage />
            </PrivateRoute>
          } />

          {/* redirect root ไป dashboard */}
          <Route path="*" element={<Navigate to="/" />
          } />
          <Route path="/maintenance" element={
            <PrivateRoute>
              <MaintenancePage />
            </PrivateRoute>
          } />
          <Route path="/alerts" element={
            <PrivateRoute>
              <AlertsPage />
            </PrivateRoute>
          } />
          <Route path="/audit-logs" element={
            <PrivateRoute>
              <AuditLogPage />
            </PrivateRoute>
          } />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;