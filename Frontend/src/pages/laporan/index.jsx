import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

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
  const [showCharts, setShowCharts] = useState(true);

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

  // --- Chart Data Aggregations ---
  const pendaftaranChartData = useMemo(() => {
    if (reportType !== 'pendaftaran' || data.length === 0) return null;
    
    const statusCounts = { pending: 0, diterima: 0, ditolak: 0 };
    const jalurCounts = {};
    const tahunCounts = {};

    data.forEach(item => {
      if (item.status) statusCounts[item.status]++;
      if (item.jalur) {
        jalurCounts[item.jalur] = (jalurCounts[item.jalur] || 0) + 1;
      }
      if (item.created_at) {
        const year = new Date(item.created_at).getFullYear();
        tahunCounts[year] = (tahunCounts[year] || 0) + 1;
      }
    });

    const statusData = [
      { name: 'Diterima', value: statusCounts.diterima, color: '#10b981' }, 
      { name: 'Menunggu', value: statusCounts.pending, color: '#f59e0b' },
      { name: 'Ditolak', value: statusCounts.ditolak, color: '#ef4444' },
    ].filter(d => d.value > 0);

    const jalurData = Object.keys(jalurCounts).map(key => ({
      name: key.replace('_', ' ').toUpperCase(),
      Jumlah: jalurCounts[key]
    })).sort((a, b) => b.Jumlah - a.Jumlah);

    const trenData = Object.keys(tahunCounts).sort().map(year => ({
      name: year,
      Jumlah: tahunCounts[year]
    }));

    return { statusData, jalurData, trenData };
  }, [data, reportType]);

  const siswaChartData = useMemo(() => {
    if (reportType !== 'siswa' || data.length === 0) return null;

    let aktifCount = 0;
    let nonAktifCount = 0;
    const tahunMasukCounts = {};

    data.forEach(item => {
      if (item.is_active) aktifCount++;
      else nonAktifCount++;

      if (item.tahun_masuk) {
        tahunMasukCounts[item.tahun_masuk] = (tahunMasukCounts[item.tahun_masuk] || 0) + 1;
      }
    });

    const statusData = [
      { name: 'Aktif', value: aktifCount, color: '#10b981' },
      { name: 'Tidak Aktif', value: nonAktifCount, color: '#ef4444' },
    ].filter(d => d.value > 0);

    const tahunData = Object.keys(tahunMasukCounts)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(key => ({
        name: key,
        Jumlah: tahunMasukCounts[key]
      }));

    return { statusData, tahunData };
  }, [data, reportType]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-100 text-sm">
          <p className="font-bold text-slate-700">{label || payload[0].name}</p>
          <p className="text-blue-600 font-semibold mt-1">Total: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 text-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 relative overflow-hidden animate-fade-up">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-[#1e293b]">Laporan & Statistik</h2>
            <p className="text-slate-500 text-sm max-w-xl">
              Lihat, analisis, dan unduh laporan data Pendaftaran serta Siswa.
            </p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setReportType('pendaftaran')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                reportType === 'pendaftaran' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Pendaftaran
            </button>
            <button
              onClick={() => setReportType('siswa')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                reportType === 'siswa' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Siswa
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
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-600"
              />
            </div>
            <div className="w-full sm:w-auto">
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Tanggal Selesai</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-600"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                type="submit"
                className="flex-1 sm:flex-none px-5 py-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
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
              onClick={() => setShowCharts(!showCharts)}
              className={`flex-1 md:flex-none px-4 py-2 border rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                showCharts ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              {showCharts ? 'Sembunyikan Grafik' : 'Tampilkan Grafik'}
            </button>
            <button 
              onClick={() => handleExport('excel')}
              disabled={isExporting || data.length === 0}
              className="flex-1 md:flex-none px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      {showCharts && !isLoading && !error && data.length > 0 && (
        <div className="space-y-6 animate-fade-up delay-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart 1: Pie Chart (Status) */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col">
              <h3 className="text-[15px] font-bold text-slate-800 mb-6 text-center">
                Statistik Status {reportType === 'pendaftaran' ? 'Pendaftaran' : 'Siswa Aktif'}
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={reportType === 'pendaftaran' ? pendaftaranChartData?.statusData : siswaChartData?.statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {(reportType === 'pendaftaran' ? pendaftaranChartData?.statusData : siswaChartData?.statusData)?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Bar Chart (Jalur / Tahun) */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col">
              <h3 className="text-[15px] font-bold text-slate-800 mb-6 text-center">
                {reportType === 'pendaftaran' ? 'Distribusi Jalur Pendaftaran' : 'Jumlah Siswa per Tahun Masuk'}
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={reportType === 'pendaftaran' ? pendaftaranChartData?.jalurData : siswaChartData?.tahunData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }} 
                    />
                    <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                    <Bar 
                      dataKey="Jumlah" 
                      fill="#3b82f6" 
                      radius={[6, 6, 0, 0]} 
                      maxBarSize={60}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Chart 3: Trends (Only for Pendaftaran) */}
          {reportType === 'pendaftaran' && pendaftaranChartData?.trenData && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col">
              <h3 className="text-[15px] font-bold text-slate-800 mb-6 text-center">
                Tren Pendaftar per Tahun
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={pendaftaranChartData.trenData}
                    margin={{ top: 10, right: 30, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }} 
                    />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="Jumlah" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] animate-fade-up delay-150">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[16px] font-bold text-[#1e293b]">
            Tabel Data {reportType === 'pendaftaran' ? 'Pendaftaran' : 'Siswa'}
          </h3>
          <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
            Total: {data.length} baris
          </span>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
              <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
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
                    <th className="pb-3">Tgl Dibuat</th>
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
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                              item.jalur === 'zonasi' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                              item.jalur === 'afirmasi' ? 'bg-purple-50 text-purple-600 border-purple-100' : 
                              item.jalur === 'prestasi' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                              'bg-slate-50 text-slate-600 border-slate-100'
                            }`}>
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
                            item.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
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
