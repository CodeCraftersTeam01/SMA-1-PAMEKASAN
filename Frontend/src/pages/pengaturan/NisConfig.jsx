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

const NisConfig = () => {
  const { token } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [formData, setFormData] = useState({
    format: '[TAHUN_4][KODE][URUT]',
    kode_sekolah: '',
    panjang_urut: 4,
    reset_per_tahun: true,
  });

  const [previewNis, setPreviewNis] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => setToast({ message, type });

  const fetchConfig = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pengaturan-nis`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setFormData({
            format: data.format || '[TAHUN_4][KODE][URUT]',
            kode_sekolah: data.kode_sekolah || '',
            panjang_urut: data.panjang_urut || 4,
            reset_per_tahun: data.reset_per_tahun ? true : false,
          });
        }
      }
    } catch (error) {
      console.error(error);
      showToast('Gagal memuat konfigurasi NIS', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPreview = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pengaturan-nis/preview`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        const data = await response.json();
        setPreviewNis(data.preview);
      }
    } catch (error) {
      console.error('Failed to preview', error);
    }
  };

  // Fetch initial config on mount
  useEffect(() => {
    fetchConfig();
  }, [token, API_BASE_URL]);

  // Update preview automatically when formData changes
  useEffect(() => {
    if (!isLoading) {
      const debounceTimer = setTimeout(() => {
        fetchPreview();
      }, 500);
      return () => clearTimeout(debounceTimer);
    }
  }, [formData, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/pengaturan-nis`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        showToast('Konfigurasi berhasil disimpan!', 'success');
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

  const handleInsertTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      format: prev.format + tag
    }));
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 relative overflow-hidden animate-fade-up">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
        <div className="relative z-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-1 text-[#1e293b]">Konfigurasi Nomor Induk Siswa</h2>
          <p className="text-slate-500 text-sm max-w-xl">
            Atur pola pembuatan NIS otomatis agar sesuai dengan format Dapodik atau standar internal sekolah Anda.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-up delay-75">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
              <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 className="text-lg font-bold text-slate-800">Builder Format</h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Kode Sekolah (Dapodik / NPSN)
                  </label>
                  <input
                    type="text"
                    value={formData.kode_sekolah}
                    onChange={(e) => setFormData({...formData, kode_sekolah: e.target.value})}
                    placeholder="Misal: 20500123"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 text-sm"
                  />
                  <p className="mt-1.5 text-xs text-slate-500">Kode ini bisa Anda panggil dengan nama variabel [KODE].</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Panjang Angka Urut
                  </label>
                  <select
                    value={formData.panjang_urut}
                    onChange={(e) => setFormData({...formData, panjang_urut: parseInt(e.target.value)})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700 text-sm"
                  >
                    <option value={2}>2 digit (01-99)</option>
                    <option value={3}>3 digit (001-999)</option>
                    <option value={4}>4 digit (0001-9999)</option>
                    <option value={5}>5 digit (00001-99999)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Format (Template String) <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  <button type="button" onClick={() => handleInsertTag('[TAHUN_4]')} className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition-colors border border-indigo-200">+ [TAHUN_4]</button>
                  <button type="button" onClick={() => handleInsertTag('[TAHUN_2]')} className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold rounded-lg transition-colors border border-amber-200">+ [TAHUN_2]</button>
                  <button type="button" onClick={() => handleInsertTag('[KODE]')} className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg transition-colors border border-emerald-200">+ [KODE]</button>
                  <button type="button" onClick={() => handleInsertTag('[URUT]')} className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg transition-colors border border-rose-200">+ [URUT]</button>
                </div>
                <input
                  type="text"
                  value={formData.format}
                  onChange={(e) => setFormData({...formData, format: e.target.value})}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 font-mono text-sm shadow-inner bg-slate-50"
                />
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={formData.reset_per_tahun}
                      onChange={(e) => setFormData({...formData, reset_per_tahun: e.target.checked})}
                    />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${formData.reset_per_tahun ? 'bg-indigo-500' : 'bg-slate-300'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.reset_per_tahun ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">Reset Urutan Per Tahun</div>
                    <div className="text-xs text-slate-500 mt-0.5">Jika aktif, angka urut akan kembali ke No 1 pada setiap pergantian Tahun Masuk (sangat disarankan).</div>
                  </div>
                </label>
              </div>

              <div className="pt-6 mt-2 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? "Menyimpan..." : "Simpan Konfigurasi"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-800 rounded-2xl shadow-xl overflow-hidden sticky top-6">
            <div className="px-6 py-5 border-b border-slate-700 flex items-center gap-3 bg-slate-800/80 backdrop-blur-sm">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <h3 className="text-lg font-bold text-white">Live Preview</h3>
            </div>
            <div className="p-8 pb-10 flex flex-col items-center justify-center min-h-[200px] text-center">
              <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Hasil Nomor:</div>
              <div className="text-4xl sm:text-3xl lg:text-4xl font-mono font-bold text-white tracking-wider break-all leading-tight bg-slate-900/50 py-3 px-5 rounded-xl border border-slate-700 shadow-inner">
                {previewNis || '...'}
              </div>
              <p className="mt-6 text-xs text-slate-400 max-w-[200px] leading-relaxed">
                Ini adalah simulasi pembentukan Nomor Induk Siswa berdasarkan template aktif.
              </p>
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

export default NisConfig;
