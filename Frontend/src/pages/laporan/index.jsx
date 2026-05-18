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

// ── SVG Stacked Bar Chart for Registration trends ──────────────────────────────
const BarChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-slate-400 text-sm py-12">Belum ada data visualisasi tren.</div>
    );
  }

  const maxVal = Math.max(...data.map(d => d.total), 1);
  const chartHeight = 160;
  const chartWidth = 500;
  const padding = 40;
  
  const barWidth = Math.min(45, (chartWidth - padding * 2) / data.length - 15);
  const gap = ((chartWidth - padding * 2) - (barWidth * data.length)) / (data.length + 1);

  return (
    <svg viewBox={`0 0 ${chartWidth} ${chartHeight + padding * 2}`} className="w-full h-auto max-h-[220px]">
      {/* Grid Lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
        const y = padding + chartHeight * (1 - ratio);
        const val = Math.round(maxVal * ratio);
        return (
          <g key={idx}>
            <line x1={padding} y1={y} x2={chartWidth - padding} y2={y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />
            <text x={padding - 10} y={y + 4} fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="end">{val}</text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, idx) => {
        const x = padding + gap + idx * (barWidth + gap);
        
        // Stacked heights
        const yDiterima = (d.diterima / maxVal) * chartHeight;
        const yDitolak = (d.ditolak / maxVal) * chartHeight;
        const yPending = (d.pending / maxVal) * chartHeight;

        let currentY = padding + chartHeight;

        return (
          <g key={idx} className="group cursor-pointer">
            {/* Accepted (Diterima) Bar */}
            {yDiterima > 0 && (
              <rect
                x={x}
                y={currentY - yDiterima}
                width={barWidth}
                height={yDiterima}
                fill="#10b981"
                rx="4"
                className="transition-all duration-300 hover:opacity-90"
              />
            )}
            {/* Rejected (Ditolak) Bar */}
            {yDitolak > 0 && (
              <rect
                x={x}
                y={currentY - yDiterima - yDitolak}
                width={barWidth}
                height={yDitolak}
                fill="#ef4444"
                rx="4"
                className="transition-all duration-300 hover:opacity-90"
              />
            )}
            {/* Pending Bar */}
            {yPending > 0 && (
              <rect
                x={x}
                y={currentY - yDiterima - yDitolak - yPending}
                width={barWidth}
                height={yPending}
                fill="#f59e0b"
                rx="4"
                className="transition-all duration-300 hover:opacity-90"
              />
            )}

            {/* Label for year */}
            <text
              x={x + barWidth / 2}
              y={padding + chartHeight + 20}
              fill="#475569"
              fontSize="11"
              fontWeight="bold"
              textAnchor="middle"
            >
              {d.year}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// ── SVG Stacked Bar Chart for Student trends ───────────────────────────────
const SiswaBarChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-slate-400 text-sm py-12">Belum ada data visualisasi tren.</div>
    );
  }

  const maxVal = Math.max(...data.map(d => d.total), 1);
  const chartHeight = 160;
  const chartWidth = 500;
  const padding = 40;
  
  const barWidth = Math.min(45, (chartWidth - padding * 2) / data.length - 15);
  const gap = ((chartWidth - padding * 2) - (barWidth * data.length)) / (data.length + 1);

  return (
    <svg viewBox={`0 0 ${chartWidth} ${chartHeight + padding * 2}`} className="w-full h-auto max-h-[220px]">
      {/* Grid Lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
        const y = padding + chartHeight * (1 - ratio);
        const val = Math.round(maxVal * ratio);
        return (
          <g key={idx}>
            <line x1={padding} y1={y} x2={chartWidth - padding} y2={y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />
            <text x={padding - 10} y={y + 4} fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="end">{val}</text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, idx) => {
        const x = padding + gap + idx * (barWidth + gap);
        
        const yAktif = (d.aktif / maxVal) * chartHeight;
        const yTidakAktif = (d.tidakAktif / maxVal) * chartHeight;

        let currentY = padding + chartHeight;

        return (
          <g key={idx} className="group cursor-pointer">
            {/* Active (Aktif) Bar */}
            {yAktif > 0 && (
              <rect
                x={x}
                y={currentY - yAktif}
                width={barWidth}
                height={yAktif}
                fill="#1e293b"
                rx="4"
                className="transition-all duration-300 hover:opacity-90"
              />
            )}
            {/* Inactive Bar */}
            {yTidakAktif > 0 && (
              <rect
                x={x}
                y={currentY - yAktif - yTidakAktif}
                width={barWidth}
                height={yTidakAktif}
                fill="#ef4444"
                rx="4"
                className="transition-all duration-300 hover:opacity-90"
              />
            )}

            {/* Label for year */}
            <text
              x={x + barWidth / 2}
              y={padding + chartHeight + 20}
              fill="#475569"
              fontSize="11"
              fontWeight="bold"
              textAnchor="middle"
            >
              {d.year}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// ── SVG Donut Chart for Registration Status ────────────────────────────────────
const DonutChart = ({ diterima, ditolak, pending }) => {
  const total = diterima + ditolak + pending;
  if (total === 0) return null;

  const pDiterima = (diterima / total) * 100;
  const pDitolak = (ditolak / total) * 100;
  const pPending = (pending / total) * 100;

  const radius = 38;
  const circumference = 2 * Math.PI * radius;

  const offsetDiterima = circumference - (pDiterima / 100) * circumference;
  const offsetDitolak = circumference - (pDitolak / 100) * circumference;
  const offsetPending = circumference - (pPending / 100) * circumference;

  const rotDiterima = 0;
  const rotDitolak = (pDiterima / 100) * 360;
  const rotPending = ((pDiterima + pDitolak) / 100) * 360;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 justify-center w-full">
      <div className="relative w-28 h-28 shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#f8fafc" strokeWidth="10" />
          
          {/* Diterima segment */}
          {pDiterima > 0 && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#10b981"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={offsetDiterima}
              transform={`rotate(${rotDiterima} 50 50)`}
              className="transition-all duration-500"
            />
          )}
          
          {/* Ditolak segment */}
          {pDitolak > 0 && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#ef4444"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={offsetDitolak}
              transform={`rotate(${rotDitolak} 50 50)`}
              className="transition-all duration-500"
            />
          )}

          {/* Pending segment */}
          {pPending > 0 && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#f59e0b"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={offsetPending}
              transform={`rotate(${rotPending} 50 50)`}
              className="transition-all duration-500"
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-black text-slate-800">{total}</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
        </div>
      </div>
      
      {/* Legend list */}
      <div className="flex flex-col gap-2 w-full sm:w-auto">
        <div className="flex items-center justify-between sm:justify-start gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0"></span>
            <span className="text-xs font-semibold text-slate-600">Diterima</span>
          </div>
          <span className="text-xs font-bold text-slate-800 ml-auto">{diterima} ({Math.round(pDiterima)}%)</span>
        </div>
        <div className="flex items-center justify-between sm:justify-start gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 shrink-0"></span>
            <span className="text-xs font-semibold text-slate-600">Ditolak</span>
          </div>
          <span className="text-xs font-bold text-slate-800 ml-auto">{ditolak} ({Math.round(pDitolak)}%)</span>
        </div>
        <div className="flex items-center justify-between sm:justify-start gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0"></span>
            <span className="text-xs font-semibold text-slate-600">Menunggu</span>
          </div>
          <span className="text-xs font-bold text-slate-800 ml-auto">{pending} ({Math.round(pPending)}%)</span>
        </div>
      </div>
    </div>
  );
};

// ── SVG Donut Chart for Student Status ────────────────────────────────────
const SiswaDonutChart = ({ aktif, tidakAktif }) => {
  const total = aktif + tidakAktif;
  if (total === 0) return null;

  const pAktif = (aktif / total) * 100;
  const pTidakAktif = (tidakAktif / total) * 100;

  const radius = 38;
  const circumference = 2 * Math.PI * radius;

  const offsetAktif = circumference - (pAktif / 100) * circumference;
  const offsetTidakAktif = circumference - (pTidakAktif / 100) * circumference;

  const rotAktif = 0;
  const rotTidakAktif = (pAktif / 100) * 360;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 justify-center w-full">
      <div className="relative w-28 h-28 shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#f8fafc" strokeWidth="10" />
          
          {/* Active segment */}
          {pAktif > 0 && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#1e293b"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={offsetAktif}
              transform={`rotate(${rotAktif} 50 50)`}
              className="transition-all duration-500"
            />
          )}
          
          {/* Inactive segment */}
          {pTidakAktif > 0 && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#ef4444"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={offsetTidakAktif}
              transform={`rotate(${rotTidakAktif} 50 50)`}
              className="transition-all duration-500"
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-black text-slate-800">{total}</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
        </div>
      </div>
      
      {/* Legend list */}
      <div className="flex flex-col gap-2 w-full sm:w-auto">
        <div className="flex items-center justify-between sm:justify-start gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-800 shrink-0"></span>
            <span className="text-xs font-semibold text-slate-600">Aktif</span>
          </div>
          <span className="text-xs font-bold text-slate-800 ml-auto">{aktif} ({Math.round(pAktif)}%)</span>
        </div>
        <div className="flex items-center justify-between sm:justify-start gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 shrink-0"></span>
            <span className="text-xs font-semibold text-slate-600">Tidak Aktif</span>
          </div>
          <span className="text-xs font-bold text-slate-800 ml-auto">{tidakAktif} ({Math.round(pTidakAktif)}%)</span>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
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
    setTimeout(() => {
        fetchReportData();
    }, 0);
  };

  // ── Stat Aggregation Helpers ──────────────────────────────────────────────
  const getPendaftaranStats = () => {
    const stats = {};
    let totalDiterima = 0;
    let totalDitolak = 0;
    let totalPending = 0;

    data.forEach(item => {
      const year = new Date(item.created_at).getFullYear();
      if (!stats[year]) {
        stats[year] = { year, total: 0, diterima: 0, ditolak: 0, pending: 0 };
      }
      stats[year].total++;
      if (item.status === 'diterima') {
        stats[year].diterima++;
        totalDiterima++;
      } else if (item.status === 'ditolak') {
        stats[year].ditolak++;
        totalDitolak++;
      } else {
        stats[year].pending++;
        totalPending++;
      }
    });

    const yearData = Object.values(stats).sort((a, b) => a.year - b.year);
    return { yearData, totalDiterima, totalDitolak, totalPending };
  };

  const getSiswaStats = () => {
    const stats = {};
    let totalAktif = 0;
    let totalTidakAktif = 0;

    data.forEach(item => {
      const year = item.tahun_masuk || new Date(item.created_at).getFullYear();
      if (!stats[year]) {
        stats[year] = { year, total: 0, aktif: 0, tidakAktif: 0 };
      }
      stats[year].total++;
      if (item.is_active) {
        stats[year].aktif++;
        totalAktif++;
      } else {
        stats[year].tidakAktif++;
        totalTidakAktif++;
      }
    });

    const yearData = Object.values(stats).sort((a, b) => a.year - b.year);
    return { yearData, totalAktif, totalTidakAktif };
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
              disabled={isExporting || data.length === 0}
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

      {/* Dashboard Statistics & Visualizations */}
      {!isLoading && !error && data.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-up">
          {/* Metrics summary cards */}
          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
            {reportType === 'pendaftaran' ? (
              <>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Total Pendaftar</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-black text-slate-800">{data.length}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Siswa</span>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                  <span className="text-[10px] font-extrabold text-emerald-500 uppercase tracking-widest">Diterima</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-black text-emerald-500">{getPendaftaranStats().totalDiterima}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Siswa</span>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                  <span className="text-[10px] font-extrabold text-red-500 uppercase tracking-widest">Ditolak</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-black text-red-500">{getPendaftaranStats().totalDitolak}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Siswa</span>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                  <span className="text-[10px] font-extrabold text-amber-500 uppercase tracking-widest">Menunggu</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-black text-amber-500">{getPendaftaranStats().totalPending}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Siswa</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Total Siswa</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-black text-slate-800">{data.length}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Siswa</span>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between col-span-2">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Status Keaktifan</span>
                  <div className="flex items-baseline gap-6 mt-2">
                    <div>
                      <span className="text-2xl font-black text-slate-800">{getSiswaStats().totalAktif}</span>
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase ml-1">Aktif</span>
                    </div>
                    <div className="border-l border-slate-200 h-6"></div>
                    <div>
                      <span className="text-2xl font-black text-red-500">{getSiswaStats().totalTidakAktif}</span>
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase ml-1">Tidak Aktif</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Tahun Masuk Terbaru</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-xl font-extrabold text-slate-800">
                      {data.length > 0 ? Math.max(...data.map(s => s.tahun_masuk || 0)) : '-'}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Chart Cards */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[300px]">
            <div className="mb-4">
              <h4 className="text-[14px] font-bold text-slate-800">
                {reportType === 'pendaftaran' ? 'Tren Pendaftaran Tahunan' : 'Tren Penerimaan Siswa Baru'}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Statistik jumlah yang dikelompokkan berdasarkan tahun masuk / tahun pendaftaran.
              </p>
            </div>
            <div className="flex-1 flex items-center justify-center py-2">
              {reportType === 'pendaftaran' ? (
                <BarChart data={getPendaftaranStats().yearData} />
              ) : (
                <SiswaBarChart data={getSiswaStats().yearData} />
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[300px]">
            <div className="mb-4">
              <h4 className="text-[14px] font-bold text-slate-800">Distribusi Status</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Persentase distribusi status dari seluruh data saat ini.</p>
            </div>
            <div className="flex-1 flex items-center justify-center py-2">
              {reportType === 'pendaftaran' ? (
                <DonutChart 
                  diterima={getPendaftaranStats().totalDiterima}
                  ditolak={getPendaftaranStats().totalDitolak}
                  pending={getPendaftaranStats().totalPending}
                />
              ) : (
                <SiswaDonutChart 
                  aktif={getSiswaStats().totalAktif}
                  tidakAktif={getSiswaStats().totalTidakAktif}
                />
              )}
            </div>
          </div>
        </div>
      )}

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
