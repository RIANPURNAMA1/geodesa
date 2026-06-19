import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }    from './contexts/AuthContext';
import { ToastProvider }   from './components/common/Toast';
import { ProtectedRoute, StaffRoute, AdminRoute, GuestRoute } from './components/common/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import AppLayout           from './components/layout/AppLayout';
import LoginPage           from './pages/auth/LoginPage';
import AuthCallback        from './pages/auth/AuthCallback';
import DashboardPage       from './pages/dashboard/DashboardPage';
import KategoriPage        from './pages/kategori/KategoriPage';
import LokasiPage          from './pages/lokasi/LokasiPage';
import PetaPage            from './pages/map/PetaPage';
import PublicPetaPage      from './pages/map/PublicPetaPage';
import LokasiDetailPage    from './pages/lokasi/LokasiDetailPage';
import UsersPage           from './pages/users/UsersPage';
import NotifikasiPage      from './pages/notifikasi/NotifikasiPage';

function HomeRedirect() {
  const { isUser } = useAuth();
  return <Navigate to={isUser ? '/' : '/dashboard'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public - no auth required */}
            <Route path="/" element={<PublicPetaPage />} />
            <Route path="/lokasi/:id" element={<LokasiDetailPage />} />

            {/* Guest only */}
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<LoginPage />} />
            </Route>

            {/* Google OAuth callback - no auth needed */}
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Protected - all authenticated users */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                {/* role-aware root redirect */}
                <Route path="/"          element={<HomeRedirect />} />

                {/* Staff only — admin / operator_desa */}
                <Route element={<StaffRoute />}>
                  <Route path="/dashboard"   element={<DashboardPage />} />
                  <Route path="/peta"        element={<PetaPage />} />
                  <Route path="/lokasi"      element={<LokasiPage />} />
                  <Route path="/notifikasi"  element={<NotifikasiPage />} />
                </Route>

                {/* Admin only */}
                <Route element={<AdminRoute />}>
                  <Route path="/kategori"  element={<KategoriPage />} />
                  <Route path="/users"     element={<UsersPage />} />
                </Route>
              </Route>
            </Route>

            {/* Catch all */}
            <Route path="*" element={<HomeRedirect />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
