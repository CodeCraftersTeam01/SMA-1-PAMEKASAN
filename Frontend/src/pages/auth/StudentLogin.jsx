import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const StudentLogin = () => {
  const [nis, setNis] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/login-siswa`, {
        nis,
        password,
      });

      if (response.data.token && response.data.user) {
        login(response.data.user, response.data.token, true);
        navigate('/dashboard-siswa');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal login. Pastikan NIS dan Password benar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[1000px] bg-white rounded-2xl shadow-lg shadow-slate-200/50 overflow-hidden flex flex-col md:flex-row border border-slate-100">
        
        {/* Left Side: Branding / Info */}
        <div className="bg-slate-900 md:w-2/5 p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
              <img src="/logo-sma.png" alt="Logo" className="w-10 h-10 object-contain" />
              <div>
                <h2 className="text-white font-bold tracking-tight">SMAN 1 PAMEKASAN</h2>
                <p className="text-slate-400 text-[10px] tracking-widest uppercase">Portal Siswa</p>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-white leading-tight mb-4">
              Selamat Datang<br/>Kembali, Siswa!
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Silakan masuk menggunakan NIS dan Password Anda untuk mengakses layanan akademik dan pendataan alumni sekolah.
            </p>
          </div>
          
          <div className="relative z-10 mt-12 pt-8 border-t border-slate-800">
             <p className="text-xs text-slate-500">
               Butuh bantuan? Hubungi admin sekolah jika Anda melupakan password.
             </p>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl"></div>
        </div>

        {/* Right Side: Login Form */}
        <div className="md:w-3/5 p-8 md:p-12 lg:p-16 bg-white flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-10 text-center md:text-left">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Login Siswa</h2>
              <p className="text-sm text-slate-500">Masukkan kredensial Anda untuk melanjutkan.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-slate-700">Nomor Induk Siswa (NIS)</label>
                <input
                  type="text"
                  required
                  value={nis}
                  onChange={(e) => setNis(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-100 focus:border-slate-400 focus:outline-none transition-all placeholder:text-slate-400 bg-slate-50 hover:bg-white focus:bg-white"
                  placeholder="Contoh: 123456"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-slate-700">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-100 focus:border-slate-400 focus:outline-none transition-all placeholder:text-slate-400 bg-slate-50 hover:bg-white focus:bg-white"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 mt-6 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl shadow-md shadow-slate-200/50 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memproses...
                  </>
                ) : (
                  'Masuk ke Portal'
                )}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentLogin;
