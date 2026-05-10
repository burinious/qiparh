import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from './providers/AuthProvider.jsx';
import AuthPage from './pages/AuthPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ModulePage from './pages/ModulePage.jsx';
import Profile from './pages/Profile.jsx';
import Settings from './pages/Settings.jsx';
import AppShell from './components/AppShell.jsx';
import { moduleConfigs } from './data/modules.js';

function ProtectedRoute({ children }) {
  const { user, loading, hasFirebaseConfig } = useAuth();

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!hasFirebaseConfig) {
    return <AuthPage configMissing />;
  }

  if (!user) return <Navigate to="/login" replace />;

  return <AppShell>{children}</AppShell>;
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route
          path="/"
          element={(
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          )}
        />
        {Object.entries(moduleConfigs).map(([key, config]) => (
          <Route
            key={key}
            path={`/${key === 'documents' ? 'documents' : key}`}
            element={(
              <ProtectedRoute>
                <ModulePage moduleKey={key} config={config} />
              </ProtectedRoute>
            )}
          />
        ))}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
