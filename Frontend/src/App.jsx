import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import WebsiteHome from './pages/website';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/dashboard';
import Pendaftar from './pages/pendaftar';
import TahunAjaran from './pages/tahun-ajaran';
import Profile from './pages/profile';
import NisConfig from './pages/pengaturan/NisConfig';
import TrackingConfig from './pages/pengaturan/TrackingConfig';
import Siswa from './pages/siswa';
import Kelas from './pages/kelas';
import SetKelas from './pages/set-kelas';
import Laporan from './pages/laporan';
import UserManagement from './pages/user-management';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/auth/login';

import AdminTrackingDashboard from './pages/admin/alumni-tracking/AdminTrackingDashboard';
import AlumniList from './pages/admin/alumni/AlumniList';
import PublicTracking from './pages/website/PublicTracking';

import AdminNews from './pages/admin/website/news';
import AdminPrestasi from './pages/admin/website/prestasi';
import AdminFasilitas from './pages/admin/website/fasilitas';
import AdminPages from './pages/admin/website/pages';
import AdminNavbar from './pages/admin/website/navbar';

// Komponen pembantu untuk animasi transisi halaman
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Website - login via modal */}
        <Route
          path="/"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <WebsiteHome />
            </motion.div>
          }
        />

        {/* Admin Login Portal - Redirect to homepage modal */}
        <Route path="/login" element={<Navigate to="/" replace />} />


        {/* Independent Public Alumni Tracking Page */}
        <Route
          path="/siswas/tracking"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PublicTracking />
            </motion.div>
          }
        />

        {/* Protected Routes */}

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin/website/fasilitas" element={<AdminFasilitas />} />
            <Route path="/admin/website/pages" element={<AdminPages />} />
            <Route path="/admin/website/navbar" element={<AdminNavbar />} />
            <Route
              path="/dashboard"
              element={
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full"
                >
                  <Dashboard />
                </motion.div>
              }
            />
            <Route
              path="/pendaftar"
              element={
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full"
                >
                  <Pendaftar />
                </motion.div>
              }
            />
            <Route
              path="/tahun-ajaran"
              element={
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full"
                >
                  <TahunAjaran />
                </motion.div>
              }
            />
            <Route
              path="/profile"
              element={
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full"
                >
                  <Profile />
                </motion.div>
              }
            />
            <Route
              path="/pengaturan-nis"
              element={
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full"
                >
                  <NisConfig />
                </motion.div>
              }
            />
            <Route
              path="/pengaturan-tracking"
              element={
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full"
                >
                  <TrackingConfig />
                </motion.div>
              }
            />
            <Route
              path="/siswa"
              element={
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full"
                >
                  <Siswa />
                </motion.div>
              }
            />
            <Route
              path="/kelas"
              element={
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full"
                >
                  <Kelas />
                </motion.div>
              }
            />
            <Route
              path="/set-kelas"
              element={
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full"
                >
                  <SetKelas />
                </motion.div>
              }
            />
            <Route
              path="/laporan"
              element={
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full"
                >
                  <Laporan />
                </motion.div>
              }
            />
            <Route
              path="/admin/alumni-tracking"
              element={
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full"
                >
                  <AdminTrackingDashboard />
                </motion.div>
              }
            />
            <Route
              path="/admin/alumni"
              element={
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full"
                >
                  <AlumniList />
                </motion.div>
              }
            />
          </Route>

            {/* User Management (Admin Only) */}
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route element={<DashboardLayout />}>
              <Route
                path="/user-management"
                element={
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full"
                  >
                    <UserManagement />
                  </motion.div>
                }
              />
              
              {/* Website CMS (Admin Only) */}
              <Route
                path="/admin/website/news"
                element={
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full"
                  >
                    <AdminNews />
                  </motion.div>
                }
              />
              <Route
                path="/admin/website/prestasi"
                element={
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full"
                  >
                    <AdminPrestasi />
                  </motion.div>
                }
              />
              <Route
                path="/admin/website/fasilitas"
                element={
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full"
                  >
                    <AdminFasilitas />
                  </motion.div>
                }
              />
            </Route>
          </Route>


        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
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