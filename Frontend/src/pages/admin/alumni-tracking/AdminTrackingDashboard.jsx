import React, { useState, useEffect, useMemo } from 'react';
// Authentication context removed for mock phase as requested

// MOCK DATA CONTRACT
const mockAlumniData = [
  {
    id: 1,
    nama: "Andi Saputra",
    nis: "19201001",
    kelas_asal: "12-IPA-1",
    tahun_lulus: "2024",
    status_pengisian: "Lengkap",
    pilihan_1: { universitas: "Universitas Gadjah Mada", jurusan: "Kedokteran" },
    pilihan_2: { universitas: "Universitas Airlangga", jurusan: "Farmasi" },
    nilai_rapor: { semester_1: 85, semester_2: 87, semester_3: 88, semester_4: 90, semester_5: 91 }
  },
  {
    id: 2,
    nama: "Budi Santoso",
    nis: "19201002",
    kelas_asal: "12-IPS-2",
    tahun_lulus: "2024",
    status_pengisian: "Pending",
    pilihan_1: { universitas: "Universitas Indonesia", jurusan: "Ilmu Hukum" },
    pilihan_2: { universitas: "Universitas Padjadjaran", jurusan: "Hubungan Internasional" },
    nilai_rapor: { semester_1: 80, semester_2: 82, semester_3: 81, semester_4: 85, semester_5: 86 }
  },
  {
    id: 3,
    nama: "Citra Lestari",
    nis: "19201003",
    kelas_asal: "12-IPA-2",
    tahun_lulus: "2024",
    status_pengisian: "Lengkap",
    pilihan_1: { universitas: "Institut Teknologi Bandung", jurusan: "Teknik Informatika" },
    pilihan_2: { universitas: "Institut Teknologi Sepuluh Nopember", jurusan: "Sistem Informasi" },
    nilai_rapor: { semester_1: 90, semester_2: 92, semester_3: 91, semester_4: 94, semester_5: 95 }
  },
  {
    id: 4,
    nama: "Dewi Kartika",
    nis: "19201004",
    kelas_asal: "12-IPS-1",
    tahun_lulus: "2023",
    status_pengisian: "Lengkap",
    pilihan_1: { universitas: "Universitas Gadjah Mada", jurusan: "Psikologi" },
    pilihan_2: { universitas: "Universitas Brawijaya", jurusan: "Ilmu Komunikasi" },
    nilai_rapor: { semester_1: 88, semester_2: 89, semester_3: 90, semester_4: 91, semester_5: 92 }
  },
  {
    id: 5,
    nama: "Eko Prasetyo",
    nis: "19201005",
    kelas_asal: "12-IPA-3",
    tahun_lulus: "2024",
    status_pengisian: "Pending",
    pilihan_1: { universitas: "", jurusan: "" },
    pilihan_2: { universitas: "", jurusan: "" },
    nilai_rapor: { semester_1: 75, semester_2: 78, semester_3: 79, semester_4: 80, semester_5: 81 }
  },
  {
    id: 6,
    nama: "Fani Rahmawati",
    nis: "19201006",
    kelas_asal: "12-IPA-1",
    tahun_lulus: "2024",
    status_pengisian: "Lengkap",
    pilihan_1: { universitas: "Universitas Airlangga", jurusan: "Kedokteran Gigi" },
    pilihan_2: { universitas: "Universitas Gadjah Mada", jurusan: "Biologi" },
    nilai_rapor: { semester_1: 89, semester_2: 90, semester_3: 88, semester_4: 92, semester_5: 93 }
  },
  {
    id: 7,
    nama: "Gilang Dirga",
    nis: "19201007",
    kelas_asal: "12-IPS-2",
    tahun_lulus: "2023",
    status_pengisian: "Lengkap",
    pilihan_1: { universitas: "Universitas Indonesia", jurusan: "Manajemen" },
    pilihan_2: { universitas: "Universitas Diponegoro", jurusan: "Akuntansi" },
    nilai_rapor: { semester_1: 82, semester_2: 84, semester_3: 85, semester_4: 88, semester_5: 89 }
  }
];

const AdminTrackingDashboard = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTahun, setFilterTahun] = useState('');
  const [filterUniv, setFilterUniv] = useState('');

  // Modal State
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchTrackingData();
  }, []);

  const fetchTrackingData = async () => {
    setIsLoading(true);
    
    // TEMPORARY BYPASS: Using Mock Data
    setTimeout(() => {
      setData(mockAlumniData);
      setIsLoading(false);
    }, 600);
  };

  // Extract unique values for dropdowns
  const uniqueTahun = [...new Set(data.map(item => item.tahun_lulus))].filter(Boolean).sort().reverse();
  const uniqueUniv = [...new Set(data.map(item => item.pilihan_1?.universitas))].filter(Boolean).sort();

  // Apply filters
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch = item.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.nis.includes(searchQuery);
      const matchTahun = filterTahun === '' || item.tahun_lulus === filterTahun;
      const matchUniv = filterUniv === '' || item.pilihan_1?.universitas === filterUniv;
      
      return matchSearch && matchTahun && matchUniv;
    });
  }, [data, searchQuery, filterTahun, filterUniv]);

  // Analytics Calculations
  const totalData = filteredData.length;
  const sudahMengisi = filteredData.filter(item => item.status_pengisian === 'Lengkap').length;
  const persentase = totalData > 0 ? ((sudahMengisi / totalData) * 100).toFixed(1) : 0;

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredData.length === 0) return;

    const headers = [
      'ID', 'Nama', 'NIS', 'Kelas Asal', 'Tahun Lulus', 'Status Pengisian',
      'Univ Pilihan 1', 'Jurusan 1', 'Univ Pilihan 2', 'Jurusan 2',
      'Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5'
    ];

    const rows = filteredData.map(item => [
      item.id,
      `"${item.nama}"`,
      `"${item.nis}"`,
      `"${item.kelas_asal}"`,
      `"${item.tahun_lulus}"`,
      `"${item.status_pengisian}"`,
      `"${item.pilihan_1?.universitas || ''}"`,
      `"${item.pilihan_1?.jurusan || ''}"`,
      `"${item.pilihan_2?.universitas || ''}"`,
      `"${item.pilihan_2?.jurusan || ''}"`,
      item.nilai_rapor?.semester_1 || '',
      item.nilai_rapor?.semester_2 || '',
      item.nilai_rapor?.semester_3 || '',
      item.nilai_rapor?.semester_4 || '',
      item.nilai_rapor?.semester_5 || ''
    ]);

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
            Monitor progres dan data rencana karir siswa.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportCSV}
            disabled={filteredData.length === 0}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm py-2 px-4 rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
             <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Data</p>
             <p className="text-3xl font-bold text-slate-900">{totalData}</p>
           </div>
           <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
             <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
           </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
             <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Sudah Mengisi</p>
             <p className="text-3xl font-bold text-emerald-600">{sudahMengisi}</p>
           </div>
           <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
             <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
           </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
             <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Persentase Selesai</p>
             <p className="text-3xl font-bold text-amber-500">{persentase}%</p>
           </div>
           <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
             <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
           </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="mb-6 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Pencarian Siswa</label>
          <div className="relative border border-slate-200 rounded-xl bg-white flex items-center px-3 shadow-sm focus-within:ring-2 focus-within:ring-slate-100 focus-within:border-slate-300 transition-all">
             <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
             <input 
               type="text" 
               placeholder="Cari Nama atau NIS..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full py-2.5 px-3 outline-none text-sm text-slate-800 placeholder-slate-400 bg-transparent"
             />
          </div>
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
        <div className="w-full lg:w-64">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Universitas Target 1</label>
          <select 
            value={filterUniv}
            onChange={(e) => setFilterUniv(e.target.value)}
            className="w-full py-2.5 px-3 border border-slate-200 rounded-xl bg-white text-sm shadow-sm outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-300 transition-all cursor-pointer"
          >
            <option value="">Semua Universitas</option>
            {uniqueUniv.map(univ => (
              <option key={univ} value={univ}>{univ}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full relative">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 border border-slate-100 rounded-2xl bg-slate-50/50">
            <svg className="animate-spin w-8 h-8 text-slate-400 mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-sm font-medium text-slate-500">Memuat Data...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-slate-100 rounded-2xl bg-slate-50/50">
            <svg className="w-12 h-12 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-base font-semibold text-slate-600 mb-1">Tidak Ada Data</p>
            <p className="text-sm text-slate-500">Data tidak ditemukan dengan filter saat ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider w-16 text-center">No</th>
                  <th className="px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider">Nama & NIS</th>
                  <th className="px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider w-32">Kelas</th>
                  <th className="px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider">Universitas Target 1</th>
                  <th className="px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider w-32">Status</th>
                  <th className="px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider w-24 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => {
                  const isComplete = item.status_pengisian === 'Lengkap';
                  return (
                    <tr 
                      key={item.id} 
                      className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0 bg-white"
                    >
                      <td className="px-5 py-4 text-center text-sm font-medium text-slate-500">
                        {index + 1}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-sm text-slate-900">{item.nama}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{item.nis}</p>
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-slate-700">
                        {item.kelas_asal}
                      </td>
                      <td className="px-5 py-4">
                         {item.pilihan_1?.universitas ? (
                           <>
                             <p className="font-medium text-sm text-slate-800">{item.pilihan_1.universitas}</p>
                             <p className="text-xs text-slate-500 mt-0.5">{item.pilihan_1.jurusan}</p>
                           </>
                         ) : (
                           <span className="text-slate-400 text-sm italic">Belum dipilih</span>
                         )}
                      </td>
                      <td className="px-5 py-4">
                        {isComplete ? (
                          <span className="inline-flex items-center px-2.5 py-1 font-medium text-[11px] uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                            Lengkap
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 font-medium text-[11px] uppercase tracking-wide bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button 
                          onClick={() => setSelectedStudent(item)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Lihat Detail"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-white">
               <div>
                 <h2 className="text-lg font-bold text-slate-900">Detail Penelusuran</h2>
                 <p className="text-sm text-slate-500 mt-1">{selectedStudent.nama} • {selectedStudent.nis}</p>
               </div>
               <button 
                 onClick={() => setSelectedStudent(null)}
                 className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-xl transition-colors"
               >
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto bg-slate-50/50 flex flex-col gap-6">
               
               {/* Section: Nilai Rapor */}
               <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Nilai Rata-rata Rapor
                  </h3>
                  <div className="grid grid-cols-5 gap-3">
                    {[1,2,3,4,5].map(sem => (
                      <div key={sem} className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Sem {sem}</p>
                        <p className="text-lg font-bold text-slate-900">{selectedStudent.nilai_rapor?.[`semester_${sem}`] || '-'}</p>
                      </div>
                    ))}
                  </div>
               </div>

               {/* Section: Rencana Karir */}
               <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                 <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    Target Pendidikan
                 </h3>
                 <div className="flex flex-col gap-4">
                   {/* Target 1 */}
                   <div className="flex-1 bg-slate-50 rounded-xl border border-slate-100 p-4">
                     <p className="text-xs font-semibold uppercase text-slate-500 mb-2">Pilihan 1 (Utama)</p>
                     {selectedStudent.pilihan_1?.universitas ? (
                        <>
                          <p className="font-semibold text-slate-900 text-base">{selectedStudent.pilihan_1.universitas}</p>
                          <p className="text-sm text-slate-600 mt-0.5">{selectedStudent.pilihan_1.jurusan}</p>
                        </>
                     ) : (
                        <p className="text-sm text-slate-400 italic">Belum diisi</p>
                     )}
                   </div>
                   {/* Target 2 */}
                   <div className="flex-1 bg-slate-50 rounded-xl border border-slate-100 p-4">
                     <p className="text-xs font-semibold uppercase text-slate-500 mb-2">Pilihan 2 (Opsional)</p>
                     {selectedStudent.pilihan_2?.universitas ? (
                        <>
                          <p className="font-semibold text-slate-900 text-base">{selectedStudent.pilihan_2.universitas}</p>
                          <p className="text-sm text-slate-600 mt-0.5">{selectedStudent.pilihan_2.jurusan}</p>
                        </>
                     ) : (
                        <p className="text-sm text-slate-400 italic">Belum diisi</p>
                     )}
                   </div>
                 </div>
               </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminTrackingDashboard;
