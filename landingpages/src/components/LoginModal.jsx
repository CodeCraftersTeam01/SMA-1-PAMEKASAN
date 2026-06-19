import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const DASHBOARD_URL = import.meta.env.VITE_DASHBOARD_URL || (isLocalhost ? 'http://localhost:5173' : window.location.origin);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        window.location.href = `${DASHBOARD_URL}/dashboard?token=${data.token}`;
      } else {
        setError(data.message || 'Email atau kata sandi salah');
      }
    } catch (err) {
      setError('Tidak dapat terhubung ke server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl shadow-2xl z-[1000] p-8 overflow-hidden"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition-colors"
            >
              &times;
            </button>
            <div className="text-center mb-8">
              <img src="/logo-sma.png" alt="Logo" className="w-16 h-16 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-smansa-navy mb-1">Portal Admin</h2>
              <p className="text-gray-500 text-sm">Masuk untuk mengelola website & sistem</p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-xl text-center font-medium border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                  placeholder="admin@smansa.sch.id"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Kata Sandi</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm tracking-widest"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-smansa-navy hover:bg-blue-900 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Memproses...' : 'Masuk Sekarang'}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
