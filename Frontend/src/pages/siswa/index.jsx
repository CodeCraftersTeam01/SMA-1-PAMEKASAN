import React, { useState, useEffect } from 'react';

// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
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

const Siswa = () => {
  const [siswaList, setSiswaList] = useState([]);
  const [tahunAjaranList, setTahunAjaranList] = useState([]);
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isMigrating, setIsMigrating] = useState(false);
  const [isMigrateModalOpen, setIsMigrateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  const showToast = (message, type = 'info') => setToast({ message, type });

  const fetchSiswa = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/siswa`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSiswaList(Array.isArray(data) ? data : (data.data || []));
      } else if (response.status === 404) {
        setSiswaList([]);
      } else {
        showToast('Gagal memuat data siswa', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan koneksi', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTahunAjaran = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tahun-ajaran`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      if (response.ok) {
        const data = await response.json();
        const list = Array.isArray(data) ? data : (data.data || []);
        setTahunAjaranList(list);
        // Default pilih yang aktif
        const active = list.find(t => t.is_active);
        if (active) setSelectedTahunAjaran(String(active.id));
        else if (list.length > 0) setSelectedTahunAjaran(String(list[0].id));
      }
    } catch {
      // silent
    }
  };

  useEffect(() => {
    fetchSiswa();
    fetchTahunAjaran();
  }, []);

  const handleMigrate = async () => {
    if (!selectedTahunAjaran) {
      showToast('Pilih tahun ajaran terlebih dahulu!', 'error');
      return;
    }

    setIsMigrating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/siswa/migrate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ tahun_ajaran_id: parseInt(selectedTahunAjaran) })
      });

      const data = await response.json();

      if (response.ok) {
        setIsMigrateModalOpen(false);
        showToast(data.message, 'success');
        fetchSiswa();
      } else if (response.status === 404) {
        showToast(data.message || 'Tidak ada pendaftar yang menunggu.', 'info');
        setIsMigrateModalOpen(false);
      } else {
        showToast(data.message || 'Gagal melakukan migrasi', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan koneksi', 'error');
    } finally {
      setIsMigrating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus data siswa ini?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/siswa/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (response.ok) {
        showToast('Data siswa berhasil dihapus', 'success');
        fetchSiswa();
      } else {
        showToast('Gagal menghapus data', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan koneksi', 'error');
    }
  };

  const filteredSiswa = siswaList.filter(s =>
    s.nama_lengkap?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.nis?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 relative overflow-hidden animate-fade-up">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-800"></div>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-[#1e293b]">Data Siswa</h2>
            <p className="text-slate-500 text-sm max-w-xl">
              Kelola data siswa aktif SMAN 1 Pamekasan. Migrasikan pendaftar yang diterima menjadi siswa resmi.
            </p>
          </div>
          <button
            onClick={() => setIsMigrateModalOpen(true)}
            className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-slate-900/20 font-semibold flex items-center gap-2 shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Migrate Siswa
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-up delay-75">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Siswa</p>
            <p className="text-2xl font-bold text-slate-800">{siswaList.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Siswa Aktif</p>
            <p className="text-2xl font-bold text-slate-800">{siswaList.filter(s => s.is_active).length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Alumni</p>
            <p className="text-2xl font-bold text-slate-800">{siswaList.filter(s => !s.is_active).length}</p>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] animate-fade-up delay-100">
        <div className="flex items-center justify-between mb-6 gap-4">
          <h3 className="text-[16px] font-bold text-[#1e293b] shrink-0">Daftar Siswa</h3>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari nama / NIS..."
              className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all text-slate-600"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
              <div className="w-10 h-10 border-4 border-slate-100 border-t-slate-800 rounded-full animate-spin"></div>
              <p className="text-sm font-medium">Memuat data siswa...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-2">NIS</th>
                  <th className="pb-3">Nama Lengkap</th>
                  <th className="pb-3">Tahun Masuk</th>
                  <th className="pb-3">Tahun Ajaran</th>
                  <th className="pb-3">NISN Pendaftar</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-2">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-slate-600">
                {filteredSiswa.map((item) => (
                  <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 pl-2">
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-lg text-xs">
                        {item.nis || '-'}
                      </span>
                    </td>
                    <td className="py-4 font-bold text-slate-700">{item.nama_lengkap}</td>
                    <td className="py-4 text-slate-500">{item.tahun_masuk}</td>
                    <td className="py-4">
                      {item.tahun_ajaran ? (
                        <span className="px-2 py-1 rounded-md text-[10px] font-bold border bg-indigo-50 text-indigo-600 border-indigo-100">
                          {item.tahun_ajaran.tahun}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="py-4 text-slate-500">
                      {item.pendaftaran?.nisn || '-'}
                    </td>
                    <td className="py-4">
                      {item.is_active ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border bg-slate-800 text-white border-slate-800">
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border bg-slate-50 text-slate-500 border-slate-100">
                          Alumni
                        </span>
                      )}
                    </td>
                    <td className="py-4 text-right pr-2">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredSiswa.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan="7" className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <svg className="w-12 h-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="font-semibold text-slate-500">Belum ada data siswa</p>
                        <p className="text-sm text-slate-400">Klik "Migrate Siswa" untuk memindahkan pendaftar yang diterima</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Migrate Confirmation Modal */}
      {isMigrateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-up">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800">Migrate Siswa</h3>
              </div>
              <button
                onClick={() => setIsMigrateModalOpen(false)}
                disabled={isMigrating}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
                <div className="flex gap-2">
                  <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <strong>Perhatian!</strong> Proses ini akan:
                    <ul className="list-disc ml-4 mt-1 space-y-1">
                      <li>Mengubah status semua pendaftar "Menunggu" menjadi <strong>Diterima</strong></li>
                      <li>Membuat data siswa baru dengan <strong>NIS otomatis</strong></li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Pilih Tahun Ajaran <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedTahunAjaran}
                  onChange={e => setSelectedTahunAjaran(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-700 text-sm"
                >
                  <option value="">-- Pilih Tahun Ajaran --</option>
                  {tahunAjaranList.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.tahun} {t.is_active ? '(Aktif)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsMigrateModalOpen(false)}
                  disabled={isMigrating}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleMigrate}
                  disabled={isMigrating || !selectedTahunAjaran}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 shadow-md shadow-slate-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isMigrating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      <span>Ya, Migrate Sekarang</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

    </div>
  );
};

export default Siswa;
