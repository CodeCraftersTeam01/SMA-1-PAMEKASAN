import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const GantiPassword = () => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.new_password !== formData.confirm_password) {
      setStatus({ type: 'error', message: 'Konfirmasi password baru tidak cocok.' });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      // Assuming endpoint is /api/profile/password (based on DashboardLayout.jsx logic)
      const response = await axios.put(`${API_BASE_URL}/api/profile/password`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.status === 200) {
        setStatus({ type: 'success', message: 'Password berhasil diperbarui!' });
        setFormData({ old_password: '', new_password: '', confirm_password: '' });
      }
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Gagal memperbarui password. Periksa password lama Anda.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800">Ganti Password</h2>
          <p className="text-sm text-slate-500">Amankan akun Anda dengan memperbarui password secara berkala.</p>
        </div>

        <div className="p-8">
          {status.message && (
            <div className={`mb-6 p-4 rounded-xl text-sm font-medium border flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200 ${
              status.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
            }`}>
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {status.type === 'success' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-slate-700">Password Lama <span className="text-red-500">*</span></label>
              <input
                type="password"
                name="old_password"
                required
                value={formData.old_password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-100 focus:border-slate-500 focus:outline-none transition-all placeholder:text-slate-400 bg-slate-50/50"
                placeholder="••••••••"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-slate-700">Password Baru <span className="text-red-500">*</span></label>
                <input
                  type="password"
                  name="new_password"
                  required
                  value={formData.new_password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-100 focus:border-slate-500 focus:outline-none transition-all placeholder:text-slate-400 bg-slate-50/50"
                  placeholder="Minimal 8 karakter"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-slate-700">Konfirmasi Password Baru <span className="text-red-500">*</span></label>
                <input
                  type="password"
                  name="confirm_password"
                  required
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-100 focus:border-slate-500 focus:outline-none transition-all placeholder:text-slate-400 bg-slate-50/50"
                  placeholder="Ulangi password baru"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl shadow-md shadow-slate-200/50 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memperbarui...
                  </>
                ) : (
                  'Perbarui Password'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GantiPassword;
