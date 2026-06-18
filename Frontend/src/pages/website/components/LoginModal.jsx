import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from "../../../context/AuthContext";

export default function LoginModal({ open, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleLoginGuru = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "https://api.smansa.m-tech.fun";
      const response = await fetch(`${apiBaseUrl}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password, remember: rememberMe }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Email atau password salah.");
        return;
      }

      if (!data.token) {
        setError("Token login tidak ditemukan dari server.");
        return;
      }

      login(data.user, data.token, rememberMe);
      window.location.href = "/dashboard";
    } catch (err) {
      setError("Tidak dapat terhubung ke server. Periksa koneksi atau API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1040]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl shadow-2xl z-[1050] p-8 overflow-hidden"
          >
            <button 
              onClick={onClose}
              disabled={loading}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition-colors"
            >
              &times;
            </button>
            <div className="text-center mb-8">
              <img src="/logo-sma.png" alt="Logo" className="w-16 h-16 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-800 mb-1">Login Admin</h2>
              <p className="text-gray-500 text-sm">Masukkan email dan password untuk mengakses dashboard</p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-xl text-center font-medium border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleLoginGuru} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                  placeholder="name@school.id"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm tracking-widest"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="flex items-center mt-2 ml-1">
                <input
                  id="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  disabled={loading}
                  className="w-4 h-4 text-slate-800 bg-gray-100 border-gray-300 rounded focus:ring-slate-500 cursor-pointer"
                />
                <label htmlFor="rememberMe" className="ml-2 text-xs font-medium text-gray-600 cursor-pointer">
                  Ingat saya
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg mt-4 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {loading ? (
                   <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" role="status"></span>
                ) : (
                  'Akses Dashboard'
                )}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

