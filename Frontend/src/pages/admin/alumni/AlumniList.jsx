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
  const [filterKategori, setFilterKategori] = useState(''); // '', 'kuliah', 'kerja', 'bisnis', 'belum'

  // Modal State
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  
  // Add / Edit Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // If null, we are adding new alumni
  const [isSavingForm, setIsSavingForm] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formState, setFormState] = useState({
    nisn: '',
    nama_lengkap: '',
    tahun_lulus: '',
    jurusan: 'MIPA',
    no_telepon: '',
    email: '',
    alamat_domisili: '',
    latitude: '',
    longitude: '',
    
    // plans
    kategori_pilihan: 'kuliah',
    univ_pilihan_1: '',
    jurusan_pilihan_1: '',
    univ_pilihan_2: '',
    jurusan_pilihan_2: '',
    jalur_seleksi: '',
    status_seleksi: 'Rencana',
    nama_perusahaan: '',
    posisi_pekerjaan: '',
    estimasi_gaji: '',
    nama_bisnis: '',
    bidang_bisnis: '',
    modal_awal: '',
  });

  // Bulk actions
  const [selectedItems, setSelectedItems] = useState([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);



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

  useEffect(() => {
    const t = setTimeout(() => {
      fetchAlumniData();
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const handleDelete = async (alumniId, studentId) => {
    const deleteId = alumniId || studentId;
    if (!deleteId) {
      alert("ID Alumni tidak tersedia untuk dihapus");
      return;
    }
    if (!window.confirm("Yakin ingin menghapus data alumni ini?")) return;

    const rawApiUrl = import.meta.env.VITE_API_BASE_URL || "";
    const API_BASE_URL = rawApiUrl.replace(/\/$/, "");
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    try {
      await axios.delete(`${API_BASE_URL}/api/alumni/${deleteId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      alert('Data alumni berhasil dihapus');
      fetchAlumniData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Gagal menghapus data alumni');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Yakin ingin menghapus ${selectedItems.length} data terpilih?`)) return;
    setIsBulkDeleting(true);
    const rawApiUrl = import.meta.env.VITE_API_BASE_URL || "";
    const API_BASE_URL = rawApiUrl.replace(/\/$/, "");
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    // Resolve matching alumni ids for the selected items
    const alumniIds = selectedItems.map(siswaId => {
      const item = data.find(d => d.id === siswaId);
      return item ? item.alumni_id : null;
    }).filter(Boolean);

    if (alumniIds.length === 0) {
      alert('Tidak ada ID alumni yang valid untuk dihapus bulk');
      setIsBulkDeleting(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/alumni/bulk-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: alumniIds }),
      });
      if (res.ok) {
        alert(`${alumniIds.length} data alumni berhasil dihapus`);
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

  // Open Add Form
  const handleOpenAddForm = () => {
    setEditingId(null);
    setFormState({
      nisn: '',
      nama_lengkap: '',
      tahun_lulus: '',
      jurusan: 'MIPA',
      no_telepon: '',
      email: '',
      alamat_domisili: '',
      latitude: '',
      longitude: '',
      kategori_pilihan: 'kuliah',
      univ_pilihan_1: '',
      jurusan_pilihan_1: '',
      univ_pilihan_2: '',
      jurusan_pilihan_2: '',
      jalur_seleksi: '',
      status_seleksi: 'Rencana',
      nama_perusahaan: '',
      posisi_pekerjaan: '',
      estimasi_gaji: '',
      nama_bisnis: '',
      bidang_bisnis: '',
      modal_awal: '',
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Open Edit Form
  const handleOpenEditForm = (item) => {
    if (!item.alumni_id) {
      alert("Data alumni_id belum tersinkronisasi di database");
      return;
    }
    setEditingId(item.alumni_id);
    const rk = item.rencana_detail;
    setFormState({
      nisn: item.nisn || '',
      nama_lengkap: item.nama || '',
      tahun_lulus: item.tahun_lulus || '',
      jurusan: item.jurusan || 'MIPA',
      no_telepon: item.no_telepon || '',
      email: item.email || '',
      alamat_domisili: item.alamat || '',
      latitude: item.rencana_detail?.latitude || '',
      longitude: item.rencana_detail?.longitude || '',
      kategori_pilihan: item.kategori_pilihan === 'belum' ? 'kuliah' : (item.kategori_pilihan || 'kuliah'),
      univ_pilihan_1: rk?.univ_pilihan_1 || '',
      jurusan_pilihan_1: rk?.jurusan_pilihan_1 || '',
      univ_pilihan_2: rk?.univ_pilihan_2 || '',
      jurusan_pilihan_2: rk?.jurusan_pilihan_2 || '',
      jalur_seleksi: rk?.jalur_seleksi || '',
      status_seleksi: rk?.status_seleksi || 'Rencana',
      nama_perusahaan: rk?.nama_perusahaan || '',
      posisi_pekerjaan: rk?.posisi_pekerjaan || '',
      estimasi_gaji: rk?.estimasi_gaji || '',
      nama_bisnis: rk?.nama_bisnis || '',
      bidang_bisnis: rk?.bidang_bisnis || '',
      modal_awal: rk?.modal_awal || '',
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Save Add/Edit Form
  const handleSaveForm = async (e) => {
    e.preventDefault();
    setIsSavingForm(true);
    setFormErrors({});

    const errors = {};
    if (!formState.nisn) errors.nisn = "NISN wajib diisi";
    if (!formState.nama_lengkap) errors.nama_lengkap = "Nama Lengkap wajib diisi";
    if (!formState.tahun_lulus) errors.tahun_lulus = "Tahun Lulus wajib diisi";

    if (formState.kategori_pilihan === 'kuliah') {
      if (!formState.univ_pilihan_1) errors.univ_pilihan_1 = "Universitas Pilihan 1 wajib diisi";
      if (!formState.jurusan_pilihan_1) errors.jurusan_pilihan_1 = "Jurusan Pilihan 1 wajib diisi";
    } else if (formState.kategori_pilihan === 'kerja') {
      if (!formState.nama_perusahaan) errors.nama_perusahaan = "Nama Perusahaan wajib diisi";
      if (!formState.posisi_pekerjaan) errors.posisi_pekerjaan = "Posisi Pekerjaan wajib diisi";
    } else if (formState.kategori_pilihan === 'bisnis') {
      if (!formState.nama_bisnis) errors.nama_bisnis = "Nama Bisnis wajib diisi";
      if (!formState.bidang_bisnis) errors.bidang_bisnis = "Bidang Bisnis wajib diisi";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsSavingForm(false);
      return;
    }

    const rawApiUrl = import.meta.env.VITE_API_BASE_URL || "";
    const API_BASE_URL = rawApiUrl.replace(/\/$/, "");
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    try {
      const url = editingId 
        ? `${API_BASE_URL}/api/alumni/${editingId}`
        : `${API_BASE_URL}/api/alumni`;
      
      const method = editingId ? 'put' : 'post';

      const response = await axios[method](url, formState, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.data.status === 'success' || response.status === 201 || response.status === 200) {
        alert(editingId ? 'Data alumni berhasil diperbarui' : 'Data alumni berhasil ditambahkan');
        setIsFormOpen(false);
        fetchAlumniData();
      } else {
        alert(response.data.message || 'Gagal menyimpan data');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Terjadi kesalahan saat menghubungi server');
    } finally {
      setIsSavingForm(false);
    }
  };

  // GPS Coordinates detection helper
  const detectGPS = () => {
    if (!navigator.geolocation) {
      alert("Browser Anda tidak mendukung deteksi lokasi (GPS).");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormState(prev => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6)
        }));
      },
      (err) => {
        console.error("GPS Detection failed:", err);
        alert("Gagal mendeteksi lokasi GPS Anda. Pastikan izin akses lokasi telah diberikan.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Export filtered data to CSV
  const handleExportCSV = () => {
    if (filteredData.length === 0) return;

    const headers = [
      'ID', 'Nama', 'NIS', 'NISN', 'Kelas Asal', 'Tahun Lulus', 'Status Pengisian',
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
        `"${item.nis || '-'}"`,
        `"${item.nisn || '-'}"`,
        `"${item.kelas_asal || '-'}"`,
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

  // Filtered & Searched Data — no manual useMemo, React Compiler handles it
  const filteredData = data.filter(item => {
    const nameMatch = (item.nama || '').toLowerCase().includes(searchQuery.toLowerCase());
    const nisMatch = (item.nis || '').toLowerCase().includes(searchQuery.toLowerCase());
    const nisnMatch = (item.nisn || '').toLowerCase().includes(searchQuery.toLowerCase());
    const univMatch = (item.pilihan_1?.universitas || '').toLowerCase().includes(searchQuery.toLowerCase());
    const studyMatch = (item.pilihan_1?.jurusan || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSearch = nameMatch || nisMatch || nisnMatch || univMatch || studyMatch;
    const matchesTahun = filterTahunLulus ? String(item.tahun_lulus) === filterTahunLulus : true;
    const matchesKategori =
      filterKategori === 'all' || filterKategori === ''
        ? true
        : item.kategori_pilihan === filterKategori;

    return matchesSearch && matchesTahun && matchesKategori;
  });

  // Avatar Initials Helpers
  const getInitials = (name) => {
    if (!name) return 'A';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const getAvatarBg = (name) => {
    const code = (name || '').charCodeAt(0) || 65;
    const colors = [
      'bg-indigo-50 text-indigo-700 border border-indigo-100',
      'bg-blue-50 text-blue-700 border border-blue-100',
      'bg-purple-50 text-purple-700 border border-purple-100',
      'bg-emerald-50 text-emerald-700 border border-emerald-100',
      'bg-rose-50 text-rose-700 border border-rose-100',
      'bg-amber-50 text-amber-700 border border-amber-100',
    ];
    return colors[code % colors.length];
  };

  // Radial Ring Properties for Stats Ring
  const radius = 18;
  const strokeWidth = 3.5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stats.rasio / 100) * circumference;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-805 tracking-tight flex items-center gap-2">
            <span>Penelusuran & Data Alumni</span>
            {activeTahunAjaran && (
              <span className="px-2.5 py-0.5 text-[10px] font-semibold text-emerald-705 bg-emerald-50 rounded-full border border-emerald-100/70">
                TA Aktif: {activeTahunAjaran}
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-450 mt-1">
            Pantau dan kelola data rencana karir serta kuesioner tracer study alumni SMAN 1 Pamekasan.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleOpenAddForm}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all cursor-pointer shadow-sm hover:scale-[1.01] active:scale-[0.99]"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Tambah Alumni
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Unduh CSV
          </button>
          <button 
            onClick={fetchAlumniData}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 20v-5h-5" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 9a9 9 0 0 1 14.9-3.4L20 7M4 15l1.1 1.4A9 9 0 0 0 20 15" />
            </svg>
            Segarkan
          </button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Alumni */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Alumni</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1 leading-none">{stats.total}</h3>
            </div>
          </div>
          <span className="text-[9px] font-extrabold px-2.5 py-1 bg-indigo-50 border border-indigo-100/50 text-indigo-700 rounded-full">Siswa</span>
        </div>

        {/* Card 2: Lengkap Survey */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
              <svg className="w-11 h-11 transform -rotate-90">
                <circle cx="22" cy="22" r={radius} stroke="#f1f5f9" strokeWidth={strokeWidth} fill="transparent" />
                <circle cx="22" cy="22" r={radius} stroke="#10b981" strokeWidth={strokeWidth} fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className="transition-all duration-500" strokeLinecap="round" />
              </svg>
              <span className="absolute text-[10px] font-black text-slate-700">{stats.rasio}%</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lengkap Survey</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1 leading-none">{stats.lengkap}</h3>
            </div>
          </div>
          <span className="text-[9px] font-extrabold px-2.5 py-1 bg-emerald-50 border border-emerald-100/50 text-emerald-700 rounded-full">Selesai</span>
        </div>

        {/* Card 3: Rencana Karir Segmented Progress */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex flex-col justify-between min-h-20.5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rencana Karir</span>
            <span className="text-[10px] font-extrabold text-slate-500">{stats.kuliah + stats.kerja + stats.bisnis} Mengisi</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex shadow-inner">
            <div style={{ width: `${stats.total > 0 ? (stats.kuliah / stats.total) * 100 : 0}%` }} className="bg-blue-500 h-full transition-all duration-500" title={`Kuliah: ${stats.kuliah}`} />
            <div style={{ width: `${stats.total > 0 ? (stats.kerja / stats.total) * 100 : 0}%` }} className="bg-emerald-500 h-full transition-all duration-500" title={`Bekerja: ${stats.kerja}`} />
            <div style={{ width: `${stats.total > 0 ? (stats.bisnis / stats.total) * 100 : 0}%` }} className="bg-amber-550 h-full transition-all duration-500" title={`Wirausaha: ${stats.bisnis}`} />
            <div style={{ width: `${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%` }} className="bg-slate-200 h-full transition-all duration-500" title={`Belum: ${stats.pending}`} />
          </div>
          <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 mt-2">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>Kuliah: {stats.kuliah}</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Kerja: {stats.kerja}</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-550"></span>Bisnis: {stats.bisnis}</span>
          </div>
        </div>

        {/* Card 4: Belum Mengisi */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Belum Mengisi</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1 leading-none">{stats.pending}</h3>
            </div>
          </div>
          <span className="text-[9px] font-extrabold px-2.5 py-1 bg-rose-50 border border-rose-100/50 text-rose-700 rounded-full">Tertunda</span>
        </div>
      </div>

      {/* Main Table & Filters */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        {/* Filters and Search */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Cari nama, NIS, NISN, universitas, atau jurusan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800 transition-all bg-slate-50/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {selectedItems.length > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={isBulkDeleting}
                className="px-3.5 py-2 bg-red-50 text-red-600 hover:bg-red-105 border border-red-100 rounded-2xl text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Hapus Terpilih ({selectedItems.length})
              </button>
            )}

            {/* Filter Tahun Lulus */}
            <select
              value={filterTahunLulus}
              onChange={(e) => setFilterTahunLulus(e.target.value)}
              className="px-3.5 py-2 border border-slate-200 rounded-2xl text-xs text-slate-700 bg-white outline-none focus:ring-2 focus:ring-slate-800 cursor-pointer transition-all"
            >
              <option value="">Semua Tahun Lulus</option>
              {listTahunLulus.map(year => (
                <option key={year} value={year}>Lulus Tahun {year}</option>
              ))}
            </select>

            {/* Filter Kategori Pilihan */}
            <select
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              className="px-3.5 py-2 border border-slate-200 rounded-2xl text-xs text-slate-700 bg-white outline-none focus:ring-2 focus:ring-slate-800 cursor-pointer transition-all"
            >
              <option value="">Semua Kategori</option>
              <option value="kuliah">Kuliah</option>
              <option value="kerja">Bekerja</option>
              <option value="bisnis">Wirausaha</option>
              <option value="belum">Belum Mengisi</option>
            </select>
          </div>
        </div>

        {/* Error State Banner */}
        {errorMsg && (
          <div className="p-4 border-b border-red-150 bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-3">
            <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Data Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
              <p className="text-xs font-bold">Memuat data alumni...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center gap-2 text-slate-400">
              <svg className="w-12 h-12 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-3 2.246L11 15H3m16 0a2 2 0 00-3-2.246L11 15H3m0 0a2 2 0 002 2h6a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4z" />
              </svg>
              <h4 className="text-sm font-bold text-slate-500">Tidak Ada Alumni Ditemukan</h4>
              <p className="text-[11px] text-slate-400">Silakan sesuaikan kata kunci pencarian atau kategori filter Anda.</p>
            </div>
          ) : (
            <table className="w-full border-collapse text-left text-slate-600">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-400 uppercase text-[9px] font-extrabold tracking-wider">
                  <th className="py-4 px-4 w-12 text-center">
                    <input type="checkbox" className="rounded border-slate-300 text-slate-800 focus:ring-slate-800" checked={filteredData.length > 0 && selectedItems.length === filteredData.length} onChange={handleSelectAll} />
                  </th>
                  <th className="py-4 px-3 text-center w-12">No</th>
                  <th className="py-4 px-4 w-28">NIS</th>
                  <th className="py-4 px-4">Nama Lengkap & Detail</th>
                  <th className="py-4 px-4 text-center w-28">Tahun Masuk</th>
                  <th className="py-4 px-4 text-center w-28">Tahun Lulus</th>
                  <th className="py-4 px-4 w-36">Status Tracer</th>
                  <th className="py-4 px-4">Pilihan Utama / Target</th>
                  <th className="py-4 px-6 text-center w-36">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredData.map((item, index) => {
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-3 px-4 text-center">
                        <input type="checkbox" className="rounded border-slate-300 text-slate-800 focus:ring-slate-800" checked={selectedItems.includes(item.id)} onChange={() => handleSelectItem(item.id)} />
                      </td>
                      <td className="py-3 px-3 text-center text-slate-400 font-bold">{index + 1}</td>
                      <td className="py-3 px-4 font-bold text-slate-700">{item.nis || '-'}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${getAvatarBg(item.nama)}`}>
                            {getInitials(item.nama)}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-800 leading-tight">{item.nama}</div>
                            <div className="text-[10px] text-slate-400 mt-1 leading-none">NISN: {item.nisn || '-'} | Kelas Asal: {item.kelas_asal || '-'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-500">{item.tahun_masuk}</td>
                      <td className="py-3 px-4 text-center font-extrabold text-slate-800">{item.tahun_lulus}</td>
                      <td className="py-3 px-4">
                        {item.kategori_pilihan === 'kuliah' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            Kuliah
                          </span>
                        )}
                        {item.kategori_pilihan === 'kerja' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Bekerja
                          </span>
                        )}
                        {item.kategori_pilihan === 'bisnis' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 bg-amber-550/10 border border-amber-200 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Wirausaha
                          </span>
                        )}
                        {item.kategori_pilihan === 'belum' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            Belum Mengisi
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate">
                        {item.pilihan_1 ? (
                          <div>
                            <p className="font-extrabold text-slate-800 leading-tight">{item.pilihan_1.universitas}</p>
                            <p className="text-[10px] text-slate-450 mt-0.5 font-bold">{item.pilihan_1.jurusan}</p>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-medium italic">Belum mengisi kuesioner</span>
                        )}
                      </td>
                      <td className="py-3 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedAlumni(item)}
                            className="px-2.5 py-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 hover:bg-indigo-150 rounded-lg transition-colors cursor-pointer"
                            title="Detail"
                          >
                            Detail
                          </button>
                          <button
                            onClick={() => handleOpenEditForm(item)}
                            className="px-2.5 py-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.alumni_id, item.id)}
                            className="px-2.5 py-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                            title="Hapus"
                          >
                            Hapus
                          </button>
                        </div>
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
            <div className="bg-linear-to-r from-slate-900 to-slate-800 px-6 py-5 text-white flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold">Detail Profil Alumni</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">NISN: {selectedAlumni.nisn || '-'} • {selectedAlumni.nama}</p>
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
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Informasi Akademik & Kontak</h4>
                <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-4 border border-slate-100 rounded-2xl">
                  <div>
                    <p className="text-[10px] text-slate-400">Nama Lengkap</p>
                    <p className="font-bold text-slate-800 mt-0.5">{selectedAlumni.nama}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">NIS / NISN</p>
                    <p className="font-bold text-slate-800 mt-0.5">{selectedAlumni.nis || '-'} / {selectedAlumni.nisn || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Jurusan Asal</p>
                    <p className="font-semibold text-slate-700 mt-0.5">{selectedAlumni.jurusan || selectedAlumni.kelas_asal || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Tahun Masuk / Lulus</p>
                    <p className="font-bold text-slate-800 mt-0.5">{selectedAlumni.tahun_masuk} / {selectedAlumni.tahun_lulus}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">No. Telepon / WhatsApp</p>
                    <p className="font-semibold text-slate-750 mt-0.5">{selectedAlumni.rencana_detail?.no_telepon || selectedAlumni.no_telepon || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Email</p>
                    <p className="font-semibold text-slate-750 mt-0.5">{selectedAlumni.rencana_detail?.email || selectedAlumni.email || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] text-slate-400">Alamat Domisili</p>
                    <p className="font-medium text-slate-700 mt-0.5">{selectedAlumni.rencana_detail?.alamat_domisili || selectedAlumni.alamat || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Latitude (Lintang)</p>
                    <p className="font-semibold text-slate-700 mt-0.5">{selectedAlumni.rencana_detail?.latitude || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Longitude (Bujur)</p>
                    <p className="font-semibold text-slate-700 mt-0.5">{selectedAlumni.rencana_detail?.longitude || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Rencana Karir Section */}
              <div>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Rencana Karir Alumni</h4>
                
                {selectedAlumni.kategori_pilihan === 'belum' || !selectedAlumni.rencana_detail ? (
                  <div className="bg-rose-50/50 border border-rose-100/50 text-rose-700 p-4 rounded-2xl text-center">
                    <p className="font-semibold">Survey Belum Diisi</p>
                    <p className="text-[10px] text-rose-505 mt-0.5">Alumni ini belum mengisi kuesioner rencana penelusuran setelah lulus.</p>
                  </div>
                ) : (
                  <div className="border border-slate-100 rounded-2xl overflow-hidden">
                    {/* Header Pilihan */}
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <span>Pilihan: </span>
                        {selectedAlumni.kategori_pilihan === 'kuliah' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            Melanjutkan Kuliah
                          </span>
                        )}
                        {selectedAlumni.kategori_pilihan === 'kerja' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Langsung Bekerja
                          </span>
                        )}
                        {selectedAlumni.kategori_pilihan === 'bisnis' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-amber-50 border border-amber-100 text-amber-700 text-[10px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
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

      {/* Add / Edit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 w-full max-w-2xl rounded-3xl shadow-xl overflow-hidden animate-in zoom-in duration-200">
            {/* Modal Header */}
            <div className={`px-6 py-5 text-white flex justify-between items-center ${editingId ? 'bg-linear-to-r from-amber-600 to-amber-700' : 'bg-linear-to-r from-slate-900 to-slate-800'}`}>
              <div>
                <h3 className="text-base font-bold">{editingId ? 'Edit Profil & Tracer Alumni' : 'Tambah Alumni Baru'}</h3>
                <p className="text-[10px] text-slate-350 mt-0.5">Lengkapi data profil diri dan kuesioner rencana lulusan sekolah.</p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveForm}>
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-xs">
                {/* Profile Fields */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">A. Data Diri Alumni</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-655 font-bold mb-1">Nama Lengkap *</label>
                      <input 
                        type="text" 
                        value={formState.nama_lengkap}
                        onChange={e => setFormState({...formState, nama_lengkap: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-800 text-xs"
                      />
                      {formErrors.nama_lengkap && <p className="text-red-500 text-[10px] mt-0.5">{formErrors.nama_lengkap}</p>}
                    </div>

                    <div>
                      <label className="block text-slate-655 font-bold mb-1">NISN *</label>
                      <input 
                        type="text" 
                        value={formState.nisn}
                        onChange={e => setFormState({...formState, nisn: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-800 text-xs"
                      />
                      {formErrors.nisn && <p className="text-red-500 text-[10px] mt-0.5">{formErrors.nisn}</p>}
                    </div>

                    <div>
                      <label className="block text-slate-655 font-bold mb-1">Tahun Lulus *</label>
                      <input 
                        type="number" 
                        value={formState.tahun_lulus}
                        onChange={e => setFormState({...formState, tahun_lulus: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-800 text-xs"
                      />
                      {formErrors.tahun_lulus && <p className="text-red-500 text-[10px] mt-0.5">{formErrors.tahun_lulus}</p>}
                    </div>

                    <div>
                      <label className="block text-slate-655 font-bold mb-1">Jurusan / Peminatan</label>
                      <select 
                        value={formState.jurusan}
                        onChange={e => setFormState({...formState, jurusan: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-800 text-xs bg-white cursor-pointer"
                      >
                        <option value="MIPA">MIPA</option>
                        <option value="IPS">IPS</option>
                        <option value="Bahasa">Bahasa</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-655 font-bold mb-1">Nomor HP / WhatsApp</label>
                      <input 
                        type="text" 
                        value={formState.no_telepon}
                        onChange={e => setFormState({...formState, no_telepon: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-800 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-655 font-bold mb-1">Email</label>
                      <input 
                        type="email" 
                        value={formState.email}
                        onChange={e => setFormState({...formState, email: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-800 text-xs"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-slate-655 font-bold mb-1">Alamat Domisili Sekarang</label>
                      <textarea 
                        rows="2"
                        value={formState.alamat_domisili}
                        onChange={e => setFormState({...formState, alamat_domisili: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-850 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-655 font-bold mb-1">Garis Lintang (Latitude)</label>
                      <input 
                        type="text" 
                        placeholder="Contoh: -7.161389"
                        value={formState.latitude}
                        onChange={e => setFormState({...formState, latitude: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-800 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-655 font-bold mb-1">Garis Bujur (Longitude)</label>
                      <input 
                        type="text" 
                        placeholder="Contoh: 113.483056"
                        value={formState.longitude}
                        onChange={e => setFormState({...formState, longitude: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-800 text-xs"
                      />
                    </div>

                    <div className="col-span-2 flex justify-start">
                      <button
                        type="button"
                        onClick={detectGPS}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 text-blue-700 rounded-lg hover:bg-blue-100 transition-all font-bold text-[10px] cursor-pointer"
                      >
                        <i className="bi bi-geo-alt-fill"></i> Dapatkan Koordinat GPS
                      </button>
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Plans Fields */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">B. Rencana Karir / Tracer Study</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-slate-655 font-bold mb-1">Pilihan Rencana Karir Saat Ini</label>
                      <select
                        value={formState.kategori_pilihan}
                        onChange={e => setFormState({...formState, kategori_pilihan: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-800 text-xs bg-white cursor-pointer"
                      >
                        <option value="kuliah">Melanjutkan Kuliah</option>
                        <option value="kerja">Langsung Bekerja</option>
                        <option value="bisnis">Berwirausaha / Bisnis</option>
                        <option value="mencari_kerja">Mencari Kerja</option>
                        <option value="lainnya">Lainnya / Tidak Ditentukan</option>
                      </select>
                    </div>

                    {/* Kategori Kuliah */}
                    {formState.kategori_pilihan === 'kuliah' && (
                      <div className="grid grid-cols-2 gap-4 bg-blue-50/20 p-4 rounded-2xl border border-blue-100/30">
                        <div>
                          <label className="block text-slate-655 font-bold mb-1">Jalur Seleksi</label>
                          <input 
                            type="text" 
                            placeholder="Contoh: SNBP, SNBT, Mandiri"
                            value={formState.jalur_seleksi}
                            onChange={e => setFormState({...formState, jalur_seleksi: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-800 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-655 font-bold mb-1">Status Seleksi</label>
                          <select 
                            value={formState.status_seleksi}
                            onChange={e => setFormState({...formState, status_seleksi: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-800 text-xs bg-white cursor-pointer"
                          >
                            <option value="Lolos">Lolos</option>
                            <option value="Tidak Lolos">Tidak Lolos</option>
                            <option value="Rencana">Rencana / Menunggu Pengumuman</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-slate-655 font-bold mb-1">Universitas Pilihan 1 *</label>
                          <input 
                            type="text" 
                            value={formState.univ_pilihan_1}
                            onChange={e => setFormState({...formState, univ_pilihan_1: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-800 text-xs"
                          />
                          {formErrors.univ_pilihan_1 && <p className="text-red-500 text-[10px] mt-0.5">{formErrors.univ_pilihan_1}</p>}
                        </div>
                        <div>
                          <label className="block text-slate-655 font-bold mb-1">Program Studi Pilihan 1 *</label>
                          <input 
                            type="text" 
                            value={formState.jurusan_pilihan_1}
                            onChange={e => setFormState({...formState, jurusan_pilihan_1: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-800 text-xs"
                          />
                          {formErrors.jurusan_pilihan_1 && <p className="text-red-500 text-[10px] mt-0.5">{formErrors.jurusan_pilihan_1}</p>}
                        </div>
                        <div>
                          <label className="block text-slate-655 font-bold mb-1">Universitas Cadangan (Pilihan 2)</label>
                          <input 
                            type="text" 
                            value={formState.univ_pilihan_2}
                            onChange={e => setFormState({...formState, univ_pilihan_2: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-800 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-655 font-bold mb-1">Program Studi (Pilihan 2)</label>
                          <input 
                            type="text" 
                            value={formState.jurusan_pilihan_2}
                            onChange={e => setFormState({...formState, jurusan_pilihan_2: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-800 text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {/* Kategori Kerja */}
                    {formState.kategori_pilihan === 'kerja' && (
                      <div className="grid grid-cols-2 gap-4 bg-emerald-50/20 p-4 rounded-2xl border border-emerald-100/30">
                        <div>
                          <label className="block text-slate-655 font-bold mb-1">Nama Perusahaan / Instansi *</label>
                          <input 
                            type="text" 
                            value={formState.nama_perusahaan}
                            onChange={e => setFormState({...formState, nama_perusahaan: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-800 text-xs"
                          />
                          {formErrors.nama_perusahaan && <p className="text-red-500 text-[10px] mt-0.5">{formErrors.nama_perusahaan}</p>}
                        </div>
                        <div>
                          <label className="block text-slate-655 font-bold mb-1">Posisi / Jabatan Target *</label>
                          <input 
                            type="text" 
                            value={formState.posisi_pekerjaan}
                            onChange={e => setFormState({...formState, posisi_pekerjaan: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-800 text-xs"
                          />
                          {formErrors.posisi_pekerjaan && <p className="text-red-500 text-[10px] mt-0.5">{formErrors.posisi_pekerjaan}</p>}
                        </div>
                        <div className="col-span-2">
                          <label className="block text-slate-655 font-bold mb-1">Estimasi Rentang Gaji</label>
                          <select 
                            value={formState.estimasi_gaji}
                            onChange={e => setFormState({...formState, estimasi_gaji: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-800 text-xs bg-white cursor-pointer"
                          >
                            <option value="">Pilih Rentang Gaji</option>
                            <option value="< Rp 2 Juta">&lt; Rp 2 Juta</option>
                            <option value="Rp 2 Juta - Rp 5 Juta">Rp 2 Juta - Rp 5 Juta</option>
                            <option value="Rp 5 Juta - Rp 10 Juta">Rp 5 Juta - Rp 10 Juta</option>
                            <option value="> Rp 10 Juta">&gt; Rp 10 Juta</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Kategori Bisnis */}
                    {formState.kategori_pilihan === 'bisnis' && (
                      <div className="grid grid-cols-2 gap-4 bg-amber-50/20 p-4 rounded-2xl border border-amber-100/30">
                        <div>
                          <label className="block text-slate-655 font-bold mb-1">Nama Usaha / Bisnis *</label>
                          <input 
                            type="text" 
                            value={formState.nama_bisnis}
                            onChange={e => setFormState({...formState, nama_bisnis: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-800 text-xs"
                          />
                          {formErrors.nama_bisnis && <p className="text-red-500 text-[10px] mt-0.5">{formErrors.nama_bisnis}</p>}
                        </div>
                        <div>
                          <label className="block text-slate-655 font-bold mb-1">Sektor / Bidang Bisnis *</label>
                          <input 
                            type="text" 
                            value={formState.bidang_bisnis}
                            onChange={e => setFormState({...formState, bidang_bisnis: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-800 text-xs"
                          />
                          {formErrors.bidang_bisnis && <p className="text-red-500 text-[10px] mt-0.5">{formErrors.bidang_bisnis}</p>}
                        </div>
                        <div className="col-span-2">
                          <label className="block text-slate-655 font-bold mb-1">Estimasi Modal Awal</label>
                          <select 
                            value={formState.modal_awal}
                            onChange={e => setFormState({...formState, modal_awal: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-slate-800 text-xs bg-white cursor-pointer"
                          >
                            <option value="">Pilih Estimasi Modal</option>
                            <option value="< Rp 5 Juta">&lt; Rp 5 Juta</option>
                            <option value="Rp 5 Juta - Rp 15 Juta">Rp 5 Juta - Rp 15 Juta</option>
                            <option value="Rp 15 Juta - Rp 50 Juta">Rp 15 Juta - Rp 50 Juta</option>
                            <option value="> Rp 50 Juta">&gt; Rp 50 Juta</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Footer */}
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl transition-all cursor-pointer text-[11px]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingForm}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all cursor-pointer text-[11px]"
                >
                  {isSavingForm ? 'Menyimpan...' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlumniList;
