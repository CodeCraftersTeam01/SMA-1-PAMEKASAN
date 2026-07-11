import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Search, Trophy, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';

const API_BASE = 'http://localhost:8000/api/public';
const STORAGE_BASE = 'http://localhost:8000/storage';

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
          <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            {filteredAchievements.map((item) => (
              <div key={item.id} className="break-inside-avoid group relative bg-gray-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col border border-gray-100 mb-8">
                  {/* Background Image (dictates natural height) */}
                  {item.image_url ? (
                    <div className="w-full h-full overflow-hidden">
                      <img src={`${STORAGE_BASE}/${item.image_url}`} alt={item.title} className="block w-full h-auto object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                    </div>
                  ) : (
                    <div className="w-full aspect-[4/3] bg-gradient-to-br from-blue-600 to-indigo-800 group-hover:scale-110 transition-transform duration-700 opacity-90"></div>
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

                    {/* Expanded Details on Hover */}
                    <div className="max-h-0 opacity-0 group-hover:max-h-[300px] group-hover:opacity-100 group-hover:mt-4 transition-all duration-500 overflow-hidden flex flex-col gap-3">
                        {/* Student Name */}
                        {item.siswas && item.siswas.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {item.siswas.map((s, idx) => (
                              <div key={idx} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl font-medium text-sm border border-white/20">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                {s.nama_lengkap}
                                {s.jenis_kelamin === 'L' && <span className="text-blue-300 font-black ml-1">(L)</span>}
                                {s.jenis_kelamin === 'P' && <span className="text-pink-300 font-black ml-1">(P)</span>}
                                {s.kelas && <span className="ml-1 text-xs font-semibold bg-white/20 text-white px-1.5 py-0.5 rounded">Kelas {s.kelas}</span>}
                              </div>
                            ))}
                          </div>
                        ) : item.student_name ? (
                          <div className="flex flex-wrap gap-2">
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl font-medium text-sm border border-white/20">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                              {item.student_name}
                            </div>
                          </div>
                        ) : null}

                        <p className="text-gray-200 text-sm line-clamp-4 leading-relaxed drop-shadow-sm">{item.description}</p>
                    </div>
                  </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-400 mb-2">Tidak Ada Prestasi Ditemukan</h3>
            <p className="text-gray-500">Coba gunakan kata kunci pencarian yang lain.</p>
          </div>
        )}
      </div>
    </div>
  );
}
