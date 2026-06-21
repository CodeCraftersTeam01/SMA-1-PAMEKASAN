import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white shadow-2xl shadow-slate-900/20 animate-fade-up ${colors[type] || colors.info}`}>
      {type === 'success' && (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
      {type === 'error' && (
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      <span className="text-sm font-semibold">{message}</span>
      <button onClick={onClose} className="ml-1 opacity-70 hover:opacity-100">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

const TrackingConfig = () => {
  const { token } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [formData, setFormData] = useState({
    is_open: false,
    tahun_ajaran_id: '',
  });

  const [tahunAjaranList, setTahunAjaranList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => setToast({ message, type });

  const fetchData = async () => {
    try {
      // Fetch Tahun Ajaran
      const taResponse = await fetch(`${API_BASE_URL}/api/tahun-ajaran`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      if (taResponse.ok) {
        const taData = await taResponse.json();
        setTahunAjaranList(taData);
      }

      // Fetch Tracking Config
      const configResponse = await fetch(`${API_BASE_URL}/api/pengaturan-tracking`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      if (configResponse.ok) {
        const configData = await configResponse.json();
        if (configData) {
          setFormData({
            is_open: configData.is_open ? true : false,
            tahun_ajaran_id: configData.tahun_ajaran_id || '',
          });
        }
      }
    } catch (error) {
      console.error(error);
      showToast('Gagal memuat konfigurasi', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token, API_BASE_URL]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/pengaturan-tracking`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          is_open: formData.is_open,
          tahun_ajaran_id: formData.tahun_ajaran_id || null,
        })
      });

      if (response.ok) {
        showToast('Pengaturan berhasil disimpan!', 'success');
      } else {
        const data = await response.json();
        showToast(data.message || 'Gagal menyimpan', 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan jaringan', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-slate-800 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 relative overflow-hidden animate-fade-up">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-800" />
        <div className="relative z-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-1 text-[#1e293b]">Pengaturan Akses Tracking</h2>
          <p className="text-slate-500 text-sm max-w-xl">
            Tentukan apakah halaman web tracking siswa dibuka untuk publik, dan atur batasan Tahun Ajaran mana yang data siswanya dapat diakses melalui web tracking tersebut.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-up delay-75">
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
              <svg className="w-5 h-5 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <h3 className="text-lg font-bold text-slate-800">Kontrol Halaman</h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              <div>
                <label className="flex items-center justify-between cursor-pointer p-5 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                  <div className="pr-4">
                    <div className="text-base font-bold text-slate-800">Status Akses Tracking</div>
                    <div className="text-sm text-slate-500 mt-1">Buka jika Anda ingin calon siswa dapat melacak status mereka di web publik.</div>
                  </div>
                  <div className="relative shrink-0">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={formData.is_open}
                      onChange={(e) => setFormData({...formData, is_open: e.target.checked})}
                    />
                    <div className={`block w-14 h-8 rounded-full transition-colors ${formData.is_open ? 'bg-slate-800' : 'bg-slate-300'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${formData.is_open ? 'transform translate-x-6' : ''}`}></div>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Tahun Ajaran Aktif (Filter Data)
                </label>
                <select
                  value={formData.tahun_ajaran_id}
                  onChange={(e) => setFormData({...formData, tahun_ajaran_id: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all text-slate-700 font-medium bg-slate-50"
                >
                  <option value="">-- Pilih Tahun Ajaran --</option>
                  {tahunAjaranList.map((ta) => (
                    <option key={ta.id} value={ta.id}>
                      {ta.tahun} {ta.is_active ? '(Aktif)' : ''}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-slate-500">Hanya siswa/pendaftar pada tahun ajaran ini yang datanya dapat dicek melalui halaman tracking.</p>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 shadow-md shadow-slate-900/20 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? "Menyimpan..." : "Simpan Pengaturan"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
              <svg className="w-5 h-5 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <h3 className="text-lg font-bold text-slate-800">Bagikan Link Mandiri</h3>
            </div>

            <div className="p-6 space-y-6">
              <p className="text-sm text-slate-500 leading-relaxed">
                Bagikan link rahasia ini kepada siswa/alumni pada tahun ajaran aktif agar mereka dapat mengisi kuesioner rencana karir mandiri tanpa perlu masuk ke dashboard utama.
              </p>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 relative">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Link Kuesioner Mandiri</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${import.meta.env.VITE_LANDING_PAGE_URL || window.location.origin}/tracking-alumni`}
                    className="w-full bg-white border border-slate-200 text-slate-700 rounded-lg py-2 px-3 text-xs font-semibold focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`${import.meta.env.VITE_LANDING_PAGE_URL || window.location.origin}/tracking-alumni`);
                      showToast('Link kuesioner berhasil disalin!', 'success');
                    }}
                    className="shrink-0 px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900 transition-colors flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Salin
                  </button>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200/60 text-amber-800 text-xs p-4 rounded-xl flex gap-3">
                <svg className="w-5 h-5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="leading-relaxed">
                  <strong className="font-bold">Penting:</strong> Hanya siswa yang datanya terdaftar di bawah Tahun Ajaran aktif dan memiliki NIS & NISN yang sah yang dapat mengisi melalui link ini.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

export default TrackingConfig;
