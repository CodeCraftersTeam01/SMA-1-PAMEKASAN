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

// ── Ultra Premium SVG Stacked Bar Chart for Registration ───────────────────
const BarChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-slate-400 py-12">
        <svg className="w-10 h-10 mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-xs font-semibold text-slate-400">Belum ada data tren yang terekam.</p>
      </div>
    );
  }

  const maxVal = Math.max(...data.map(d => d.total), 1);
  const chartHeight = 150;
  const chartWidth = 500;
  const padding = 40;
  
  const barWidth = Math.min(38, (chartWidth - padding * 2) / data.length - 20);
  const gap = ((chartWidth - padding * 2) - (barWidth * data.length)) / (data.length + 1);

  return (
    <svg viewBox={`0 0 ${chartWidth} ${chartHeight + padding * 2}`} className="w-full h-auto max-h-[220px]">
      <defs>
        {/* Sleek iOS gradients */}
        <linearGradient id="gradDiterima" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="gradDitolak" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
        <linearGradient id="gradPending" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        {/* Full track background */}
        <linearGradient id="gradBarTrack" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#f1f5f9" />
        </linearGradient>
      </defs>

      {/* Grid Lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
        const y = padding + chartHeight * (1 - ratio);
        const val = Math.round(maxVal * ratio);
        return (
          <g key={idx}>
            <line x1={padding} y1={y} x2={chartWidth - padding} y2={y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />
            <text x={padding - 12} y={y + 4} fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="end">{val}</text>
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
            {/* Visual background track pill */}
            <rect
              x={x}
              y={padding}
              width={barWidth}
              height={chartHeight}
              fill="url(#gradBarTrack)"
              rx="5"
            />

            {/* Accepted (Diterima) Bar */}
            {yDiterima > 0 && (
              <rect
                x={x}
                y={currentY - yDiterima}
                width={barWidth}
                height={yDiterima}
                fill="url(#gradDiterima)"
                rx="5"
                className="transition-all duration-300 hover:brightness-105"
              />
            )}
            {/* Rejected (Ditolak) Bar */}
            {yDitolak > 0 && (
              <rect
                x={x}
                y={currentY - yDiterima - yDitolak}
                width={barWidth}
                height={yDitolak}
                fill="url(#gradDitolak)"
                rx="5"
                className="transition-all duration-300 hover:brightness-105"
              />
            )}
            {/* Pending Bar */}
            {yPending > 0 && (
              <rect
                x={x}
                y={currentY - yDiterima - yDitolak - yPending}
                width={barWidth}
                height={yPending}
                fill="url(#gradPending)"
                rx="5"
                className="transition-all duration-300 hover:brightness-105"
              />
            )}

            {/* Label for year */}
            <text
              x={x + barWidth / 2}
              y={padding + chartHeight + 20}
              fill="#475569"
              fontSize="10"
              fontWeight="800"
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

// ── Ultra Premium SVG Stacked Bar Chart for Student ──────────────────────────
const SiswaBarChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-slate-400 py-12">
        <svg className="w-10 h-10 mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-xs font-semibold text-slate-400">Belum ada data tren yang terekam.</p>
      </div>
    );
  }

  const maxVal = Math.max(...data.map(d => d.total), 1);
  const chartHeight = 150;
  const chartWidth = 500;
  const padding = 40;
  
  const barWidth = Math.min(38, (chartWidth - padding * 2) / data.length - 20);
  const gap = ((chartWidth - padding * 2) - (barWidth * data.length)) / (data.length + 1);

  return (
    <svg viewBox={`0 0 ${chartWidth} ${chartHeight + padding * 2}`} className="w-full h-auto max-h-[220px]">
      <defs>
        <linearGradient id="gradSiswaAktif" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="gradSiswaTidakAktif" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="100%" stopColor="#b91c1c" />
        </linearGradient>
        <linearGradient id="gradBarTrack" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#f1f5f9" />
        </linearGradient>
      </defs>

      {/* Grid Lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
        const y = padding + chartHeight * (1 - ratio);
        const val = Math.round(maxVal * ratio);
        return (
          <g key={idx}>
            <line x1={padding} y1={y} x2={chartWidth - padding} y2={y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />
            <text x={padding - 12} y={y + 4} fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="end">{val}</text>
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
            {/* Visual background track pill */}
            <rect
              x={x}
              y={padding}
              width={barWidth}
              height={chartHeight}
              fill="url(#gradBarTrack)"
              rx="5"
            />

            {/* Active (Aktif) Bar */}
            {yAktif > 0 && (
              <rect
                x={x}
                y={currentY - yAktif}
                width={barWidth}
                height={yAktif}
                fill="url(#gradSiswaAktif)"
                rx="5"
                className="transition-all duration-300 hover:brightness-105"
              />
            )}
            {/* Inactive Bar */}
            {yTidakAktif > 0 && (
              <rect
                x={x}
                y={currentY - yAktif - yTidakAktif}
                width={barWidth}
                height={yTidakAktif}
                fill="url(#gradSiswaTidakAktif)"
                rx="5"
                className="transition-all duration-300 hover:brightness-105"
              />
            )}

            {/* Label for year */}
            <text
              x={x + barWidth / 2}
              y={padding + chartHeight + 20}
              fill="#475569"
              fontSize="10"
              fontWeight="800"
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

// ── Helper Donut Segments ────────────────────────────────────
const createDonutSegments = (data, radius) => {
    let currentAngle = -90; // Start at top
    const circumference = 2 * Math.PI * radius;
    
    return data.map((item) => {
        if (item.value === 0) return null;
        
        const percentage = item.value / item.total;
        const dasharray = `${percentage * circumference} ${circumference}`;
        
        // Calculate offset to start drawing from currentAngle
        const offset = circumference - ((currentAngle + 90) / 360) * circumference;
        
        const segment = {
            ...item,
            dasharray,
            offset,
            percentage: percentage * 100
        };
        
        currentAngle += percentage * 360;
        return segment;
    }).filter(Boolean);
};

// ── Donut Chart for Registration Status ────────────────────────────────────
const DonutChart = ({ diterima, ditolak, pending }) => {
  const total = diterima + ditolak + pending;
  if (total === 0) return null;

  const radius = 40;
  
  const segments = createDonutSegments([
      { id: 'diterima', value: diterima, total, color: '#10b981' },
      { id: 'ditolak', value: ditolak, total, color: '#ef4444' },
      { id: 'pending', value: pending, total, color: '#f59e0b' }
  ], radius);

  return (
    <div className="flex flex-col items-center justify-center w-full gap-6">
      <div className="relative w-32 h-32 shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth="12" />

          {segments.map((seg) => (
            <circle
              key={seg.id}
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke={seg.color}
              strokeWidth="12"
              strokeDasharray={seg.dasharray}
              strokeDashoffset={seg.offset}
              strokeLinecap={seg.value === total ? "butt" : "round"}
              className="transition-all duration-700 ease-out hover:stroke-[14px]"
              style={{ transformOrigin: 'center' }}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-slate-800 tracking-tight">{total}</span>
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mt-0.5">Siswa</span>
        </div>
      </div>

      {/* Legend list */}
      <div className="flex flex-col gap-2.5 w-full max-w-[260px]">
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl border border-slate-100 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-emerald-200 transition-colors cursor-default">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 shadow-sm shadow-emerald-500/40"></span>
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Diterima</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400">{Math.round((diterima/total)*100)}%</span>
            <span className="text-xs font-extrabold text-slate-800 bg-slate-50 px-2 py-0.5 rounded-md">{diterima}</span>
          </div>
        </div>
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl border border-slate-100 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-red-200 transition-colors cursor-default">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 shadow-sm shadow-red-500/40"></span>
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Ditolak</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400">{Math.round((ditolak/total)*100)}%</span>
            <span className="text-xs font-extrabold text-slate-800 bg-slate-50 px-2 py-0.5 rounded-md">{ditolak}</span>
          </div>
        </div>
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl border border-slate-100 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-amber-200 transition-colors cursor-default">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 shadow-sm shadow-amber-500/40"></span>
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Menunggu</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400">{Math.round((pending/total)*100)}%</span>
            <span className="text-xs font-extrabold text-slate-800 bg-slate-50 px-2 py-0.5 rounded-md">{pending}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Donut Chart for Student Status ────────────────────────────────────
const SiswaDonutChart = ({ aktif, tidakAktif }) => {
  const total = aktif + tidakAktif;
  if (total === 0) return null;

  const radius = 40;
  
  const segments = createDonutSegments([
      { id: 'aktif', value: aktif, total, color: '#1e293b' },
      { id: 'tidakAktif', value: tidakAktif, total, color: '#ef4444' }
  ], radius);

  return (
    <div className="flex flex-col items-center justify-center w-full gap-6">
      <div className="relative w-32 h-32 shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth="12" />

          {segments.map((seg) => (
            <circle
              key={seg.id}
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke={seg.color}
              strokeWidth="12"
              strokeDasharray={seg.dasharray}
              strokeDashoffset={seg.offset}
              strokeLinecap={seg.value === total ? "butt" : "round"}
              className="transition-all duration-700 ease-out hover:stroke-[14px]"
              style={{ transformOrigin: 'center' }}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-slate-800 tracking-tight">{total}</span>
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mt-0.5">Siswa</span>
        </div>
      </div>

      {/* Legend list */}
      <div className="flex flex-col gap-2.5 w-full max-w-[260px]">
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl border border-slate-100 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-slate-300 transition-colors cursor-default">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-800 shrink-0 shadow-sm shadow-slate-800/40"></span>
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Aktif</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400">{Math.round((aktif/total)*100)}%</span>
            <span className="text-xs font-extrabold text-slate-800 bg-slate-50 px-2 py-0.5 rounded-md">{aktif}</span>
          </div>
        </div>
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl border border-slate-100 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-red-200 transition-colors cursor-default">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 shadow-sm shadow-red-500/40"></span>
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Tidak Aktif</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400">{Math.round((tidakAktif/total)*100)}%</span>
            <span className="text-xs font-extrabold text-slate-800 bg-slate-50 px-2 py-0.5 rounded-md">{tidakAktif}</span>
          </div>
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
        fetchReportData(); // Fetch data laporan setelah filter direset
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
      case 'diterima': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'ditolak': return 'bg-red-50 text-red-600 border-red-100';
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
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

  // Pre-calculate percentages for progress indicators in metrics
  const pendaftaranStats = getPendaftaranStats();
  const totalPendaftar = data.length || 1;
  const ratioDiterima = Math.round((pendaftaranStats.totalDiterima / totalPendaftar) * 100);
  const ratioDitolak = Math.round((pendaftaranStats.totalDitolak / totalPendaftar) * 100);
  const ratioPending = Math.round((pendaftaranStats.totalPending / totalPendaftar) * 100);

  const siswaStats = getSiswaStats();
  const totalSiswaVal = data.length || 1;
  const ratioAktif = Math.round((siswaStats.totalAktif / totalSiswaVal) * 100);
  const ratioTidakAktif = Math.round((siswaStats.totalTidakAktif / totalSiswaVal) * 100);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 text-slate-800 shadow-[0_4px_30px_rgba(0,0,0,0.02)] border border-slate-100 relative overflow-hidden animate-fade-up">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-900"></div>
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100 text-slate-700">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </span>
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Dashboard Analitik</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black mb-1.5 text-slate-800 tracking-tight">Laporan & Statistik</h2>
            <p className="text-slate-500 text-xs sm:text-sm max-w-xl">
              Pantau tren pendaftaran tahunan secara dinamis dan cetak laporan resmi SMAN 1 Pamekasan.
            </p>
          </div>
          <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full lg:w-auto shrink-0 border border-slate-200/40">
            <button
              onClick={() => setReportType('pendaftaran')}
              className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-extrabold rounded-xl transition-all ${
                reportType === 'pendaftaran' 
                  ? 'bg-white text-slate-900 shadow-[0_4px_15px_rgba(0,0,0,0.06)]' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Laporan Pendaftaran
            </button>
            <button
              onClick={() => setReportType('siswa')}
              className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-extrabold rounded-xl transition-all ${
                reportType === 'siswa' 
                  ? 'bg-white text-slate-900 shadow-[0_4px_15px_rgba(0,0,0,0.06)]' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
              Laporan Siswa
            </button>
          </div>
        </div>
      </div>

      {/* Filter Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.02)] animate-fade-up delay-75">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <form onSubmit={handleFilter} className="flex flex-col sm:flex-row items-end gap-3 w-full md:w-auto">
            <div className="w-full sm:w-auto">
              <label className="block text-[10px] font-extrabold text-slate-400 mb-1.5 uppercase tracking-wider">Tanggal Mulai</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-800 transition-all text-xs font-bold text-slate-700"
              />
            </div>
            <div className="w-full sm:w-auto">
              <label className="block text-[10px] font-extrabold text-slate-400 mb-1.5 uppercase tracking-wider">Tanggal Selesai</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-800 transition-all text-xs font-bold text-slate-700"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                type="submit"
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-extrabold text-white bg-slate-900 hover:bg-slate-850 shadow-lg shadow-slate-900/10 transition-all flex items-center justify-center gap-2"
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
                  className="px-4 py-2.5 rounded-xl text-xs font-extrabold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all"
                >
                  Reset
                </button>
              )}
            </div>
          </form>

          <div className="flex gap-2 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
            <button 
              onClick={() => handleExport('csv')}
              disabled={isExporting || data.length === 0}
              className="flex-1 md:flex-none px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              CSV
            </button>
            <button 
              onClick={() => handleExport('excel')}
              disabled={isExporting || data.length === 0}
              className="flex-1 md:flex-none px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-extrabold hover:bg-slate-850 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Unduh Excel
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
                {/* Total Pendaftar */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.015)] hover:scale-[1.01] transition-all duration-350 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Total Pendaftar</span>
                    <span className="p-2 rounded-xl bg-slate-50 text-slate-600">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-4">
                    <span className="text-3xl font-black text-slate-800 tracking-tight">{data.length}</span>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase">Pendaftar</span>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between items-center text-[9px] text-slate-400 font-extrabold mb-1">
                      <span>Kapasitas</span>
                      <span>100%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1">
                      <div className="bg-slate-800 h-1 rounded-full w-full"></div>
                    </div>
                  </div>
                </div>

                {/* Diterima */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.015)] hover:scale-[1.01] transition-all duration-350 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-extrabold text-emerald-500 uppercase tracking-wider">Diterima</span>
                    <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-4">
                    <span className="text-3xl font-black text-emerald-500 tracking-tight">{pendaftaranStats.totalDiterima}</span>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase">Pendaftar</span>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between items-center text-[9px] text-slate-400 font-extrabold mb-1">
                      <span>Rasio Kelulusan</span>
                      <span>{ratioDiterima}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1">
                      <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${ratioDiterima}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Ditolak */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.015)] hover:scale-[1.01] transition-all duration-350 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-extrabold text-red-500 uppercase tracking-wider">Ditolak</span>
                    <span className="p-2 rounded-xl bg-red-50 text-red-600">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-4">
                    <span className="text-3xl font-black text-red-50 tracking-tight text-red-500">{pendaftaranStats.totalDitolak}</span>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase">Pendaftar</span>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between items-center text-[9px] text-slate-400 font-extrabold mb-1">
                      <span>Rasio Gugur</span>
                      <span>{ratioDitolak}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1">
                      <div className="bg-red-500 h-1 rounded-full" style={{ width: `${ratioDitolak}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Menunggu */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.015)] hover:scale-[1.01] transition-all duration-350 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-extrabold text-amber-500 uppercase tracking-wider">Menunggu</span>
                    <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-4">
                    <span className="text-3xl font-black text-amber-500 tracking-tight">{pendaftaranStats.totalPending}</span>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase">Pendaftar</span>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between items-center text-[9px] text-slate-400 font-extrabold mb-1">
                      <span>Rasio Antrean</span>
                      <span>{ratioPending}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1">
                      <div className="bg-amber-500 h-1 rounded-full" style={{ width: `${ratioPending}%` }}></div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Total Siswa */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.015)] hover:scale-[1.01] transition-all duration-350 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Total Siswa</span>
                    <span className="p-2 rounded-xl bg-slate-50 text-slate-600">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-4">
                    <span className="text-3xl font-black text-slate-800 tracking-tight">{data.length}</span>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase">Siswa</span>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between items-center text-[9px] text-slate-400 font-extrabold mb-1">
                      <span>Keaktifan</span>
                      <span>100%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1">
                      <div className="bg-slate-800 h-1 rounded-full w-full"></div>
                    </div>
                  </div>
                </div>

                {/* Status Keaktifan */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.015)] hover:scale-[1.01] transition-all duration-350 flex flex-col justify-between col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">Keaktifan Kelas</span>
                    <span className="p-2 rounded-xl bg-slate-50 text-slate-600">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </span>
                  </div>
                  <div className="flex items-baseline gap-6 mt-4">
                    <div>
                      <span className="text-2xl font-black text-slate-800 tracking-tight">{siswaStats.totalAktif}</span>
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase ml-1">Aktif</span>
                    </div>
                    <div className="border-l border-slate-200 h-6"></div>
                    <div>
                      <span className="text-2xl font-black text-red-500 tracking-tight">{siswaStats.totalTidakAktif}</span>
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase ml-1">Tidak Aktif</span>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between items-center text-[9px] text-slate-400 font-extrabold mb-1">
                        <span>Aktif</span>
                        <span>{ratioAktif}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1">
                        <div className="bg-slate-800 h-1 rounded-full" style={{ width: `${ratioAktif}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center text-[9px] text-slate-400 font-extrabold mb-1">
                        <span>Tidak Aktif</span>
                        <span>{ratioTidakAktif}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1">
                        <div className="bg-red-500 h-1 rounded-full" style={{ width: `${ratioTidakAktif}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tahun Masuk Terbaru */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.015)] hover:scale-[1.01] transition-all duration-350 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Tahun Terbaru</span>
                    <span className="p-2 rounded-xl bg-slate-50 text-slate-600">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-4">
                    <span className="text-2xl font-black text-slate-800 tracking-tight">
                      {data.length > 0 ? Math.max(...data.map(s => s.tahun_masuk || 0)) : '-'}
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between items-center text-[9px] text-slate-400 font-extrabold mb-1">
                      <span>Status</span>
                      <span>Terdata</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1">
                      <div className="bg-emerald-500 h-1 rounded-full w-full"></div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Chart Cards */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[300px]">
            <div className="mb-4">
              <h4 className="text-sm font-bold text-slate-800">
                {reportType === 'pendaftaran' ? 'Tren Pendaftaran Tahunan' : 'Tren Penerimaan Siswa Baru'}
              </h4>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">
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

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[300px]">
            <div className="mb-4">
              <h4 className="text-sm font-bold text-slate-800">Distribusi Status</h4>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">Persentase distribusi status dari seluruh data saat ini.</p>
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
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.02)] animate-fade-up delay-150">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span>
            <h3 className="text-sm font-black text-slate-800">
              Hasil Data Terperinci
            </h3>
          </div>
          <span className="text-[10px] font-extrabold px-3 py-1 bg-slate-50 text-slate-500 rounded-full border border-slate-100">
            Total: {data.length} Baris
          </span>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
              <div className="w-8 h-8 border-4 border-slate-100 border-t-slate-950 rounded-full animate-spin"></div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Sinkronisasi Data...</p>
            </div>
          ) : error ? (
            <div className="py-20 text-center text-red-500">
              <p>{error}</p>
              <button onClick={fetchReportData} className="mt-2 text-slate-800 font-extrabold underline text-xs">Coba lagi</button>
            </div>
          ) : (
            <table className="w-full text-left responsive border-collapse">
              <thead>
                {reportType === 'pendaftaran' ? (
                  <tr className="border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                    <th className="pb-3 pl-2">No. Pendaftaran</th>
                    <th className="pb-3">NISN</th>
                    <th className="pb-3">Nama Lengkap</th>
                    <th className="pb-3">Asal Sekolah</th>
                    <th className="pb-3">Jalur</th>
                    <th className="pb-3">Tanggal Daftar</th>
                    <th className="pb-3">Status</th>
                  </tr>
                ) : (
                  <tr className="border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                    <th className="pb-3 pl-2">NIS</th>
                    <th className="pb-3">Nama Lengkap</th>
                    <th className="pb-3">Tahun Masuk</th>
                    <th className="pb-3">Tahun Ajaran</th>
                    <th className="pb-3">Status Aktif</th>
                    <th className="pb-3">Tanggal Terdata</th>
                  </tr>
                )}
              </thead>
              <tbody className="text-xs font-medium text-slate-600">
                {data.map((item, index) => (
                  <tr key={item.id || index} className="border-b border-slate-50 hover:bg-slate-50/40 transition-colors">
                    {reportType === 'pendaftaran' ? (
                      <>
                        <td className="py-4 pl-2 font-extrabold text-slate-400">{item.no_pendaftaran || '-'}</td>
                        <td className="py-4 text-slate-600 font-semibold">{item.nisn || '-'}</td>
                        <td className="py-4 font-extrabold text-slate-800">{item.nama_lengkap}</td>
                        <td className="py-4 text-slate-500 font-bold">{item.asal_sekolah}</td>
                        <td className="py-4">
                          {item.jalur ? (
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider border ${item.jalur === 'zonasi' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                item.jalur === 'afirmasi' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                  item.jalur === 'prestasi' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                    'bg-slate-50 text-slate-600 border-slate-100'
                              }`}>
                              {item.jalur.replace('_', ' ')}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="py-4 text-slate-400 font-bold">{new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                        <td className="py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider border ${getStatusColor(item.status || 'pending')}`}>
                            {getStatusText(item.status || 'pending')}
                          </span>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-4 pl-2 font-extrabold text-slate-800">{item.nis || '-'}</td>
                        <td className="py-4 font-black text-slate-800">{item.nama_lengkap}</td>
                        <td className="py-4 text-slate-600 font-bold">{item.tahun_masuk}</td>
                        <td className="py-4 text-slate-600 font-extrabold">{item.tahun_ajaran?.tahun || '-'}</td>
                        <td className="py-4">
                          {item.is_active ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider border bg-slate-900 text-white border-slate-900">
                              Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider border bg-slate-50 text-slate-500 border-slate-100">
                              Alumni
                            </span>
                          )}
                        </td>
                        <td className="py-4 text-slate-400 font-bold">{new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                      </>
                    )}
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td colSpan={reportType === 'pendaftaran' ? "7" : "6"} className="py-16 text-center text-slate-400">
                      <svg className="w-10 h-10 mx-auto mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tidak ada data laporan ditemukan</p>
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
