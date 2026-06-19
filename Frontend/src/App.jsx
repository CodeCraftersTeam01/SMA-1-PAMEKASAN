import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

// Public pages — kept reasonably light, still split from the dashboard bundle
const LoginPage = lazy(() => import('./pages/auth/login'));
const PublicTracking = lazy(() => import('./pages/website/PublicTracking'));

// Dashboard + admin pages — loaded on demand to keep the initial bundle small
const DashboardLayout = lazy(() => import('./components/layout/DashboardLayout'));
const Dashboard = lazy(() => import('./pages/dashboard'));
const Pendaftar = lazy(() => import('./pages/pendaftar'));
const TahunAjaran = lazy(() => import('./pages/tahun-ajaran'));
const Profile = lazy(() => import('./pages/profile'));
const NisConfig = lazy(() => import('./pages/pengaturan/NisConfig'));
const TrackingConfig = lazy(() => import('./pages/pengaturan/TrackingConfig'));
const Siswa = lazy(() => import('./pages/siswa'));
const Kelas = lazy(() => import('./pages/kelas'));
const SetKelas = lazy(() => import('./pages/set-kelas'));
const Laporan = lazy(() => import('./pages/laporan'));
const UserManagement = lazy(() => import('./pages/user-management'));
const AdminTrackingDashboard = lazy(() => import('./pages/admin/alumni-tracking/AdminTrackingDashboard'));
const AlumniList = lazy(() => import('./pages/admin/alumni/AlumniList'));
const AdminNews = lazy(() => import('./pages/admin/website/news'));
const AdminPrestasi = lazy(() => import('./pages/admin/website/prestasi'));
const AdminFasilitas = lazy(() => import('./pages/admin/website/fasilitas'));
const AdminPages = lazy(() => import('./pages/admin/website/pages'));
const AdminNavbar = lazy(() => import('./pages/admin/website/navbar'));
const AdminTeachers = lazy(() => import('./pages/admin/website/teachers'));
const AdminFeatures = lazy(() => import('./pages/admin/website/features'));
const AdminPrograms = lazy(() => import('./pages/admin/website/programs'));
const AdminSettings = lazy(() => import('./pages/admin/website/settings'));
const AdminExtracurricular = lazy(() => import('./pages/admin/website/ekstrakurikuler'));
const AdminAgenda = lazy(() => import('./pages/admin/website/agenda'));
const AdminPengumuman = lazy(() => import('./pages/admin/website/pengumuman'));
const AdminQuotes = lazy(() => import('./pages/quotes'));

// Shared fallback while a lazy chunk is loading
const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-slate-100">
    <div className="flex flex-col items-center gap-3 text-slate-400">
      <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
      <p className="text-sm font-medium">Memuat halaman...</p>
    </div>
  </div>
);

// Reusable fade/slide wrapper so each route doesn't repeat the same motion config
const Page = ({ children, slide = true }) => (
  <motion.div
    initial={{ opacity: 0, y: slide ? 15 : 0 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: slide ? -15 : 0 }}
    transition={{ duration: 0.3 }}
    className="w-full h-full"
  >
    {children}
  </motion.div>
);

// External Redirect Component for root path
const ExternalRedirect = () => {
  useEffect(() => {
    // Redirect to landing page base URL defined in .env
    const landingUrl = import.meta.env.VITE_LANDING_PAGE_URL || 'http://localhost:5174';
    window.location.href = landingUrl;
  }, []);
  return null;
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<RouteFallback />}>
        <Routes location={location} key={location.pathname}>
          {/* Base URL redirects to Landing Pages */}
          <Route path="/" element={<ExternalRedirect />} />

          {/* Admin Login Portal */}
          <Route path="/login" element={<Page slide={false}><LoginPage /></Page>} />

          {/* Independent Public Alumni Tracking Page */}
          <Route path="/siswas/tracking" element={<Page slide={false}><PublicTracking /></Page>} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Page><Dashboard /></Page>} />
              <Route path="/pendaftar" element={<Page><Pendaftar /></Page>} />
              <Route path="/tahun-ajaran" element={<Page><TahunAjaran /></Page>} />
              <Route path="/profile" element={<Page><Profile /></Page>} />
              <Route path="/pengaturan-nis" element={<Page><NisConfig /></Page>} />
              <Route path="/pengaturan-tracking" element={<Page><TrackingConfig /></Page>} />
              <Route path="/siswa" element={<Page><Siswa /></Page>} />
              <Route path="/kelas" element={<Page><Kelas /></Page>} />
              <Route path="/set-kelas" element={<Page><SetKelas /></Page>} />
              <Route path="/laporan" element={<Page><Laporan /></Page>} />
              <Route path="/admin/alumni-tracking" element={<Page><AdminTrackingDashboard /></Page>} />
              <Route path="/admin/alumni" element={<Page><AlumniList /></Page>} />
              {/* Website CMS — gated per-user via permissions in the sidebar */}
              <Route path="/admin/website/news" element={<Page><AdminNews /></Page>} />
              <Route path="/admin/website/prestasi" element={<Page><AdminPrestasi /></Page>} />
              <Route path="/admin/website/fasilitas" element={<Page><AdminFasilitas /></Page>} />
              <Route path="/admin/website/pages" element={<Page><AdminPages /></Page>} />
              <Route path="/admin/website/navbar" element={<Page><AdminNavbar /></Page>} />
              <Route path="/admin/website/teachers" element={<Page><AdminTeachers /></Page>} />
              <Route path="/admin/website/features" element={<Page><AdminFeatures /></Page>} />
              <Route path="/admin/website/programs" element={<Page><AdminPrograms /></Page>} />
              <Route path="/admin/website/settings" element={<Page><AdminSettings /></Page>} />
              <Route path="/admin/website/ekstrakurikuler" element={<Page><AdminExtracurricular /></Page>} />
              <Route path="/admin/website/agenda" element={<Page><AdminAgenda /></Page>} />
              <Route path="/admin/website/pengumuman" element={<Page><AdminPengumuman /></Page>} />
              <Route path="/admin/website/quotes" element={<Page><AdminQuotes /></Page>} />
            </Route>

            {/* Admin Only */}
            <Route element={<ProtectedRoute requiredRole="admin" />}>
              <Route element={<DashboardLayout />}>
                <Route path="/user-management" element={<Page><UserManagement /></Page>} />
              </Route>
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AnimatedRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
