import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ForceSetupModal = () => {
  const { token, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    new_password: '',
    confirm_password: '',
    recovery_email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Frontend validation
    if (!formData.new_password || !formData.confirm_password || !formData.recovery_email) {
      setError('Harap lengkapi semua field.');
      return;
    }

    if (formData.new_password.length < 8) {
      setError('Password baru minimal harus 8 karakter.');
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      setError('Konfirmasi password baru tidak cocok.');
      return;
    }

    setIsSubmitting(true);

    const activeToken = token || localStorage.getItem('token') || sessionStorage.getItem('token');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/profile/setup`, {
        new_password: formData.new_password,
        new_password_confirmation: formData.confirm_password,
        email: formData.recovery_email
      }, {
        headers: {
          'Authorization': `Bearer ${activeToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200 || response.status === 201) {
        setSuccess(true);
        // Delay to allow user to read the success message before state refresh
        setTimeout(async () => {
          await refreshUser();
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan data. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      {/* Modal Container: strictly non-dismissible */}
      <div className="relative w-full max-w-lg bg-white/95 dark:bg-slate-900/95 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_24px_50px_rgba(0,0,0,0.25)] overflow-hidden transition-all duration-300 transform scale-100 backdrop-blur-2xl">
        
        {/* Stern Warning Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 p-6 border-b border-amber-500/20">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-amber-500 to-rose-500" />
          <div className="flex gap-4 items-start">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1">Pengaturan Awal Wajib</h3>
              <p className="text-xs font-semibold leading-relaxed text-amber-700 dark:text-amber-300">
                PENTING: Ubah password default Anda dan tambahkan email aktif untuk fitur lupa password. Kami tidak bertanggung jawab atas hilangnya akses akun jika Anda lupa password dan tidak memiliki email pemulihan.
              </p>
            </div>
          </div>
        </div>

        {/* Success View */}
        {success ? (
          <div className="p-8 text-center flex flex-col items-center justify-center min-h-[300px] animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20">
              <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Konfigurasi Berhasil!</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              Data pemulihan dan password baru Anda telah disimpan. Sistem sedang mengalihkan Anda ke portal utama...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {error && (
              <div className="p-4 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-2xl border border-rose-500/20 flex items-center gap-3">
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Email Recovery */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Email Pemulihan <span className="text-rose-500">*</span></label>
              <div className="relative">
                <input
                  type="email"
                  name="recovery_email"
                  required
                  value={formData.recovery_email}
                  onChange={handleInputChange}
                  placeholder="nama@email.com"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all"
                />
                <svg className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                </svg>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">Digunakan untuk mereset kata sandi jika Anda lupa di kemudian hari.</p>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Password Baru <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <input
                    type="password"
                    name="new_password"
                    required
                    value={formData.new_password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all"
                  />
                  <svg className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Konfirmasi Password <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <input
                    type="password"
                    name="confirm_password"
                    required
                    value={formData.confirm_password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all"
                  />
                  <svg className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="relative w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl shadow-lg shadow-slate-900/10 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Menyimpan Konfigurasi...</span>
                  </>
                ) : (
                  <span>Simpan & Masuk ke Dashboard</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForceSetupModal;
