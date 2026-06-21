import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const AlumniList = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTahunAjaran, setActiveTahunAjaran] = useState("");

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTahunLulus, setFilterTahunLulus] = useState('');
  const [filterKategori, setFilterKategori] = useState(''); // 'all', 'kuliah', 'kerja', 'bisnis', 'belum'

  // Modal State
  const [selectedAlumni, setSelectedAlumni] = useState(null);

  // Bulk actions
  const [selectedItems, setSelectedItems] = useState([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  useEffect(() => {
    fetchAlumniData();
  }, []);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(filteredData.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Yakin ingin menghapus ${selectedItems.length} data terpilih?`)) return;
    setIsBulkDeleting(true);
    const rawApiUrl = import.meta.env.VITE_API_BASE_URL || "";
    const API_BASE_URL = rawApiUrl.replace(/\/$/, "");
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/alumni/bulk-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: selectedItems }),
      });
      if (res.ok) {
        alert(`${selectedItems.length} data berhasil dihapus`);
        setSelectedItems([]);
        fetchAlumniData();
      } else {
        alert('Gagal menghapus data');
      }
    } catch {
      alert('Terjadi kesalahan koneksi');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const fetchAlumniData = async () => {
    setIsLoading(true);
    setErrorMsg("");
    
    const rawApiUrl = import.meta.env.VITE_API_BASE_URL || "";
    const API_BASE_URL = rawApiUrl.replace(/\/$/, "");
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/alumni-tracking`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      
      setData(response.data?.data || []);
      setActiveTahunAjaran(response.data?.active_tahun_ajaran || "");
    } catch (err) {
      console.error("Error fetching alumni data:", err);
      const errMsg = err.response?.data?.message || "Gagal memuat data alumni dari server. Silakan coba beberapa saat lagi.";
      setErrorMsg(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Extract unique graduation years for filter
  const listTahunLulus = useMemo(() => {
    const years = data.map(item => item.tahun_lulus).filter(Boolean);
    return [...new Set(years)].sort((a, b) => b - a);
  }, [data]);

  // Statistics
  const stats = useMemo(() => {
    const total = data.length;
    const lengkap = data.filter(item => item.status_pengisian === 'Lengkap').length;
    const pending = total - lengkap;
    const rasio = total > 0 ? Math.round((lengkap / total) * 100) : 0;
    
    const kuliah = data.filter(item => item.kategori_pilihan === 'kuliah').length;
    const kerja = data.filter(item => item.kategori_pilihan === 'kerja').length;
    const bisnis = data.filter(item => item.kategori_pilihan === 'bisnis').length;

    return { total, lengkap, pending, rasio, kuliah, kerja, bisnis };
  }, [data]);

  // Filtered & Searched Data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = 
        item.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nis?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.pilihan_1?.universitas?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.pilihan_1?.jurusan?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTahun = filterTahunLulus ? String(item.tahun_lulus) === filterTahunLulus : true;
      
      const matchesKategori = 
        filterKategori === 'all' || filterKategori === '' 
          ? true 
          : item.kategori_pilihan === filterKategori;

      return matchesSearch && matchesTahun && matchesKategori;
    });
  }, [data, searchQuery, filterTahunLulus, filterKategori]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Welcome Card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Daftar Alumni SMAN 1 Pamekasan</h1>
            <p className="text-xs text-slate-500 mt-1">
              Menampilkan seluruh alumni yang terhitung sejak 3 tahun sebelum tahun ajaran aktif saat ini: 
              <span className="ml-1.5 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-100">
                {activeTahunAjaran || "Belum Set Aktif"}
              </span>
            </p>
          </div>
          {selectedItems.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
              className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-2 self-start"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              {isBulkDeleting ? 'Menghapus...' : `Hapus (${selectedItems.length})`}
            </button>
          )}
        </div>
        <button 
          onClick={fetchAlumniData}
          className="self-start md:self-auto flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer"
        >
          <svg class="w-4 h-4 " fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"></path></svg>
          Segarkan Data
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Alumni Card */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm relative overflow-hidden group">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Alumni</p>
              <h3 className="text-xl font-bold text-slate-800 mt-0.5">{stats.total}</h3>
            </div>
          </div>
        </div>

        {/* Survey Completion Card */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm relative overflow-hidden group">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Lengkap Survey</p>
              <h3 className="text-xl font-bold text-slate-800 mt-0.5">{stats.lengkap} <span className="text-[11px] font-medium text-slate-400">({stats.rasio}%)</span></h3>
            </div>
          </div>
        </div>

        {/* Kuliah / Kerja / Bisnis Card */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm relative overflow-hidden group">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Rencana Alumni</p>
              <div className="mt-1.5 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-400 inline-block shrink-0"></span>
                    Kuliah
                  </span>
                  <span className="text-[13px] font-bold text-blue-600">{stats.kuliah}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shrink-0"></span>
                    Kerja
                  </span>
                  <span className="text-[13px] font-bold text-emerald-600">{stats.kerja}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400 inline-block shrink-0"></span>
                    Bisnis
                  </span>
                  <span className="text-[13px] font-bold text-amber-600">{stats.bisnis}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Belum Mengisi Card */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm relative overflow-hidden group">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Belum Mengisi</p>
              <h3 className="text-xl font-bold text-slate-800 mt-0.5">{stats.pending}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table & Filters */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        {/* Filters Section */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Cari nama, NIS, universitas, atau jurusan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition-all outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Tahun Lulus */}
            <select
              value={filterTahunLulus}
              onChange={(e) => setFilterTahunLulus(e.target.value)}
              className="px-3.5 py-2 border border-slate-200 rounded-2xl text-xs text-slate-700 bg-white outline-none focus:ring-2 focus:ring-slate-800 cursor-pointer transition-all"
            >
              <option value="">Semua Tahun Lulus</option>
              {listTahunLulus.map(year => (
                <option key={year} value={year}>Tahun Lulus {year}</option>
              ))}
            </select>

            {/* Filter Kategori Pilihan */}
            <select
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              className="px-3.5 py-2 border border-slate-200 rounded-2xl text-xs text-slate-700 bg-white outline-none focus:ring-2 focus:ring-slate-800 cursor-pointer transition-all"
            >
              <option value="all">Semua Rencana</option>
              <option value="kuliah">Melanjutkan Kuliah</option>
              <option value="kerja">Langsung Bekerja</option>
              <option value="bisnis">Berwirausaha / Bisnis</option>
              <option value="belum">Belum Mengisi</option>
            </select>
          </div>
        </div>

        {/* Error State */}
        {errorMsg && (
          <div className="p-6 border-b border-red-100 bg-red-50 text-red-700 text-xs font-medium flex items-center gap-3">
            <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Table Content */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
              <p className="text-xs font-semibold">Memuat data alumni...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center gap-2 text-slate-400">
              <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-3 2.246L11 15H3m16 0a2 2 0 00-3-2.246L11 15H3m0 0a2 2 0 002 2h6a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4z" />
              </svg>
              <h4 className="text-sm font-bold text-slate-600">Tidak Ada Alumni Ditemukan</h4>
              <p className="text-[11px] text-slate-400">Coba ubah kata kunci pencarian atau filter yang diterapkan.</p>
            </div>
          ) : (
            <table className="w-full border-collapse text-left text-slate-600">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                  <th className="py-4 px-4 w-10 text-center">
                    <input type="checkbox" className="rounded border-slate-300" checked={filteredData.length > 0 && selectedItems.length === filteredData.length} onChange={handleSelectAll} />
                  </th>
                  <th className="py-4 px-6 text-center w-14">No</th>
                  <th className="py-4 px-4 w-28">NIS</th>
                  <th className="py-4 px-4">Nama Lengkap</th>
                  <th className="py-4 px-4 text-center w-28">Tahun Masuk</th>
                  <th className="py-4 px-4 text-center w-28">Tahun Lulus</th>
                  <th className="py-4 px-4">Kategori Rencana</th>
                  <th className="py-4 px-4">Pilihan Utama / Target</th>
                  <th className="py-4 px-6 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredData.map((item, index) => {
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-3.5 px-4 text-center">
                        <input type="checkbox" className="rounded border-slate-300" checked={selectedItems.includes(item.id)} onChange={() => handleSelectItem(item.id)} />
                      </td>
                      <td className="py-3.5 px-6 text-center text-slate-400 font-medium">{index + 1}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">{item.nis}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{item.nama}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Kelas Asal: {item.kelas_asal}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-medium text-slate-500">{item.tahun_masuk}</td>
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-800">{item.tahun_lulus}</td>
                      <td className="py-3.5 px-4">
                        {item.kategori_pilihan === 'kuliah' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded-full">
                            <i className="bi bi-mortarboard-fill mr-1"></i>
                            Kuliah
                          </span>
                        )}
                        {item.kategori_pilihan === 'kerja' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full">
                            <i className="bi bi-briefcase-fill mr-1"></i>
                            Bekerja
                          </span>
                        )}
                        {item.kategori_pilihan === 'bisnis' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-100 rounded-full">
                            <i className="bi bi-cash-stack mr-1"></i>
                            Bisnis
                          </span>
                        )}
                        {item.kategori_pilihan === 'belum' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200 rounded-full">
                            <i className="bi bi-clock-history mr-1"></i>
                            Belum Mengisi
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate">
                        {item.pilihan_1 ? (
                          <div>
                            <p className="font-bold text-slate-800">{item.pilihan_1.universitas}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{item.pilihan_1.jurusan}</p>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Belum mengisi target</span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        <button
                          onClick={() => setSelectedAlumni(item)}
                          className="px-3 py-1.5 text-[11px] font-bold text-indigo-600 hover:text-white hover:bg-indigo-600 border border-indigo-200 hover:border-indigo-600 rounded-lg transition-all cursor-pointer"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Alumni Detail Modal */}
      {selectedAlumni && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 w-full max-w-2xl rounded-3xl shadow-xl overflow-hidden animate-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5 text-white flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold">Detail Profil Alumni</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">NIS: {selectedAlumni.nis} • {selectedAlumni.nama}</p>
              </div>
              <button
                onClick={() => setSelectedAlumni(null)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
              {/* Profile Card Section */}
              <div>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Informasi Akademik</h4>
                <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-4 border border-slate-100 rounded-2xl">
                  <div>
                    <p className="text-[10px] text-slate-400">Nama Lengkap</p>
                    <p className="font-bold text-slate-800 mt-0.5">{selectedAlumni.nama}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">NIS / NISN</p>
                    <p className="font-bold text-slate-800 mt-0.5">{selectedAlumni.nis} / {selectedAlumni.nisn}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">No. Pendaftaran</p>
                    <p className="font-semibold text-slate-700 mt-0.5">{selectedAlumni.no_pendaftaran}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Asal Sekolah</p>
                    <p className="font-semibold text-slate-700 mt-0.5">{selectedAlumni.asal_sekolah}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Tahun Masuk / Lulus</p>
                    <p className="font-bold text-slate-800 mt-0.5">{selectedAlumni.tahun_masuk} / {selectedAlumni.tahun_lulus}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Jalur Masuk (Kelas Asal)</p>
                    <p className="font-semibold text-slate-700 mt-0.5">{selectedAlumni.kelas_asal}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] text-slate-400">Alamat</p>
                    <p className="font-medium text-slate-700 mt-0.5">{selectedAlumni.alamat}</p>
                  </div>
                </div>
              </div>

              {/* Rencana Karir Section */}
              <div>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Rencana Karir Alumni</h4>
                
                {selectedAlumni.kategori_pilihan === 'belum' || !selectedAlumni.rencana_detail ? (
                  <div className="bg-rose-50/50 border border-rose-100/50 text-rose-700 p-4 rounded-2xl text-center">
                    <p className="font-semibold">Survey Belum Diisi</p>
                    <p className="text-[10px] text-rose-500 mt-0.5">Alumni ini belum mengisi kuesioner rencana penelusuran setelah lulus.</p>
                  </div>
                ) : (
                  <div className="border border-slate-100 rounded-2xl overflow-hidden">
                    {/* Header Pilihan */}
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <span>Pilihan: </span>
                        {selectedAlumni.kategori_pilihan === 'kuliah' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-bold">
                            <i className="bi bi-mortarboard-fill mr-1"></i>
                            Melanjutkan Kuliah
                          </span>
                        )}
                        {selectedAlumni.kategori_pilihan === 'kerja' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold">
                            <i className="bi bi-briefcase-fill mr-1"></i>
                            Langsung Bekerja
                          </span>
                        )}
                        {selectedAlumni.kategori_pilihan === 'bisnis' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-100 text-amber-700 text-[10px] font-bold">
                            <i className="bi bi-cash-stack mr-1"></i>
                            Membuka Bisnis
                          </span>
                        )}
                      </span>
                      <span className="px-2 py-0.5 text-[9px] font-bold bg-indigo-50 border border-indigo-100 text-indigo-700 rounded">
                        Lengkap
                      </span>
                    </div>

                    {/* Content Detail berdasarkan kategori */}
                    <div className="p-4 space-y-3">
                      {selectedAlumni.kategori_pilihan === 'kuliah' && (
                        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                          <div>
                            <p className="text-[10px] text-slate-400">Universitas Pilihan 1</p>
                            <p className="font-bold text-slate-800 mt-0.5">{selectedAlumni.rencana_detail.univ_pilihan_1}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400">Jurusan Pilihan 1</p>
                            <p className="font-bold text-slate-800 mt-0.5">{selectedAlumni.rencana_detail.jurusan_pilihan_1}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400">Universitas Pilihan 2</p>
                            <p className="font-semibold text-slate-700 mt-0.5">{selectedAlumni.rencana_detail.univ_pilihan_2 || '-'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400">Jurusan Pilihan 2</p>
                            <p className="font-semibold text-slate-700 mt-0.5">{selectedAlumni.rencana_detail.jurusan_pilihan_2 || '-'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400">Jalur Seleksi</p>
                            <p className="font-medium text-slate-700 mt-0.5">{selectedAlumni.rencana_detail.jalur_seleksi || '-'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400">Status Seleksi</p>
                            <span className={`inline-block mt-0.5 px-2 py-0.5 text-[10px] font-bold rounded ${
                              selectedAlumni.rencana_detail.status_seleksi === 'Lolos' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                              selectedAlumni.rencana_detail.status_seleksi === 'Tidak Lolos' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                              'bg-amber-50 text-amber-700 border border-amber-100'
                            }`}>
                              {selectedAlumni.rencana_detail.status_seleksi || 'Menunggu Pengumuman'}
                            </span>
                          </div>
                        </div>
                      )}

                      {selectedAlumni.kategori_pilihan === 'kerja' && (
                        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                          <div>
                            <p className="text-[10px] text-slate-400">Nama Perusahaan / Institusi</p>
                            <p className="font-bold text-slate-800 mt-0.5">{selectedAlumni.rencana_detail.nama_perusahaan}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400">Posisi / Jabatan Pekerjaan</p>
                            <p className="font-bold text-slate-800 mt-0.5">{selectedAlumni.rencana_detail.posisi_pekerjaan}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-[10px] text-slate-400">Estimasi Rentang Gaji Bulanan</p>
                            <p className="font-semibold text-slate-700 mt-0.5">{selectedAlumni.rencana_detail.estimasi_gaji || 'Tidak menyebutkan'}</p>
                          </div>
                        </div>
                      )}

                      {selectedAlumni.kategori_pilihan === 'bisnis' && (
                        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                          <div>
                            <p className="text-[10px] text-slate-400">Nama Usaha / Bisnis</p>
                            <p className="font-bold text-slate-800 mt-0.5">{selectedAlumni.rencana_detail.nama_bisnis}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400">Bidang Usaha</p>
                            <p className="font-bold text-slate-800 mt-0.5">{selectedAlumni.rencana_detail.bidang_bisnis}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-[10px] text-slate-400">Estimasi Modal Awal</p>
                            <p className="font-semibold text-slate-700 mt-0.5">{selectedAlumni.rencana_detail.modal_awal || 'Tidak menyebutkan'}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedAlumni(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlumniList;
