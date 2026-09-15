import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Search, ArrowLeft, Filter, Clock, BookOpen, Award, CheckCircle2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000') + '/api/public';

export default function AgendaSekolah() {
  const [agendas, setAgendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');

  useEffect(() => {
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }

    const fetchAgendas = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/academic-calendar?all=1`, {
          headers: {
            'x-api-key': import.meta.env.VITE_API_KEY || 'smansa123',
            'Accept': 'application/json',
          },
        });
        const data = await res.json();
        const list = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);
        setAgendas(list);
      } catch (err) {
        console.error('Failed to fetch agendas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgendas();
  }, []);

  const formatIndonesianDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date)) return dateStr;
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getDayAndMonth = (dateStr) => {
    if (!dateStr) return { day: '--', month: '---' };
    const date = new Date(dateStr);
    if (isNaN(date)) return { day: '--', month: '---' };
    return {
      day: date.getDate().toString().padStart(2, '0'),
      month: date.toLocaleString('id-ID', { month: 'short' }),
    };
  };

  const getAgendaStatus = (dateStr) => {
    if (!dateStr) return { label: 'Mendatang', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(dateStr);
    eventDate.setHours(0, 0, 0, 0);

    if (eventDate.getTime() === today.getTime()) {
      return { label: 'Hari Ini', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold' };
    } else if (eventDate.getTime() > today.getTime()) {
      return { label: 'Mendatang', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
    } else {
      return { label: 'Selesai', bg: 'bg-slate-100 text-slate-500 border-slate-200' };
    }
  };

  // Extract available months for filter
  const months = [
    { value: 'all', label: 'Semua Bulan' },
    { value: '0', label: 'Januari' },
    { value: '1', label: 'Februari' },
    { value: '2', label: 'Maret' },
    { value: '3', label: 'April' },
    { value: '4', label: 'Mei' },
    { value: '5', label: 'Juni' },
    { value: '6', label: 'Juli' },
    { value: '7', label: 'Agustus' },
    { value: '8', label: 'September' },
    { value: '9', label: 'Oktober' },
    { value: '10', label: 'November' },
    { value: '11', label: 'Desember' },
  ];

  const categories = [
    { id: 'all', label: 'Semua Kategori' },
    { id: 'Akademik', label: 'Akademik' },
    { id: 'Non-Akademik', label: 'Non-Akademik' },
  ];

  const filteredAgendas = agendas.filter((item) => {
    const titleMatch = (item.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const descMatch = (item.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = titleMatch || descMatch;

    const matchesCategory =
      selectedCategory === 'all' ||
      (item.type || '').toLowerCase() === selectedCategory.toLowerCase();

    let matchesMonth = true;
    if (selectedMonth !== 'all' && item.event_date) {
      const monthNum = new Date(item.event_date).getMonth().toString();
      matchesMonth = monthNum === selectedMonth;
    }

    return matchesSearch && matchesCategory && matchesMonth;
  });

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-24 font-sans text-slate-800">
      <SEO
        title="Agenda Sekolah & Kalender Kegiatan"
        description="Jadwal lengkap kegiatan akademik, ujian, libur nasional, dan agenda kegiatan SMAN 1 Pamekasan."
        keywords="Agenda SMAN 1 Pamekasan, Kalender Akademik SMANSA, Jadwal Kegiatan SMAN 1 Pamekasan"
      />

      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Navigation back */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            to="/#agenda"
            className="inline-flex items-center gap-2 text-slate-700 font-bold hover:text-blue-600 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200 text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
          </Link>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Kalender Sekolah SMANSA
          </span>
        </div>

        {/* Header Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-sm">
            <Calendar className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Agenda & Kalender Kegiatan
          </h1>
          <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto">
            Daftar lengkap jadwal kegiatan akademik, pelaksanaan ujian, acara sekolah, dan libur nasional SMAN 1 Pamekasan.
          </p>
        </motion.div>

        {/* Controls: Search & Filters */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-slate-200/80 mb-10 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search input */}
            <div className="relative md:col-span-1">
              <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama agenda / kegiatan..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-slate-700 text-sm outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Category Pill Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? 'bg-smansa-navy text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Month Filter Dropdown */}
            <div>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 text-sm outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all appearance-none cursor-pointer"
              >
                {months.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Agendas List */}
        {loading ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-500 font-medium text-sm">Memuat agenda sekolah...</p>
          </div>
        ) : filteredAgendas.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700 mb-2">Agenda Tidak Ditemukan</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
              Tidak ada kegiatan atau agenda sekolah yang sesuai dengan pencarian atau filter Anda.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedMonth('all');
              }}
              className="px-5 py-2.5 bg-blue-50 text-blue-700 font-bold text-xs rounded-xl hover:bg-blue-100 transition-colors"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAgendas.map((agenda, index) => {
              const { day, month } = getDayAndMonth(agenda.event_date);
              const status = getAgendaStatus(agenda.event_date);

              return (
                <motion.div
                  key={agenda.id || index}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.3 }}
                  className="bg-white rounded-3xl p-6 md:p-7 border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgba(37,99,235,0.06)] hover:border-blue-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group"
                >
                  <div className="flex items-start md:items-center gap-6 flex-1">
                    {/* Date Badge */}
                    <div className="bg-gradient-to-br from-smansa-navy to-blue-900 text-white rounded-2xl p-4 w-20 shrink-0 text-center shadow-md group-hover:scale-105 transition-transform">
                      <span className="block text-2xl font-extrabold leading-none">{day}</span>
                      <span className="block text-xs font-bold uppercase mt-1 text-yellow-300">
                        {month}
                      </span>
                    </div>

                    {/* Agenda Details */}
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg uppercase tracking-wider">
                          {agenda.type || 'Akademik'}
                        </span>
                        <span
                          className={`px-3 py-1 text-xs rounded-lg border ${status.bg}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {agenda.title}
                      </h3>

                      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>{formatIndonesianDate(agenda.event_date)}</span>
                      </div>

                      {agenda.description && (
                        <p className="text-slate-600 text-sm leading-relaxed pt-1">
                          {agenda.description}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
