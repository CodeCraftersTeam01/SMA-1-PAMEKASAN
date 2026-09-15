import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Search, Trophy, Users, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/SEO';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000') + '/api/public';
const STORAGE_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000') + '/storage';

const PrestasiSkeleton = () => (
  <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8 animate-pulse">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="break-inside-avoid bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
        <div className="w-16 h-16 bg-slate-200 rounded-2xl mb-6"></div>
        <div className="h-6 bg-slate-200 rounded-lg w-3/4 mb-4"></div>
        <div className="flex items-center gap-3 mb-5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="w-10 h-10 rounded-full bg-slate-200"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            <div className="h-3 bg-slate-200 rounded w-1/3"></div>
          </div>
        </div>
        <div className="space-y-2 mb-6">
          <div className="h-4 bg-slate-100 rounded w-full"></div>
          <div className="h-4 bg-slate-100 rounded w-5/6"></div>
        </div>
        <div className="h-4 bg-slate-200 rounded w-1/3 mt-auto pt-4 border-t border-slate-100"></div>
      </div>
    ))}
  </div>
);

export default function PrestasiDetail() {
  const [achievements, setAchievements] = useState([]);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
    fetch(`${API_BASE}/achievements`, {
      headers: {
        'x-api-key': import.meta.env.VITE_API_KEY || 'smansa123',
        'Accept': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAchievements(data.data);
        }
      })
      .catch(err => console.error("Error fetching achievements", err))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredAchievements = achievements.filter(item => {
    const query = searchQuery.toLowerCase();
    const studentName = item.siswa ? item.siswa.nama_lengkap : item.student_name;
    const className = item.siswa && item.siswa.kelas ? item.siswa.kelas : '';
    
    return (
      item.title.toLowerCase().includes(query) ||
      (studentName && studentName.toLowerCase().includes(query)) ||
      (className && className.toLowerCase().includes(query)) ||
      (item.description && item.description.toLowerCase().includes(query)) ||
      item.year.toString().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-24 font-sans text-gray-800">
      <SEO 
        title="Prestasi Gemilang SMANSA"
        description="Jelajahi seluruh daftar penghargaan dan pencapaian luar biasa yang telah diraih oleh siswa-siswi SMAN 1 Pamekasan."
        keywords="prestasi SMAN 1 Pamekasan, penghargaan SMANSA, olimpiade SMAN 1 Pamekasan"
      />
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/#prestasi" className="inline-flex items-center gap-2 text-smansa-navy font-bold hover:text-blue-600 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
          </Link>
        </div>
        
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-smansa-navy mb-6 tracking-tight">Prestasi Gemilang SMANSA</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-10">
            Jelajahi seluruh daftar penghargaan dan pencapaian luar biasa yang telah diraih oleh siswa-siswi kami.
          </p>
          <Link to="/prestasi/form" className="inline-flex items-center gap-2 bg-smansa-navy text-white px-8 py-4 rounded-full font-bold text-base hover:bg-blue-900 hover:scale-105 transition-all duration-300 shadow-lg mb-10">
            <Trophy className="w-5 h-5" /> Kirim Prestasi Baru
          </Link>

          <div className="max-w-2xl mx-auto relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari prestasi, nama siswa, atau tahun..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-full focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-lg shadow-sm"
            />
          </div>
        </div>

        {isLoading ? (
          <PrestasiSkeleton />
        ) : filteredAchievements.length > 0 ? (
          (() => {
            const renderPrestasiCard = (item) => (
              <div 
                key={item.id} 
                onClick={() => setSelectedAchievement(item)}
                className="group relative bg-gray-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col border border-gray-100 cursor-pointer w-full"
              >
                  {/* Background Image (dictates natural height) */}
                  {item.image_url ? (
                    <div className="w-full h-full overflow-hidden">
                      <img src={`${STORAGE_BASE}/${item.image_url}`} alt={item.title} className="block w-full h-auto object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                    </div>
                  ) : (
                    <div className="w-full aspect-4/3 bg-gradient-to-br from-blue-600 to-indigo-800 group-hover:scale-110 transition-transform duration-700 opacity-90"></div>
                  )}
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                  {/* Content Overlay */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-end text-white z-10">
                    {/* Always visible (Title, Level, Icon) */}
                    <div className="flex justify-between items-end mb-2">
                       <div className="flex-1 pr-4">
                         <h3 className="text-2xl font-bold mb-1 drop-shadow-md line-clamp-2">{item.title} ({item.year})</h3>
                       </div>
                       <div className="flex flex-col items-end gap-3 shrink-0">
                         <div className="w-12 h-12 bg-yellow-400/20 backdrop-blur-md text-yellow-400 rounded-full flex items-center justify-center border border-yellow-400/30">
                            <Trophy className="w-6 h-6" />
                         </div>
                         <span className="text-xs font-bold bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full border border-white/20">{item.level}</span>
                       </div>
                    </div>

                    {/* Student Name */}
                    {item.siswas && item.siswas.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {item.siswas.slice(0, 2).map((s, idx) => (
                          <div key={idx} className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg font-medium text-xs border border-white/20">
                            <Users className="w-3 h-3" />
                            <span>{s.nama_lengkap}</span>
                          </div>
                        ))}
                        {item.siswas.length > 2 && (
                          <span className="text-xs text-blue-200 self-center font-bold">+{item.siswas.length - 2} siswa</span>
                        )}
                      </div>
                    ) : item.student_name ? (
                      <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg font-medium text-xs border border-white/20 mb-2">
                        <Users className="w-3 h-3" />
                        <span>{item.student_name}</span>
                      </div>
                    ) : null}

                    {/* Click CTA */}
                    <div className="pt-3 border-t border-white/15 flex items-center text-xs font-bold text-yellow-400 group-hover:text-yellow-300 transition-colors">
                      <span>Lihat Selengkapnya</span>
                      <ArrowRight className="w-4 h-4 ml-1.5 transform group-hover:translate-x-1.5 transition-transform" />
                    </div>
                  </div>
              </div>
            );

            const col1 = filteredAchievements.filter((_, idx) => idx % 3 === 0);
            const col2 = filteredAchievements.filter((_, idx) => idx % 3 === 1);
            const col3 = filteredAchievements.filter((_, idx) => idx % 3 === 2);

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
                <div className="flex flex-col gap-8">
                  {col1.map(renderPrestasiCard)}
                </div>
                <div className="flex flex-col gap-8">
                  {col2.map(renderPrestasiCard)}
                </div>
                <div className="flex flex-col gap-8">
                  {col3.map(renderPrestasiCard)}
                </div>
              </div>
            );
          })()
        ) : (
          <div className="text-center py-20">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-400 mb-2">Tidak Ada Prestasi Ditemukan</h3>
            <p className="text-gray-500">Coba gunakan kata kunci pencarian yang lain.</p>
          </div>
        )}
      </div>

      {/* Modal Detail Prestasi */}
      <AnimatePresence>
        {selectedAchievement && (
          <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 bg-slate-950/70 backdrop-blur-md" 
            onClick={() => setSelectedAchievement(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Image (Supports flexible resolution portrait & landscape) */}
              <div className="relative w-full max-h-[380px] bg-slate-950 overflow-hidden shrink-0 flex items-center justify-center">
                {selectedAchievement.image_url ? (
                  <>
                    <img 
                      src={`${STORAGE_BASE}/${selectedAchievement.image_url}`} 
                      alt="" 
                      aria-hidden="true" 
                      className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-125 select-none pointer-events-none" 
                    />
                    <img 
                      src={`${STORAGE_BASE}/${selectedAchievement.image_url}`} 
                      alt={selectedAchievement.title} 
                      className="relative z-10 max-h-[380px] w-auto max-w-full object-contain" 
                    />
                  </>
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center">
                    <Trophy className="w-16 h-16 text-yellow-400 opacity-80" />
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={() => setSelectedAchievement(null)}
                  className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-sm transition-colors cursor-pointer"
                  title="Tutup"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-5">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="bg-yellow-50 text-yellow-800 border border-yellow-200/80 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1.5 shadow-xs">
                    <Trophy className="w-3.5 h-3.5 text-yellow-600" />
                    {selectedAchievement.level || 'Tingkat Nasional'}
                  </span>
                  <span className="bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-full text-xs">
                    Tahun {selectedAchievement.year}
                  </span>
                  {selectedAchievement.category && (
                    <span className="bg-slate-100 text-slate-700 font-semibold px-3 py-1 rounded-full text-xs">
                      {selectedAchievement.category}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-2xl md:text-3xl font-extrabold text-smansa-navy tracking-tight leading-snug">
                  {selectedAchievement.title}
                </h3>

                {/* Students List */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Peraih Prestasi / Tim</h4>
                  {selectedAchievement.siswas && selectedAchievement.siswas.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedAchievement.siswas.map((s, idx) => (
                        <div key={idx} className="inline-flex items-center gap-2 bg-slate-100 text-slate-800 px-3.5 py-2 rounded-xl font-medium text-sm border border-slate-200/60 shadow-xs">
                          <Users className="w-4 h-4 text-blue-600" />
                          <span>{s.nama_lengkap}</span>
                          {s.jenis_kelamin === 'L' && <span className="text-blue-600 font-bold text-xs">(L)</span>}
                          {s.jenis_kelamin === 'P' && <span className="text-pink-600 font-bold text-xs">(P)</span>}
                          {s.kelas && <span className="text-xs font-semibold bg-white text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">Kelas {s.kelas}</span>}
                        </div>
                      ))}
                    </div>
                  ) : selectedAchievement.student_name ? (
                    <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-800 px-3.5 py-2 rounded-xl font-medium text-sm border border-slate-200/60 shadow-xs">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>{selectedAchievement.student_name}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-500 italic">Siswa SMAN 1 Pamekasan</span>
                  )}
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Deskripsi Lengkap</h4>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line text-sm md:text-base">
                    {selectedAchievement.description || 'Tidak ada deskripsi tambahan.'}
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 md:px-8 md:py-5 border-t border-slate-100 bg-slate-50 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedAchievement(null)}
                  className="px-6 py-2.5 bg-smansa-navy hover:bg-blue-900 text-white rounded-xl font-bold text-sm transition-all shadow-md cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
