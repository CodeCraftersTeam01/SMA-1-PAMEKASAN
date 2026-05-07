import React, { useState, useEffect } from 'react';

// Simple Toast notification component
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

const Laporan = () => {
  const [reportType, setReportType] = useState('pendaftaran'); // 'pendaftaran' or 'siswa'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const fetchReportData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let url = `${API_BASE_URL}/api/reports/${reportType}?format=json`;
      if (startDate && endDate) {
        url += `&start_date=${startDate}&end_date=${endDate}`;
      }

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const responseData = await response.json();

      if (response.ok) {
        setData(Array.isArray(responseData) ? responseData : (responseData.data || []));
      } else {
        if (response.status === 404) {
          setData([]);
        } else {
          setError(responseData.message || 'Gagal mengambil data laporan');
        }
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi saat memuat laporan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [reportType]); // Refetch when type changes

  const handleFilter = (e) => {
    e.preventDefault();
    if ((startDate && !endDate) || (!startDate && endDate)) {
      showToast('Harap isi kedua tanggal (Mulai & Selesai) untuk filter rentang waktu', 'error');
      return;
    }
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      showToast('Tanggal mulai tidak boleh lebih dari tanggal selesai', 'error');
      return;
    }
    fetchReportData();
  };

  const handleResetFilter = () => {
    setStartDate('');
    setEndDate('');
    // setTimeout to allow state to update before fetch if we don't rely on dependency array for dates
    setTimeout(() => {
        fetchReportData();
    }, 0);
  };

  const handleExport = async (format) => {
    setIsExporting(true);
    try {
      let url = `${API_BASE_URL}/api/reports/${reportType}?format=${format}`;
      if (startDate && endDate) {
        url += `&start_date=${startDate}&end_date=${endDate}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Gagal mengekspor laporan');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      
      const ext = format === 'csv' ? 'csv' : 'xls';
      a.download = `laporan_${reportType}_${new Date().getTime()}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
      
      showToast(`Laporan berhasil diekspor ke ${format.toUpperCase()}`, 'success');
    } catch (err) {
      showToast('Terjadi kesalahan saat mengekspor laporan', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'diterima': return 'bg-emerald-50 text-emerald-500 border-emerald-100';
      case 'ditolak': return 'bg-red-50 text-red-500 border-red-100';
      case 'pending': return 'bg-amber-50 text-amber-500 border-amber-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'diterima': return 'Diterima';
      case 'ditolak': return 'Ditolak';
      case 'pending': return 'Menunggu';
      default: return 'Menunggu';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 text-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 relative overflow-hidden animate-fade-up">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-800"></div>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-[#1e293b]">Laporan Data</h2>
            <p className="text-slate-500 text-sm max-w-xl">
              Lihat dan unduh laporan data Pendaftaran dan Siswa SMAN 1 Pamekasan.
            </p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setReportType('pendaftaran')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                reportType === 'pendaftaran' 
                  ? 'bg-white text-slate-800 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Laporan Pendaftaran
            </button>
            <button
              onClick={() => setReportType('siswa')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                reportType === 'siswa' 
                  ? 'bg-white text-slate-800 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Laporan Siswa
            </button>
          </div>
        </div>
      </div>

      {/* Filter Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] animate-fade-up delay-75">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <form onSubmit={handleFilter} className="flex flex-col sm:flex-row items-end gap-3 w-full md:w-auto">
            <div className="w-full sm:w-auto">
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Tanggal Mulai</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all text-sm text-slate-600"
              />
            </div>
            <div className="w-full sm:w-auto">
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Tanggal Selesai</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all text-sm text-slate-600"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                type="submit"
                className="flex-1 sm:flex-none px-5 py-2 rounded-xl text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 shadow-md shadow-slate-900/20 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter
              </button>
              {(startDate || endDate) && (
                <button 
                  type="button"
                  onClick={handleResetFilter}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
                >
                  Reset
                </button>
              )}
            </div>
          </form>

          <div className="flex gap-2 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
            <button 
              onClick={() => handleExport('csv')}
              disabled={isExporting || data.length === 0}
              className="flex-1 md:flex-none px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
            <button 
              onClick={() => handleExport('excel')}
              className="flex-1 md:flex-none px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-900 transition-all shadow-md shadow-slate-900/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] animate-fade-up delay-150">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[16px] font-bold text-[#1e293b]">
            Hasil Laporan {reportType === 'pendaftaran' ? 'Pendaftaran' : 'Siswa'}
          </h3>
          <span className="text-xs font-bold px-3 py-1 bg-slate-50 text-slate-800 rounded-full">
            Total: {data.length} data
          </span>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
              <div className="w-10 h-10 border-4 border-slate-100 border-t-slate-800 rounded-full animate-spin"></div>
              <p className="text-sm font-medium">Memuat data laporan...</p>
            </div>
          ) : error ? (
            <div className="py-20 text-center text-red-500">
              <p>{error}</p>
              <button onClick={fetchReportData} className="mt-2 text-blue-500 underline text-sm">Coba lagi</button>
            </div>
          ) : (
            <table className="w-full text-left responsive border-collapse">
              <thead>
                {reportType === 'pendaftaran' ? (
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 pl-2">No. Pendaftaran</th>
                    <th className="pb-3">NISN</th>
                    <th className="pb-3">Nama Lengkap</th>
                    <th className="pb-3">Asal Sekolah</th>
                    <th className="pb-3">Jalur</th>
                    <th className="pb-3">Tanggal Daftar</th>
                    <th className="pb-3">Status</th>
                  </tr>
                ) : (
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 pl-2">NIS</th>
                    <th className="pb-3">Nama Lengkap</th>
                    <th className="pb-3">Tahun Masuk</th>
                    <th className="pb-3">Tahun Ajaran</th>
                    <th className="pb-3">Status Aktif</th>
                    <th className="pb-3">Tanggal Data Dibuat</th>
                  </tr>
                )}
              </thead>
              <tbody className="text-[13px] text-slate-600">
                {data.map((item, index) => (
                  <tr key={item.id || index} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    {reportType === 'pendaftaran' ? (
                      <>
                        <td className="py-4 pl-2 font-medium text-slate-400">{item.no_pendaftaran || '-'}</td>
                        <td className="py-4 text-slate-600">{item.nisn || '-'}</td>
                        <td className="py-4 font-bold text-slate-700">{item.nama_lengkap}</td>
                        <td className="py-4">{item.asal_sekolah}</td>
                        <td className="py-4">
                          {item.jalur ? (
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border bg-slate-50 text-slate-600 border-slate-100`}>
                              {item.jalur.replace('_', ' ')}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="py-4 text-slate-500">{new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                        <td className="py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(item.status || 'pending')}`}>
                            {getStatusText(item.status || 'pending')}
                          </span>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-4 pl-2 font-medium text-slate-600">{item.nis || '-'}</td>
                        <td className="py-4 font-bold text-slate-700">{item.nama_lengkap}</td>
                        <td className="py-4 text-slate-600">{item.tahun_masuk}</td>
                        <td className="py-4 text-slate-600">{item.tahun_ajaran?.tahun || '-'}</td>
                        <td className="py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                            item.is_active ? 'bg-slate-800 text-white border-slate-800' : 'bg-red-50 text-red-600 border-red-100'
                          }`}>
                            {item.is_active ? 'Aktif' : 'Tidak Aktif'}
                          </span>
                        </td>
                        <td className="py-4 text-slate-500">{new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                      </>
                    )}
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={reportType === 'pendaftaran' ? "7" : "6"} className="py-12 text-center text-slate-400">
                      <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p>Tidak ada data laporan untuk ditampilkan.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Laporan;
