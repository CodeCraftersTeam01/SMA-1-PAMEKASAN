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
import Laporan from './pages/laporan';
import UserManagement from './pages/user-management';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/auth/login';
import StudentLogin from './pages/auth/StudentLogin';
import StudentDashboardLayout from './pages/dashboard-siswa/StudentDashboardLayout';
import StudentDashboard from './pages/dashboard-siswa/StudentDashboard';
import AlumniTracking from './pages/dashboard-siswa/AlumniTracking';
import GantiPassword from './pages/dashboard-siswa/GantiPassword';
import ProfileSiswa from './pages/dashboard-siswa/ProfileSiswa';
import AdminTrackingDashboard from './pages/admin/alumni-tracking/AdminTrackingDashboard';
import PublicTracking from './pages/website/PublicTracking';


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

        {/* Dedicated Student Login Portal */}
        <Route
          path="/login-siswa"
          element={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <StudentLogin />
            </motion.div>
          }
        />

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
            </Route>
          </Route>

          {/* Student Dashboard Routes */}
          <Route path="/dashboard-siswa" element={<StudentDashboardLayout />}>
            <Route
              index
              element={
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full"
                >
                  <StudentDashboard />
                </motion.div>
              }
            />
            <Route
              path="alumni-tracking"
              element={
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full"
                >
                  <AlumniTracking />
                </motion.div>
              }
            />
            <Route
              path="profile"
              element={
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full"
                >
                  <ProfileSiswa />
                </motion.div>
              }
            />
            <Route
              path="ganti-password"
              element={
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full"
                >
                  <GantiPassword />
                </motion.div>
              }
            />
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