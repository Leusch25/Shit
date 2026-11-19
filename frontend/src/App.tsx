/**
 * Main App Component with Routing
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { MusicProvider } from './contexts/MusicContext';
import { ToastProvider } from './components/ui/Toast';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Games } from './pages/Games';
import { GamePlay } from './pages/GamePlay';
import { Music } from './pages/Music';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { Auth } from './pages/Auth';
import { useAuth } from './contexts/AuthContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/auth" element={
        <PublicRoute>
          <Auth />
        </PublicRoute>
      } />

      {/* Protected Routes with Layout */}
      <Route element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route path="/" element={<Home />} />
        <Route path="/games" element={<Games />} />
        <Route path="/play/:id" element={<GamePlay />} />
        <Route path="/music" element={<Music />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Redirects */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MusicProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </MusicProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}