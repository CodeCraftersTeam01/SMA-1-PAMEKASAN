import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lockSeconds, setLockSeconds] = useState(0);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Countdown timer while the account is locked out.
  useEffect(() => {
    if (lockSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockSeconds((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [lockSeconds]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (lockSeconds > 0) return;
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password, remember: rememberMe }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // Let AuthContext handle storage — only token is stored, NOT user JSON
        login(data.user, data.token, rememberMe);
        navigate('/dashboard');
      } else if (response.status === 429) {
        // Locked out: start the countdown.
        const wait = data.retry_after || 60;
        setLockSeconds(wait);
        setError(data.message || `Terlalu banyak percobaan. Coba lagi dalam ${wait} detik.`);
      } else {
        const left = typeof data.attempts_left === 'number'
          ? ` (sisa ${data.attempts_left} percobaan)`
          : '';
        setError((data.message || 'Email atau kata sandi salah') + left);
      }
    } catch (err) {
      setError('Tidak dapat terhubung ke server. Periksa koneksi atau API.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 bg-[url('/hero-bg.jpg')] bg-cover bg-center relative p-4">
      {/* Overlay to darken background like the modal's backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 overflow-hidden z-10"
      >
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

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={isLoading || lockSeconds > 0}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              placeholder="admin@smansa.sch.id"
              required
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5 ml-1 mr-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Kata Sandi</label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={isLoading || lockSeconds > 0}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm tracking-widest pr-10"
                placeholder="••••••••"
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {showPassword ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  )}
                </svg>
              </button>
            </div>
          </div>
          
          <div className="flex items-center mt-2 ml-1">
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              disabled={isLoading || lockSeconds > 0}
              className="w-4 h-4 text-slate-800 bg-gray-100 border-gray-300 rounded focus:ring-slate-500 cursor-pointer"
            />
            <label htmlFor="rememberMe" className="ml-2 text-xs font-medium text-gray-600 cursor-pointer">
              Ingat saya
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading || lockSeconds > 0}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg mt-4 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {lockSeconds > 0 ? (
              `Coba lagi dalam ${lockSeconds}s`
            ) : isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" role="status"></span>
            ) : (
              'Akses Dashboard'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;
