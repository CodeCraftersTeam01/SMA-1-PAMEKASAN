import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import LoginPage from './pages/auth/login';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/dashboard';
import Pendaftar from './pages/pendaftar';
import TahunAjaran from './pages/tahun-ajaran';
import Profile from './pages/profile';
import NisConfig from './pages/pengaturan/NisConfig';
import Siswa from './pages/siswa';
import Laporan from './pages/laporan';
import UserManagement from './pages/user-management';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

// Komponen pembantu untuk animasi transisi halaman
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Route */}
        <Route
          path="/login"
          element={
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="w-full min-h-screen"
            >
              <LoginPage />
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
            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>
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
