import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const AdminTrackingDashboard = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTahun, setFilterTahun] = useState('');
  const [filterJalur, setFilterJalur] = useState(''); // '', 'kuliah', 'kerja', 'bisnis', 'belum'

  // Modal State
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Admin Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    kategori_pilihan: 'kuliah',
    univ_pilihan_1: '',
    jurusan_pilihan_1: '',
    univ_pilihan_2: '',
    jurusan_pilihan_2: '',
    jalur_seleksi: '',
    status_seleksi: '',
    nama_perusahaan: '',
    posisi_pekerjaan: '',
    estimasi_gaji: '',
    bidang_bisnis: '',
    nama_bisnis: '',
    modal_awal: '',
  });

  const handleStartEdit = () => {
    if (!selectedStudent) return;
    const rk = selectedStudent.rencana_detail;
    setFormData({
      kategori_pilihan: selectedStudent.kategori_pilihan || 'kuliah',
      univ_pilihan_1: rk?.univ_pilihan_1 || '',
      jurusan_pilihan_1: rk?.jurusan_pilihan_1 || '',
      univ_pilihan_2: rk?.univ_pilihan_2 || '',
      jurusan_pilihan_2: rk?.jurusan_pilihan_2 || '',
      jalur_seleksi: rk?.jalur_seleksi || '',
      status_seleksi: rk?.status_seleksi || '',
      nama_perusahaan: rk?.nama_perusahaan || '',
      posisi_pekerjaan: rk?.posisi_pekerjaan || '',
      estimasi_gaji: rk?.estimasi_gaji || '',
      bidang_bisnis: rk?.bidang_bisnis || '',
      nama_bisnis: rk?.nama_bisnis || '',
      modal_awal: rk?.modal_awal || '',
    });
    setFormError("");
    setIsEditing(true);
  };

  const handleAdminSaveTracking = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setFormError("");

    if (formData.kategori_pilihan === 'kuliah') {
      if (!formData.univ_pilihan_1 || !formData.jurusan_pilihan_1) {
        setFormError("Universitas Pilihan 1 dan Jurusan Pilihan 1 wajib diisi!");
        setIsSaving(false);
        return;
      }
    } else if (formData.kategori_pilihan === 'kerja') {
      if (!formData.nama_perusahaan || !formData.posisi_pekerjaan) {
        setFormError("Nama Perusahaan dan Posisi Pekerjaan wajib diisi!");
        setIsSaving(false);
        return;
      }
    } else if (formData.kategori_pilihan === 'bisnis') {
      if (!formData.bidang_bisnis || !formData.nama_bisnis) {
        setFormError("Bidang Usaha dan Nama Usaha wajib diisi!");
        setIsSaving(false);
        return;
      }
    }

    const rawApiUrl = import.meta.env.VITE_API_BASE_URL || "";
    const API_BASE_URL = rawApiUrl.replace(/\/$/, "");
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    try {
      const payload = {
        siswa_id: selectedStudent.id,
        kategori_pilihan: formData.kategori_pilihan,
        ...formData
      };

      const response = await axios.post(`${API_BASE_URL}/api/student/tracking`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      if (response.data.status === 'success') {
        await fetchTrackingData();
        setIsEditing(false);
        setSelectedStudent(null);
      } else {
        setFormError(response.data.message || "Gagal menyimpan data.");
      }
    } catch (err) {
      console.error("Error saving student tracking data by admin:", err);
      const msg = err.response?.data?.message || "Koneksi gagal atau terjadi kesalahan pada server.";
      setFormError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    fetchTrackingData();
  }, []);

  const fetchTrackingData = async () => {
    setIsLoading(true);
    setErrorMsg("");
    
    // Gunakan VITE_API_BASE_URL yang dinormalisasi tanpa trailing slash, tanpa fallback hardcode eksternal
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
    } catch (err) {
      console.error("Error fetching tracking data:", err);
      const errMsg = err.response?.data?.message || "Gagal memuat data penelusuran dari server. Pastikan Anda masuk sebagai Admin.";
      setErrorMsg(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Extract unique years for graduates filter
  const uniqueTahun = useMemo(() => {
    return [...new Set(data.map(item => item.tahun_lulus))].filter(Boolean).sort().reverse();
  }, [data]);

  // Apply search & advanced filters
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch = item.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.nis.includes(searchQuery);
      
      const matchTahun = filterTahun === '' || item.tahun_lulus === filterTahun;
      
      let matchJalur = true;
      if (filterJalur === 'belum') {
        matchJalur = !item.kategori_pilihan;
      } else if (filterJalur !== '') {
        matchJalur = item.kategori_pilihan === filterJalur;
      }
      
      return matchSearch && matchTahun && matchJalur;
    });
  }, [data, searchQuery, filterTahun, filterJalur]);

  // Analytics Calculations
  const totalData = filteredData.length;
  const sudahMengisi = filteredData.filter(item => item.status_pengisian === 'Lengkap').length;
  const persentase = totalData > 0 ? ((sudahMengisi / totalData) * 100).toFixed(1) : 0;

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredData.length === 0) return;

    const headers = [
      'ID', 'Nama', 'NIS', 'Jalur Pendaftaran', 'Tahun Lulus', 'Status Pengisian',
      'Jalur Pilihan', 'Univ/Perusahaan/Bisnis Utama', 'Jurusan/Posisi/Bidang', 'Target Pilihan 2'
    ];

    const rows = filteredData.map(item => {
      const isKuliah = item.kategori_pilihan === 'kuliah';
      const isKerja = item.kategori_pilihan === 'kerja';
      const isBisnis = item.kategori_pilihan === 'bisnis';

      let targetUtama = '';
      let subTarget = '';
      let targetKedua = '';

      if (isKuliah) {
        targetUtama = item.rencana_detail?.univ_pilihan_1 || '';
        subTarget = item.rencana_detail?.jurusan_pilihan_1 || '';
        targetKedua = item.rencana_detail?.univ_pilihan_2 
          ? `${item.rencana_detail.univ_pilihan_2} - ${item.rencana_detail.jurusan_pilihan_2 || ''}` 
          : '';
      } else if (isKerja) {
        targetUtama = item.rencana_detail?.nama_perusahaan || '';
        subTarget = item.rencana_detail?.posisi_pekerjaan || '';
      } else if (isBisnis) {
        targetUtama = item.rencana_detail?.nama_bisnis || '';
        subTarget = item.rencana_detail?.bidang_bisnis || '';
      }

      return [
        item.id,
        `"${item.nama}"`,
        `"${item.nis}"`,
        `"${item.kelas_asal}"`,
        `"${item.tahun_lulus}"`,
        `"${item.status_pengisian}"`,
        `"${item.kategori_pilihan || 'Belum Mengisi'}"`,
        `"${targetUtama}"`,
        `"${subTarget}"`,
        `"${targetKedua}"`
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(',') + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Export_Penelusuran_Alumni.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full bg-white text-slate-800 font-sans p-6 lg:p-8 min-h-[calc(100vh-120px)] rounded-2xl shadow-sm border border-slate-100 relative">
      
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            Manajemen Penelusuran Alumni
          </h1>
          <p className="text-sm text-slate-500">
            Monitor progres kuesioner and data rencana karir siswa secara riil.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={fetchTrackingData}
            className="flex items-center justify-center p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer"
            title="Refresh Data"
            disabled={isLoading}
          >
            <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
          
          <button 
            type="button"
            onClick={handleExportCSV}
            disabled={filteredData.length === 0}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm py-2.5 px-4 rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="alert alert-danger py-4 px-5 border-0 rounded-2xl small mb-8 flex items-center gap-3 animate-fade-in-up" style={{ backgroundColor: '#fef2f2', color: '#991b1b' }}>
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="fw-bold mb-0.5" style={{ fontSize: '13.5px' }}>Terjadi Kesalahan</p>
            <p className="mb-0 text-red-700/80 small" style={{ fontSize: '12px' }}>{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Summary Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
             <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Siswa Terfilter</p>
             <p className="text-3xl font-bold text-slate-900">{totalData}</p>
           </div>
           <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
             <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
             </svg>
           </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
             <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Sudah Mengisi</p>
             <p className="text-3xl font-bold text-emerald-600">{sudahMengisi}</p>
           </div>
           <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
             <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
           </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
             <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Rasio Pengisian</p>
             <p className="text-3xl font-bold text-amber-500">{persentase}%</p>
           </div>
           <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
             <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
             </svg>
           </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="mb-6 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Pencarian Siswa</label>
          <div className="relative border border-slate-200 rounded-xl bg-white flex items-center px-3 shadow-sm focus-within:ring-2 focus-within:ring-slate-100 focus-within:border-slate-300 transition-all">
             <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
             </svg>
             <input 
               type="text" 
               placeholder="Cari Nama atau NIS..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full py-2.5 px-3 outline-none text-sm text-slate-800 placeholder-slate-400 bg-transparent"
             />
          </div>
        </div>

        <div className="w-full lg:w-56">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Jalur Karir Pilihan</label>
          <select 
            value={filterJalur}
            onChange={(e) => setFilterJalur(e.target.value)}
            className="w-full py-2.5 px-3 border border-slate-200 rounded-xl bg-white text-sm shadow-sm outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-300 transition-all cursor-pointer"
          >
            <option value="">Semua Jalur</option>
            <option value="kuliah">🎓 Kuliah / Studi Lanjut</option>
            <option value="kerja">💼 Bekerja / Karyawan</option>
            <option value="bisnis">💰 Wirausaha / Bisnis</option>
            <option value="belum">⏳ Belum Mengisi</option>
          </select>
        </div>

        <div className="w-full lg:w-48">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tahun Lulus</label>
          <select 
            value={filterTahun}
            onChange={(e) => setFilterTahun(e.target.value)}
            className="w-full py-2.5 px-3 border border-slate-200 rounded-xl bg-white text-sm shadow-sm outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-300 transition-all cursor-pointer"
          >
            <option value="">Semua Tahun</option>
            {uniqueTahun.map(tahun => (
              <option key={tahun} value={tahun}>{tahun}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full relative">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 border border-slate-100 rounded-2xl bg-slate-50/50">
            <svg className="animate-spin w-8 h-8 text-slate-400 mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-sm font-semibold text-slate-600">Sinkronisasi Data Alumni...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-slate-100 rounded-2xl bg-slate-50/50">
            <svg className="w-12 h-12 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-base font-bold text-slate-700 mb-0.5">Tidak Ada Data</p>
            <p className="text-sm text-slate-400">Belum ada data siswa yang cocok dengan filter saat ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider w-16 text-center">No</th>
                  <th className="px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider">Nama & NIS</th>
                  <th className="px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider w-36">Jalur Masuk</th>
                  <th className="px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider">Rencana Karir Utama</th>
                  <th className="px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider w-32">Status</th>
                  <th className="px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider w-24 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => {
                  const isComplete = item.status_pengisian === 'Lengkap';
                  const hasChoice = !!item.kategori_pilihan;

                  return (
                    <tr 
                      key={item.id} 
                      className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0 bg-white"
                    >
                      <td className="px-5 py-4 text-center text-sm font-medium text-slate-500">
                        {index + 1}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-sm text-slate-900">{item.nama}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{item.nis}</p>
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-slate-700">
                        {item.kelas_asal}
                      </td>
                      <td className="px-5 py-4">
                         {hasChoice ? (
                           <>
                             {item.kategori_pilihan === 'kuliah' && (
                               <div>
                                 <p className="font-semibold text-sm text-slate-800">{item.pilihan_1?.universitas}</p>
                                 <p className="text-xs text-blue-600 font-medium mt-0.5">🎓 Kuliah • {item.pilihan_1?.jurusan}</p>
                               </div>
                             )}
                             {item.kategori_pilihan === 'kerja' && (
                               <div>
                                 <p className="font-semibold text-sm text-slate-800">{item.pilihan_1?.universitas}</p>
                                 <p className="text-xs text-emerald-600 font-medium mt-0.5">💼 Bekerja • {item.pilihan_1?.jurusan}</p>
                               </div>
                             )}
                             {item.kategori_pilihan === 'bisnis' && (
                               <div>
                                 <p className="font-semibold text-sm text-slate-800">{item.pilihan_1?.universitas}</p>
                                 <p className="text-xs text-amber-600 font-medium mt-0.5">💰 Bisnis • {item.pilihan_1?.jurusan}</p>
                               </div>
                             )}
                           </>
                         ) : (
                           <span className="text-slate-400 text-xs italic font-medium">Belum mengisi kuesioner</span>
                         )}
                      </td>
                      <td className="px-5 py-4">
                        {isComplete ? (
                          <span className="inline-flex items-center px-2.5 py-1 font-semibold text-[10px] uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                            Lengkap
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 font-semibold text-[10px] uppercase tracking-wide bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button 
                          type="button"
                          onClick={() => setSelectedStudent(item)}
                          className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer"
                          title="Lihat Detail"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail View Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 overflow-hidden border border-slate-100">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-white">
               <div>
                 <h2 className="text-lg font-bold text-slate-900">{isEditing ? "Isi / Edit Rencana Karir" : "Detail Rencana Karir"}</h2>
                 <p className="text-sm text-slate-500 mt-1">{selectedStudent.nama} • {selectedStudent.nis}</p>
               </div>
               <button 
                 type="button"
                 onClick={() => { setSelectedStudent(null); setIsEditing(false); }}
                 className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-xl transition-colors cursor-pointer"
               >
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                 </svg>
               </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto bg-slate-50/50 flex flex-col gap-5 flex-1">
               {isEditing ? (
                 <form onSubmit={handleAdminSaveTracking} className="flex flex-col gap-4">
                   {formError && (
                     <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200">
                       {formError}
                     </div>
                   )}

                   {/* Dropdown Kategori */}
                   <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                     <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Jalur Karir Pilihan <span className="text-red-500">*</span></label>
                     <select
                       value={formData.kategori_pilihan}
                       onChange={(e) => setFormData({ ...formData, kategori_pilihan: e.target.value })}
                       className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-semibold focus:ring-2 focus:ring-slate-100 focus:border-slate-500 focus:outline-none bg-white transition-all text-sm cursor-pointer"
                     >
                       <option value="kuliah">🎓 Studi Lanjut / Kuliah</option>
                       <option value="kerja">💼 Bekerja / Karyawan</option>
                       <option value="bisnis">💰 Wirausaha / Bisnis Mandiri</option>
                     </select>
                   </div>

                   {/* KULIAH FORM FIELDS */}
                   {formData.kategori_pilihan === 'kuliah' && (
                     <div className="space-y-4">
                       <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1.5">
                           <label className="text-xs font-bold text-slate-700">Jalur Seleksi</label>
                           <select
                             value={formData.jalur_seleksi}
                             onChange={(e) => setFormData({ ...formData, jalur_seleksi: e.target.value })}
                             className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-100 focus:border-slate-500 focus:outline-none bg-white transition-all text-sm cursor-pointer"
                           >
                             <option value="">-- Pilih Jalur Seleksi --</option>
                             <option value="SNBP">SNBP (Prestasi)</option>
                             <option value="SNBT">SNBT (Tulis/UTBK)</option>
                             <option value="Mandiri">Mandiri / Ujian Mandiri</option>
                             <option value="Kedinasan">Sekolah Kedinasan</option>
                             <option value="Swasta">PTS / Kampus Swasta</option>
                             <option value="Lainnya">Lainnya</option>
                           </select>
                         </div>
                         <div className="space-y-1.5">
                           <label className="text-xs font-bold text-slate-700">Status Kelulusan</label>
                           <select
                             value={formData.status_seleksi}
                             onChange={(e) => setFormData({ ...formData, status_seleksi: e.target.value })}
                             className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-100 focus:border-slate-500 focus:outline-none bg-white transition-all text-sm cursor-pointer"
                           >
                             <option value="">-- Pilih Status --</option>
                             <option value="Rencana">Masih Rencana / Belum Pengumuman</option>
                             <option value="Diterima">Sudah Diterima</option>
                             <option value="Tidak Diterima">Tidak Diterima</option>
                           </select>
                         </div>
                       </div>

                       <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-4 animate-in fade-in duration-200">
                         <h4 className="font-bold text-xs text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
                           <span>Pilihan 1 (Utama)</span>
                           <span className="text-red-500">*</span>
                         </h4>
                         <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                             <label className="text-[11px] font-bold text-slate-600 uppercase">Universitas Target 1</label>
                             <input
                               type="text"
                               value={formData.univ_pilihan_1}
                               onChange={(e) => setFormData({ ...formData, univ_pilihan_1: e.target.value })}
                               placeholder="Contoh: Universitas Gadjah Mada"
                               className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-100 focus:border-slate-500 focus:outline-none transition-all text-sm"
                             />
                           </div>
                           <div className="space-y-1.5">
                             <label className="text-[11px] font-bold text-slate-600 uppercase">Program Studi Target 1</label>
                             <input
                               type="text"
                               value={formData.jurusan_pilihan_1}
                               onChange={(e) => setFormData({ ...formData, jurusan_pilihan_1: e.target.value })}
                               placeholder="Contoh: Kedokteran"
                               className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-100 focus:border-slate-500 focus:outline-none transition-all text-sm"
                             />
                           </div>
                         </div>
                       </div>

                       <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 animate-in fade-in duration-200">
                         <h4 className="font-bold text-xs text-slate-600 uppercase tracking-wider">Pilihan 2 (Alternatif / Opsional)</h4>
                         <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                             <label className="text-[11px] font-bold text-slate-600 uppercase">Universitas Target 2</label>
                             <input
                               type="text"
                               value={formData.univ_pilihan_2}
                               onChange={(e) => setFormData({ ...formData, univ_pilihan_2: e.target.value })}
                               placeholder="Contoh: Universitas Airlangga"
                               className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-100 focus:border-slate-500 focus:outline-none transition-all text-sm"
                             />
                           </div>
                           <div className="space-y-1.5">
                             <label className="text-[11px] font-bold text-slate-600 uppercase">Program Studi Target 2</label>
                             <input
                               type="text"
                               value={formData.jurusan_pilihan_2}
                               onChange={(e) => setFormData({ ...formData, jurusan_pilihan_2: e.target.value })}
                               placeholder="Contoh: Farmasi"
                               className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-100 focus:border-slate-500 focus:outline-none transition-all text-sm"
                             />
                           </div>
                         </div>
                       </div>
                     </div>
                   )}

                   {/* BEKERJA FORM FIELDS */}
                   {formData.kategori_pilihan === 'kerja' && (
                     <div className="space-y-4 animate-in fade-in duration-200">
                       <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-4">
                         <h4 className="font-bold text-xs text-emerald-800 uppercase tracking-wider">Target Profesional Kerja</h4>
                         <div className="space-y-3">
                           <div className="space-y-1.5">
                             <label className="text-xs font-bold text-slate-700 block">Nama Perusahaan / Industri <span className="text-red-500">*</span></label>
                             <input
                               type="text"
                               value={formData.nama_perusahaan}
                               onChange={(e) => setFormData({ ...formData, nama_perusahaan: e.target.value })}
                               placeholder="Contoh: PT Telkom Indonesia, Perbankan, BUMN"
                               className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-100 focus:border-slate-500 focus:outline-none transition-all text-sm"
                             />
                           </div>
                           <div className="space-y-1.5">
                             <label className="text-xs font-bold text-slate-700 block">Posisi / Pekerjaan Target <span className="text-red-500">*</span></label>
                             <input
                               type="text"
                               value={formData.posisi_pekerjaan}
                               onChange={(e) => setFormData({ ...formData, posisi_pekerjaan: e.target.value })}
                               placeholder="Contoh: Software Engineer, Staf Administrasi"
                               className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-100 focus:border-slate-500 focus:outline-none transition-all text-sm"
                             />
                           </div>
                           <div className="space-y-1.5">
                             <label className="text-xs font-bold text-slate-700 block">Estimasi Gaji Bulanan Target</label>
                             <select
                               value={formData.estimasi_gaji}
                               onChange={(e) => setFormData({ ...formData, estimasi_gaji: e.target.value })}
                               className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-100 focus:border-slate-500 focus:outline-none bg-white transition-all text-sm cursor-pointer"
                             >
                               <option value="">-- Pilih Estimasi Gaji --</option>
                               <option value="< 3 Juta">Kurang dari Rp 3.000.000</option>
                               <option value="3 Juta - 5 Juta">Rp 3.000.000 - Rp 5.000.000</option>
                               <option value="5 Juta - 10 Juta">Rp 5.000.000 - Rp 10.000.000</option>
                               <option value="> 10 Juta">Diatas Rp 10.000.000</option>
                             </select>
                           </div>
                         </div>
                       </div>
                     </div>
                   )}

                   {/* BISNIS FORM FIELDS */}
                   {formData.kategori_pilihan === 'bisnis' && (
                     <div className="space-y-4 animate-in fade-in duration-200">
                       <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 space-y-4">
                         <h4 className="font-bold text-xs text-amber-800 uppercase tracking-wider">Rencana Wirausaha / Usaha Mandiri</h4>
                         <div className="space-y-3">
                           <div className="space-y-1.5">
                             <label className="text-xs font-bold text-slate-700 block">Bidang / Sektor Bisnis <span className="text-red-500">*</span></label>
                             <input
                               type="text"
                               value={formData.bidang_bisnis}
                               onChange={(e) => setFormData({ ...formData, bidang_bisnis: e.target.value })}
                               placeholder="Contoh: Kuliner, Fashion, Teknologi Informasi"
                               className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-100 focus:border-slate-500 focus:outline-none transition-all text-sm"
                             />
                           </div>
                           <div className="space-y-1.5">
                             <label className="text-xs font-bold text-slate-700 block">Nama Bisnis / Rencana Ide Usaha <span className="text-red-500">*</span></label>
                             <input
                               type="text"
                               value={formData.nama_bisnis}
                               onChange={(e) => setFormData({ ...formData, nama_bisnis: e.target.value })}
                               placeholder="Contoh: Café Kopi, Startup E-commerce"
                               className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-100 focus:border-slate-500 focus:outline-none transition-all text-sm"
                             />
                           </div>
                           <div className="space-y-1.5">
                             <label className="text-xs font-bold text-slate-700 block">Estimasi Modal Awal</label>
                             <select
                               value={formData.modal_awal}
                               onChange={(e) => setFormData({ ...formData, modal_awal: e.target.value })}
                               className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-slate-100 focus:border-slate-500 focus:outline-none bg-white transition-all text-sm cursor-pointer"
                             >
                               <option value="">-- Pilih Rentang Modal Awal --</option>
                               <option value="< 5 Juta">Kurang dari Rp 5.000.000</option>
                               <option value="5 Juta - 20 Juta">Rp 5.000.000 - Rp 20.000.000</option>
                               <option value="20 Juta - 100 Juta">Rp 20.000.000 - Rp 100.000.000</option>
                               <option value="> 100 Juta">Diatas Rp 100.000.000</option>
                             </select>
                           </div>
                         </div>
                       </div>
                     </div>
                   )}

                   {/* Form Actions inside modal footer */}
                   <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-white">
                     <button
                       type="button"
                       onClick={() => setIsEditing(false)}
                       disabled={isSaving}
                       className="px-5 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700 bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                     >
                       Batal
                     </button>
                     <button
                       type="submit"
                       disabled={isSaving}
                       className="px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                     >
                       {isSaving ? (
                         <>
                           <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                           </svg>
                           Menyimpan...
                         </>
                       ) : (
                         "Simpan Rencana"
                       )}
                     </button>
                   </div>
                 </form>
               ) : (
                 <>
                   {/* Section: Status & Jalur Badge */}
                   <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                     <div>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status Kuesioner</p>
                       {selectedStudent.status_pengisian === 'Lengkap' ? (
                         <span className="inline-flex items-center px-3 py-1 font-bold text-[10px] uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                           Selesai Diisi
                         </span>
                       ) : (
                         <span className="inline-flex items-center px-3 py-1 font-bold text-[10px] uppercase tracking-wide bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                           Belum Lengkap / Pending
                         </span>
                       )}
                     </div>
                     
                     <div className="text-end">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Jalur Pilihan</p>
                       {selectedStudent.kategori_pilihan === 'kuliah' && (
                         <span className="inline-flex items-center px-3 py-1 font-bold text-[10px] uppercase tracking-wide bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                           🎓 Studi Lanjut
                         </span>
                       )}
                       {selectedStudent.kategori_pilihan === 'kerja' && (
                         <span className="inline-flex items-center px-3 py-1 font-bold text-[10px] uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                           💼 Bekerja
                         </span>
                       )}
                       {selectedStudent.kategori_pilihan === 'bisnis' && (
                         <span className="inline-flex items-center px-3 py-1 font-bold text-[10px] uppercase tracking-wide bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                           💰 Wirausaha
                         </span>
                       )}
                       {!selectedStudent.kategori_pilihan && (
                         <span className="inline-flex items-center px-3 py-1 font-bold text-[10px] uppercase tracking-wide bg-slate-100 text-slate-500 border border-slate-200 rounded-full">
                           ⏳ Belum Mengisi
                         </span>
                       )}
                     </div>
                   </div>
                   
                    {/* Section: Academic Identity */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Identitas Lengkap Siswa
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Lengkap</p>
                          <p className="font-bold text-slate-800 text-sm leading-tight">{selectedStudent.nama}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nomor Induk Siswa (NIS)</p>
                          <p className="font-bold text-slate-800 text-sm leading-tight">{selectedStudent.nis}</p>
                        </div>
                        
                        <div className="space-y-1 border-t border-slate-50 pt-2.5">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nomor Induk Siswa Nasional (NISN)</p>
                          <p className="font-semibold text-slate-700 text-sm leading-tight">{selectedStudent.nisn || 'Tidak tersedia'}</p>
                        </div>
                        <div className="space-y-1 border-t border-slate-50 pt-2.5">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">No. Pendaftaran</p>
                          <p className="font-semibold text-slate-700 text-sm leading-tight">{selectedStudent.no_pendaftaran || 'Tidak tersedia'}</p>
                        </div>

                        <div className="space-y-1 border-t border-slate-50 pt-2.5">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jalur Masuk Sekolah</p>
                          <p className="font-semibold text-slate-700 text-sm leading-tight capitalize">{selectedStudent.kelas_asal}</p>
                        </div>
                        <div className="space-y-1 border-t border-slate-50 pt-2.5">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Asal Sekolah</p>
                          <p className="font-semibold text-slate-700 text-sm leading-tight">{selectedStudent.asal_sekolah || 'Tidak tersedia'}</p>
                        </div>

                        <div className="space-y-1 border-t border-slate-50 pt-2.5">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tahun Masuk / Lulus</p>
                          <p className="font-semibold text-slate-700 text-sm leading-tight">
                            {selectedStudent.tahun_masuk || 'Tidak tersedia'} / {selectedStudent.tahun_lulus}
                          </p>
                        </div>
                        <div className="space-y-1 border-t border-slate-50 pt-2.5">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tahun Ajaran Aktif</p>
                          <p className="font-semibold text-slate-700 text-sm leading-tight">{selectedStudent.tahun_ajaran || 'Tidak tersedia'}</p>
                        </div>

                        <div className="col-span-2 space-y-1 border-t border-slate-50 pt-3">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alamat Rumah</p>
                          <p className="font-medium text-slate-600 text-xs leading-relaxed">{selectedStudent.alamat || 'Tidak tersedia'}</p>
                        </div>
                      </div>
                    </div>

                   {/* Section: Dynamic Career Plan Details */}
                   {selectedStudent.rencana_detail ? (
                     <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                       
                       {/* KULIAH DETAILS */}
                       {selectedStudent.kategori_pilihan === 'kuliah' && (
                         <div>
                           <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                             <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                             </svg>
                             Rencana Pendidikan Tinggi
                           </h3>
                           <div className="d-flex flex-column gap-3.5">
                             <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                               <p className="text-[10px] font-bold uppercase text-blue-600 mb-1">Pilihan Utama (Pilihan 1)</p>
                               <p className="font-bold text-slate-800 text-sm">{selectedStudent.rencana_detail.univ_pilihan_1}</p>
                               <p className="text-xs text-slate-500 mt-0.5">Jurusan: {selectedStudent.rencana_detail.jurusan_pilihan_1}</p>
                             </div>
                             
                             {selectedStudent.rencana_detail.univ_pilihan_2 && (
                               <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                                 <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Pilihan Cadangan (Pilihan 2)</p>
                                 <p className="font-bold text-slate-800 text-sm">{selectedStudent.rencana_detail.univ_pilihan_2}</p>
                                 <p className="text-xs text-slate-500 mt-0.5">Jurusan: {selectedStudent.rencana_detail.jurusan_pilihan_2}</p>
                               </div>
                             )}

                             <div className="row g-3 mt-1">
                               <div className="col-6">
                                 <p className="text-[10px] font-semibold text-slate-400 uppercase">Jalur Seleksi</p>
                                 <p className="text-sm font-bold text-slate-800 mb-0">{selectedStudent.rencana_detail.jalur_seleksi || 'Belum diisi'}</p>
                               </div>
                               <div className="col-6">
                                 <p className="text-[10px] font-semibold text-slate-400 uppercase">Status Seleksi</p>
                                 <p className="text-sm font-bold text-slate-800 mb-0">{selectedStudent.rencana_detail.status_seleksi || 'Belum diisi'}</p>
                               </div>
                             </div>
                           </div>
                         </div>
                       )}

                       {/* BEKERJA DETAILS */}
                       {selectedStudent.kategori_pilihan === 'kerja' && (
                         <div>
                           <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                             <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                             </svg>
                             Rencana Karir Profesional
                           </h3>
                           <div className="d-flex flex-column gap-3">
                             <div>
                               <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Nama Perusahaan / Instansi</p>
                               <p className="font-bold text-slate-800 text-sm">{selectedStudent.rencana_detail.nama_perusahaan}</p>
                             </div>
                             <div>
                               <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Posisi Pekerjaan</p>
                               <p className="font-bold text-slate-800 text-sm">{selectedStudent.rencana_detail.posisi_pekerjaan}</p>
                             </div>
                             {selectedStudent.rencana_detail.estimasi_gaji && (
                               <div>
                                 <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Estimasi Gaji</p>
                                 <p className="text-sm font-bold text-slate-800">{selectedStudent.rencana_detail.estimasi_gaji}</p>
                               </div>
                             )}
                           </div>
                         </div>
                       )}

                       {/* WIRAUSAHA DETAILS */}
                       {selectedStudent.kategori_pilihan === 'bisnis' && (
                         <div>
                           <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                             <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                             </svg>
                             Rencana Wirausaha / Bisnis
                           </h3>
                           <div className="d-flex flex-column gap-3">
                             <div>
                               <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Nama Usaha / Brand</p>
                               <p className="font-bold text-slate-800 text-sm">{selectedStudent.rencana_detail.nama_bisnis}</p>
                             </div>
                             <div>
                               <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Bidang Usaha</p>
                               <p className="font-bold text-slate-800 text-sm">{selectedStudent.rencana_detail.bidang_bisnis}</p>
                             </div>
                             {selectedStudent.rencana_detail.modal_awal && (
                               <div>
                                 <p className="text-sm font-bold text-slate-800">{selectedStudent.rencana_detail.modal_awal}</p>
                               </div>
                             )}
                           </div>
                         </div>
                       )}
                     </div>
                   ) : (
                     <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center">
                       <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                       </svg>
                       <p className="text-sm font-bold text-slate-700 mb-0.5">Belum Ada Rencana Karir</p>
                       <p className="text-xs text-slate-400 mb-0">Siswa ini belum memulai atau melengkapi kuesioner rencana karir di portal dashboard mereka.</p>
                     </div>
                   )}
                 </>
               )}
            </div>

            {/* Modal Footer */}
            {!isEditing && (
              <div className="p-5 border-t border-slate-100 bg-white flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => { setSelectedStudent(null); setIsEditing(false); }}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-800 bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                  {selectedStudent.rencana_detail ? "Edit Rencana Karir" : "Isi Rencana Karir"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTrackingDashboard;
